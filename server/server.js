const express = require('express');
const cors = require('cors');
const pythonBridge = require('python-bridge');
const python = pythonBridge();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());

app.get('/', (req, res) => {
  res.send('Welcome to the Sudoku Generator API! Use /generate-sudoku to get a Sudoku puzzle.');
});

app.get('/generate-sudoku', async (req, res) => {
  try {
    await python.ex`
      import json
      import random
      import requests
      from sudoku import Sudoku

      def get_external_data():
          url = "https://beacon.nist.gov/beacon/2.0/pulse/last"
          response = None

          try:
              response = requests.get(url, timeout=3)
              response.raise_for_status()
          except requests.exceptions.Timeout:
              print("Timed out =(")
              return None
          except requests.exceptions.RequestException as e:
              print(f"An error occurred: {e}")
              return None

          if response.status_code == 200:
              data = response.json()
              output = data["pulse"]["outputValue"]
              return int(output, 16)

      def get_seed():
          decimal = str(get_external_data())
          sample = int("".join(random.sample(decimal, int((len(decimal)) / 2))))
          return sample

      def generate_sudoku():
          SEEDED = get_seed()
          result = Sudoku(3, 3, seed=SEEDED).difficulty(0.5).board
          for i, row in enumerate(result):
              for j, value in enumerate(row):
                  if value is None:
                      result[i][j] = -1
          return json.dumps(result)
    `;

    const sudokuJson = await python`generate_sudoku()`;
    const sudoku = JSON.parse(sudokuJson);

    res.json(sudoku);
  } catch (error) {
    console.error('Error executing Python code:', error);
    res.status(500).send('Error generating Sudoku');
  }
});

app.get('/flip-coin', async (req, res) => {
  try {
    await python.ex`
      import json
      import random
      import requests

      def get_external_data():
          url = "https://beacon.nist.gov/beacon/2.0/pulse/last"
          response = None

          try:
              response = requests.get(url, timeout=3)
              response.raise_for_status()
          except requests.exceptions.Timeout:
              print("Timed out =(")
              return None
          except requests.exceptions.RequestException as e:
              print(f"An error occurred: {e}")
              return None

          if response.status_code == 200:
              data = response.json()
              output = data["pulse"]["outputValue"]
              return int(output, 16)

      def get_seed():
          decimal = str(get_external_data())
          sample = int("".join(random.sample(decimal, int((len(decimal)) / 2))))
          return sample

      def flip_coin():
          SEEDED = get_seed()
          random.seed(SEEDED)
          flip = random.randint(0,1)  # Change the range as needed
          return json.dumps(flip)
    `;

    const flipJson = await python`flip_coin()`;
    const coin = JSON.parse(flipJson);

    res.json(coin);
  } catch (error) {
    console.error('Error executing Python code:', error);
    res.status(500).send('Error flipping coin');
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});