// List available Gemini models
const https = require('https');
require('dotenv').config({ path: '.env' });

const apiKey = process.env.GEMINI_API_KEY;
console.log('Listing available models...\n');

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

https.get(url, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      if (parsed.models) {
        console.log('Available models:');
        parsed.models.forEach(model => {
          if (model.supportedGenerationMethods && model.supportedGenerationMethods.includes('generateContent')) {
            console.log(`  ✅ ${model.name} - ${model.displayName}`);
          }
        });
      } else {
        console.log('Response:', JSON.stringify(parsed, null, 2));
      }
    } catch (e) {
      console.log('Error parsing response:', e.message);
      console.log('Raw response:', data);
    }
  });
}).on('error', (error) => {
  console.error('Request error:', error.message);
});
