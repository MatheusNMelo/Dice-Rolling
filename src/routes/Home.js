import React, { useEffect, useState } from "react";
import Typography from '@mui/material/Typography';
import { CircularProgress } from '@mui/material';
import './RockPaperScissors.css';

function Home() {
  const [pulse, setPulse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPulse = async () => {
      try {
        const response = await fetch('http://localhost:5000/get-pulse');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setPulse(data.currentSeed);
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchPulse();
  }, []);

  return (
    <div className="bg-container">
      <div className="app-container">
        <Typography variant="h4" gutterBottom color="textPrimary">Welcome to the Beacon Dice Project</Typography>

        {loading && <CircularProgress color="primary" />}
        {error && <Typography variant="h6" color="error">{error.message}</Typography>}

        {pulse !== null && (
          <>
            <Typography variant="h6" gutterBottom color="textPrimary">
              This application aims to retrieve, treat and use data from a given Randomness Beacon pulse to use as a source for randomness in different games.<br />
              The current Randomness Beacon being used is the <strong>NIST Randomness Beacon</strong> and the current pulse value is:<br /><br />
              <strong>pulse</strong>.<br /><br />
              Clicking on the logo in the top-left will reveal a navbar containing the different available games that will use this pulse as
              a source for their truly random generation. <br /><strong>Enjoy!</strong>
            </Typography>
          </>
        )}
      </div>
    </div>
  );
}

export default Home;