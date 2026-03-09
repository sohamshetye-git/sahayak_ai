// Test Gemini API Key
const https = require('https');

const API_KEY = 'AIzaSyBdVAyKoUIQR3twog1hNCtsVy-OqkyrngU';
const MODEL = 'gemini-1.5-flash';

const data = JSON.stringify({
  contents: [{
    parts: [{
      text: 'Hello, say hi back'
    }]
  }]
});

const options = {
  hostname: 'generativelanguage.googleapis.com',
  port: 443,
  path: `/v1/models/${MODEL}:generateContent?key=${API_KEY}`,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

console.log('Testing Gemini API...');
console.log('URL:', `https://${options.hostname}${options.path}`);

const req = https.request(options, (res) => {
  let responseData = '';

  res.on('data', (chunk) => {
    responseData += chunk;
  });

  res.on('end', () => {
    console.log('\nStatus Code:', res.statusCode);
    if (res.statusCode === 200) {
      console.log('✓ API KEY IS VALID!');
      const parsed = JSON.parse(responseData);
      console.log('Response:', parsed.candidates[0].content.parts[0].text);
    } else {
      console.log('✗ API KEY FAILED');
      console.log('Response:', responseData);
    }
  });
});

req.on('error', (error) => {
  console.error('✗ Request Error:', error.message);
});

req.write(data);
req.end();
