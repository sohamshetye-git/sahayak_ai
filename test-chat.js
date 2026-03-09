// Quick test script to check chat endpoint
const fetch = require('node-fetch');

async function testChat() {
  try {
    console.log('Testing chat endpoint...');
    const response = await fetch('http://localhost:3001/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Hello, tell me about PM-KISAN scheme',
        language: 'en'
      })
    });

    const data = await response.json();
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testChat();
