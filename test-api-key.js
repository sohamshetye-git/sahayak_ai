// Test if the Gemini API key is valid
const https = require('https');
require('dotenv').config({ path: '.env' });

const apiKey = process.env.GEMINI_API_KEY;
console.log('Testing API Key:', apiKey ? apiKey.substring(0, 20) + '...' : 'NOT FOUND');

if (!apiKey) {
  console.error('No API key found in .env file!');
  process.exit(1);
}

// Test with a simple API call
const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;

const data = JSON.stringify({
  contents: [{
    parts: [{
      text: 'Hello'
    }]
  }]
});

const options = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = https.request(url, options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  
  let responseData = '';
  res.on('data', (chunk) => {
    responseData += chunk;
  });
  
  res.on('end', () => {
    try {
      const parsed = JSON.parse(responseData);
      if (res.statusCode === 200) {
        console.log('✅ API Key is VALID!');
        console.log('Response:', JSON.stringify(parsed, null, 2).substring(0, 200));
      } else {
        console.log('❌ API Key test failed');
        console.log('Error:', JSON.stringify(parsed, null, 2));
      }
    } catch (e) {
      console.log('Response:', responseData);
    }
  });
});

req.on('error', (error) => {
  console.error('Request error:', error.message);
});

req.write(data);
req.end();
