import React, { useState } from 'react';
import './RockPaperScissors.css';
import Divider from '@mui/material/Divider';

export const images = {
  rock: 'https://static.thenounproject.com/png/477918-512.png',
  paper: 'https://static.thenounproject.com/png/477912-512.png',
  scissors: 'https://static.thenounproject.com/png/477919-512.png',
};

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
  const [wins, setWins] = useState(0);
  const [losses, setLosses] = useState(0);
  const [ties, setTies] = useState(0);
  const [outcome, setOutcome] = useState('');

  const onClickThrow = async () => {
    try {
      const throwResult = await throwHand();
      setResultHand(throwResult.result);

      if (throwResult.result === userHand) {
        setOutcome('It\'s a tie!');
        setTies(prev => prev + 1);
      } else if (
        (userHand === 'rock' && throwResult.result === 'scissors') ||
        (userHand === 'paper' && throwResult.result === 'rock') ||
        (userHand === 'scissors' && throwResult.result === 'paper')
      ) {
        setOutcome('You win!');
        setWins(prev => prev + 1);
      } else {
        setOutcome('You lose!');
        setLosses(prev => prev + 1);
      }

      if (throwResult.result === 'rock') {
        setRock(prev => prev + 1);
      } else if (throwResult.result === 'paper') {
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
    setWins(0);
    setLosses(0);
    setTies(0);
    setUserHand('');
    setResultHand('');
    setOutcome('');
  };


  const total = rock + paper + scissors;
  return (
    <div className="bg-container">
      <div className="app-container">
        <h1 className="heading">Rock Paper Scissors</h1>
        <Divider sx={{ backgroundColor: "black" }} />
        <p className="desc">Choose your hand!</p>
        <div className="hand-selection">
          <button className="button" onClick={() => setUserHand('rock')}>Rock</button>
          <button className="button" onClick={() => setUserHand('paper')}>Paper</button>
          <button className="button" onClick={() => setUserHand('scissors')}>Scissors</button>
        </div>
        <button className="button" type="button" onClick={onClickThrow} disabled={!userHand}>
          Throw hand
        </button>
        <div className="result-hand-container">
          {resultHand && (
            <div className="user-hand-result">
              <h2 className="result-heading">Your Hand:</h2>
              <img src={images[userHand]} className="image" alt="Users choice" />
            </div>
          )}
          {resultHand && (
            <div className="beacon-hand-result">
              <h2 className="result-heading">Beacon:</h2>
              <img src={images[resultHand]} className="image" alt="Beacon result" />
            </div>
          )}
        </div>
        <h1>{outcome}</h1>
        <div className="count-container">
          <p className="count">{`Rock: ${rock}`}</p>
          <p className="count">{`Paper: ${paper}`}</p>
          <p className="count">{`Scissors: ${scissors}`}</p>
        </div>
        <div className="count-container">
          <p className="count">{`Losses: ${losses}`}</p>
          <p className="count">{`Wins: ${wins}`}</p>
          <p className="count">{`Ties: ${ties}`}</p>
          <p className="count">{`Total: ${total}`}</p>
        </div>
        <button className="button" type="button" onClick={resetCounts}>
          Reset
        </button>
      </div>
    </div>
  );
};

export default ThrowHand;