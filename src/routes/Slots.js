import React, { useState } from 'react';
import './Slots.css';
import Alert from '@mui/material/Alert';

export const symbols = ['🍒', '🍋', '🍊',];

const mapNumberToSymbol = (number) => {
  return symbols[parseInt(number) - 1];
};

const SlotGame = () => {
  const [reels, setReels] = useState(['🍒', '🍒', '🍒']);
  const [spinning, setSpinning] = useState(false);
  const [alert, setAlert] = useState({ message: '', severity: '', show: false });

  const spinReels = async () => {
    setSpinning(true);
    setAlert({ message: '', severity: '', show: false });

    try {
      const response = await fetch('http://localhost:5000/slots');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      const newReels = data.map(mapNumberToSymbol);

      setTimeout(() => {
        setSpinning(false);
        setReels(newReels);

        if (newReels[0] === newReels[1] && newReels[1] === newReels[2]) {
          setAlert({ message: 'YOU WIN!', severity: 'success', show: true });
        } else {
          setAlert({ message: 'AW, DANGIT!', severity: 'error', show: true });
        }
      }, 500);
    } catch (error) {
      console.error('Error spinning slots:', error);
      setSpinning(false);
      setAlert({ message: 'Failed to spin reels. Please try again.', severity: 'error', show: true });
    }
  };

  return (
    <div className="bg-container">
      <div className="app-container">
        <h1 className="heading">Slots</h1>
        <div className="reels">
          {reels.map((symbol, index) => (
            <div key={index} className={`reel ${spinning ? 'reel-spinning' : ''}`}>
              {symbol}
            </div>
          ))}
        </div>
        <button className="button" onClick={spinReels} disabled={spinning}>
          {spinning ? 'Girando...' : 'Girar'}
        </button>
        {alert.show && (
          <Alert severity={alert.severity} onClose={() => setAlert({ ...alert, show: false })}>
            {alert.message}
          </Alert>
        )}
      </div>
    </div>
  );
};

export default SlotGame;