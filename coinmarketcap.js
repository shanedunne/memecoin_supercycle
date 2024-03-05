// coinmarketcap.js
require('dotenv').config();
const axios = require('axios');

const headers = {
  'X-CMC_PRO_API_KEY': process.env.COINMARKETCAP_API_KEY
};

const apiUrl = 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest';

// Function to fetch data for a specific set of coins
async function getMarketCaps(coinArray) {
  const params = {
    id: coinArray.join(',') // This is likely where you had the error if coinArray was undefined
  };

  try {
    const response = await axios.get(apiUrl, { headers, params });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching market cap data:', error);
    throw error; // Rethrow the error so you can handle it in the caller
  }
}

module.exports = getMarketCaps;

