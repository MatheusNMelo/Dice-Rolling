import * as React from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { SidebarData } from './SidebarData';
import { Link } from 'react-router-dom';
import logo from './logo.png';
import logo2 from './logo2.png';

export default function TemporaryDrawer() {
  const [open, setOpen] = React.useState(false);
  const [timeLeft, setTimeLeft] = React.useState(60);
  const [iteration, setIteration] = React.useState(null);

  const toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
  };

  const fetchPulse = async () => {
    try {
      const response = await fetch('http://localhost:5000/get-pulse');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setIteration(data.iteration);
    } catch (error) {
      console.error('Error fetching pulse:', error);
    }
  };

  React.useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const seconds = now.getSeconds();
      const timeToNextMinute = 60 - seconds;
      setTimeLeft(timeToNextMinute);
    };

    updateTimer();
    const timerInterval = setInterval(updateTimer, 100);
    const pulseInterval = setInterval(fetchPulse, 100);

    return () => {
      clearInterval(timerInterval);
      clearInterval(pulseInterval);
    };
  }, []);

  const DrawerList = (
    <Box sx={{ width: 250 }} role="presentation" onClick={toggleDrawer(false)}>
      <img src={logo2} alt="Logo" style={{ height: '85px', width: 'auto' }} />
      <List>
        {SidebarData.map((item, index) => (
          <ListItem key={index} disablePadding>
            <ListItemButton component={Link} to={item.path}>
              <ListItemIcon>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.title} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
    </Box>
  );

  return (
    <div>
      <Button className='LogoButton' onClick={toggleDrawer(true)}>
        <img src={logo} alt="Logo" style={{ height: '100px', width: 'auto' }} />
      </Button>
      <Drawer open={open} onClose={toggleDrawer(false)}>
        {DrawerList}
      </Drawer>
      <div style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: 'rgba(0, 0, 0, 0.1)', padding: '10px', borderRadius: '5px', color: 'white', textAlign: 'center' }}>
        <h2 style={{ margin: 0 }}>Current pulse has {iteration} iterations</h2>
        <p style={{ margin: 0 }}>New pulse in: {timeLeft} seconds</p>
      </div>
    </div>
  );
}