const express = require('express');
const { PythonShell } = require('python-shell');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());

app.get('/generate-sudoku', (req, res) => {
  PythonShell.run('getSudoku.py', { args: ['World'] }, (err, results) => {
    if (err) {
      return res.status(500).send(err.toString());
    }
    console.log(JSON.parse(results[0]));
    res.json(JSON.parse(results[0]));
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});