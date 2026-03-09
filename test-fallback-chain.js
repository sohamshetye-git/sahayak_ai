#!/usr/bin/env node

/**
 * Simple Fallback Chain Test
 * Single chat request to verify fallback chain works
 */

require('dotenv').config();

const API_URL = process.env.API_BASE_URL || 'http://localhost:3001';

console.log('🧪 Testing Fallback Chain...\n');
console.log(`📍 API URL: ${API_URL}\n`);

async function testChat() {
  try {
    console.log('📤 Sending single chat message...');
    
    const response = await fetch(`${API_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'What is 2+2?',
        language: 'en',
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ Chat API Error:', error);
      process.exit(1);
    }

    const data = await response.json();

    console.log('✅ Chat API Working!\n');
    console.log('Response:', data.text || data.message);
    console.log('\n📊 Provider used:', data.provider || 'unknown');
    console.log('✨ Fallback chain is working!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\n💡 Make sure backend is running: npm run dev');
    process.exit(1);
  }
}

testChat();
