# Debugging Guide: AI Context Awareness

## Console Logs to Monitor

### 1. Profile Extraction
```
[PROFILE] Extracted age: 43
[PROFILE] Extracted profile (20% complete): { age: 43, completeness: 20 }
```

**What to check:**
- Age/field is being extracted correctly
- Completeness percentage is updating
- Profile object has expected fields

### 2. Profile Context Passed to AI
```
[PROFILE] Current profile summary for AI: 
Current user profile (already collected):
Age: 43
```

**What to check:**
- Profile summary is being built
- Summary contains correct fields
- Summary is in correct language (en/hi)

### 3. AI Provider Call
```
[GEMINI API CALL] Timestamp: 2024-03-08T10:30:00.000Z
[GEMINI API SUCCESS] Tokens: 150
```

**What to check:**
- AI provider is being called
- No API errors
- Token usage is reasonable

### 4. Eligibility Check
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

**What to check:**
- All conditions are being evaluated
- `shouldShowSchemes` is true only when appropriate
- Message count is accurate

---

## Common Issues and Solutions

### Issue 1: AI Still Repeats Questions

**Symptoms:**
- User provides age
- AI asks for age again

**Debug Steps:**
1. Check console for profile extraction:
   ```
   [PROFILE] Extracted age: X
   ```
   If missing → Age extraction pattern failed

2. Check profile summary:
   ```
   [PROFILE] Current profile summary for AI: ...
   ```
   If empty → buildProfileSummary not working

3. Check AI provider logs:
   ```
   [GEMINI API CALL] ...
   ```
   If no profile in prompt → systemPrompt not being passed

**Solution:**
- Verify age extraction patterns in `conversation-orchestrator.ts`
- Verify `buildProfileSummary()` is being called
- Verify AI provider uses `request.systemPrompt`

---

### Issue 2: Profile Not Extracted

**Symptoms:**
- User says "my age is 43"
- Console shows no extraction log
- Profile remains empty

**Debug Steps:**
1. Check user message format:
   ```javascript
   console.log('User message:', userMessage);
   ```

2. Check age patterns in `extractUserProfile()`:
   ```typescript
   const agePatterns = [
     /(?:my\s+)?age\s+is\s+(\d+)/i,
     /(?:i\s+am|i'm)\s+(\d+)/i,
     /(\d+)\s*(?:years?|साल|वर्ष)/i,
     /^(\d+)$/,
   ];
   ```

3. Test patterns manually:
   ```javascript
   const message = "my age is 43";
   const pattern = /(?:my\s+)?age\s+is\s+(\d+)/i;
   console.log(message.match(pattern)); // Should match
   ```

**Solution:**
- Add more age patterns if needed
- Check for typos in user message
- Verify pattern matching logic

---

### Issue 3: Schemes Shown Too Early

**Symptoms:**
- User provides only age
- Schemes are displayed immediately

**Debug Steps:**
1. Check eligibility conditions:
   ```javascript
   console.log('[ELIGIBILITY CHECK]', {
     hasEnoughData,
     hasRequiredFields,
     hasMinimumMessages,
     isAskingAboutSchemes,
     shouldShowSchemes
   });
   ```

2. Check profile completeness:
   ```javascript
   console.log('Profile completeness:', profile.completeness);
   console.log('Required fields:', {
     age: profile.age,
     occupation: profile.occupation,
     state: profile.state,
     income: profile.income
   });
   ```

3. Check message count:
   ```javascript
   console.log('Message count:', session.messages.length);
   ```

**Solution:**
- Verify `hasRequiredFields` checks all 4 fields
- Verify `hasMinimumMessages` requires >= 8 messages
- Verify `hasEnoughData` requires >= 60% completeness

---

### Issue 4: Profile Summary Not Formatted Correctly

**Symptoms:**
- Profile summary is empty or malformed
- AI doesn't see profile data

**Debug Steps:**
1. Check buildProfileSummary input:
   ```javascript
   console.log('Profile input:', userProfile);
   ```

2. Check buildProfileSummary output:
   ```javascript
   const summary = this.buildProfileSummary(userProfile, language);
   console.log('Profile summary:', summary);
   ```

3. Check field conditions:
   ```javascript
   if (profile.age !== undefined) {
     console.log('Age field exists:', profile.age);
   }
   ```

**Solution:**
- Verify profile object has expected structure
- Verify field checks use correct conditions
- Verify language parameter is correct

---

### Issue 5: System Prompt Not Enhanced

**Symptoms:**
- AI doesn't follow profile checking rules
- Profile summary not visible to AI

**Debug Steps:**
1. Check base system prompt:
   ```javascript
   const basePrompt = (this.aiProvider as any).buildSystemPrompt(language);
   console.log('Base prompt:', basePrompt);
   ```

2. Check enhanced system prompt:
   ```javascript
   const enhancedPrompt = basePrompt + profileSummary;
   console.log('Enhanced prompt:', enhancedPrompt);
   ```

3. Check AI provider receives it:
   ```javascript
   // In AI provider (gemini-provider.ts, sarvam-provider.ts)
   console.log('System prompt received:', request.systemPrompt);
   ```

**Solution:**
- Verify `buildSystemPrompt()` is public
- Verify profile summary is appended correctly
- Verify AI provider uses `request.systemPrompt`

---

## Debugging Checklist

When AI repeats questions, check in order:

- [ ] Profile extraction logs appear
- [ ] Extracted fields are correct
- [ ] Profile summary is built
- [ ] Profile summary contains correct data
- [ ] Enhanced system prompt is created
- [ ] AI provider receives enhanced prompt
- [ ] AI response doesn't repeat questions

---

## Manual Testing Commands

### Test Profile Extraction
```javascript
// In conversation-orchestrator.ts
const testProfile = await this.extractUserProfile("my age is 43", {});
console.log('Test extraction:', testProfile);
// Expected: { age: 43, completeness: 20 }
```

### Test Profile Summary
```javascript
// In conversation-orchestrator.ts
const testSummary = this.buildProfileSummary(
  { age: 43, occupation: 'farmer' },
  'en'
);
console.log('Test summary:', testSummary);
// Expected: "Current user profile (already collected):\nAge: 43\nOccupation: farmer"
```

### Test System Prompt Enhancement
```javascript
// In conversation-orchestrator.ts
const basePrompt = (this.aiProvider as any).buildSystemPrompt('en');
const profileSummary = this.buildProfileSummary({ age: 43 }, 'en');
const enhanced = basePrompt + profileSummary;
console.log('Enhanced prompt length:', enhanced.length);
console.log('Contains profile:', enhanced.includes('Age: 43'));
// Expected: true
```

---

## Expected Console Output (Complete Flow)

```
[CHAT] Processing message | Session: abc-123 | IP: 127.0.0.1
[PROFILE] Current profile summary for AI: 
Current user profile: No information collected yet.
Calling AI provider...
[GEMINI API CALL] Timestamp: 2024-03-08T10:30:00.000Z
[GEMINI API SUCCESS] Tokens: 120
AI Response received: { text: "May I know your age?", confidence: 0.85, tokensUsed: 120 }
[PROFILE] Extracted profile (0% complete): { completeness: 0 }
[ELIGIBILITY CHECK] {
  hasEnoughData: false,
  hasRequiredFields: false,
  hasMinimumMessages: false,
  isAskingAboutSchemes: false,
  shouldShowSchemes: false,
  completeness: 0,
  messageCount: 2
}

[CHAT] Processing message | Session: abc-123 | IP: 127.0.0.1
[PROFILE] Extracted age: 43
[PROFILE] Current profile summary for AI: 
Current user profile (already collected):
Age: 43
Calling AI provider...
[GEMINI API CALL] Timestamp: 2024-03-08T10:30:15.000Z
[GEMINI API SUCCESS] Tokens: 130
AI Response received: { text: "Thanks. May I know your gender?", confidence: 0.85, tokensUsed: 130 }
[PROFILE] Extracted profile (20% complete): { age: 43, completeness: 20 }
[ELIGIBILITY CHECK] {
  hasEnoughData: false,
  hasRequiredFields: false,
  hasMinimumMessages: false,
  isAskingAboutSchemes: false,
  shouldShowSchemes: false,
  completeness: 20,
  messageCount: 4
}
```

---

## Quick Verification Script

Add this to `conversation-orchestrator.ts` for testing:

```typescript
// Add after processMessage() method
async testProfileContext() {
  console.log('=== Testing Profile Context ===');
  
  // Test 1: Profile extraction
  const profile1 = await this.extractUserProfile("my age is 43", {});
  console.log('Test 1 - Age extraction:', profile1.age === 43 ? '✅' : '❌');
  
  // Test 2: Profile summary
  const summary = this.buildProfileSummary({ age: 43, occupation: 'farmer' }, 'en');
  console.log('Test 2 - Profile summary:', summary.includes('Age: 43') ? '✅' : '❌');
  
  // Test 3: System prompt enhancement
  const basePrompt = (this.aiProvider as any).buildSystemPrompt('en');
  const enhanced = basePrompt + summary;
  console.log('Test 3 - Enhanced prompt:', enhanced.includes('Current user profile') ? '✅' : '❌');
  
  console.log('=== Tests Complete ===');
}
```

Call it from chat handler:
```typescript
// In chat.ts handler
if (process.env.DEBUG_MODE === 'true') {
  await orch.testProfileContext();
}
```

---

## Success Indicators

✅ Profile extraction logs appear for each field
✅ Profile summary shows collected data
✅ AI doesn't repeat questions
✅ Schemes only shown after complete profile
✅ Console shows all expected logs
✅ No errors in console
✅ User experience is smooth
