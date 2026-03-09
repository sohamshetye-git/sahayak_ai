// Test the full application flow
const fetch = require('node-fetch');

async function testFullFlow() {
  console.log('🧪 Testing Sahayak AI Full Flow\n');
  
  // Test 1: Backend Health
  console.log('1️⃣ Testing Backend Health...');
  try {
    const healthResponse = await fetch('http://localhost:3001/health');
    const healthData = await healthResponse.json();
    console.log('   ✅ Backend is healthy:', healthData);
  } catch (error) {
    console.log('   ❌ Backend health check failed:', error.message);
    return;
  }
  
  // Test 2: Chat Endpoint
  console.log('\n2️⃣ Testing Chat Endpoint...');
  try {
    const chatResponse = await fetch('http://localhost:3001/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'I am a farmer from Maharashtra',
        language: 'en'
      })
    });
    
    const chatData = await chatResponse.json();
    if (chatResponse.ok) {
      console.log('   ✅ Chat is working!');
      console.log('   📝 AI Response:', chatData.response.substring(0, 100) + '...');
      console.log('   👤 User Profile:', chatData.userProfile);
    } else {
      console.log('   ❌ Chat failed:', chatData.error);
    }
  } catch (error) {
    console.log('   ❌ Chat test failed:', error.message);
  }
  
  // Test 3: Frontend
  console.log('\n3️⃣ Testing Frontend...');
  try {
    const frontendResponse = await fetch('http://localhost:3000');
    if (frontendResponse.ok) {
      console.log('   ✅ Frontend is accessible');
      console.log('   🌐 URL: http://localhost:3000');
    } else {
      console.log('   ❌ Frontend returned status:', frontendResponse.status);
    }
  } catch (error) {
    console.log('   ❌ Frontend test failed:', error.message);
  }
  
  console.log('\n✨ All tests completed!');
  console.log('\n📱 Open the application:');
  console.log('   👉 http://localhost:3000');
  console.log('\n💡 Or open OPEN-APP.html in your browser');
}

testFullFlow();
