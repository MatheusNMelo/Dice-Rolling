require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pythonBridge = require('python-bridge');
const python = pythonBridge();
const axios = require('axios');
const mysql = require('mysql2/promise');

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

app.use(cors());

async function fetchSeed() {
  try {
    const response = await axios.get('https://beacon.nist.gov/beacon/2.0/pulse/last');
    currentSeed = response.data.pulse.outputValue;
  } catch (error) {
    console.error('Error fetching seed:', error);
  }
}

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

async function fetchRoutine() {
  await fetchSeed();
  prng = new MersenneTwister(currentSeed);
}

setInterval(fetchRoutine, 60 * 1000);
fetchRoutine();

app.get('/generate-sudoku', async (req, res) => {
  try {
    const seeded = prng.generate();
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
      'INSERT INTO game_results (pulse, generated_number, game_name, game_result) VALUES (?, ?, ?, ?)',
      [currentSeed, seeded, 'Sudoku', 'Generated Sudoku Board']
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
    const coin = Number(BigInt('0x' + output) % 2n);

    await pool.execute(
      'INSERT INTO game_results (pulse, generated_number, game_name, game_result) VALUES (?, ?, ?, ?)',
      [currentSeed, output, 'Coins', coin ? 'Heads' : 'Tails']
    );

    res.json(coin);
  } catch (error) {
    console.error('Error flipping coin:', error);
    res.status(500).send('Error flipping coin');
  }
});

app.get('/roll-dice', async (req, res) => {
  try {
    const { numberOfDice, type } = req.query;

    if (!numberOfDice || !type) {
      return res.status(400).send('Please provide both numberOfDice and type parameters.');
    }

    const numDice = parseInt(numberOfDice, 10);
    if (isNaN(numDice) || numDice <= 0) {
      return res.status(400).send('numberOfDice must be a positive integer.');
    }

    const diceType = parseInt(type.substring(1), 10);
    if (isNaN(diceType) || diceType <= 0) {
      return res.status(400).send('Invalid dice type. Please use d4, d6, etc.');
    }

    const rolls = [];
    for (let i = 0; i < numDice; i++) {
      const output = prng.generate();
      const roll = Number(BigInt('0x' + output) % BigInt(diceType)) + 1;
      await pool.execute(
        'INSERT INTO game_results (pulse, generated_number, game_name, game_result) VALUES (?, ?, ?, ?)',
        [currentSeed, output, `Dices-d${diceType}`, `${roll}`]
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
    const RPS = Number(BigInt('0x' + seeded) % 3n);
    const result = RPS === 0 ? "rock" : RPS === 1 ? "paper" : "scissors";

    await pool.execute(
      'INSERT INTO game_results (pulse, generated_number, game_name, game_result) VALUES (?, ?, ?, ?)',
      [currentSeed, seeded, 'RPS', result]
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
  res.json({ currentSeed });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

process.on('SIGINT', async () => {
  await pool.end();
  process.exit(0);
});