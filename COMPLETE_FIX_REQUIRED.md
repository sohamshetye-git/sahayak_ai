# 🚨 COMPLETE FIX REQUIRED: Two Critical Issues

## Issues Identified

### Issue 1: AI Not Extracting Age
**Problem:** User says "my age is 43" but AI asks for age again

**Root Cause:** Age extraction pattern required "years" keyword
```typescript
// Old pattern (BROKEN):
/(\d+)\s*(years?|साल|वर्ष|yr|yrs)/i  // Requires "years"

// "my age is 43" doesn't match because no "years" keyword
```

**Fix Applied:** Added multiple flexible patterns
```typescript
/(?:my\s+)?age\s+is\s+(\d+)/i,           // "my age is 43"
/(?:i\s+am|i'm)\s+(\d+)/i,                // "I am 43"
/(\d+)\s*(?:years?|साल|वर्ष)/i,          // "43 years"
/^(\d+)$/,                                 // Just "43"
```

### Issue 2: Schemes Shown Too Early
**Problem:** Schemes displayed after just providing age (only 1 field out of 4 required)

**Root Cause:** Frontend `parseSchemes()` function automatically shows schemes when:
1. AI response contains words like "eligible", "scheme", "recommend"
2. OR AI mentions any scheme name
3. This happens BEFORE backend runs eligibility check

**Current Flow (BROKEN):**
```
User: "my age is 43"
AI: "I'll help you find schemes. May I know your age?"
Frontend: Detects word "schemes" → Shows scheme cards ❌ WRONG!
```

---

## Complete Solution Required

### Backend Changes (✅ DONE)

**File:** `backend/src/core/conversation-orchestrator.ts`
- ✅ Fixed age extraction with multiple patterns
- ✅ Added logging for extracted values

**File:** `backend/src/handlers/chat.ts`
- ✅ Stricter conditions (need 8+ messages, all 4 fields)
- ✅ Enhanced response cleaning
- ✅ Detailed logging

**File:** `backend/src/ai/base-provider.ts`
- ✅ Ultra-strict system prompt (15-word limit)
- ✅ Only 5 allowed responses

### Frontend Changes (❌ NEEDED)

**File:** `frontend/src/app/chat/page.tsx`

**Problem Code:**
```typescript
const parseSchemes = (content: string) => {
  // This triggers on ANY mention of "scheme" or "eligible"
  const isEligibilityResponse = 
    content.toLowerCase().includes('eligible') ||
    content.toLowerCase().includes('scheme');

  if (isEligibilityResponse) {
    // Shows schemes even when AI just says "I'll help you find schemes"
    const allSchemes = schemesDataService.getAllSchemes();
    // ... shows schemes
  }
}
```

**Required Fix:**
```typescript
const parseSchemes = (content: string) => {
  const schemes: ParsedScheme[] = [];
  let textContent = content;

  // ONLY parse schemes if backend sends structured data
  // Format: [SCHEME_DATA]...[/SCHEME_DATA]
  const schemeDataPattern = /\[SCHEME_DATA\]([\s\S]*?)\[\/SCHEME_DATA\]/g;
  const matches = content.matchAll(schemeDataPattern);

  for (const match of matches) {
    try {
      const schemesData = JSON.parse(match[1]);
      schemes.push(...schemesData);
      textContent = textContent.replace(match[0], '');
    } catch (e) {
      console.error('Failed to parse scheme data:', e);
    }
  }

  return { schemes, textContent: textContent.trim() };
}
```

**Backend Response Format:**
```typescript
// When schemes should be shown:
const response = `Let me check which schemes match your profile.

[SCHEME_DATA]
[
  {
    "scheme_id": "SCH_001",
    "scheme_name": "PM-KISAN",
    "matchPercentage": 85,
    ...
  }
]
[/SCHEME_DATA]`;
```

---

## Recommended Implementation

### Step 1: Update Backend Response Format

**File:** `backend/src/handlers/chat.ts`

**Change the `formatSchemeRecommendation` function:**
```typescript
function formatSchemeRecommendation(
  aiResponse: string,
  schemes: any[],
  profile: UserProfile,
  language: 'hi' | 'en'
): string {
  if (schemes.length === 0) {
    return aiResponse;
  }
  
  // Create structured scheme data
  const schemeData = JSON.stringify(schemes, null, 2);
  
  // Add scheme data in parseable format
  const response = `${aiResponse}

[SCHEME_DATA]
${schemeData}
[/SCHEME_DATA]`;
  
  return response;
}
```

### Step 2: Update Frontend Parsing

**File:** `frontend/src/app/chat/page.tsx`

**Replace the `parseSchemes` function:**
```typescript
const parseSchemes = (content: string): { schemes: ParsedScheme[]; textContent: string } => {
  const schemes: ParsedScheme[] = [];
  let textContent = content;

  // ONLY parse schemes if backend sends structured data
  const schemeDataPattern = /\[SCHEME_DATA\]([\s\S]*?)\[\/SCHEME_DATA\]/g;
  const matches = content.matchAll(schemeDataPattern);

  for (const match of matches) {
    try {
      const schemesData = JSON.parse(match[1]);
      schemes.push(...schemesData);
      textContent = textContent.replace(match[0], '');
    } catch (e) {
      console.error('Failed to parse scheme data:', e);
    }
  }

  return { schemes, textContent: textContent.trim() };
}
```

---

## Expected Behavior After Fix

### Conversation Flow

**Message 1:**
```
User: "I want to know about schemes"
AI: "I'll help you. May I know your age?"
Frontend: NO schemes shown (no [SCHEME_DATA] tag)
```

**Message 2:**
```
User: "my age is 43"
Backend: Extracts age=43
AI: "Thank you. What work do you do?"
Frontend: NO schemes shown
```

**Message 3:**
```
User: "Farmer"
Backend: Extracts occupation=farmer
AI: "Great. Which state do you live in?"
Frontend: NO schemes shown
```

**Message 4:**
```
User: "Maharashtra"
Backend: Extracts state=Maharashtra
AI: "Perfect. What is your family's yearly income?"
Frontend: NO schemes shown
```

**Message 5:**
```
User: "2 lakh"
Backend: 
  - Extracts income=200000
  - Profile complete (age, occupation, state, income)
  - Runs eligibility engine
  - Finds 3 eligible schemes
  - Formats response with [SCHEME_DATA] tag
AI: "Let me check which schemes match your profile.

[SCHEME_DATA]
[{scheme1}, {scheme2}, {scheme3}]
[/SCHEME_DATA]"

Frontend: Parses [SCHEME_DATA] → Shows 3 scheme cards
```

---

## Testing After Fix

### Test 1: Age Extraction
```
Input: "my age is 43"
Expected: age=43 extracted
Console: [PROFILE] Extracted age: 43
```

### Test 2: No Premature Schemes
```
Input: "I want schemes"
Expected: AI asks for age, NO schemes shown
Frontend: schemes array is empty
```

### Test 3: Schemes After Complete Profile
```
After providing age, occupation, state, income:
Expected: Schemes shown with [SCHEME_DATA] tag
Frontend: Parses and displays scheme cards
```

---

## Files to Modify

### Backend (✅ DONE)
1. ✅ `backend/src/core/conversation-orchestrator.ts` - Age extraction fixed
2. ✅ `backend/src/handlers/chat.ts` - Conditions fixed
3. ✅ `backend/src/ai/base-provider.ts` - Prompt fixed

### Frontend (❌ TODO)
1. ❌ `frontend/src/app/chat/page.tsx` - Update `parseSchemes()` function
2. ❌ `backend/src/handlers/chat.ts` - Update `formatSchemeRecommendation()` to use [SCHEME_DATA] tags

---

## Priority

**CRITICAL:** Frontend changes are required to prevent premature scheme display

**Current Status:**
- Backend: ✅ Fixed (age extraction, strict conditions)
- Frontend: ❌ Still showing schemes on keyword detection

**Next Step:**
1. Update `formatSchemeRecommendation()` to use [SCHEME_DATA] tags
2. Update frontend `parseSchemes()` to only parse [SCHEME_DATA] tags
3. Test complete flow

---

**Date:** March 8, 2026  
**Status:** Backend fixes applied, frontend changes needed
