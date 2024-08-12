const axios = require('axios');
const fs = require('fs');

const API_URL = 'https://qrng.anu.edu.au/API/jsonI.php?length=1024&type=hex16';
const ERROR_LOG_FILE = 'error.log';
const RANDOM_NUMBERS_FILE = 'random_numbers.json';

const makeRequest = async () => {
  const retries = 3;
  const delay = 2000; // 2 seconds

  for (let i = 1; i <= retries; i++) {
    console.log(`Sending request to QRNG API (Attempt ${i})...`);
    try {
      const response = await axios.get(API_URL);
      if (response.status === 200) {
        console.log(`Request successful (Status code: ${response.status})`);
        const jsonResponse = response.data;

        if (jsonResponse.success) {
          fs.appendFileSync(RANDOM_NUMBERS_FILE, JSON.stringify(jsonResponse) + '\n');
          console.log('Valid JSON response received.');
          console.log('Received JSON data:', JSON.stringify(jsonResponse, null, 2));
          console.log('Extracting hex numbers...');
          const hexNumbers = jsonResponse.data.join('\n');
          console.log(hexNumbers);
          return true;
        } else {
          console.error('Request was not successful. Success field is false.');
          fs.appendFileSync(ERROR_LOG_FILE, 'Request was not successful. Success field is false.\n');
        }
      } else {
        console.error(`Request failed or rate limit exceeded (Status code: ${response.status}).`);
        fs.appendFileSync(ERROR_LOG_FILE, `Request failed or rate limit exceeded, status code: ${response.status}\n`);
      }
    } catch (error) {
      console.error(`Request failed or rate limit exceeded (Error: ${error.message}).`);
      fs.appendFileSync(ERROR_LOG_FILE, `Request failed or rate limit exceeded, error: ${error.message}\n`);
    }

    if (i < retries) {
      console.log(`Retrying in ${delay / 1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  return false;
};

const shutdown = () => {
  console.log('Shutting down... Saving any pending data and closing logs.');
  process.exit(0);
};

process.on('SIGINT', shutdown);

const mainLoop = async () => {
  while (true) {
    if (await makeRequest()) {
      console.log('Sleeping for 60 seconds before next request...');
      await new Promise(resolve => setTimeout(resolve, 60000));
    } else {
      console.log('Failed to get a valid response after 3 attempts. Sleeping for 60 seconds before next request...');
      await new Promise(resolve => setTimeout(resolve, 60000));
    }
  }
};

mainLoop();
