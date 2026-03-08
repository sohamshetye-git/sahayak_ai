# 🧪 Test Guide: Complete Fix

## Quick Test (3 minutes)

### 1. Restart Backend
```bash
cd backend
npm run dev
```

### 2. Restart Frontend
```bash
cd frontend
npm run dev
```

### 3. Open Chat
```
http://localhost:3000/chat
```

### 4. Test Complete Flow

**Message 1:**
```
You: "I want to know about schemes"
Expected AI: "I'll help you. May I know your age?"
Expected Frontend: NO schemes shown
```

**Message 2:**
```
You: "my age is 43"
Expected AI: "Thank you. What work do you do?"
Expected Frontend: NO schemes shown
Console: [PROFILE] Extracted age: 43
```

**Message 3:**
```
You: "Farmer"
Expected AI: "Great. Which state do you live in?"
Expected Frontend: NO schemes shown
```

**Message 4:**
```
You: "Maharashtra"
Expected AI: "Perfect. What is your family's yearly income?"
Expected Frontend: NO schemes shown
```

**Message 5:**
```
You: "2 lakh"
Expected AI: "Let me check which schemes match your profile."
Expected Frontend: 3 scheme cards shown
Console: [ELIGIBILITY] Running rule-based eligibility check
```

---

## Pass/Fail Criteria

### ✅ PASS if:
1. Age extracted from "my age is 43"
2. NO schemes shown until message 5
3. AI responses under 15 words
4. Schemes shown only after complete profile
5. Console shows eligibility check on message 5

### ❌ FAIL if:
1. AI asks for age again after "my age is 43"
2. Schemes shown on message 1, 2, 3, or 4
3. AI gives long explanations
4. Schemes shown without [SCHEME_DATA] tag

---

**Status:** ✅ READY FOR TESTING  
**Date:** March 8, 2026
