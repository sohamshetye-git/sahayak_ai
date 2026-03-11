# System Design, Eligibility Criteria & AI Rules - Complete Documentation

## PART 1: SYSTEM ARCHITECTURE OVERVIEW

### High-Level Architecture
```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Next.js)                        │
│  Chat UI → Message Input → useChat Hook → API Client            │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTP POST /api/chat
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (Node.js/Lambda)                      │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Chat Handler (chat.ts)                                   │   │
│  │ - Receives user message                                  │   │
│  │ - Manages session                                        │   │
│  │ - Calls Conversation Orchestrator                        │   │
│  └──────────────────────────────────────────────────────────┘   │
│                             ↓                                     │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Conversation Orchestrator (conversation-orchestrator.ts) │   │
│  │ - Manages conversation stages                            │   │
│  │ - Extracts user profile from messages                    │   │
│  │ - Determines conversation flow                           │   │
│  │ - Builds AI context and prompts                          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                             ↓                                     │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Task Classifier (task-classifier.ts)                     │   │
│  │ - Classifies message intent                              │   │
│  │ - Selects appropriate AI model                           │   │
│  │ - Determines task type                                   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                             ↓                                     │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ AI Provider Factory (provider-factory.ts)                │   │
│  │ - Routes to selected AI model                            │   │
│  │ - Handles fallback logic                                 │   │
│  │ - Manages API calls                                      │   │
│  └──────────────────────────────────────────────────────────┘   │
│                             ↓                                     │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ AI Providers (gemini, openai, groq, sarvam, bedrock)     │   │
│  │ - Generate AI responses                                  │   │
│  │ - Extract structured data                                │   │
│  │ - Handle language-specific processing                    │   │
│  └──────────────────────────────────────────────────────────┘   │
│                             ↓                                     │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Eligibility Engine (eligibility-engine.ts)               │   │
│  │ - Matches user profile to schemes                        │   │
│  │ - Evaluates eligibility criteria                         │   │
│  │ - Calculates confidence scores                           │   │
│  └──────────────────────────────────────────────────────────┘   │
│                             ↓                                     │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Ranking Engine (ranking-engine.ts)                       │   │
│  │ - Ranks eligible schemes by relevance                    │   │
│  │ - Applies multi-factor scoring                           │   │
│  │ - Returns top schemes                                    │   │
│  └──────────────────────────────────────────────────────────┘   │
│                             ↓                                     │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Structured Output (structured-output.ts)                 │   │
│  │ - Formats response with scheme data                      │   │
│  │ - Wraps schemes in [SCHEME_DATA] tags                    │   │
│  │ - Prepares for frontend parsing                          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                             ↓                                     │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Cache Service (cache-service.ts)                         │   │
│  │ - Caches schemes and results                             │   │
│  │ - Manages session data                                   │   │
│  │ - Reduces database queries                               │   │
│  └──────────────────────────────────────────────────────────┘   │
│                             ↓                                     │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Database (DynamoDB/PostgreSQL)                           │   │
│  │ - Stores schemes data                                    │   │
│  │ - Stores user sessions                                   │   │
│  │ - Stores applications                                    │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                             ↑
                    Response with schemes
                             │
                    ┌────────┴────────┐
                    ↓                 ↓
            Frontend parses    Displays SchemeCards
            [SCHEME_DATA]      to user
```

---

## PART 2: CONVERSATION FLOW & STAGES

### Conversation Stages
The system manages conversation through 5 distinct stages:

#### Stage 1: **GREETING**
- User enters chat for first time
- System shows greeting: "Namaste! I'm Sahayak AI..."
- System asks first eligibility question

#### Stage 2: **PROFILE_COLLECTION**
- System asks for missing eligibility fields ONE AT A TIME
- User provides information
- System validates and extracts data
- Continues until 60% of required fields are filled

#### Stage 3: **PROFILE_COMPLETE**
- All required fields collected (or 80% complete)
- System summarizes collected profile
- Asks if user wants scheme recommendations

#### Stage 4: **RECOMMENDATION**
- System runs eligibility engine
- Matches user to eligible schemes
- Ranks schemes by relevance
- Returns top 3-5 schemes with match percentages

#### Stage 5: **FOLLOW_UP**
- User asks questions about schemes
- System provides detailed information
- Offers application guidance

### Stage Transition Logic
```typescript
determineConversationStage(
  profile: UserProfile,
  currentStage: ConversationStage,
  userMessage: string
): ConversationStage {
  
  const completeness = calculateProfileCompleteness(profile);
  
  // If profile < 60% complete, stay in PROFILE_COLLECTION
  if (completeness < 60) {
    return 'PROFILE_COLLECTION';
  }
  
  // If profile 60-80% complete, move to PROFILE_COMPLETE
  if (completeness >= 60 && completeness < 80) {
    return 'PROFILE_COMPLETE';
  }
  
  // If profile > 80% complete and user asks for recommendations
  if (completeness >= 80 && hasRecommendationKeyword(userMessage)) {
    return 'RECOMMENDATION';
  }
  
  // If already recommended, stay in FOLLOW_UP
  if (currentStage === 'RECOMMENDATION') {
    return 'FOLLOW_UP';
  }
  
  return currentStage;
}
```

---

## PART 3: ELIGIBILITY CRITERIA & MATCHING RULES

### Required Eligibility Fields
```typescript
interface UserProfile {
  age?: number;                    // 0-120 years
  gender?: 'Male' | 'Female' | 'Other';
  state?: string;                  // State name
  residenceType?: 'Urban' | 'Rural';
  annualIncome?: number;           // In INR
  category?: 'General' | 'OBC' | 'SC' | 'ST';
  occupation?: string;             // farmer, student, worker, etc.
  specialStatus?: string;          // Student, Farmer, Senior Citizen, Disabled, None
  hasDisability?: boolean;
  casteCategory?: string;
}
```

### Eligibility Matching Rules

#### Rule 1: Age Matching
```typescript
// Scheme defines: ageMin, ageMax
// User provides: age

if (userAge >= schemeAgeMin && userAge <= schemeAgeMax) {
  ✓ ELIGIBLE
} else {
  ✗ NOT ELIGIBLE
}

Example:
- Scheme: PM-KISAN (18-120 years)
- User: 45 years
- Result: ✓ ELIGIBLE
```

#### Rule 2: Income Matching
```typescript
// Scheme defines: incomeMax
// User provides: annualIncome

if (userIncome <= schemeIncomeMax) {
  ✓ ELIGIBLE
} else {
  ✗ NOT ELIGIBLE
}

Example:
- Scheme: NSP (Max income: ₹2,50,000)
- User: ₹2,00,000
- Result: ✓ ELIGIBLE
```

#### Rule 3: Gender Matching
```typescript
// Scheme defines: gender (can be "Male", "Female", "All", or "ANY")
// User provides: gender

if (schemeGender === "ANY" || schemeGender === "All") {
  ✓ ELIGIBLE
} else if (userGender === schemeGender) {
  ✓ ELIGIBLE
} else {
  ✗ NOT ELIGIBLE
}

Example:
- Scheme: PMUY (Female only)
- User: Female
- Result: ✓ ELIGIBLE
```

#### Rule 4: Category/Caste Matching
```typescript
// Scheme defines: category (array or "ANY")
// User provides: category

if (schemeCategory.includes("ANY")) {
  ✓ ELIGIBLE
} else if (schemeCategory.includes(userCategory)) {
  ✓ ELIGIBLE
} else {
  ✗ NOT ELIGIBLE
}

Example:
- Scheme: NSP (SC/ST/OBC)
- User: SC
- Result: ✓ ELIGIBLE
```

#### Rule 5: Occupation Matching
```typescript
// Scheme defines: occupation (array or "ANY")
// User provides: occupation

if (schemeOccupation.includes("ANY")) {
  ✓ ELIGIBLE
} else if (schemeOccupation.includes(userOccupation)) {
  ✓ ELIGIBLE
} else {
  ✗ NOT ELIGIBLE
}

Example:
- Scheme: PM-KISAN (Farmer only)
- User: Farmer
- Result: ✓ ELIGIBLE
```

#### Rule 6: Geographic Matching
```typescript
// Scheme defines: state ("All India" or specific state)
// User provides: state

if (schemeState === "All India") {
  ✓ ELIGIBLE (for any state)
} else if (userState === schemeState) {
  ✓ ELIGIBLE
} else {
  ✗ NOT ELIGIBLE
}

Example:
- Scheme: PM-KISAN (All India)
- User: Maharashtra
- Result: ✓ ELIGIBLE
```

#### Rule 7: Disability Matching
```typescript
// Scheme defines: disability (true/false/null)
// User provides: hasDisability

if (schemeDisability === null) {
  ✓ ELIGIBLE (no restriction)
} else if (userDisability === schemeDisability) {
  ✓ ELIGIBLE
} else {
  ✗ NOT ELIGIBLE
}

Example:
- Scheme: PMSBY (No disability restriction)
- User: No disability
- Result: ✓ ELIGIBLE
```

### Eligibility Calculation
```typescript
// For each scheme, calculate:
const matchedCriteria = [];
const missingCriteria = [];

// Check each criterion
for (criterion in scheme.eligibility) {
  if (userProfile[criterion] matches scheme.eligibility[criterion]) {
    matchedCriteria.push(criterion);
  } else {
    missingCriteria.push(criterion);
  }
}

// User is ELIGIBLE if NO missing criteria
const isEligible = missingCriteria.length === 0;

// Calculate confidence score
const confidenceScore = matchedCriteria.length / (matchedCriteria.length + missingCriteria.length);

// Example:
// Matched: [age, gender, state, income] = 4
// Missing: [category] = 1
// Confidence: 4/5 = 80%
// Eligible: NO (because category is missing)
```

---

## PART 4: RANKING & RECOMMENDATION LOGIC

### Ranking Factors (Total: 100 points)

#### Factor 1: Occupation Match (30 points)
```typescript
if (userOccupation matches schemeOccupation) {
  score = 30 points (FULL)
} else if (schemeOccupation === "ANY") {
  score = 15 points (HALF - neutral)
} else {
  score = 0 points (NO MATCH)
}

Example:
- User: Farmer
- Scheme 1: PM-KISAN (Farmer) → 30 points
- Scheme 2: NSP (Student) → 0 points
- Scheme 3: PMAY-G (ANY) → 15 points
```

#### Factor 2: State Match (25 points)
```typescript
if (userState === schemeState) {
  score = 25 points (FULL)
} else if (schemeState === "All India") {
  score = 17.5 points (70% - national schemes are good)
} else {
  score = 0 points (NO MATCH)
}

Example:
- User: Maharashtra
- Scheme 1: PM-KISAN (All India) → 17.5 points
- Scheme 2: PMAY-G (Maharashtra) → 25 points
- Scheme 3: NSP (All India) → 17.5 points
```

#### Factor 3: Benefit Value (20 points)
```typescript
// Normalized based on benefit amount (max: ₹100,000)
benefitScore = (benefitAmount / 100000) * 20

Example:
- Scheme 1: ₹6,000 → (6000/100000) * 20 = 1.2 points
- Scheme 2: ₹50,000 → (50000/100000) * 20 = 10 points
- Scheme 3: ₹500,000 (capped at 100k) → 20 points
```

#### Factor 4: Category Priority (15 points)
```typescript
// High priority: Health, Education, Healthcare, Scholarship
if (category in HIGH_PRIORITY) {
  score = 15 points
}
// Medium priority: Agriculture, Housing, Employment
else if (category in MEDIUM_PRIORITY) {
  score = 10.5 points (70%)
}
// Low priority: Other
else {
  score = 7.5 points (50%)
}

Example:
- Health scheme → 15 points
- Agriculture scheme → 10.5 points
- Other scheme → 7.5 points
```

#### Factor 5: Recency (10 points)
```typescript
// Newer schemes get higher scores
// Currently: Default 8 points (80%)
// In production: Calculate based on creation date

score = 8 points (default)
```

### Final Ranking Score
```typescript
totalScore = occupationScore + stateScore + benefitScore + categoryScore + recencyScore

// Example calculation:
// User: 45-year-old farmer from Maharashtra
// Scheme: PM-KISAN

occupationScore = 30 (farmer matches)
stateScore = 17.5 (All India scheme)
benefitScore = 1.2 (₹6,000 benefit)
categoryScore = 10.5 (Agriculture - medium priority)
recencyScore = 8 (default)

totalScore = 30 + 17.5 + 1.2 + 10.5 + 8 = 67.2 points

// Schemes are sorted by totalScore (descending)
// Top 3-5 schemes are recommended
```

---

## PART 5: AI RULES & CONSTRAINTS

### System Prompt Rules (Strict Guidelines for AI)

#### Rule 1: ONE QUESTION AT A TIME
```
❌ WRONG:
"What is your age, gender, and state?"

✓ CORRECT:
"What is your age?"
```

#### Rule 2: NEVER ASK FOR ALREADY PROVIDED DATA
```
Current Profile: { age: 45, gender: "Male" }

❌ WRONG:
"What is your age and gender?"

✓ CORRECT:
"Which state do you live in?"
```

#### Rule 3: VALIDATE BEFORE MOVING FORWARD
```
User: "I'm 150 years old"

❌ WRONG:
"Thanks! Next, what's your gender?"

✓ CORRECT:
"That seems unusual. Are you sure? (Valid age: 0-120 years)"
```

#### Rule 4: ACKNOWLEDGE UNSOLICITED INFORMATION
```
User: "I'm a farmer from Maharashtra"
(Without being asked)

❌ WRONG:
"What is your age?"

✓ CORRECT:
"Great! I've noted that you're a farmer from Maharashtra. 
What is your age?"
```

#### Rule 5: ONLY RECOMMEND AFTER PROFILE IS COMPLETE
```
Profile Completeness: 40%

❌ WRONG:
"Based on your profile, here are schemes..."

✓ CORRECT:
"I need a bit more information. What is your annual income?"
```

#### Rule 6: PROVIDE MATCH PERCENTAGE WITH RECOMMENDATIONS
```
❌ WRONG:
"Here are schemes for you:
1. PM-KISAN
2. NSP"

✓ CORRECT:
"Here are schemes you're eligible for:
1. PM-KISAN (95% match - You're a farmer in Maharashtra)
2. NSP (75% match - You're in the right age group)"
```

#### Rule 7: EXPLAIN ELIGIBILITY REASONS
```
❌ WRONG:
"You're eligible for PM-KISAN"

✓ CORRECT:
"You're eligible for PM-KISAN because:
✓ Your age (45) is within the required range (18-120)
✓ You're a farmer
✓ The scheme is available in Maharashtra"
```

#### Rule 8: HANDLE MISSING DATA GRACEFULLY
```
User: "I don't know my exact income"

❌ WRONG:
"You must provide your income"

✓ CORRECT:
"No problem! Can you give an approximate range?
- Below ₹1 lakh
- ₹1-3 lakh
- ₹3-5 lakh
- Above ₹5 lakh"
```

#### Rule 9: LANGUAGE CONSISTENCY
```
If language = 'hi':
- Respond in Hindi
- Use Hindi field names
- Provide Hindi scheme names

If language = 'en':
- Respond in English
- Use English field names
- Provide English scheme names
```

#### Rule 10: NO PERSONAL ADVICE
```
❌ WRONG:
"You should apply for this scheme because it's better"

✓ CORRECT:
"This scheme offers ₹6,000 annually. 
Here's how to apply: [steps]"
```

### AI Provider Selection Rules

#### Task Classification
```typescript
enum TaskType {
  CONVERSATION = 'conversation',     // Guided questioning
  RECOMMENDATION = 'recommendation', // Scheme recommendations
  EXTRACTION = 'extraction',         // Profile data extraction
  GENERAL = 'general',               // General conversation
}

// Classification Logic:
if (hasRecommendationKeyword && profileCompleteness >= 60) {
  taskType = RECOMMENDATION;
  recommendedModel = GEMINI;
}
else if (hasExtractionPattern && messageCount < 10) {
  taskType = EXTRACTION;
  recommendedModel = SARVAM;
}
else if (isConversational || profileCompleteness < 60) {
  taskType = CONVERSATION;
  recommendedModel = GEMINI;
}
else {
  taskType = GENERAL;
  recommendedModel = GEMINI;
}
```

#### Model Priority (Fallback Policy)
```
RECOMMENDATION:
1. Gemini (best reasoning)
2. OpenAI (secondary)
3. Groq (fallback)
4. Sarvam (last resort)

EXTRACTION:
1. Sarvam (fast, cost-effective)
2. Gemini (accurate)
3. OpenAI (secondary)
4. Groq (fallback)

CONVERSATION:
1. Gemini (instruction-following)
2. OpenAI (secondary)
3. Groq (fallback)
4. Sarvam (last resort)

GENERAL:
1. Gemini (quality)
2. OpenAI (secondary)
3. Groq (fallback)
4. Sarvam (last resort)
```

---

## PART 6: PROFILE EXTRACTION LOGIC

### Pattern-Based Extraction
```typescript
// Age extraction patterns
/(?:my\s+)?age\s+is\s+(\d+)/i           // "my age is 43"
/(?:i\s+am|i'm)\s+(\d+)\s*(?:years?)/i  // "I'm 43 years"
/(\d+)\s*(?:years?|साल|वर्ष)/i           // "43 years old"

// Gender extraction patterns
/\b(male|man|boy|m|female|woman|girl|f|other|transgender)\b/i
/\b(पुरुष|लड़का|महिला|लड़की|तीसरा|ट्रांसजेंडर)\b/i

// State extraction patterns
/from\s+(\w+)/i                          // "from Maharashtra"
/live\s+in\s+(\w+)/i                     // "live in Delhi"
/state\s+is\s+(\w+)/i                    // "state is Gujarat"

// Income extraction patterns
/income\s+(?:is\s+)?(?:₹|rs\.?)\s*([\d,]+)/i  // "income is ₹200000"
/earn\s+(?:₹|rs\.?)\s*([\d,]+)/i              // "earn ₹150000"

// Occupation extraction patterns
/(?:work\s+as|occupation|job)\s+(\w+)/i  // "work as farmer"
/i\s+(?:am|'m)\s+a\s+(\w+)/i             // "I'm a student"
```

### AI-Based Extraction (Fallback)
```typescript
// If pattern matching fails, use AI to extract:
const extractionPrompt = `
Extract user profile information from this message:
"${userMessage}"

Current profile: ${JSON.stringify(currentProfile)}

Return JSON with extracted fields:
{
  "age": number,
  "gender": string,
  "state": string,
  "income": number,
  "occupation": string,
  "category": string
}
`;

// AI returns structured JSON
// Merged with current profile
```

### Profile Completeness Calculation
```typescript
const requiredFields = [
  'age',
  'gender',
  'state',
  'income',
  'occupation',
  'category'
];

const filledFields = requiredFields.filter(field => 
  profile[field] !== undefined && profile[field] !== null
);

completeness = (filledFields.length / requiredFields.length) * 100;

// Stages:
// 0-40%: Early collection
// 40-60%: Mid collection
// 60-80%: Profile complete (can recommend)
// 80-100%: Full profile
```

---

## PART 7: RESPONSE FORMATTING

### Response Structure
```typescript
interface ChatResponse {
  sessionId: string;
  response: string;              // AI-generated text response
  userProfile: UserProfile;      // Extracted/updated profile
  suggestedActions: string[];    // Next steps
  timestamp: number;
  stage: ConversationStage;
}
```

### Scheme Data Formatting
```typescript
// When recommending schemes, format as:
const response = `
Here are the schemes you're eligible for:

[SCHEME_DATA]
[
  {
    "scheme_id": "PM-KISAN",
    "scheme_name": "PM-Kisan Samman Nidhi",
    "category": "Agriculture",
    "financial_assistance": "₹6,000 per year",
    "matchPercentage": 95,
    "eligibilityReason": "You're a farmer in Maharashtra"
  },
  {
    "scheme_id": "NSP",
    "scheme_name": "National Scholarship Portal",
    "category": "Education",
    "financial_assistance": "₹50,000",
    "matchPercentage": 75,
    "eligibilityReason": "You're in the eligible age group"
  }
]
[/SCHEME_DATA]

You can apply for these schemes at the service centers near you.
`;

// Frontend parses [SCHEME_DATA] tags and renders SchemeCards
```

---

## PART 8: CONVERSATION EXAMPLES

### Example 1: Complete Conversation Flow

```
User: "Namaste, I want to know about government schemes"

AI: "Namaste! I'm Sahayak AI, your smart assistant for government schemes.
Tell me about yourself, and I'll help you find the best schemes you're eligible for.

Let's start: What is your age?"

User: "I'm 45 years old"

AI: "Great! You're 45 years old. 
What is your gender?"

User: "Male"

AI: "Thanks. Which state do you live in?"

User: "Maharashtra"

AI: "Perfect! Are you from an urban or rural area?"

User: "Rural"

AI: "Got it. What is your approximate annual family income?
- Below ₹1 lakh
- ₹1-3 lakh
- ₹3-5 lakh
- Above ₹5 lakh"

User: "₹2 lakh"

AI: "Thanks. What is your occupation?"

User: "I'm a farmer"

AI: "Excellent! And your category?
- General
- OBC
- SC
- ST"

User: "General"

AI: "Perfect! Based on your profile, here are the schemes you're eligible for:

[SCHEME_DATA]
[
  {
    "scheme_id": "PM-KISAN",
    "scheme_name": "PM-Kisan Samman Nidhi",
    "matchPercentage": 95,
    "eligibilityReason": "You're a farmer in Maharashtra with income ₹2 lakh"
  },
  {
    "scheme_id": "PMAY-G",
    "scheme_name": "Pradhan Mantri Awas Yojana - Gramin",
    "matchPercentage": 85,
    "eligibilityReason": "You're from rural Maharashtra with eligible income"
  }
]
[/SCHEME_DATA]

Would you like to know more about any of these schemes?"
```

### Example 2: Handling Unsolicited Information

```
User: "I'm a 35-year-old female farmer from Punjab with ₹1.5 lakh income"

AI: "Great! I've noted all that information:
✓ Age: 35
✓ Gender: Female
✓ Occupation: Farmer
✓ State: Punjab
✓ Income: ₹1.5 lakh

What is your category?
- General
- OBC
- SC
- ST"

User: "General"

AI: "Perfect! Based on your profile, here are the schemes you're eligible for:
[SCHEME_DATA]
...
[/SCHEME_DATA]"
```

### Example 3: Handling Invalid Data

```
User: "I'm 200 years old"

AI: "That seems unusual. The valid age range is 0-120 years.
Could you please confirm your age?"

User: "Sorry, I meant 45"

AI: "No problem! So you're 45 years old.
What is your gender?"
```

---

## PART 9: SYSTEM CONSTRAINTS & LIMITS

### Conversation Limits
- **Max messages per session:** 100
- **Max context window:** Last 10 messages
- **Session timeout:** 24 hours
- **Max profile extraction attempts:** 3

### Eligibility Limits
- **Min age:** 0 years
- **Max age:** 120 years
- **Min income:** ₹0
- **Max income:** ₹50,00,000 (50 lakh)
- **Max schemes to recommend:** 5

### Performance Limits
- **AI response timeout:** 30 seconds
- **Database query timeout:** 10 seconds
- **Cache TTL:** 24 hours
- **Max concurrent sessions:** 1000

### Data Validation
```typescript
// Age validation
if (age < 0 || age > 120) {
  throw new Error('Invalid age');
}

// Income validation
if (income < 0 || income > 5000000) {
  throw new Error('Invalid income');
}

// State validation
if (!validStates.includes(state)) {
  throw new Error('Invalid state');
}

// Gender validation
if (!['Male', 'Female', 'Other'].includes(gender)) {
  throw new Error('Invalid gender');
}
```

---

## SUMMARY

This system implements a sophisticated multi-stage conversation flow that:

1. **Collects** user profile data through guided questioning
2. **Validates** data using pattern matching and AI extraction
3. **Matches** user profile to eligible schemes using rule-based eligibility engine
4. **Ranks** schemes using multi-factor scoring algorithm
5. **Recommends** top schemes with match percentages and reasons
6. **Guides** users through application process

All AI interactions follow strict rules to ensure:
- One question at a time
- No duplicate questions
- Proper validation
- Clear explanations
- Language consistency
- Accurate recommendations

The system is designed to be user-friendly, accurate, and efficient in helping users find government schemes they're eligible for.
