# Smart Model Routing Implementation Complete

## Architecture

```
User Request
    ↓
Task Classifier
    ↓
Model Router
    ├─ Reasoning Tasks → Gemini (best for logic)
    ├─ Language Tasks → Sarvam (best for Hindi/Marathi)
    ├─ Extraction Tasks → Sarvam (good at data extraction)
    └─ General Tasks → Gemini (default)
    ↓
Fallback Chain: Primary → Secondary → Tertiary
    ↓
Response
```

## Components Implemented

### 1. Task Classifier (`backend/src/ai/task-classifier.ts`)

Classifies tasks into 4 types:
- **REASONING**: Eligibility logic, recommendations, comparisons
- **LANGUAGE**: Hindi/Marathi content, simple Q&A
- **EXTRACTION**: Profile data extraction from user messages
- **GENERAL**: Default conversation

**Classification Logic:**
```typescript
// Reasoning: "which scheme", "eligible", "recommend"
// Language: Hindi content, simple greetings
// Extraction: "I am 43", "my age is", "from Maharashtra"
```

**Model Priority per Task:**
- Reasoning: Gemini → Groq → Sarvam
- Language: Sarvam → Gemini → Groq
- Extraction: Sarvam → Gemini → Groq
- General: Gemini → Sarvam → Groq

### 2. Model Router (`backend/src/ai/model-router.ts`)

Routes requests to appropriate model based on task classification.

**Features:**
- Automatic model selection per task
- Fallback chain on failure
- Performance logging
- Statistics tracking

**Usage:**
```typescript
const router = new ModelRouter({
  geminiApiKey: 'key',
  sarvamApiKey: 'key',
  groqApiKey: 'key',
  enableRouting: true
});

const response = await router.generateResponse(request);
// Automatically routes to best model
```

### 3. Structured Output Enforcer (`backend/src/ai/structured-output.ts`)

Enforces JSON schema responses for:
- Eligibility results
- Scheme recommendations
- Missing criteria questions
- Conversation responses

**Schemas:**
```typescript
EligibilityResultSchema
SchemeRecommendationSchema
SchemeRecommendationListSchema
MissingCriteriaQuestionSchema
ConversationResponseSchema
```

### 4. Updated Provider Factory

Added 'router' type to provider factory:
```typescript
AI_PROVIDER=router  // Smart routing mode
AI_PROVIDER=gemini  // Single model mode
AI_PROVIDER=sarvam  // Single model mode
```

### 5. Gemini Provider Updated

Updated to use latest model:
- Old: `gemini-pro` (deprecated)
- New: `gemini-1.5-flash` (current)

## Configuration

### Environment Variables

```bash
# Smart Routing (Recommended)
AI_PROVIDER=router
AI_PROVIDER_PRIMARY_MODEL=router
AI_ROUTING_ENABLED=true

# API Keys (at least 2 required for routing)
GEMINI_API_KEY=your-key
SARVAM_API_KEY=your-key
GROQ_API_KEY=your-key
```

### Single Model Mode

```bash
# Use only Gemini
AI_PROVIDER=gemini
AI_PROVIDER_PRIMARY_MODEL=gemini-1.5-flash
AI_ROUTING_ENABLED=false

# Use only Sarvam
AI_PROVIDER=sarvam
AI_PROVIDER_PRIMARY_MODEL=sarvam-m
AI_ROUTING_ENABLED=false
```

## How It Works

### Example 1: Reasoning Task

```
User: "Which schemes am I eligible for?"

Task Classifier:
  - Detects: "eligible", "which scheme"
  - Classification: REASONING
  - Recommended: Gemini

Model Router:
  - Routes to Gemini (best for logic)
  - Gemini generates structured recommendation
  - Returns scheme list with eligibility reasons
```

### Example 2: Language Task

```
User: "मुझे स्वास्थ्य योजनाओं के बारे में बताएं"

Task Classifier:
  - Detects: Hindi script (Devanagari)
  - Classification: LANGUAGE
  - Recommended: Sarvam

Model Router:
  - Routes to Sarvam (best for Hindi)
  - Sarvam responds in Hindi
  - Natural language handling
```

### Example 3: Extraction Task

```
User: "I am 43 years old, male, from Maharashtra"

Task Classifier:
  - Detects: "I am", "years old", "from"
  - Classification: EXTRACTION
  - Recommended: Sarvam

Model Router:
  - Routes to Sarvam (good at extraction)
  - Extracts: age=43, gender=male, state=Maharashtra
  - Returns structured profile data
```

## Reliability Features

### 1. Automatic Fallback

```
Primary Model Fails
    ↓
Try Secondary Model
    ↓
Try Tertiary Model
    ↓
Return Error (all failed)
```

### 2. Retry Logic

- Retry once on transient failures
- Different models for different attempts
- Exponential backoff (optional)

### 3. Performance Logging

```
[MODEL ROUTER] Task: reasoning, Recommended: gemini
[MODEL ROUTER] Attempting gemini...
[MODEL ROUTER] ✓ gemini succeeded (1.2s, 450 tokens)
```

### 4. Statistics Tracking

```typescript
router.getStats()
// {
//   availableModels: ['gemini', 'sarvam', 'groq'],
//   routingEnabled: true,
//   defaultModel: undefined
// }
```

## Benefits

### 1. Better AI Quality
- Gemini for complex reasoning (eligibility, recommendations)
- Sarvam for Indian languages (Hindi, Marathi)
- Right model for right task

### 2. Improved Reliability
- Automatic fallback on failure
- Multiple models available
- No single point of failure

### 3. Cost Optimization
- Use cheaper models for simple tasks
- Reserve expensive models for complex tasks
- Reduce API costs

### 4. Performance
- Fast models (Groq) for simple tasks
- Accurate models (Gemini) for complex tasks
- Optimized per use case

## Testing

### Test Smart Routing

```bash
# Start backend with routing enabled
cd backend
npm run dev

# Test reasoning task
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Which schemes am I eligible for?","language":"en"}'

# Check logs for routing decision
# [MODEL ROUTER] Task: reasoning, Recommended: gemini
```

### Test Language Task

```bash
# Test Hindi message
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"नमस्ते","language":"hi"}'

# Check logs
# [MODEL ROUTER] Task: language, Recommended: sarvam
```

## Migration Guide

### From Single Model to Router

1. Update `.env`:
```bash
AI_PROVIDER=router
AI_ROUTING_ENABLED=true
```

2. Ensure API keys are set:
```bash
GEMINI_API_KEY=your-key
SARVAM_API_KEY=your-key
GROQ_API_KEY=your-key  # Optional
```

3. Restart backend:
```bash
npm run dev
```

4. Monitor logs for routing decisions

### Rollback to Single Model

```bash
AI_PROVIDER=sarvam
AI_ROUTING_ENABLED=false
```

## Production Deployment

### Recommended Configuration

```bash
# Use router with all 3 models
AI_PROVIDER=router
AI_ROUTING_ENABLED=true
GEMINI_API_KEY=prod-key
SARVAM_API_KEY=prod-key
GROQ_API_KEY=prod-key
```

### Monitoring

Monitor these metrics:
- Model selection distribution
- Success/failure rates per model
- Response times per model
- API costs per model

### Scaling

- Add more models to router
- Adjust task classification rules
- Fine-tune model priorities
- Implement caching layer

## Next Steps

1. ✅ Task classifier implemented
2. ✅ Model router implemented
3. ✅ Structured output schemas
4. ✅ Gemini provider updated
5. ✅ Configuration updated

**Ready to test:**
- Restart backend
- Test different task types
- Monitor routing decisions
- Verify improved AI quality

## Files Modified

- `backend/src/ai/task-classifier.ts` (new)
- `backend/src/ai/model-router.ts` (new)
- `backend/src/ai/structured-output.ts` (new)
- `backend/src/ai/provider-factory.ts` (updated)
- `backend/src/ai/gemini-provider.ts` (updated)
- `backend/src/types/index.ts` (updated)
- `backend/src/config/index.ts` (updated)
- `.env` (updated)

No frontend changes required.
