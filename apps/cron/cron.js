require('dotenv').config();
const path = require('path');

// Load .env.local if it exists, otherwise fall back to .env
const envPath = path.resolve(process.cwd(), '.env.local');
require('dotenv').config({ path: envPath });

async function fetchData() {
  try {
    console.log(`calling ..${process.env.WEB_BASE}/api/stats`);
    const response = await fetch(`${process.env.WEB_BASE}/api/stats`, {
      method: "GET",
      headers: {
        'Content-Type': 'application/json',
        'API_KEY': process.env.API_KEY,
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching data:', error);
    return null;
  }
}

async function main() {
  try {
    const resp = await fetchData();
    console.log('resp', resp);
  } catch (error) {
    console.log(error);
  }
}

main();
