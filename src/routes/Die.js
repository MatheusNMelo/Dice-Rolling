import React from 'react';
import './Die.css';

const Die = ({ face, rolling }) => {
  return (
    <div className={`Die ${rolling ? 'Die-rolling' : ''}`}>
      {face}
    </div>
  );
};

export default Die;