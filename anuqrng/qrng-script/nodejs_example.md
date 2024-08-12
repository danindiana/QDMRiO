You're correct that this type of program could be implemented in Node.js, which offers several advantages for handling asynchronous operations, JSON parsing, and network requests. Node.js is particularly well-suited for tasks involving HTTP requests and data processing.

Here's an equivalent Node.js script that performs the same tasks as your Bash script:

1. Sends HTTP requests to the QRNG API.
2. Handles retries for failed requests.
3. Parses and logs JSON responses.
4. Extracts and prints hex numbers.
5. Handles graceful shutdown on Ctrl+C.

```javascript
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
```

### Explanation of the Node.js Script:

1. **Dependencies**: The script uses `axios` for making HTTP requests and `fs` for file operations.
2. **makeRequest Function**: This function attempts to make an HTTP GET request to the QRNG API. It retries up to 3 times if the request fails.
3. **Error Handling**: Errors are logged to `error.log` and printed to the console.
4. **JSON Parsing**: The script checks if the `success` field in the JSON response is `true` before processing the data.
5. **Hex Numbers Extraction**: The script extracts and prints the hex numbers from the JSON response.
6. **Graceful Shutdown**: The script listens for the `SIGINT` signal (Ctrl+C) and calls the `shutdown` function to exit gracefully.
7. **Main Loop**: The script runs an infinite loop, making requests every 60 seconds.

This Node.js script provides a more robust and flexible solution for handling HTTP requests and JSON data compared to the Bash script.
