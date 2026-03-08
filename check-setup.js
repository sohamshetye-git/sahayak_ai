#!/usr/bin/env node
/**
 * Setup Validation Script
 * Checks if the environment is properly configured
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Checking Sahayak AI setup...\n');

// Check .env file
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.error('❌ .env file not found!');
  console.log('   Please copy .env.example to .env and configure it.');
  process.exit(1);
}

// Read .env file
const envContent = fs.readFileSync(envPath, 'utf-8');
const envLines = envContent.split('\n');
const envVars = {};

envLines.forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const match = trimmed.match(/^([A-Z_]+)=(.*)$/);
    if (match) {
      envVars[match[1]] = match[2].trim();
    }
  }
});

// Check critical variables
let hasErrors = false;

console.log('📋 Environment Configuration:');
console.log('─'.repeat(50));

// Check AI Provider
const aiProvider = envVars.AI_PROVIDER || 'not set';
console.log(`AI Provider: ${aiProvider}`);

// Check Gemini API Key
const geminiKey = envVars.GEMINI_API_KEY || '';
if (!geminiKey || geminiKey.includes('Dummy') || geminiKey.includes('Replace')) {
  console.error('❌ GEMINI_API_KEY is not configured properly!');
  console.log('   Current value:', geminiKey);
  console.log('   Please update .env file with your actual Gemini API key.');
  console.log('   Get your key from: https://makersuite.google.com/app/apikey');
  hasErrors = true;
} else {
  console.log('✅ GEMINI_API_KEY is configured');
}

// Check API URLs
const apiUrl = envVars.API_BASE_URL || 'not set';
const nextPublicUrl = envVars.NEXT_PUBLIC_API_URL || 'not set';
console.log(`API Base URL: ${apiUrl}`);
console.log(`Frontend API URL: ${nextPublicUrl}`);

if (apiUrl !== nextPublicUrl) {
  console.warn('⚠️  API_BASE_URL and NEXT_PUBLIC_API_URL don\'t match!');
  console.log('   This might cause connection issues.');
}

console.log('─'.repeat(50));

if (hasErrors) {
  console.log('\n❌ Setup validation failed!');
  console.log('\n📝 To fix:');
  console.log('   1. Open .env file in your editor');
  console.log('   2. Replace the dummy GEMINI_API_KEY with your actual key');
  console.log('   3. Save the file');
  console.log('   4. Restart the backend server (npm run dev in backend folder)');
  console.log('   5. Run this script again to verify\n');
  process.exit(1);
} else {
  console.log('\n✅ All checks passed!');
  console.log('\n🚀 You can now start the application:');
  console.log('   Backend:  cd backend && npm run dev');
  console.log('   Frontend: cd frontend && npm run dev\n');
}
