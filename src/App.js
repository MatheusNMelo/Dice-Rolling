import './App.css';
import { useState, useEffect } from 'react';

async function generateNewSudoku() {
  const response = await fetch('http://localhost:5000/generate-sudoku');
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return await response.json();
}

function App() {
  const [sudokuArr, setSudokuArr] = useState([]);
  const [initial, setInitial] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchSudoku = async () => {
      setLoading(true);
      try {
        const initialSudoku = await generateNewSudoku();
        setInitial(initialSudoku);
        setSudokuArr(getDeepCopy(initialSudoku));
      } catch (error) {
        console.error("Error fetching Sudoku:", error);
      }
      setLoading(false);
    };

    fetchSudoku();
  }, []);

  function getDeepCopy(arr) {
    return JSON.parse(JSON.stringify(arr));
  }

  function onInputChange(e, row, col) {
    const val = parseInt(e.target.value) || -1;
    const grid = getDeepCopy(sudokuArr);
    if (val === -1 || (val >= 1 && val <= 9)) {
      grid[row][col] = val;
    }
    setSudokuArr(grid);
  }

  function compareSudokus(currentSudoku, solvedSudoku) {
    let res = {
      isComplete: true,
      isSolvable: true,
    };
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (currentSudoku[i][j] !== solvedSudoku[i][j]) {
          if (currentSudoku[i][j] !== -1) {
            res.isSolvable = false;
          }
          res.isComplete = false;
        }
      }
    }
    return res;
  }

  function checkSudoku() {
    let sudoku = getDeepCopy(initial);
    solver(sudoku);
    let compare = compareSudokus(sudokuArr, sudoku);
    if (compare.isComplete) {
      alert("Completed!");
    } else if (compare.isSolvable) {
      alert("Partially Correct!");
    } else {
      alert("Incorrect!");
    }
  }

  async function generateSeedPuzzle() {
    try {
      const newSudoku = await generateNewSudoku();
      setInitial(newSudoku);
      setSudokuArr(getDeepCopy(newSudoku));
    } catch (error) {
      console.error("Error generating new Sudoku:", error);
    }
  }

  function checkRow(grid, row, num) {
    return grid[row].indexOf(num) === -1;
  }

  function checkCol(grid, col, num) {
    return grid.map(row => row[col]).indexOf(num) === -1;
  }

  function checkBox(grid, row, col, num) {
    let boxArr = [];
    const rowStart = row - (row % 3);
    const colStart = col - (col % 3);
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        boxArr.push(grid[rowStart + i][colStart + j]);
      }
    }
    return boxArr.indexOf(num) === -1;
  }

  function checkValid(grid, row, col, num) {
    return checkRow(grid, row, num) && checkCol(grid, col, num) && checkBox(grid, row, col, num);
  }

  function getNext(row, col) {
    return col !== 8 ? [row, col + 1] : row !== 8 ? [row + 1, 0] : [0, 0];
  }

  function solver(grid, row = 0, col = 0) {
    if (grid[row][col] !== -1) {
      const isLast = row >= 8 && col >= 8;
      if (!isLast) {
        const [newRow, newCol] = getNext(row, col);
        return solver(grid, newRow, newCol);
      }
    }
    for (let num = 1; num <= 9; num++) {
      if (checkValid(grid, row, col, num)) {
        grid[row][col] = num;
        const [newRow, newCol] = getNext(row, col);
        if (!newRow && !newCol) {
          return true;
        }
        if (solver(grid, newRow, newCol)) {
          return true;
        }
      }
    }
    grid[row][col] = -1;
    return false;
  }

  function solveSudoku() {
    let sudoku = getDeepCopy(initial);
    solver(sudoku);
    setSudokuArr(sudoku);
  }

  function resetSudoku() {
    let sudoku = getDeepCopy(initial);
    setSudokuArr(sudoku);
  }

  return (
    <div className="App">
      {loading ? <p>Loading...</p> : (
        <div className="App-header">
          <h3>Sudoku Solver</h3>
          <div>
            <button className="newPuzzle" onClick={generateSeedPuzzle}>New Puzzle</button>
          </div>
          <table>
            <tbody>
              {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((row, rIndex) => (
                <tr key={rIndex} className={(row + 1) % 3 === 0 ? 'bBorder' : ''}>
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((col, cIndex) => (
                    <td key={rIndex + cIndex} className={(col + 1) % 3 === 0 ? 'rBorder' : ''}>
                      <input
                        onChange={(e) => onInputChange(e, row, col)}
                        value={sudokuArr[row][col] === -1 ? '' : sudokuArr[row][col]}
                        className="cellInput"
                        disabled={initial[row][col] !== -1}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="buttonContainer">
            <button className="checkButton" onClick={checkSudoku}>Check</button>
            <button className="solveButton" onClick={solveSudoku}>Solve</button>
            <button className="resetButton" onClick={resetSudoku}>Reset</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;