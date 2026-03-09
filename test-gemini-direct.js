// Direct test of Gemini API
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: '.env' });

async function testGemini() {
  const apiKey = process.env.GEMINI_API_KEY;
  console.log('API Key:', apiKey ? apiKey.substring(0, 20) + '...' : 'NOT FOUND');
  
  if (!apiKey) {
    console.error('No API key found!');
    return;
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  
  // Try different model names
  const modelsToTry = [
    'gemini-pro',
    'gemini-1.5-pro',
    'gemini-1.5-flash',
    'models/gemini-pro',
    'models/gemini-1.5-pro'
  ];

  for (const modelName of modelsToTry) {
    try {
      console.log(`\nTrying model: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent('Say hello');
      const response = await result.response;
      const text = response.text();
      console.log(`✅ SUCCESS with ${modelName}:`, text.substring(0, 50));
      break;
    } catch (error) {
      console.log(`❌ Failed with ${modelName}:`, error.message.substring(0, 100));
    }
  }
}

testGemini();
