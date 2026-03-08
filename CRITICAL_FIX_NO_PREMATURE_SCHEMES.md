# 🚨 CRITICAL FIX: No Premature Scheme Recommendations

## Problem

AI was showing schemes on the FIRST message without collecting any user information.

**Example of Wrong Behavior:**
```
User: "I want to know about schemes"
AI: "The Indian government offers schemes... To help you better, specify:
1. State
2. Category
3. Purpose..."

[System shows: Ayushman Bharat 84% Match]
```

**This is COMPLETELY WRONG because:**
1. No user information collected (no age, occupation, state, income)
2. AI giving long explanations instead of asking questions
3. System showing schemes without eligibility check
4. Match percentage (84%) is meaningless without profile data

---

## Root Causes

### 1. AI Giving Long Responses
- System prompt allowed explanations
- No word limit enforced
- AI was trying to be "helpful" by explaining

### 2. Schemes Shown Too Early
- Condition `isAskingAboutSchemes` triggered on first message
- No check for minimum conversation length
- Profile completeness threshold too low (60%)

### 3. No Validation
- System didn't verify all required fields present
- Didn't check if conversation had progressed enough

---

## Solutions Implemented

### 1. ✅ Ultra-Strict System Prompt

**File:** `backend/src/ai/base-provider.ts`

**New Rules:**
```
CRITICAL RULES:
1. NEVER give long explanations
2. NEVER mention scheme names
3. NEVER describe government programs
4. NEVER list categories or options
5. NEVER ask multiple questions
6. Ask ONLY ONE simple question
7. Keep response under 15 words
```

**Allowed Responses ONLY:**
```
"I'll help you. May I know your age?"
"Thank you. What work do you do?"
"Great. Which state do you live in?"
"Perfect. What is your family's yearly income?"
"Let me check which schemes match your profile."
```

**Forbidden:**
- Any explanation about schemes
- Any list of categories
- Any description of benefits
- Multiple questions
- Long paragraphs

### 2. ✅ Enhanced Response Cleaning

**File:** `backend/src/handlers/chat.ts`

**Added Filters:**
```typescript
// Remove numbered lists (1. 2. 3.)
cleaned = cleaned.replace(/^\s*\d+\.\s+.+$/gm, '');

// Remove bullet points
cleaned = cleaned.replace(/^\s*[-•]\s+.+$/gm, '');

// Remove forbidden phrases
const forbiddenPhrases = [
  'government offers',
  'wide range',
  'various sectors',
  'to help you better',
  'could you please specify',
  'state-specific',
  'category',
  'purpose',
];

// Length check: 10-100 characters only
if (cleaned.length < 10 || cleaned.length > 100) {
  return "I'll help you find schemes. May I know your age?";
}
```

### 3. ✅ Stricter Eligibility Conditions

**File:** `backend/src/handlers/chat.ts`

**Before:**
```typescript
if (hasEnoughData && hasRequiredFields && isAskingAboutSchemes) {
  // Show schemes
}
```

**After:**
```typescript
// CRITICAL: Only show schemes if ALL conditions met:
const hasRequiredFields = 
  profile.age !== undefined && 
  profile.occupation !== undefined && 
  profile.state !== undefined && 
  profile.income !== undefined;

const hasMinimumMessages = session.messages.length >= 8; // At least 4 Q&A pairs

const shouldShowSchemes = 
  hasEnoughData &&           // 60% complete
  hasRequiredFields &&       // All 4 fields present
  hasMinimumMessages &&      // At least 8 messages (4 Q&A)
  isAskingAboutSchemes;      // User asking

console.log('[ELIGIBILITY CHECK]', {
  hasEnoughData,
  hasRequiredFields,
  hasMinimumMessages,
  isAskingAboutSchemes,
  shouldShowSchemes,
  completeness: profile.completeness,
  messageCount: session.messages.length
});

if (shouldShowSchemes) {
  // Run eligibility check
}
```

**Required Conditions:**
1. ✅ Profile completeness ≥ 60%
2. ✅ Has age, occupation, state, income (all 4)
3. ✅ At least 8 messages in conversation (4 Q&A pairs)
4. ✅ User explicitly asking about schemes

---

## Expected Behavior Now

### ✅ Correct Flow

**Message 1:**
```
User: "I want to know about schemes"
AI: "I'll help you. May I know your age?"
[NO schemes shown]
```

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
[NOW system shows eligible schemes with correct match %]
```

### ❌ What Should NEVER Happen

**On First Message:**
```
❌ Long explanation about government schemes
❌ Lists of categories or options
❌ Multiple questions (1. State 2. Category 3. Purpose)
❌ Schemes shown without profile data
❌ Match percentages without eligibility check
```

---

## Console Verification

### First Message (Should NOT Show Schemes)

**Expected Logs:**
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

### After Complete Profile (Should Show Schemes)

**Expected Logs:**
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
[PROFILE] Complete profile: { age: 35, occupation: 'farmer', state: 'Maharashtra', income: 200000 }
[SCHEMES] Loaded 150 schemes
[ELIGIBILITY] Found 12 eligible schemes
```

---

## Testing

### Test Case 1: First Message

**Input:** "I want to know about schemes"

**Expected AI Response:**
- ✅ "I'll help you. May I know your age?"
- ✅ Under 15 words
- ✅ No explanations
- ✅ No lists

**Expected System Behavior:**
- ✅ NO schemes shown
- ✅ Console shows `shouldShowSchemes: false`

**NOT Expected:**
- ❌ Long paragraph about government schemes
- ❌ Lists of categories
- ❌ Schemes displayed

### Test Case 2: Second Message

**Input:** "35"

**Expected:**
- ✅ AI: "Thank you. What work do you do?"
- ✅ NO schemes shown
- ✅ `messageCount: 4` (2 Q&A pairs)

### Test Case 3: Incomplete Profile

**Scenario:** User provides age=35, occupation=farmer

**Expected:**
- ✅ AI asks for state
- ✅ NO schemes shown
- ✅ `hasRequiredFields: false` (missing state, income)
- ✅ `hasMinimumMessages: false` (only 4 messages)

### Test Case 4: Complete Profile

**Scenario:** User provides age, occupation, state, income

**Expected:**
- ✅ AI: "Let me check which schemes match your profile."
- ✅ Schemes shown with correct eligibility
- ✅ `shouldShowSchemes: true`
- ✅ `messageCount: 10` (5 Q&A pairs)

---

## Key Changes Summary

### 1. System Prompt
- Added 15-word limit
- Removed all flexibility
- Only 5 allowed responses
- Explicitly forbid explanations

### 2. Response Cleaning
- Remove numbered lists
- Remove bullet points
- Remove forbidden phrases
- Enforce 10-100 character limit
- Return default if too long/short

### 3. Eligibility Conditions
- Added `hasMinimumMessages` check (≥8 messages)
- Stricter `hasRequiredFields` (all 4 must be present)
- Added detailed console logging
- Combined all conditions with AND logic

---

## Files Modified

1. **backend/src/ai/base-provider.ts**
   - Ultra-strict system prompt
   - 15-word limit
   - Only 5 allowed responses

2. **backend/src/handlers/chat.ts**
   - Enhanced `cleanAIResponse()` function
   - Added list/bullet removal
   - Added forbidden phrase filtering
   - Added length limits (10-100 chars)
   - Added `hasMinimumMessages` check
   - Added detailed logging

---

## Summary

### Problem
Schemes shown on first message without any user information

### Solution
1. Ultra-strict system prompt (15-word limit)
2. Enhanced response cleaning (remove lists, long text)
3. Stricter conditions (need 8+ messages, all 4 fields)

### Result
- AI gives SHORT responses (under 15 words)
- AI ONLY asks ONE question
- Schemes shown ONLY after complete profile
- Minimum 4 Q&A pairs before eligibility check

---

**Status:** ✅ CRITICAL FIX APPLIED  
**Date:** March 8, 2026  
**Impact:** CRITICAL - Prevents misleading users with premature recommendations
