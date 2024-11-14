import * as React from 'react';
import { PieChart } from '@mui/x-charts/PieChart';
import CircularProgress from '@mui/material/CircularProgress';
import { Select, MenuItem, InputLabel, FormControl, Typography, Alert, Divider } from '@mui/material';
import './Stats.css'; // Import the new CSS file for Stats

export default function Stats() {
  const [data, setData] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [selectedGame, setSelectedGame] = React.useState('Coins');
  const games = ['RPS', 'Dices', 'Coins'];

  React.useEffect(() => {
    const fetchData = async () => {
      if (!selectedGame) return;

      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`http://localhost:5000/game-stats?game=${selectedGame}`);

        if (response.status !== 200) {
          throw new Error('Network response was not ok');
        }

        const result = await response.json();
        const aggregatedData = result.reduce((acc, item) => {
          const gameResult = item.game_result.toLowerCase();
          acc[gameResult] = (acc[gameResult] || 0) + 1;
          return acc;
        }, {});

        const pieData = Object.entries(aggregatedData).map(([label, value]) => ({
          label,
          value,
        }));

        setData(pieData);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Could not fetch data for the selected game. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedGame]);

  const handleGameChange = (event) => {
    setSelectedGame(event.target.value);
    setData([]);
  };

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <div className="bg-container">
      <div className="app-container">
        <Typography variant="h4" align="center" gutterBottom>Game Statistics</Typography>
        <Divider sx={{ backgroundColor: "black", marginBottom: 2 }} />
        <FormControl sx={{ width: '150px' }} margin="normal">
          <InputLabel id="game-select-label">Select Game</InputLabel>
          <Select
            labelId="game-select-label"
            value={selectedGame}
            onChange={handleGameChange}
          >
            {games.map((game) => (
              <MenuItem key={game} value={game}>
                {game}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {data.length > 0 ? (
          <PieChart
            height={300}
            series={[
              {
                data: data.slice(0, 3),
                innerRadius: 80,
                arcLabel: (params) => params.label ?? '',
                arcLabelMinAngle: 20,
              },
            ]}
          />
        ) : (
          selectedGame && <Typography variant="body1">No data available for the selected game.</Typography>
        )}
      </div>
    </div>
  );
}