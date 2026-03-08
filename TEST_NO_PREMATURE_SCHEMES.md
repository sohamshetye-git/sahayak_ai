# 🧪 Test Guide: No Premature Scheme Recommendations

## Quick Test (2 minutes)

### 1. Start Backend
```bash
cd backend
npm run dev
```

### 2. Open Chat
```
http://localhost:3000/chat
```

### 3. Test First Message

**Input:**
```
I want to know about schemes
```

**Expected AI Response:**
```
I'll help you. May I know your age?
```

**Verify:**
- ✅ Response is SHORT (under 15 words)
- ✅ NO long explanations
- ✅ NO lists (1. 2. 3.)
- ✅ NO scheme names mentioned
- ✅ NO schemes displayed on screen

**NOT Expected:**
- ❌ "The Indian government offers..."
- ❌ "To help you better, specify: 1. State 2. Category..."
- ❌ Schemes shown (Ayushman Bharat, etc.)

### 4. Continue Conversation

**Message 2:**
```
User: "35"
AI: "Thank you. What work do you do?"
[NO schemes shown]
```

**Message 3:**
```
User: "Farmer"
AI: "Great. Which state do you live in?"
[NO schemes shown]
```

**Message 4:**
```
User: "Maharashtra"
AI: "Perfect. What is your family's yearly income?"
[NO schemes shown]
```

**Message 5:**
```
User: "2 lakh"
AI: "Let me check which schemes match your profile."
[NOW schemes are shown]
```

---

## Console Verification

### First Message

**Look for:**
```
[ELIGIBILITY CHECK] {
  hasEnoughData: false,
  hasRequiredFields: false,
  hasMinimumMessages: false,
  isAskingAboutSchemes: true,
  shouldShowSchemes: false,
  completeness: 0,
  messageCount: 2
}
```

**Should NOT see:**
```
[ELIGIBILITY] Running rule-based eligibility check
```

### After Complete Profile

**Look for:**
```
[ELIGIBILITY CHECK] {
  hasEnoughData: true,
  hasRequiredFields: true,
  hasMinimumMessages: true,
  isAskingAboutSchemes: true,
  shouldShowSchemes: true,
  completeness: 80,
  messageCount: 10
}
[ELIGIBILITY] Running rule-based eligibility check
[PROFILE] Complete profile: { age: 35, occupation: 'farmer', ... }
```

---

## Pass/Fail Criteria

### ✅ PASS if:
1. First message: AI asks for age (short response)
2. No schemes shown until message 5+
3. AI responses under 15 words
4. No lists or long explanations
5. Schemes shown only after complete profile

### ❌ FAIL if:
1. First message: Long explanation about schemes
2. Schemes shown on first message
3. AI response over 100 characters
4. Lists (1. 2. 3.) in AI response
5. Scheme names mentioned before eligibility check

---

**Status:** ✅ READY FOR TESTING  
**Date:** March 8, 2026
