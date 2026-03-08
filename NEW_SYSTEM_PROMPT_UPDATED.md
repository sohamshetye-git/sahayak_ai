# System Prompt Updated - Rule-Based Orchestration

## ✅ System Prompt Updated

The AI system prompts have been updated to reflect the new orchestration approach where the AI acts as a smart general assistant that seamlessly integrates scheme assistance, with **strict rule-based eligibility and recommendations**.

## 🎯 New Behavior

### Core Principle
**The AI is ChatGPT-like for conversation, but rule-engine-driven for eligibility and recommendations.**

### Key Changes

#### Before:
- AI could guess eligibility
- AI could recommend schemes based on assumptions
- Less clear separation between conversation and eligibility

#### After:
- AI **CANNOT** guess eligibility
- AI **MUST** wait for rule engine results
- Clear separation: AI handles conversation, rule engine handles eligibility
- AI collects profile, rule engine decides eligibility

## 📋 Updated System Prompt Structure

### 1. Core Behavior
```
Handle ANY user query naturally:
• General questions
• Casual conversation  
• Government information
• Scheme details
• Personal guidance
• Random topics
```

The AI can now handle any query like a smart assistant, not just scheme-related questions.

### 2. Special Role - Scheme Assistant
```
When the topic relates to:
• Government schemes
• Benefits
• Subsidies
• Welfare programs
• Eligibility

→ Switch to Scheme Assistance Mode
```

The AI intelligently detects when to switch to scheme assistance mode.

### 3. System Workflow
```
IF General Query:
→ Answer normally like a smart assistant

IF Scheme Information Query:
→ Explain scheme details clearly

IF Eligibility or Recommendation Query:
→ Check user profile completeness
→ IF profile incomplete: Ask ONLY missing required fields (ONE at a time)
→ IF profile complete: Explain that eligibility will be checked by the system
```

Clear workflow for different query types.

### 4. Profile Collection Rules
```
Required fields: age, state, occupation, income
Optional fields: gender, category, disability

RULES:
• Ask only missing fields
• One question per message
• Never repeat questions
• Maintain conversation flow
• Be natural and friendly
```

Structured profile collection with strict rules.

### 5. CRITICAL: Eligibility Rules
```
ELIGIBILITY IS DECIDED BY RULE ENGINE, NOT BY YOU.

YOU MUST NOT:
✘ Guess eligibility
✘ Recommend schemes based on assumptions
✘ Override rule engine decisions
✘ Say "you are eligible" without rule engine confirmation

YOU MUST:
✔ Collect profile information
✔ Explain scheme details
✔ Explain eligibility criteria
✔ Wait for rule engine results before confirming eligibility
```

**This is the most important change** - AI cannot make eligibility decisions.

### 6. Conversation Style
```
• Friendly and respectful
• Citizen-friendly language
• Clear and concise
• Helpful and solution-focused
• Natural like ChatGPT
• Accurate like a rule system
```

Combines the best of both worlds.

### 7. Strict Guards
```
• Never repeat questions
• Never restart profile collection
• Never ignore stored user profile
• Never recommend without rule engine
• Never give irrelevant suggestions
```

Prevents common AI mistakes.

### 8. Goal
```
Deliver a seamless assistant experience that:
• Feels like ChatGPT
• Thinks like a rule system
• Recommends accurately
• Guides users step-by-step
• Works dynamically for any query
```

Clear goal statement.

## 🔄 How It Works

### Example Flow 1: General Question
```
User: "What is the capital of India?"

AI Response: "The capital of India is New Delhi..."
(Answers normally like ChatGPT)
```

### Example Flow 2: Scheme Information
```
User: "Tell me about PM-KISAN"

AI Response: "PM-KISAN is a scheme that provides ₹6,000 per year to farmers..."
(Explains scheme details from database)
```

### Example Flow 3: Eligibility Check
```
User: "Am I eligible for PM-KISAN?"

AI: "To check your eligibility, I need some information. What is your age?"
User: "45"

AI: "What is your occupation?"
User: "Farmer"

AI: "Which state are you from?"
User: "Maharashtra"

AI: "What is your annual income?"
User: "₹50,000"

AI: "Thank you! Let me check your eligibility..."
(System calls rule engine)

Rule Engine: Checks criteria → Returns eligible schemes

AI: "Based on your profile, you are eligible for PM-KISAN because:
• You are a farmer (occupation match)
• Your income is below ₹2 lakh (income criteria met)
• You are from Maharashtra (geographic criteria met)"
```

### Example Flow 4: Casual Conversation
```
User: "How's the weather?"

AI: "I don't have real-time weather information, but you can check weather.com or your local weather app for current conditions in your area."
(Handles like a general assistant)
```

## 📝 Files Updated

1. **backend/src/ai/gemini-provider.ts**
   - Updated `buildSystemPrompt()` method
   - Both English and Hindi versions

2. **backend/src/ai/openai-provider.ts**
   - Updated `buildSystemPrompt()` method
   - Both English and Hindi versions

## 🎯 Benefits

### 1. Accuracy
- Eligibility decisions are always rule-based
- No AI hallucinations about eligibility
- Consistent results

### 2. Flexibility
- Can handle any user query
- Not limited to scheme-related questions
- Natural conversation flow

### 3. User Experience
- Feels like ChatGPT (natural, friendly)
- Works like a rule system (accurate, reliable)
- Best of both worlds

### 4. Maintainability
- Clear separation of concerns
- AI handles conversation
- Rule engine handles eligibility
- Easy to update rules without changing AI

## 🚀 Testing

### Test Scenario 1: General Question
```bash
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What is artificial intelligence?",
    "language": "en"
  }'
```

Expected: AI answers like a general assistant

### Test Scenario 2: Scheme Information
```bash
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Tell me about PM-KISAN scheme",
    "language": "en"
  }'
```

Expected: AI explains scheme details

### Test Scenario 3: Eligibility Check
```bash
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Am I eligible for farmer schemes?",
    "language": "en"
  }'
```

Expected: AI asks for profile information (age, state, occupation, income)

### Test Scenario 4: Profile Collection
```bash
# First message
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "I am 45 years old",
    "language": "en",
    "sessionId": "test-session-1"
  }'

# Second message
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "I am a farmer",
    "language": "en",
    "sessionId": "test-session-1"
  }'
```

Expected: AI asks for next missing field (state, then income)

## 📊 Monitoring

Watch backend logs for:

```
[GEMINI] Using system prompt: Rule-Based Orchestration
[CONVERSATION] User query type: general
[CONVERSATION] User query type: scheme_information
[CONVERSATION] User query type: eligibility_check
[PROFILE] Collecting field: age
[PROFILE] Collecting field: state
[PROFILE] Profile complete, calling rule engine
[RULE ENGINE] Evaluating eligibility...
[RULE ENGINE] Found 3 eligible schemes
```

## 🎯 Next Steps

1. ✅ System prompts updated
2. ✅ Both English and Hindi versions
3. ✅ Applied to Gemini and OpenAI providers
4. ⏳ Test with real conversations
5. ⏳ Monitor AI behavior
6. ⏳ Adjust prompts if needed

## 📚 Documentation

- System prompt is in `backend/src/ai/gemini-provider.ts`
- System prompt is in `backend/src/ai/openai-provider.ts`
- Same prompt structure for both providers
- Both English and Hindi supported

## Summary

✅ **System prompts updated to reflect rule-based orchestration**
✅ **AI handles conversation, rule engine handles eligibility**
✅ **Clear separation of concerns**
✅ **Natural conversation + Accurate recommendations**
✅ **Feels like ChatGPT, thinks like a rule system**

The system now provides a seamless assistant experience that combines the naturalness of ChatGPT with the accuracy of a rule-based system!

---

**Last Updated**: March 8, 2026
**Status**: ✅ Complete
**Ready for Testing**: ✅ Yes
