const express = require('express');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

let currentSeed = null;
let generatedNumber = null;

// Function to fetch the seed from an external source
async function fetchSeed() {
  try {
    const response = await axios.get('https://api.example.com/seed'); // Replace with your seed URL
    currentSeed = response.data.seed; // Adjust based on the structure of your response
    generateNumber(currentSeed);
  } catch (error) {
    console.error('Error fetching seed:', error);
  }
}

// Function to generate a number based on the seed
function generateNumber(seed) {
  // Simple example of generating a number based on the seed
  // You can replace this with your own logic
  generatedNumber = Math.abs(seed % 100); // Generates a number between 0 and 99
}

// Fetch seed every minute
setInterval(fetchSeed, 60 * 1000);

// Initial fetch
fetchSeed();

// Endpoint to get the generated number
app.get('/number', (req, res) => {
  res.json({ number: generatedNumber });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});