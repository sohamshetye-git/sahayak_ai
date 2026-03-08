# Testing Guide: AI Context Awareness Fix

## What Was Fixed
The AI now sees the current user profile when generating responses, so it won't ask the same questions repeatedly.

## Test Scenarios

### Test 1: Age Extraction
**Goal:** Verify AI doesn't repeat age question after user provides it

**Steps:**
1. Start chat: "I want schemes"
2. AI asks: "May I know your age?"
3. User responds: "my age is 43"
4. **Expected:** AI should ask for NEXT field (gender/occupation/state), NOT age again

**Pass Criteria:**
- ✅ AI asks for a different field (not age)
- ✅ Console shows: `[PROFILE] Extracted age: 43`
- ✅ Console shows: `[PROFILE] Current profile summary for AI: ...Age: 43`

---

### Test 2: Multiple Fields at Once
**Goal:** Verify AI extracts multiple fields and asks for next missing one

**Steps:**
1. User says: "I am 25, male, from Delhi"
2. **Expected:** AI should acknowledge and ask for next missing field (occupation/income)

**Pass Criteria:**
- ✅ Profile extracts: age=25, gender=male, state=Delhi
- ✅ AI doesn't ask for age, gender, or state
- ✅ AI asks for occupation or income

---

### Test 3: User Says "I Already Told You"
**Goal:** Verify AI handles user frustration gracefully

**Steps:**
1. User provides age: "45"
2. If AI somehow asks for age again
3. User responds: "I already told you my age"
4. **Expected:** AI should apologize and move to next field

**Pass Criteria:**
- ✅ AI apologizes
- ✅ AI asks for different field

---

### Test 4: Profile Completeness Check
**Goal:** Verify schemes only shown after complete profile

**Steps:**
1. Provide age: "45"
2. Provide gender: "male"
3. Provide state: "Maharashtra"
4. Provide occupation: "farmer"
5. Provide income: "200000"
6. Ask: "show me schemes"
7. **Expected:** AI should show schemes with [SCHEME_DATA] tags

**Pass Criteria:**
- ✅ Schemes are displayed
- ✅ Response contains `[SCHEME_DATA]` tags
- ✅ Console shows: `[ELIGIBILITY] Running rule-based eligibility check`

---

### Test 5: Premature Scheme Request
**Goal:** Verify schemes NOT shown before complete profile

**Steps:**
1. User says: "show me schemes"
2. AI asks: "May I know your age?"
3. User provides: "45"
4. User says: "show schemes now"
5. **Expected:** AI should continue asking for missing fields, NOT show schemes

**Pass Criteria:**
- ✅ No schemes displayed
- ✅ AI continues asking questions
- ✅ Console shows: `shouldShowSchemes: false`

---

## Console Logs to Watch

### Profile Extraction:
```
[PROFILE] Extracted age: 43
[PROFILE] Extracted profile (20% complete): { age: 43, completeness: 20 }
```

### Profile Context Passed to AI:
```
[PROFILE] Current profile summary for AI: 
Current user profile (already collected):
Age: 43
```

### Eligibility Check:
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
```

---

## How to Run Tests

### Option 1: Using the Frontend
1. Start backend: `cd backend && npm run dev`
2. Start frontend: `cd frontend && npm run dev`
3. Open: http://localhost:3000/chat
4. Run test scenarios above

### Option 2: Using API Directly
```bash
# Test 1: Initial message
curl -X POST http://localhost:3001/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "I want schemes",
    "language": "en"
  }'

# Test 2: Provide age
curl -X POST http://localhost:3001/chat \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "<session-id-from-previous-response>",
    "message": "my age is 43",
    "language": "en"
  }'
```

---

## Expected Behavior Summary

| Scenario | Before Fix | After Fix |
|----------|-----------|-----------|
| User provides age | AI asks for age again | AI asks for next field |
| User provides multiple fields | AI asks for already provided fields | AI asks for missing fields only |
| User says "I told you" | AI confused | AI apologizes and continues |
| Incomplete profile | Sometimes shows schemes | Never shows schemes |
| Complete profile | Sometimes doesn't show schemes | Always shows schemes |

---

## Troubleshooting

### Issue: AI still repeats questions
**Check:**
1. Console shows profile summary being passed to AI
2. System prompt includes profile checking instructions
3. AI provider is using the systemPrompt parameter

### Issue: Schemes shown too early
**Check:**
1. `shouldShowSchemes` conditions in chat.ts
2. Profile completeness percentage
3. Message count (should be >= 8)

### Issue: Age not extracted
**Check:**
1. Console shows `[PROFILE] Extracted age: X`
2. Age patterns in conversation-orchestrator.ts
3. User message format matches patterns

---

## Success Criteria

The fix is successful if:
1. ✅ AI never asks the same question twice
2. ✅ AI acknowledges previously provided information
3. ✅ Schemes only shown after complete profile (age, occupation, state, income)
4. ✅ Console logs show profile context being passed to AI
5. ✅ User experience is smooth and conversational
