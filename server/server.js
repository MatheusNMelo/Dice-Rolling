const express = require('express');
const cors = require('cors');
const pythonBridge = require('python-bridge');
const python = pythonBridge();
const axios = require('axios');
const mongoose = require('mongoose');

const app = express();
const port = process.env.PORT || 5000;

mongoose.connect('mongodb://localhost:27017/games', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const gameSchema = new mongoose.Schema({
  pulse: String,
  generatedNumber: String,
  gameName: String,
  gameResult: String,
  createdAt: { type: Date, default: Date.now }
});

const Game = mongoose.model('Game', gameSchema);

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

    const gameResult = new Game({
      pulse: currentSeed,
      generatedNumber: seeded,
      gameName: 'Sudoku',
      gameResult: 'Generated Sudoku Board'
    });
    await gameResult.save();

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

    const gameResult = new Game({
      pulse: currentSeed,
      generatedNumber: seeded,
      gameName: 'Coin Flip',
      gameResult: coin ? 'Heads' : 'Tails'
    });
    await gameResult.save();

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
      const roll = (prng.generate() % BigInt(diceType)) + 1n;
      rolls.push(roll.toString());
    }

    const gameResult = new Game({
      pulse: currentSeed,
      generatedNumber: rolls.map(roll => prng.generate()).join(', '),
      gameName: `Rolling ${numDice}d${diceType}`,
      gameResult: `Rolled: ${rolls.join(', ')}`
    });
    await gameResult.save();

    res.json({ rolls });
  } catch (error) {
    console.error('Error rolling dice:', error);
    res.status(500).send('Error rolling dice');
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});