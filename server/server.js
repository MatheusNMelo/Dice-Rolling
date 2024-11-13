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

class XorshiftPRNG {
  constructor(seedHex) {
    this.state = this.hexToUint64Array(seedHex);
  }

  hexToUint64Array(hex) {
    const uint64Array = [];
    for (let i = 0; i < hex.length; i += 16) {
      const chunk = hex.slice(i, i + 16);
      uint64Array.push(BigInt('0x' + chunk));
    }
    return uint64Array;
  }

  xorshift() {
    let t = this.state[0] ^ (this.state[0] << 13n);
    this.state[0] = this.state[1];
    this.state[1] = this.state[2];
    this.state[2] = this.state[3];
    this.state[3] = this.state[3] ^ (this.state[3] >> 9n) ^ (t ^ (t >> 6n));
    return this.state[3];
  }

  generate() {
    const randomValue = this.xorshift();
    return randomValue.toString(16).padStart(16, '0');
  }
}

async function fetchRoutine() {
  await fetchSeed();
  prng = new XorshiftPRNG(currentSeed);
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
    const seeded = prng.generate();
    const coin = Number(BigInt('0x' + seeded) % 2n);

    await pool.execute(
      'INSERT INTO game_results (pulse, generated_number, game_name, game_result) VALUES (?, ?, ?, ?)',
      [currentSeed, seeded, 'Coins', coin ? 'Heads' : 'Tails']
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
    const outputs = [];
    for (let i = 0; i < numDice; i++) {
      const output = prng.generate()
      const roll = (output % BigInt(diceType)) + 1n;
      rolls.push(roll.toString());
      outputs.push(output.toString());
    }

    await pool.execute(
      'INSERT INTO game_results (pulse, generated_number, game_name, game_result) VALUES (?, ?, ?, ?)',
      [currentSeed, outputs.join(', '), `Dices`, `Rolling ${numDice}d${diceType}, Rolled: ${rolls.join(', ')}`]
    );

    res.json({ rolls });
  } catch (error) {
    console.error('Error rolling dice:', error);
    res.status(500).send('Error rolling dice');
  }
});

app.get('/rock-paper-scissors', async (req, res) => {
  try {
    const seeded = prng.generate();
    const RPS = Number(BigInt('0x' + seeded) % 3n);
    let result = "";

    if (RPS === 0) {
      result = "rock";
    } else if (RPS === 1) {
      result = "paper";
    } else {
      result = "scissors";
    }

    await pool.execute(
      'INSERT INTO game_results (pulse, generated_number, game_name, game_result) VALUES (?, ?, ?, ?)',
      [currentSeed, seeded, 'RPS', result]
    );

    res.json(result);
  } catch (error) {
    console.error('Error throwing hand:', error);
    res.status(500).send('Error throwing hand');
  }
});


app.get('/sudoku-stats', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM game_results WHERE game_name = ?', ['Sudoku']);
    // Process data as needed
    res.json(rows);
  } catch (error) {
    console.error('Error fetching Sudoku stats:', error);
    res.status(500).send('Error fetching Sudoku stats');
  }
});

app.get('/rps-stats', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM game_results WHERE game_name = ?', ['RPS']);
    // Process data as needed
    res.json(rows);
  } catch (error) {
    console.error('Error fetching Sudoku stats:', error);
    res.status(500).send('Error fetching Sudoku stats');
  }
});

app.get('/dice-stats', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM game_results WHERE game_name = ?', ['Dices']);
    // Process data as needed
    res.json(rows);
  } catch (error) {
    console.error('Error fetching Sudoku stats:', error);
    res.status(500).send('Error fetching Sudoku stats');
  }
});

app.get('/coin-stats', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM game_results WHERE game_name = ?', ['Coins']);
    // Process data as needed
    res.json(rows);
  } catch (error) {
    console.error('Error fetching Sudoku stats:', error);
    res.status(500).send('Error fetching Sudoku stats');
  }
});


app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

process.on('SIGINT', async () => {
  await pool.end();
  console.log('MySQL connection closed');
  process.exit(0);
});