// server.js
const express = require('express');
const cors = require("cors");
const getMarketCaps = require('./coinmarketcap');
const getCoinInfo = require('./coininfo')

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.static('public')); // Make sure this doesn't conflict with your API route


let cachedData = null;
let coinInfo;

// declare coins for chart
// Shiba, Doge, WIF, Pepe, Bonk, Floki, COQ, WEN, MYRO, mog
const coinArray = [5994, 74, 23095, 24478, 28752, 10804, 28675, 29175, 28382, 27659];

const fetchMarketCaps = async () => {
  try {
    const data = await getMarketCaps(coinArray);
    cachedData = data; // Update the cached data with the new results
    console.log('Market caps updated:', new Date().toISOString());
  } catch (error) {
    console.error('Error fetching market cap data:', error);
  }
};

const fetchCoinInfo = async () => {
    try {
        const data = await getCoinInfo(coinArray);
        coinInfo = data;
        console.log(coinInfo)
      } catch (error) {
        console.error('Error fetching market cap data:', error);
      }
}

// Fetch market caps immediately when the server starts
fetchMarketCaps();
fetchCoinInfo();

// Set an interval to fetch market caps every five minutes
setInterval(fetchMarketCaps, 300000); // 300000 milliseconds = 5 minutes

app.get('/api/marketcap', async (req, res) => {
  // Check if cachedData is available, if not, it means initial fetch failed or is still pending
  if (cachedData) {
    res.json(cachedData);
  } else {
    res.status(503).json({ error: 'Market cap data is not available yet. Please try again later.' });
  }
});

app.get('/api/coininfo', async (req, res) => {
    res.json(coinInfo);
  });

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
