import React, { useState } from 'react';
import './RockPaperScissors.css';

async function throwHand() {
  const response = await fetch('http://localhost:5000/rock-paper-scissors');
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return await response.json();
}

const ThrowHand = () => {
  const [userHand, setUserHand] = useState('');
  const [resultHand, setResultHand] = useState('');
  const [rock, setRock] = useState(0);
  const [paper, setPaper] = useState(0);
  const [scissors, setScissors] = useState(0);
  const [outcome, setOutcome] = useState('');

  const onClickThrow = async () => {
    try {
      const throwResult = await throwHand();
      setResultHand(throwResult);

      // Compare user hand with result hand
      if (throwResult === userHand) {
        setOutcome('It\'s a tie!');
      } else if (
        (userHand === 'rock' && throwResult === 'scissors') ||
        (userHand === 'paper' && throwResult === 'rock') ||
        (userHand === 'scissors' && throwResult === 'paper')
      ) {
        setOutcome('You win!');
      } else {
        setOutcome('You lose!');
      }

      // Update counts based on the result
      if (throwResult === 'rock') {
        setRock(prev => prev + 1);
      } else if (throwResult === 'paper') {
        setPaper(prev => prev + 1);
      } else {
        setScissors(prev => prev + 1);
      }
    } catch (error) {
      console.error("Error fetching hand throw result:", error);
    }
  };

  const resetCounts = () => {
    setRock(0);
    setPaper(0);
    setScissors(0);
    setUserHand('');
    setResultHand('');
    setOutcome('');
  };

  const total = rock + paper + scissors;
  const imageElement = resultHand === 'rock'
    ? 'https://assets.ccbp.in/frontend/react-js/rock-img.png'
    : resultHand === 'paper'
      ? 'https://assets.ccbp.in/frontend/react-js/paper-img.png'
      : 'https://assets.ccbp.in/frontend/react-js/scissors-img.png';

  return (
    <div className="bg-container">
      <div className="app-container">
        <h1 className="heading">Rock Paper Scissors</h1>
        <p className="desc">Choose your hand!</p>
        <div className="hand-selection">
          <button className="button" onClick={() => setUserHand('rock')}>Rock</button>
          <button className="button" onClick={() => setUserHand('paper')}>Paper</button>
          <button className="button" onClick={() => setUserHand('scissors')}>Scissors</button>
        </div>
        <button className="button" type="button" onClick={onClickThrow} disabled={!userHand}>
          Throw hand
        </button>
        {resultHand && (
          <div className="result-container">
            <h2 className="result-heading">Result:</h2>
            <div className="result-hand">
              <img src={imageElement} className="image" alt="hand result" />
            </div>
            <p>{outcome}</p>
          </div>
        )}
        <div className="count-container">
          <p className="count">{`Total: ${total}`}</p>
          <p className="count">{`Rock: ${rock}`}</p>
          <p className="count">{`Paper: ${paper}`}</p>
          <p className="count">{`Scissors: ${scissors}`}</p>
        </div>
        <button className="button" type="button" onClick={resetCounts}>
          Reset
        </button>
      </div>
    </div>
  );
};

export default ThrowHand;