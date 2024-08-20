const dotenv = require("dotenv");
dotenv.config();

// function generateSHA256Checksum(data) {
//     return _crypto.createHash('sha256').update(data, 'utf8').digest('hex');
// }

async function fetchData() {
  try {
    console.log(`calling ..${process.env.WEB_BASE}/api/stats`);
    const response = await fetch(`${process.env.WEB_BASE}/api/stats`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
}

async function main() {
  try {
    const resp = await fetchData();
    console.log("resp", resp);
  } catch (error) {
    console.log(error);
  }
}

main();
