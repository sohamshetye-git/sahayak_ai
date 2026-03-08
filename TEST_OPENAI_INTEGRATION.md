# Test OpenAI Integration

## Quick Test Guide

### Prerequisites

1. **Get OpenAI API Key**
   - Go to https://platform.openai.com/api-keys
   - Create a new API key
   - Copy the key (starts with `sk-proj-...`)

2. **Add to .env file**
   ```bash
   # Edit .env file
   OPENAI_API_KEY=sk-proj-...your-key-here...
   ```

### Test 1: Verify OpenAI Provider Loads

```bash
# Start backend
cd backend
npm run dev
```

**Expected Output:**
```
AI Provider Config: {
  primaryType: 'gemini',
  primaryModel: 'gemini-pro',
  hasGeminiKey: true,
  hasOpenAIKey: true,  ← Should be true
  hasGroqKey: true,
  hasSarvamKey: true
}

[MODEL ROUTER] Available models: gemini → openai → groq → sarvam
```

### Test 2: Test OpenAI Fallback

**Scenario**: Simulate Gemini failure to trigger OpenAI fallback

1. **Temporarily disable Gemini** (optional):
   ```bash
   # In .env, comment out Gemini key
   # GEMINI_API_KEY=...
   ```

2. **Send test message**:
   ```bash
   curl -X POST http://localhost:3001/api/chat \
     -H "Content-Type: application/json" \
     -d '{
       "message": "Hi, I need help with government schemes",
       "language": "en"
     }'
   ```

3. **Check logs**:
   ```
   [MODEL ROUTER] Task: conversation, Recommended: gemini
   [MODEL ROUTER] Attempting gemini...
   [MODEL ROUTER] ✗ gemini failed: API key not configured
   [MODEL ROUTER] Attempting openai...
   [OPENAI API CALL] Model: gpt-4o-mini, Timestamp: ...
   [OPENAI API SUCCESS] Model: gpt-4o-mini, Tokens: 245
   [MODEL ROUTER] ✓ openai succeeded
   ```

### Test 3: Test All Providers

Create a test HTML file:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Test OpenAI Integration</title>
</head>
<body>
    <h1>Test OpenAI Integration</h1>
    
    <div>
        <h2>Test 1: Normal Chat (Gemini Primary)</h2>
        <button onclick="testNormalChat()">Test Normal Chat</button>
        <pre id="result1"></pre>
    </div>

    <div>
        <h2>Test 2: Force OpenAI (Disable Gemini)</h2>
        <button onclick="testOpenAIFallback()">Test OpenAI Fallback</button>
        <pre id="result2"></pre>
    </div>

    <script>
        async function testNormalChat() {
            const result = document.getElementById('result1');
            result.textContent = 'Testing...';
            
            try {
                const response = await fetch('http://localhost:3001/api/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        message: 'Hi, I am a farmer from Maharashtra. I need help with schemes.',
                        language: 'en'
                    })
                });
                
                const data = await response.json();
                result.textContent = JSON.stringify(data, null, 2);
            } catch (error) {
                result.textContent = 'Error: ' + error.message;
            }
        }

        async function testOpenAIFallback() {
            const result = document.getElementById('result2');
            result.textContent = 'Testing OpenAI fallback...';
            
            // This test requires temporarily disabling Gemini in .env
            alert('To test OpenAI fallback:\n1. Comment out GEMINI_API_KEY in .env\n2. Restart backend\n3. Click this button again');
            
            try {
                const response = await fetch('http://localhost:3001/api/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        message: 'Tell me about education schemes',
                        language: 'en'
                    })
                });
                
                const data = await response.json();
                result.textContent = JSON.stringify(data, null, 2);
            } catch (error) {
                result.textContent = 'Error: ' + error.message;
            }
        }
    </script>
</body>
</html>
```

Save as `test-openai.html` and open in browser.

### Test 4: Monitor Routing Decisions

Watch backend logs while testing:

```bash
# In backend directory
npm run dev

# Watch for these log patterns:
# [MODEL ROUTER] Task: conversation, Recommended: gemini
# [MODEL ROUTER] Attempting gemini...
# [MODEL ROUTER] ✓ gemini succeeded
# OR
# [MODEL ROUTER] ✗ gemini failed: ...
# [MODEL ROUTER] Attempting openai...
# [OPENAI API CALL] Model: gpt-4o-mini
# [OPENAI API SUCCESS] Tokens: 245
# [MODEL ROUTER] ✓ openai succeeded
```

### Test 5: Test Different Task Types

#### Conversation Task
```bash
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hi, I need help",
    "language": "en"
  }'
```

Expected routing: Gemini → OpenAI → Groq → Sarvam

#### Recommendation Task
```bash
curl -X POST http://localhost:3001/api/check-eligibility \
  -H "Content-Type: application/json" \
  -d '{
    "userProfile": {
      "age": 45,
      "gender": "male",
      "state": "Maharashtra",
      "occupation": "farmer",
      "income": 50000
    },
    "language": "en"
  }'
```

Expected routing: Gemini → OpenAI → Groq → Sarvam

#### Extraction Task
```bash
# This happens internally during profile collection
# Expected routing: Sarvam → Gemini → OpenAI → Groq
```

### Test 6: Test Hindi Support

```bash
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "नमस्ते, मुझे सरकारी योजनाओं के बारे में जानकारी चाहिए",
    "language": "hi"
  }'
```

OpenAI should respond in Hindi using the Hindi system prompt.

### Test 7: Test Error Handling

#### Invalid API Key
```bash
# In .env, set invalid key
OPENAI_API_KEY=sk-invalid-key

# Restart backend and test
# Expected: Falls back to Groq
```

#### Rate Limit
```bash
# Send many requests quickly to trigger rate limit
for i in {1..100}; do
  curl -X POST http://localhost:3001/api/chat \
    -H "Content-Type: application/json" \
    -d '{"message":"test","language":"en"}'
done

# Expected: OpenAI rate limit → Falls back to Groq
```

## Success Criteria

✅ OpenAI provider loads successfully
✅ Routing includes OpenAI in priority list
✅ OpenAI responds when Gemini fails
✅ OpenAI handles both English and Hindi
✅ Error handling works (invalid key, rate limit)
✅ Fallback to Groq works when OpenAI fails
✅ Logs show correct routing decisions

## Troubleshooting

### Issue: "Cannot find module 'openai'"
**Solution**: 
```bash
cd backend
npm install openai
```

### Issue: "Invalid OpenAI API key"
**Solution**: 
- Check API key in .env file
- Ensure key starts with `sk-proj-` or `sk-`
- Verify key is active in OpenAI dashboard

### Issue: "OpenAI rate limit exceeded"
**Solution**: 
- This is expected behavior
- System automatically falls back to Groq
- Wait a few minutes and try again

### Issue: OpenAI not being used
**Solution**: 
- Check if Gemini is working (OpenAI only used as fallback)
- Temporarily disable Gemini to force OpenAI usage
- Check logs for routing decisions

## Next Steps

1. ✅ Verify OpenAI integration works
2. ✅ Test fallback behavior
3. ✅ Monitor token usage and costs
4. ✅ Adjust routing priorities if needed
5. ✅ Update documentation with findings

## Summary

The OpenAI integration is complete and ready for testing. The system now has a robust 4-level fallback:

**Gemini → OpenAI → Groq → Sarvam**

This provides excellent reliability and quality while maintaining cost-effectiveness!
