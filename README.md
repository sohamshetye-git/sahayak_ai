# Sahayak AI - Government Scheme Assistant

AI-powered voice-first platform to help Indian citizens discover and apply for government welfare schemes.

## 🎯 Project Overview

Sahayak AI is an intelligent assistant that helps users:
- Discover relevant government schemes based on their profile
- Get personalized recommendations using AI
- Apply for schemes with guided workflows
- Find nearby service centers
- Interact in Hindi and English

## 🚀 Live Demo

**Frontend**: Deployed on Vercel - [Visit Demo](https://sahayak-ai.vercel.app)

> Note: This is an MVP prototype. Backend features (chat, recommendations) require local backend setup.

## 🏗️ Tech Stack

### Frontend
- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **API Client**: Axios

### Backend
- **Runtime**: Node.js
- **Framework**: Express
- **AI Providers**: Sarvam AI, Google Gemini, Groq, OpenAI
- **Database**: PostgreSQL (local), DynamoDB (AWS)
- **Cache**: Redis

## 📁 Project Structure

```
sahayak_ai/
├── frontend/          # Next.js frontend application
│   ├── src/
│   │   ├── app/      # Next.js app router pages
│   │   ├── lib/      # Utilities, hooks, services
│   │   └── ...
│   └── public/       # Static assets
│
├── backend/          # Node.js backend API
│   ├── src/
│   │   ├── handlers/ # API route handlers
│   │   ├── core/     # Business logic
│   │   ├── ai/       # AI provider integrations
│   │   └── ...
│   └── ...
│
└── data/            # Scheme data and SQL files
```

## 🛠️ Local Development

### Prerequisites
- Node.js 18+
- npm or yarn
- Git

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on: http://localhost:3000

### Backend Setup
```bash
cd backend
npm install
npm run dev
```
Backend runs on: http://localhost:3001

## 🌐 Deployment

### Frontend (Vercel)
1. Push code to GitHub
2. Import repository in Vercel
3. Set root directory to `frontend`
4. Add environment variable: `NEXT_PUBLIC_API_URL=http://localhost:3001`
5. Deploy

### Backend
Backend deployment guide coming soon (AWS Lambda/Elastic Beanstalk).

## 🔑 Environment Variables

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Backend (.env)
```env
PORT=3001
AI_PROVIDER=sarvam
GEMINI_API_KEY=your_key_here
SARVAM_API_KEY=your_key_here
```

## 📱 Features

### Implemented
- ✅ Multi-language support (Hindi, English)
- ✅ Voice-ready interface
- ✅ Scheme browsing and search
- ✅ Eligibility checking
- ✅ Application tracking
- ✅ Service center locator
- ✅ AI-powered chat (requires backend)
- ✅ Personalized recommendations (requires backend)

### Coming Soon
- 🔄 Voice input/output
- 🔄 Document upload
- 🔄 Application status tracking
- 🔄 SMS/Email notifications

## 🤝 Contributing

This is an MVP prototype for submission. Contributions and feedback are welcome!

## 📄 License

MIT License

## 👥 Team

Developed by Soham Shetye

## 📞 Contact

GitHub: [@sohamshetye-git](https://github.com/sohamshetye-git)

---

**Note**: This is a prototype submission. Backend API features require local setup.
