import * as React from 'react';
import { PieChart, BarChart } from '@mui/x-charts';
import CircularProgress from '@mui/material/CircularProgress';
import { Select, MenuItem, InputLabel, FormControl, Typography, Alert, Divider } from '@mui/material';
import './Stats.css';
import {
  mangoFusionPalette,
} from '@mui/x-charts/colorPalettes';


export default function Stats() {
  const [data, setData] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [selectedGame, setSelectedGame] = React.useState('Coins');
  const games = ['RPS', 'Dices', 'Coins'];
  const [selectedDiceType, setSelectedDiceType] = React.useState('d4');
  const diceTypes = ['d4', 'd6', 'd8', 'd10', 'd12', 'd20'];

  React.useEffect(() => {
    const fetchData = async () => {
      if (!selectedGame) return;

      setLoading(true);
      setError(null);
      try {
        let gameIdentifier = selectedGame;
        if (selectedGame === 'Dices') {
          gameIdentifier = `${selectedGame}-${selectedDiceType}`;
        }
        const response = await fetch(`http://localhost:5000/game-stats?game=${gameIdentifier}`);

        if (response.status !== 200) {
          throw new Error('Network response was not ok');
        }
        let chartData = '';
        const result = await response.json();
        const aggregatedData = result.reduce((acc, item) => {
          let gameResult = item.game_result.toLowerCase();
          if (selectedGame === 'Dices') {
            gameResult = gameResult.split(':').pop();
          }
          acc[gameResult] = (acc[gameResult] || 0) + 1;
          return acc;
        }, {});
        chartData = Object.entries(aggregatedData).map(([label, value]) => ({
          label,
          value,
        }));

        setData(chartData);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Could not fetch data for the selected game. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedGame, selectedDiceType]);

  const handleGameChange = (event) => {
    setSelectedGame(event.target.value);
    setData([]);
  };

  const handleDiceTypeChange = (event) => {
    setSelectedDiceType(event.target.value);
    setData([]);
  };

  if (loading) {
    <div className="loading-container">
      return <CircularProgress variant="plain" color="neutral" />;
    </div>
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }
  return (
    <div className="bg-container">
      <div className="app-container">
        <h1 className="heading">Games Statistics</h1>
        <Divider sx={{ backgroundColor: "black", marginBottom: 2 }} />

        <div className="result-hand-container">
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
          {selectedGame === 'Dices' && (
            <FormControl sx={{ width: '150px', marginLeft: 2 }} margin="normal">
              <InputLabel id="dice-type-label">Select Dice Type</InputLabel>
              <Select
                labelId="dice-type-label"
                value={selectedDiceType}
                onChange={handleDiceTypeChange}
              >
                {diceTypes.map((diceType) => (
                  <MenuItem key={diceType} value={diceType}>
                    {diceType}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </div>
        {data.length > 0 ? (
          selectedGame === 'Dices' ? (
            <BarChart
              series={[{ dataKey: 'value', name: 'Rolled' }]}
              dataset={data}
              xAxis={[{ scaleType: 'band', dataKey: 'label' }]}
              height={300}
              colors={mangoFusionPalette}
            />
          ) : (<PieChart
            height={300}
            colors={mangoFusionPalette}
            series={[
              {
                data: data.slice(0, 4),
                innerRadius: 80,
                arcLabel: (params) => params.label ?? '',
                arcLabelMinAngle: 20,
              },
            ]}
          />)
        ) : (
          selectedGame && <Typography variant="body1">No data available for the selected game.</Typography>
        )}
      </div>
    </div>
  );
}