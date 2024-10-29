import React, { useState } from 'react';
import './Coin.css';

async function coinFlip() {
  const response = await fetch('http://localhost:5000/flip-coin');
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return await response.json();
}

const CoinToss = () => {
  const [toss, setToss] = useState('heads');
  const [heads, setHeads] = useState(0);
  const [tails, setTails] = useState(0);

  const onClickToss = async () => {
    try {
      const tossResult = await coinFlip();
      if (tossResult === 0) {
        setToss('heads');
        setHeads(prevHeads => prevHeads + 1);
      } else {
        setToss('tails');
        setTails(prevTails => prevTails + 1);
      }
    } catch (error) {
      console.error("Error fetching coin toss result:", error);
    }
  };

  const resetCounts = () => {
    setHeads(0);
    setTails(0);
  };

  const total = heads + tails;
  const imageElement = toss === 'heads'
    ? 'https://assets.ccbp.in/frontend/react-js/heads-img.png'
    : 'https://assets.ccbp.in/frontend/react-js/tails-img.png';

  return (
    <div className="bg-container">
      <div className="app-container">
        <h1 className="heading">Coin Toss</h1>
        <p className="desc">Heads (or) Tails</p>
        <div id="coin" className={toss} key={+new Date()}>
          <img src={imageElement} className="image" alt="toss result" />
        </div>
        <button className="button" type="button" onClick={onClickToss}>
          Toss Coin
        </button>
        <div className="count-container">
          <p className="count">{`Total: ${total}`}</p>
          <p className="count">{`Heads: ${heads}`}</p>
          <p className="count">{`Tails: ${tails}`}</p>
        </div>
        <button className="button" type="button" onClick={resetCounts}>
          Reset
        </button>
      </div>
    </div>
  );
};

export default CoinToss;