# Complete System Explanation: Eligibility, Rule Engine, AI Context & Recommendation Logic

## Table of Contents
1. [Eligibility Engine](#eligibility-engine)
2. [Rule Engine](#rule-engine)
3. [AI Context](#ai-context)
4. [Recommendation Logic](#recommendation-logic)
5. [Necessary Requirements](#necessary-requirements)
6. [AI Response Flow](#ai-response-flow)

---

## 1. Eligibility Engine

### What is it?
The Eligibility Engine is a **rule-based system** that evaluates user profiles against scheme eligibility criteria. It's located in `backend/src/core/eligibility-engine.ts`.

### How it works:

#### Step 1: Evaluate User Against All Schemes
```typescript
evaluateEligibility(userProfile, schemes) → EligibilityResult[]
```

For each scheme, it checks:

#### Step 2: Check Individual Criteria

**Age Criteria:**
- Checks if user age falls within `ageMin` and `ageMax`
- Example: Scheme requires 18-40 years, user is 25 → ✅ Match

**Gender Criteria:**
- Exact match or "ANY"
- Example: Scheme requires "female", user is "female" → ✅ Match

**Income Criteria:**
- Checks if user income ≤ `incomeMax`
- Example: Scheme max ₹2,00,000, user earns ₹1,50,000 → ✅ Match

**Caste Category:**
- Matches against allowed categories (SC/ST/OBC/General)
- Example: Scheme allows ["sc", "st"], user is "sc" → ✅ Match

**Occupation:**
- Matches against allowed occupations
- Example: Scheme for "farmer", user is "farmer" → ✅ Match

**State:**
- Exact state match or "All India" schemes
- Example: Scheme for "Maharashtra", user in "Maharashtra" → ✅ Match

**Disability:**
- Boolean match
- Example: Scheme requires disability=true, user has disability → ✅ Match

#### Step 3: Calculate Eligibility

```typescript
isEligible = missingCriteria.length === 0
confidenceScore = matchedCriteria / totalCriteria
```

**Result:**
- `isEligible`: true/false
- `matchedCriteria`: ["age", "state", "occupation"]
- `missingCriteria`: ["income"]
- `confidenceScore`: 0.75 (75% match)

---

## 2. Rule Engine (Ranking Engine)

### What is it?
The Ranking Engine is a **multi-factor scoring system** that ranks eligible schemes by relevance. Located in `backend/src/core/ranking-engine.ts`.

### Ranking Weights (Total = 100 points)

| Factor | Weight | Description |
|--------|--------|-------------|
| Occupation Match | 30 points | Direct occupation match gets full points |
| State Match | 25 points | State-specific schemes score higher |
| Benefit Value | 20 points | Higher financial benefits score more |
| Category Priority | 15 points | Health/Education prioritized |
| Recency | 10 points | Newer schemes preferred |

### How Scoring Works:

#### 1. Occupation Score (0-30 points)
```typescript
if (user.occupation matches scheme.occupation) → 30 points
if (scheme has no occupation criteria) → 15 points (neutral)
else → 0 points
```

#### 2. State Score (0-25 points)
```typescript
if (user.state === scheme.state) → 25 points
if (scheme is "All India") → 17.5 points
else → 0 points
```

#### 3. Benefit Score (0-20 points)
```typescript
normalized = min(benefit_amount / 100000, 1)
score = 20 * normalized
```
Example: ₹50,000 benefit → 10 points

#### 4. Category Score (0-15 points)
```typescript
if (category in ["health", "education"]) → 15 points
if (category in ["agriculture", "housing"]) → 10.5 points
else → 7.5 points
```

#### 5. Recency Score (0-10 points)
Currently fixed at 8 points (placeholder for future date-based scoring)

### Final Ranking:
```typescript
totalScore = sum of all factor scores
schemes sorted by totalScore (descending)
top 3 schemes returned
```

**Example:**
- Scheme A: 30 + 25 + 15 + 15 + 8 = 93 points
- Scheme B: 15 + 17.5 + 10 + 10.5 + 8 = 61 points
- Scheme C: 0 + 25 + 20 + 15 + 8 = 68 points

**Result:** A > C > B

---

## 3. AI Context

### What Context is Sent to the AI Model?

The AI receives a **comprehensive context package** built in `ConversationOrchestrator`:

#### 1. System Prompt
```
You are Sahayak AI — an official Government Scheme Assistance Chatbot.

Your PRIMARY purpose is to:
• Provide information about government schemes
• Help users check eligibility
• Recommend schemes based on their profile
• Guide users through application support

[... full system prompt with rules ...]
```

#### 2. Profile Summary
```
Current user profile (already collected):
Age: 43
Gender: male
Occupation: farmer
State: Maharashtra
Income: ₹150000
```

#### 3. Conversation History
```
Last 10 messages:
User: Hello
Assistant: Namaste! I'm Sahayak AI...
User: I am 43 years old
Assistant: Thank you! What is your occupation?
[... up to 10 messages ...]
```

#### 4. Current User Message
```
User: I am a farmer from Maharashtra
```

### How Context is Built:

```typescript
// 1. Build profile summary
profileSummary = buildProfileSummary(userProfile, language)

// 2. Get system prompt
systemPrompt = aiProvider.buildSystemPrompt(language)

// 3. Combine
enhancedSystemPrompt = systemPrompt + profileSummary

// 4. Format conversation
context = last 10 messages

// 5. Send to AI
aiResponse = aiProvider.generateResponse({
  prompt: userMessage,
  context: context,
  language: language,
  systemPrompt: enhancedSystemPrompt
})
```

---

## 4. Recommendation Logic

### Complete Flow:

#### Step 1: Check if Ready for Recommendations

**Conditions (ALL must be true):**
```typescript
1. Profile completeness >= 60%
2. Has ALL required fields: age, occupation, state, income
3. At least 8 messages exchanged (4 Q&A pairs)
4. User is asking about schemes (keywords detected)
```

**Keywords:**
- English: "scheme", "eligible", "recommend", "suggest", "show", "check"
- Hindi: "योजना", "पात्र", "सुझाव", "दिखाओ", "जांच"

#### Step 2: Load Schemes Data
```typescript
allSchemes = loadSchemesData() // from data/schemes.json
// Returns 100+ schemes with full details
```

#### Step 3: Run Eligibility Engine
```typescript
eligibilityResults = eligibilityEngine.evaluateEligibility(
  userProfile,
  allSchemes
)

eligibleSchemes = eligibilityResults
  .filter(r => r.isEligible)
  .map(r => r.scheme)
```

#### Step 4: Rank Eligible Schemes
```typescript
rankedSchemes = rankingEngine.rankSchemes(
  eligibleSchemes,
  userProfile
)

topSchemes = rankedSchemes.slice(0, 3) // Top 3
```

#### Step 5: Format Response
```typescript
matchedSchemes = topSchemes.map(rs => ({
  scheme_id: rs.scheme.schemeId,
  scheme_name: rs.scheme.name,
  category: rs.scheme.category,
  financial_assistance: "₹" + rs.scheme.benefit.amount,
  benefit_type: rs.scheme.benefit.type,
  short_description: rs.scheme.description,
  matchPercentage: Math.round(rs.relevanceScore),
  eligibilityReason: formatEligibilityReason(rs, profile),
  geographic_criteria: rs.scheme.state || "All India"
}))
```

#### Step 6: Embed in Response
```typescript
response = `${aiResponse}

[SCHEME_DATA]
${JSON.stringify(matchedSchemes, null, 2)}
[/SCHEME_DATA]`
```

### Frontend Parsing:
The frontend detects `[SCHEME_DATA]...[/SCHEME_DATA]` tags and renders scheme cards.

---

## 5. Necessary Requirements

### Required Fields (4 fields - MUST have all)

| Field | Type | Example | Why Required |
|-------|------|---------|--------------|
| age | number | 43 | Age-based eligibility |
| state | string | "Maharashtra" | State-specific schemes |
| occupation | string | "farmer" | Occupation-based schemes |
| income | number | 150000 | Income limits |

### Optional Fields (Improve matching)

| Field | Type | Example | Purpose |
|-------|------|---------|---------|
| gender | string | "male" | Gender-specific schemes |
| casteCategory | string | "sc" | Category-based schemes |
| district | string | "Pune" | District-level schemes |
| hasDisability | boolean | false | Disability schemes |

### Profile Completeness Calculation:
```typescript
requiredFields = ["age", "state", "occupation", "income"]
filledFields = requiredFields.filter(field => profile[field] !== undefined)
completeness = (filledFields.length / requiredFields.length) * 100
```

**Example:**
- age: 43 ✅
- state: "Maharashtra" ✅
- occupation: undefined ❌
- income: 150000 ✅

**Completeness:** 75%

---

## 6. AI Response Flow

### How AI Responds:

#### Stage 1: Collecting Profile (completeness < 60%)
```
AI: "Namaste! I'm Sahayak AI. May I know your age?"
User: "I am 43"
AI: "Thank you! What is your occupation?"
User: "I am a farmer"
AI: "Great! Which state do you live in?"
User: "Maharashtra"
AI: "Perfect! What is your annual income?"
User: "₹1,50,000"
```

**AI Behavior:**
- Asks ONE question at a time
- Never repeats questions
- Never asks for already known fields
- Never recommends schemes yet

#### Stage 2: Recommending (completeness >= 60% + all required fields)
```
AI: "Based on your profile, here are the top schemes for you:"

[SCHEME_DATA]
[
  {
    "scheme_id": "SCH_001",
    "scheme_name": "PM-KISAN",
    "category": "Agriculture",
    "financial_assistance": "₹6,000",
    "matchPercentage": 93,
    "eligibilityReason": "Your occupation (farmer) matches, Your state (Maharashtra) matches"
  },
  ...
]
[/SCHEME_DATA]
```

**AI Behavior:**
- STOPS asking questions
- Automatically recommends schemes
- Explains why each scheme matches
- Prioritizes central and state schemes

#### Stage 3: Post-Recommendation
```
User: "Tell me more about PM-KISAN"
AI: "PM-KISAN provides ₹6,000 per year to farmers in 3 installments..."

User: "What documents do I need?"
AI: "You need: Aadhaar Card, Land Records, Bank Passbook..."
```

**AI Behavior:**
- Answers follow-up questions
- Helps with benefits, documents, application process
- Does NOT restart profile collection

---

## Summary

### The Complete Journey:

1. **User starts chat** → AI greets and asks for age
2. **User provides info** → Profile extraction (pattern matching + AI)
3. **Profile builds up** → Completeness increases (0% → 25% → 50% → 75%)
4. **All 4 required fields collected** → Completeness = 100%
5. **User asks about schemes** → Eligibility check triggered
6. **Eligibility Engine runs** → Filters eligible schemes
7. **Ranking Engine runs** → Ranks by relevance score
8. **Top 3 schemes selected** → Formatted with match reasons
9. **AI response generated** → Schemes embedded in response
10. **Frontend displays** → Scheme cards rendered

### Key Principles:

✅ **Accuracy over Speed** - Never recommend without complete data
✅ **No Repetition** - Never ask same question twice
✅ **Context Awareness** - AI knows what's already collected
✅ **Rule-Based Eligibility** - Transparent, explainable matching
✅ **Multi-Factor Ranking** - Fair, weighted scoring
✅ **Bilingual Support** - English + Hindi
✅ **Transparent Reasoning** - Shows why schemes match

---

## Technical Stack:

- **AI Provider:** Gemini 2.0 Flash (primary), Groq (fallback), Sarvam (extraction)
- **Eligibility:** Rule-based engine with 7 criteria
- **Ranking:** Multi-factor scoring (5 factors, 100 points)
- **Profile Extraction:** AI + Pattern matching (dual approach)
- **Context:** Last 10 messages + profile summary + system prompt
- **Data:** 100+ schemes from `data/schemes.json`
- **Frontend:** React + TypeScript + Scheme cards

---

**Document Created:** March 8, 2026
**Status:** Complete System Documentation
**Version:** 1.0
