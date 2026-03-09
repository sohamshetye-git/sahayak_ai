#!/usr/bin/env node

/**
 * Simple Groq API Test
 * Single request to verify Groq is working
 */

require('dotenv').config();

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = 'llama-3.1-8b-instant';

if (!GROQ_API_KEY) {
  console.error('❌ GROQ_API_KEY not found in .env');
  process.exit(1);
}

console.log('🧪 Testing Groq API...\n');

async function testGroq() {
  try {
    console.log('📤 Sending single request to Groq...');
    
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          {
            role: 'user',
            content: 'What is 2+2? Answer in one word.',
          },
        ],
        temperature: 0.7,
        max_tokens: 100,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Groq API Error:', error);
      process.exit(1);
    }

    const data = await response.json();
    const answer = data.choices[0].message.content;

    console.log('✅ Groq API Working!\n');
    console.log('Response:', answer);
    console.log('\n📊 Tokens used:', data.usage?.total_tokens || 0);
    console.log('✨ Groq is ready for production!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testGroq();
