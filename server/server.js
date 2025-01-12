require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pythonBridge = require('python-bridge');
const python = pythonBridge();
const mysql = require('mysql2/promise');
const readline = require('readline');
const schedule = require('node-schedule');

const app = express();
const port = process.env.PORT || 5000;

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

const pool = mysql.createPool(dbConfig);

let currentSeed = null;
let prng = null;
let beaconUrl = '';
let beacon = "";
let iteration = 0;
app.use(cors());

class MersenneTwister {
  constructor(seed) {
    this.index = 624;
    this.mt = new Array(624);
    this.mt[0] = seed >>> 0;

    for (let i = 1; i < 624; i++) {
      this.mt[i] = (1812433253 * (this.mt[i - 1] ^ (this.mt[i - 1] >>> 30)) + i) >>> 0;
    }
  }

  next() {
    if (this.index >= 624) {
      this.generateNumbers();
    }

    let y = this.mt[this.index++];
    y ^= (y >>> 11);
    y ^= (y << 7) & 2636928640;
    y ^= (y << 15) & 4022730752;
    y ^= (y >>> 18);

    return y >>> 0;
  }

  generateNumbers() {
    for (let i = 0; i < 624; i++) {
      let y = (this.mt[i] & 0x80000000) | (this.mt[(i + 1) % 624] & 0x7fffffff);
      this.mt[i] = this.mt[(i + 397) % 624] ^ (y >>> 1);
      if (y % 2 !== 0) {
        this.mt[i] ^= 2567483615;
      }
    }
    this.index = 0;
  }

  generate() {
    return this.next();
  }
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function chooseBeacon() {
  return new Promise((resolve) => {
    rl.question('Choose Beacon (1 - NIST, 2 - Local): ', (answer) => {
      if (answer === '1') {
        beaconUrl = 'https://beacon.nist.gov/beacon/2.0/pulse/last';
        console.log('NIST Beacon Selected');
        beacon = "NIST";
      } else if (answer === '2') {
        beaconUrl = 'http://192.168.217.147:8080/public/latest';
        console.log('Local Beacon Selected');
        beacon = "Local";
      } else {
        console.log('Invalid, defaulting to NIST Beacon');
        beaconUrl = 'https://beacon.nist.gov/beacon/2.0/pulse/last';
        beacon = "NIST";
      }
      rl.close();
      resolve();
    });
  });
}

async function fetchSeed() {
  try {
    const response = await fetch(beaconUrl);
    let data = await response.json();
    currentSeed = beaconUrl.includes('nist') ?
      data.pulse.outputValue :
      data.randomness;
    prng = new MersenneTwister(currentSeed);
    iteration = 0;
  } catch (error) {
    console.error('Error fetching seed:', error);
  }
}

async function feedGameResults() {
  await fetch('http://localhost:5000/rock-paper-scissors');
  await fetch('http://localhost:5000/flip-coin');
  await fetch('http://localhost:5000/roll-dice?type=d6&numberOfDice=3');
  await fetch('http://localhost:5000/roll-dice?type=d4&numberOfDice=3');
  await fetch('http://localhost:5000/roll-dice?type=d8&numberOfDice=3');
  await fetch('http://localhost:5000/roll-dice?type=d10&numberOfDice=3');
  await fetch('http://localhost:5000/roll-dice?type=d12&numberOfDice=3');
  await fetch('http://localhost:5000/roll-dice?type=d20&numberOfDice=3');
}

if (require.main === module) {
  (async () => {
    await chooseBeacon();
    await fetchSeed();
    schedule.scheduleJob('0 * * * * *', fetchSeed);

    setInterval(feedGameResults, 500)
    app.listen(port, () => {
      console.log(`Server port is http://localhost:${port}`);
    });
  })();
}

app.get('/generate-sudoku', async (req, res) => {
  try {
    const seeded = prng.generate();
    iteration++;
    await python.ex`
      import json
      from sudoku import Sudoku

      def generate_sudoku(seed):
          result = Sudoku(3, 3, seed=seed).difficulty(0.5).board
          for i, row in enumerate(result):
              for j, value in enumerate(row):
                  if value is None:
                      result[i][j] = -1
          return json.dumps(result)
    `;

    const sudokuJson = await python`generate_sudoku(${seeded})`;
    const sudoku = JSON.parse(sudokuJson);

    await pool.execute(
      'INSERT INTO game_results (beacon,pulse, generated_number, game_name, game_result, iteration) VALUES (?, ?, ?, ?, ?, ?)',
      [beacon, currentSeed, seeded, 'Sudoku', 'Generated Sudoku Board', iteration]
    );

    res.json(sudoku);
  } catch (error) {
    console.error('Error generating Sudoku:', error);
    res.status(500).send('Error generating Sudoku');
  }
});

app.get('/flip-coin', async (req, res) => {
  try {
    const output = prng.generate();
    iteration++;
    const coin = Number(BigInt('0x' + output) % 2n);

    await pool.execute(
      'INSERT INTO game_results (beacon,pulse, generated_number, game_name, game_result, iteration) VALUES (?, ?, ?, ?, ?,?)',
      [beacon, currentSeed, output, 'Coins', coin ? 'Heads' : 'Tails', iteration]
    );

    res.json(coin);
  } catch (error) {
    console.error('Error flipping coin:', error);
    res.status(500).send('Error flipping coin');
  }
});

app.get('/slots', async (req, res) => {
  try {
    const fruits = 3;
    const rolls = [];
    for (let i = 0; i < fruits; i++) {
      const output = prng.generate();
      iteration++;
      const roll = Number(BigInt('0x' + output) % BigInt(fruits)) + 1;
      await pool.execute(
        'INSERT INTO game_results (beacon,pulse, generated_number, game_name, game_result, iteration) VALUES (?, ?, ?, ?, ?, ?)',
        [beacon, currentSeed, output, `Slots`, `${roll}`, iteration]
      );
      rolls.push(roll.toString());
    }

    res.json(rolls);
  } catch (error) {
    console.error('Error rolling slots:', error);
    res.status(500).send('Error rolling slots');
  }
});

app.get('/roll-dice', async (req, res) => {
  try {
    const { numberOfDice, type } = req.query;
    const numDice = parseInt(numberOfDice, 10);
    const diceType = parseInt(type.substring(1), 10);

    const rolls = [];
    for (let i = 0; i < numDice; i++) {
      const output = prng.generate();
      iteration++;
      const roll = Number(BigInt('0x' + output) % BigInt(diceType)) + 1;
      await pool.execute(
        'INSERT INTO game_results (beacon,pulse, generated_number, game_name, game_result, iteration) VALUES (?, ?, ?, ?, ?, ?)',
        [beacon, currentSeed, output, `Dices-d${diceType}`, `${roll}`, iteration]
      );
      rolls.push(roll.toString());
    }

    res.json(rolls);
  } catch (error) {
    console.error('Error rolling dice:', error);
    res.status(500).send('Error rolling dice');
  }
});

app.get('/rock-paper-scissors', async (req, res) => {
  try {
    const seeded = prng.generate();
    iteration++;
    const RPS = Number(BigInt('0x' + seeded) % 3n);
    const result = RPS === 0 ? "rock" : RPS === 1 ? "paper" : "scissors";

    await pool.execute(
      'INSERT INTO game_results (beacon, pulse, generated_number, game_name, game_result, iteration) VALUES (?, ?, ?, ?, ?, ?)',
      [beacon, currentSeed, seeded, 'RPS', result, iteration]
    );

    res.json({ result });
  } catch (error) {
    console.error('Error playing rock-paper-scissors:', error);
    res.status(500).send('Error playing rock-paper-scissors');
  }
});

app.get('/game-stats', async (req, res) => {
  try {
    const { game } = req.query;
    const [rows] = await pool.execute('SELECT game_name, game_result, created_at FROM game_results WHERE game_name = ?', [game]);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching game stats:', error);
    res.status(500).send('Error fetching game stats');
  }
});

app.get('/get-pulse', (req, res) => {
  res.json({ currentSeed, beacon, iteration });
});

process.on('SIGINT', async () => {
  await pool.end();
  process.exit(0);
});