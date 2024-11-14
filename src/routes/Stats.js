import * as React from 'react';
import Box from '@mui/material/Box';
import { PieChart } from '@mui/x-charts/PieChart';
import CircularProgress from '@mui/material/CircularProgress';
import axios from 'axios';

export default function PieAnimation() {
  const [data, setData] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const { game } = this.state;
        const response = await axios.get(`/roll-dice?numberOfDice=${game}`);
        if (!response.ok) {
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
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <Box sx={{ width: '100%' }}>
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
    </Box>
  );
}