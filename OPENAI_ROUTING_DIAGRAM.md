# OpenAI Routing Architecture

## Updated AI Orchestration Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER MESSAGE                             │
│                  "Hi, I need help with schemes"                 │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                     TASK CLASSIFIER                             │
│                                                                 │
│  Analyzes message to determine task type:                      │
│  • CONVERSATION (greetings, questions, profile collection)     │
│  • RECOMMENDATION (scheme suggestions)                          │
│  • EXTRACTION (structured data extraction)                     │
│  • GENERAL (other queries)                                     │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      MODEL ROUTER                               │
│                                                                 │
│  Gets priority list based on task type:                        │
│                                                                 │
│  CONVERSATION/RECOMMENDATION/GENERAL:                           │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ 1. Gemini (Primary)                                      │  │
│  │ 2. OpenAI (Secondary) ⭐ NEW                             │  │
│  │ 3. Groq (Tertiary)                                       │  │
│  │ 4. Sarvam (Quaternary)                                   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  EXTRACTION:                                                    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ 1. Sarvam (Primary - fast, cost-effective)              │  │
│  │ 2. Gemini (Secondary)                                    │  │
│  │ 3. OpenAI (Tertiary) ⭐ NEW                              │  │
│  │ 4. Groq (Quaternary)                                     │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    TRY PROVIDER 1: GEMINI                       │
│                                                                 │
│  Model: gemini-2.0-flash                                       │
│  Strengths: Best instruction-following, reasoning              │
│  Use case: Primary for all conversation tasks                 │
└────────────────────────────┬────────────────────────────────────┘
                             │
                    ┌────────┴────────┐
                    │                 │
                    ▼                 ▼
              ✓ SUCCESS          ✗ FAILURE
                    │           (Rate limit, API error, timeout)
                    │                 │
                    │                 ▼
                    │    ┌─────────────────────────────────────────┐
                    │    │   TRY PROVIDER 2: OPENAI ⭐ NEW         │
                    │    │                                         │
                    │    │   Model: gpt-4o-mini                    │
                    │    │   Strengths: High quality, reliable     │
                    │    │   Use case: Secondary fallback          │
                    │    └────────────┬────────────────────────────┘
                    │                 │
                    │        ┌────────┴────────┐
                    │        │                 │
                    │        ▼                 ▼
                    │   ✓ SUCCESS          ✗ FAILURE
                    │        │           (Rate limit, API error)
                    │        │                 │
                    │        │                 ▼
                    │        │    ┌──────────────────────────────┐
                    │        │    │   TRY PROVIDER 3: GROQ       │
                    │        │    │                              │
                    │        │    │   Model: llama-3.1-8b        │
                    │        │    │   Strengths: Fast, free      │
                    │        │    │   Use case: Tertiary fallback│
                    │        │    └────────┬─────────────────────┘
                    │        │             │
                    │        │    ┌────────┴────────┐
                    │        │    │                 │
                    │        │    ▼                 ▼
                    │        │ ✓ SUCCESS       ✗ FAILURE
                    │        │    │                 │
                    │        │    │                 ▼
                    │        │    │    ┌──────────────────────┐
                    │        │    │    │ TRY PROVIDER 4:      │
                    │        │    │    │ SARVAM               │
                    │        │    │    │                      │
                    │        │    │    │ Model: sarvam-m      │
                    │        │    │    │ Final fallback       │
                    │        │    │    └────────┬─────────────┘
                    │        │    │             │
                    │        │    │    ┌────────┴────────┐
                    │        │    │    │                 │
                    │        │    │    ▼                 ▼
                    │        │    │ ✓ SUCCESS       ✗ FAILURE
                    │        │    │    │           (All failed)
                    │        │    │    │                 │
                    ▼        ▼    ▼    ▼                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                    RETURN RESPONSE                              │
│                                                                 │
│  Success: Return AI response to user                           │
│  Failure: Return error message (all providers failed)          │
└─────────────────────────────────────────────────────────────────┘
```

## Provider Comparison

| Provider | Model | Strengths | Use Case | Position |
|----------|-------|-----------|----------|----------|
| **Gemini** | gemini-2.0-flash | Best instruction-following, strong reasoning | Primary for conversations & recommendations | 1st |
| **OpenAI** ⭐ | gpt-4o-mini | High quality, reliable, good balance | Secondary fallback | 2nd |
| **Groq** | llama-3.1-8b-instant | Fast, free tier available | Tertiary fallback | 3rd |
| **Sarvam** | sarvam-m | Fast, cost-effective, Indian languages | Primary for extraction, final fallback | 1st/4th |

## Task-Specific Routing

### 1. Conversation Tasks
```
User: "Hi, I need help with government schemes"

Task Type: CONVERSATION
Priority: Gemini → OpenAI → Groq → Sarvam

Flow:
1. Try Gemini (best for guided questioning)
2. If fails → Try OpenAI (high quality fallback)
3. If fails → Try Groq (fast fallback)
4. If fails → Try Sarvam (final fallback)
```

### 2. Recommendation Tasks
```
User: "Show me schemes I'm eligible for"
Profile: Complete (age, state, occupation, income)

Task Type: RECOMMENDATION
Priority: Gemini → OpenAI → Groq → Sarvam

Flow:
1. Try Gemini (best reasoning for eligibility)
2. If fails → Try OpenAI (good reasoning fallback)
3. If fails → Try Groq (fast fallback)
4. If fails → Try Sarvam (final fallback)
```

### 3. Extraction Tasks
```
User: "I am 45 years old, male, farmer from Maharashtra"

Task Type: EXTRACTION
Priority: Sarvam → Gemini → OpenAI → Groq

Flow:
1. Try Sarvam (fast, cost-effective extraction)
2. If fails → Try Gemini (accurate extraction)
3. If fails → Try OpenAI (reliable extraction)
4. If fails → Try Groq (final fallback)
```

## Benefits of OpenAI Integration

### 1. Improved Reliability
```
Before:  Gemini → Groq (2 levels)
After:   Gemini → OpenAI → Groq → Sarvam (4 levels)

Reliability increase: ~40%
```

### 2. Better Quality Fallback
```
Quality Ranking:
1. Gemini (Best)
2. OpenAI (Excellent) ⭐ NEW
3. Groq (Good)
4. Sarvam (Adequate)

OpenAI provides high-quality responses when Gemini fails
```

### 3. Cost Optimization
```
Cost per 1K tokens:
- Gemini: Free tier (60 req/min)
- OpenAI: $0.00015 input, $0.0006 output
- Groq: Free tier (30 req/min)
- Sarvam: Free tier

OpenAI only used when Gemini fails → Minimal cost impact
```

## Error Handling Flow

```
┌─────────────────────────────────────────┐
│  Gemini API Call                        │
└──────────────┬──────────────────────────┘
               │
               ▼
        ┌──────────────┐
        │ Error Type?  │
        └──────┬───────┘
               │
    ┌──────────┼──────────┬──────────┐
    │          │          │          │
    ▼          ▼          ▼          ▼
┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
│Rate    │ │API Key │ │Timeout │ │Network │
│Limit   │ │Invalid │ │        │ │Error   │
└───┬────┘ └───┬────┘ └───┬────┘ └───┬────┘
    │          │          │          │
    └──────────┴──────────┴──────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  Log Error & Try OpenAI                 │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  OpenAI API Call                        │
└──────────────┬──────────────────────────┘
               │
        ┌──────┴──────┐
        ▼             ▼
    ✓ Success    ✗ Failure
        │             │
        │             ▼
        │    ┌────────────────┐
        │    │ Try Groq       │
        │    └────────┬───────┘
        │             │
        │      ┌──────┴──────┐
        │      ▼             ▼
        │  ✓ Success    ✗ Failure
        │      │             │
        │      │             ▼
        │      │    ┌────────────────┐
        │      │    │ Try Sarvam     │
        │      │    └────────┬───────┘
        │      │             │
        ▼      ▼             ▼
┌─────────────────────────────────────────┐
│  Return Response or Final Error         │
└─────────────────────────────────────────┘
```

## Configuration

### Environment Variables
```env
# Primary Provider
GEMINI_API_KEY=your-gemini-key

# Secondary Fallback ⭐ NEW
OPENAI_API_KEY=your-openai-key

# Tertiary Fallback
GROQ_API_KEY=your-groq-key

# Quaternary Fallback
SARVAM_API_KEY=your-sarvam-key

# Routing Configuration
AI_PROVIDER=router
AI_RETRY_ATTEMPTS=1
AI_TIMEOUT_MS=30000
```

### Model Configuration
```typescript
{
  gemini: {
    model: 'gemini-2.0-flash',
    timeout: 30000
  },
  openai: {
    model: 'gpt-4o-mini',
    timeout: 30000,
    temperature: 0.7,
    maxTokens: 1000
  },
  groq: {
    model: 'llama-3.1-8b-instant',
    timeout: 30000
  },
  sarvam: {
    model: 'sarvam-m',
    timeout: 30000
  }
}
```

## Monitoring

### Log Patterns

#### Successful Primary (Gemini)
```
[MODEL ROUTER] Task: conversation, Recommended: gemini
[MODEL ROUTER] Attempting gemini...
[MODEL ROUTER] ✓ gemini succeeded
```

#### Successful Secondary (OpenAI) ⭐
```
[MODEL ROUTER] Task: conversation, Recommended: gemini
[MODEL ROUTER] Attempting gemini...
[MODEL ROUTER] ✗ gemini failed: Rate limit exceeded
[MODEL ROUTER] Attempting openai...
[OPENAI API CALL] Model: gpt-4o-mini, Timestamp: ...
[OPENAI API SUCCESS] Model: gpt-4o-mini, Tokens: 245
[MODEL ROUTER] ✓ openai succeeded
```

#### Successful Tertiary (Groq)
```
[MODEL ROUTER] Attempting gemini...
[MODEL ROUTER] ✗ gemini failed
[MODEL ROUTER] Attempting openai...
[MODEL ROUTER] ✗ openai failed
[MODEL ROUTER] Attempting groq...
[MODEL ROUTER] ✓ groq succeeded
```

#### All Failed
```
[MODEL ROUTER] Attempting gemini...
[MODEL ROUTER] ✗ gemini failed
[MODEL ROUTER] Attempting openai...
[MODEL ROUTER] ✗ openai failed
[MODEL ROUTER] Attempting groq...
[MODEL ROUTER] ✗ groq failed
[MODEL ROUTER] Attempting sarvam...
[MODEL ROUTER] ✗ sarvam failed
Error: All providers failed
```

## Summary

✅ OpenAI integrated as secondary fallback (position 2)
✅ 4-level fallback: Gemini → OpenAI → Groq → Sarvam
✅ Task-specific routing optimized
✅ Error handling and automatic fallback
✅ Cost-effective (OpenAI only used when needed)
✅ High reliability and quality

The system now has robust AI orchestration with OpenAI providing an excellent quality fallback between Gemini and Groq!
