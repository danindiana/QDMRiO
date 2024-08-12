To set up the Node.js script on your Vagrant VM running Ubuntu 22.04, you'll need to follow these steps:

Install Node.js and npm: First, you need to install Node.js and npm (Node Package Manager) on your VM.

Create the Node.js Script: Create a new file for your Node.js script and save it with the necessary code.

Install Dependencies: Use npm to install the required dependencies (axios).

Run the Script: Execute the script using Node.js.

Here are the detailed steps:

Step 1: Install Node.js and npm
Update the package list:

bash
Copy code
sudo apt update
Install Node.js and npm:

bash
Copy code
sudo apt install -y nodejs npm
Verify the installation:

bash
Copy code
node -v
npm -v
Step 2: Create the Node.js Script
Create a directory for your project:

bash
Copy code
mkdir qrng-script
cd qrng-script
Create the script file:

bash
Copy code
nano qrng.js
Paste the Node.js script into the file:

javascript
Copy code
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
Save and exit the file (Ctrl+X, then Y, then Enter).

Step 3: Install Dependencies
Initialize npm:

bash
Copy code
npm init -y
Install axios:

bash
Copy code
npm install axios
Step 4: Run the Script
Run the script:

bash
Copy code
node qrng.js
Additional Tips
Background Execution: If you want to run the script in the background, you can use nohup or screen.

Using nohup:

bash
Copy code
nohup node qrng.js &
Using screen:

bash
Copy code
screen -S qrng
node qrng.js
Then press Ctrl+A followed by D to detach the screen session. You can reattach it later with screen -r qrng.

Logging: Ensure that the script has write permissions to the directory where it is running to create and append to log files.

By following these steps, you should be able to set up and run the Node.js script on your Vagrant VM.
