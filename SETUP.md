# Sahayak AI - Setup and Run Guide

## Quick Start (MVP Demo)

This guide will help you run the Sahayak AI MVP locally for demonstration purposes.

### Prerequisites

- Node.js >= 20.0.0
- npm >= 10.0.0
- Git

### Step 1: Install Dependencies

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### Step 2: Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

**For MVP Demo (Minimal Configuration):**

Edit `.env` and set:

```env
# Use Gemini as it's easier to set up (no AWS required for MVP)
AI_PROVIDER=gemini
GEMINI_API_KEY=your_gemini_api_key_here

# Local development
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3001
```

**To get a Gemini API key:**
1. Go to https://makersuite.google.com/app/apikey
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated key (starts with `AIzaSy...`)
5. Paste it into the `.env` file

**⚠️ IMPORTANT:** The API key must be a real key from Google. The dummy key in `.env.example` will NOT work.

**Verify your configuration:**
```bash
node check-setup.js
```

This will check if your API key is properly configured. You should see:
```
✅ All checks passed!
```

If you see errors, follow the instructions to fix them before proceeding.

### Step 3: Run the Application

Open two terminal windows:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

The backend API will start on `http://localhost:3001`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

The frontend will start on `http://localhost:3000`

### Step 4: Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

## Using the Application

### 1. Language Selection
- Choose English or Hindi
- Your preference is saved for the session

### 2. Home Dashboard
- **Ask Assistant**: Chat with AI to find schemes
- **Browse Schemes**: View all available schemes
- **Find Service Centers**: Locate nearby centers (coming soon)
- **My Applications**: Track applications (coming soon)

### 3. Chat with AI
- Type your questions about government schemes
- Example questions:
  - "I am a farmer from Maharashtra. What schemes are available for me?"
  - "मैं एक छात्र हूं। मेरे लिए कौन सी योजनाएं हैं?"
- The AI will ask follow-up questions to understand your eligibility
- Once enough information is collected, you can check eligibility

### 4. Check Eligibility
- After providing your details in chat, the system can check which schemes you're eligible for
- Schemes are ranked by relevance to your profile

## Features Implemented (MVP)

✅ **Core Features:**
- Language selection (English/Hindi)
- AI-powered chat interface
- Conversation orchestrator with context management
- User profile extraction from conversation
- Eligibility engine with rule-based matching
- Ranking engine with multi-factor scoring
- Sample scheme data (5 schemes)
- Responsive UI with Tailwind CSS

✅ **AI Provider:**
- Amazon Bedrock support (Nova Lite / Claude 3 Haiku)
- Google Gemini support (fallback)
- Automatic retry with exponential backoff
- Provider switching via configuration

✅ **Backend:**
- Express server for local development
- RESTful API endpoints
- TypeScript with Zod validation
- Error handling and logging

✅ **Frontend:**
- Next.js 14 with App Router
- Tailwind CSS styling
- Real-time chat interface
- Language switching
- Responsive design

## API Endpoints

### POST /api/chat
Send a message to the AI assistant

**Request:**
```json
{
  "sessionId": "optional-uuid",
  "message": "I am a farmer",
  "language": "en"
}
```

**Response:**
```json
{
  "sessionId": "uuid",
  "response": "Great! As a farmer, there are several schemes...",
  "userProfile": {
    "occupation": "farmer",
    "completeness": 20
  },
  "suggestedActions": [],
  "timestamp": 1234567890
}
```

### POST /api/check-eligibility
Check eligibility for schemes

**Request:**
```json
{
  "userProfile": {
    "age": 35,
    "gender": "male",
    "occupation": "farmer",
    "state": "Maharashtra",
    "income": 150000
  },
  "language": "en"
}
```

**Response:**
```json
{
  "eligibleSchemes": [
    {
      "scheme": { ... },
      "relevanceScore": 85,
      "rankingFactors": [ ... ]
    }
  ],
  "totalSchemes": 3,
  "evaluationTime": 45
}
```

### GET /api/schemes
Get all schemes

**Response:**
```json
{
  "schemes": [ ... ],
  "total": 5,
  "page": 1,
  "limit": 20,
  "hasMore": false
}
```

## Troubleshooting

### Quick Diagnostics

Run the setup validation script:
```bash
node check-setup.js
```

This will check:
- ✅ .env file exists
- ✅ Gemini API key is configured correctly
- ✅ API URLs are set properly

### Common Issues

#### Chat not working / "Cannot read properties of undefined" error

**Cause:** Invalid or missing Gemini API key

**Solution:**
1. Open `.env` file
2. Replace `GEMINI_API_KEY=AIzaSyDummyKeyPleaseReplaceWithYourActualKey` with your actual key
3. Get a real key from https://makersuite.google.com/app/apikey
4. Restart the backend server
5. Run `node check-setup.js` to verify

**Test the fix:**
```bash
node test-chat.js
```

For more detailed troubleshooting, see [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

### Backend won't start
- Check if port 3001 is available
- Verify Node.js version: `node --version` (should be >= 20)
- Check if all dependencies are installed: `cd backend && npm install`

### Frontend won't start
- Check if port 3000 is available
- Verify dependencies: `cd frontend && npm install`
- Clear Next.js cache: `rm -rf frontend/.next`

### AI responses not working
- Verify your Gemini API key is correct in `.env`
- Check backend console for error messages
- Ensure backend is running on port 3001

### Chat not connecting to backend
- Verify `NEXT_PUBLIC_API_URL=http://localhost:3001` in `.env`
- Check browser console for CORS errors
- Ensure both frontend and backend are running

## Next Steps for Full Implementation

The MVP demonstrates core functionality. For a complete system, implement:

1. **Voice Integration**
   - Web Speech API for browser-based voice
   - Amazon Transcribe/Polly for cloud-based voice

2. **Database Integration**
   - DynamoDB for session persistence
   - RDS PostgreSQL for scheme data
   - Redis for caching

3. **Additional Features**
   - Service center locator with maps
   - Application tracking
   - Document upload
   - Multi-step application workflows

4. **AWS Deployment**
   - Lambda functions for backend
   - API Gateway
   - Amplify or S3+CloudFront for frontend
   - Infrastructure as Code (CDK/Terraform)

5. **Testing**
   - Unit tests
   - Property-based tests (23 properties defined)
   - Integration tests
   - E2E tests

## Project Structure

```
sahayak-ai/
├── backend/
│   ├── src/
│   │   ├── ai/              # AI provider implementations
│   │   ├── core/            # Business logic (eligibility, ranking, orchestrator)
│   │   ├── db/              # Database configurations
│   │   ├── handlers/        # Lambda/API handlers
│   │   ├── types/           # TypeScript types and schemas
│   │   └── local.ts         # Local development server
│   └── package.json
├── frontend/
│   ├── src/
│   │   └── app/
│   │       ├── page.tsx           # Language selection
│   │       ├── home/page.tsx      # Home dashboard
│   │       ├── chat/page.tsx      # Chat interface
│   │       └── schemes/page.tsx   # Browse schemes
│   └── package.json
├── data/
│   └── schemes/
│       └── schemes.csv      # Sample scheme data
├── .env.example             # Environment template
└── README.md               # Project documentation
```

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the console logs (backend and frontend)
3. Verify all environment variables are set correctly
4. Ensure all dependencies are installed

## License

MIT License - See LICENSE file for details
