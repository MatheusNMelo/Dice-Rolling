import React from "react";

import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import Box from '@mui/material/Box';

import './Home.css';
const pulse = '';
function Home() {

  return (
    <Box>
      <Card sx={{ textAlign: "center", alignItems: "center", justifyContent: "center" }}>
        <Typography variant="body" gutterBottom color="black">This application aims to retrieve, treat and use data from
          a given Radomness Beacon pulse to use as a source for randomness in different games, the current Randomness
          Beacon being used is the NIST Randomness Beacon and the current pulse value is:{pulse}.
          Clicking on the logo in the top-left will reveal a navbar containing the different available games that will use this pulse as
          a source for their truly random generation, enjoy!</Typography>
      </Card>
    </Box>

  )
}
export default Home;