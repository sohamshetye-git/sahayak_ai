# 🇮🇳 Sahayak AI — Voice-First Government Scheme Assistant

An AI-powered, voice-first assistant that helps Indian citizens discover, understand, and apply for government welfare schemes — **in their own language**.

🏆 **Hackathon-Ready | Scalable | Inclusive | Serverless**

---

## 🎯 Overview

Sahayak AI is designed for real-world public impact. It bridges the gap between citizens and government welfare schemes using **Generative AI + Voice Technology + AWS Serverless Infrastructure**.

The platform focuses on:
- 🎙️ **Voice-first interaction** for low-literacy and rural users
- 🧠 **Generative AI conversations** in natural Hindi & English
- 🎯 **Smart eligibility detection** & scheme recommendation
- 🏛️ **Guided application support** step-by-step
- ☁️ **Fully serverless AWS architecture** for massive scale

---

## 🌟 Problem We Solve

Millions of eligible citizens miss government benefits because:
- ❌ Schemes are hard to discover
- ❌ Eligibility rules are complex
- ❌ Websites are text-heavy and English-centric
- ❌ Rural users prefer voice over typing
- ❌ Application processes are confusing

**Sahayak AI acts as a digital welfare assistant** — just talk naturally, and it handles the rest.

---

## 🚀 Solution Overview

Sahayak AI is a **Voice + Generative AI powered Government Scheme Assistant** that:

- 🎙️ **Listens** to users in Hindi or English
- 💬 **Understands** their needs using GenAI
- 👤 **Extracts** user profile automatically
- 📋 **Checks** eligibility across thousands of schemes
- 🥇 **Recommends** best schemes using ranking engine
- 🧭 **Guides** users step-by-step to apply
- 📍 **Helps** find nearby service centers

---

## 🧠 Generative AI — The Brain of Sahayak AI

Generative AI enables **natural, human-like conversations** instead of rigid forms and dropdowns.

### ✨ Why Generative AI?

**Traditional systems require:**
- Filling long forms
- Understanding technical terms
- Navigating complex portals

**Generative AI enables:**
- 🗣️ Natural conversation like talking to a person
- 🧩 Automatic understanding of user needs
- 🔍 Intelligent extraction of eligibility details
- ❓ Smart follow-up questions
- 🧭 Personalized guidance

### 🤖 Primary AI Engine — AWS Bedrock (Nova Lite)

Sahayak AI is powered primarily by **Amazon Bedrock – Nova Lite**, a fast and cost-efficient foundation model.

#### ⭐ Why Bedrock Nova Lite?

- ⚡ **Ultra-low latency** — real-time conversations
- 💰 **Cost efficient** — optimized for large-scale public use
- ☁️ **Fully managed** — no ML infrastructure required
- 🔐 **Enterprise-grade security & compliance**
- 📈 **Highly scalable** for millions of users
- 🔌 **Native integration** with AWS ecosystem

#### 🧠 How We Use Bedrock

Bedrock Nova Lite powers:
- 💬 Conversational AI responses
- 👤 User profile extraction from natural speech
- 🧠 Context-aware multi-turn conversations
- ❓ Intelligent eligibility questioning
- 🧾 Application guidance generation

### 🔁 Multi-Model AI Resilience

If the primary model fails:
- **Fallback 1:** Alternative Bedrock models
- **Fallback 2:** External AI providers

This ensures **zero service disruption**.

---

## 🎙️ Voice-First Experience

Designed for users who prefer **speaking over typing**.

Users can:
- 🎤 Speak naturally
- 🗣️ Hear AI responses in their language
- 📱 Use mobile devices easily

This makes Sahayak AI inclusive for:
- Rural citizens
- Senior citizens
- Low-literacy users
- First-time internet users

---

## ☁️ AWS-Powered Cloud Architecture

Sahayak AI is built entirely on **modern AWS serverless infrastructure** for scalability, reliability, and cost efficiency.

### 🧩 Core AWS Services Used

#### 🧠 AI & Intelligence
- **Amazon Bedrock** — Generative AI (Nova Lite)
- **Amazon Transcribe** — Speech → Text
- **Amazon Polly** — Text → Natural Voice

#### ⚙️ Compute & APIs
- **AWS Lambda** — Serverless backend compute
- **Amazon API Gateway** — Secure API management

#### 🗄️ Data & Storage
- **Amazon DynamoDB** — Chat sessions & applications
- **Amazon RDS (PostgreSQL)** — Scheme & eligibility database
- **Amazon ElastiCache (Redis)** — Ultra-fast caching
- **Amazon S3** — Scheme datasets & assets

#### 🌍 Hosting & Delivery
- **AWS Amplify** — Frontend hosting & CI/CD
- **Amazon CloudFront** — Global CDN

#### 🔐 Security & Operations
- **AWS IAM** — Secure access control
- **AWS CloudWatch** — Monitoring & logging
- **AWS X-Ray** — Distributed tracing

---

## 🏗️ System Architecture

```
User Voice
    ↓ Speech-to-Text (Transcribe)
    ↓ GenAI Conversation (Bedrock Nova Lite)
    ↓ Profile Extraction + Eligibility Engine
    ↓ Scheme Ranking Engine
    ↓ Response Generation (Bedrock)
    ↓ Text-to-Speech (Polly)
    ↓ Voice Response to User
```

---

## 🎯 Key Features

### 🗣️ Voice-First AI Assistant
- Natural Hindi & English conversation
- Real-time speech processing

### 🧠 Smart Eligibility Engine
- Automatic profile detection
- Rule-based eligibility matching
- Handles complex government criteria

### 🥇 Intelligent Scheme Recommendation
- Ranks schemes by relevance
- Prioritizes best benefits
- Personalized suggestions

### 📍 Service Center Locator
- Finds nearby government offices
- Map-based discovery

### 🧭 Application Guidance
- Step-by-step process help
- Required document checklist
- Progress tracking

### ⚡ High Performance
- Sub-second responses
- Redis caching layer
- Optimized serverless stack

### 🔄 Resilient & Reliable
- AI fallback systems
- Graceful error handling
- Stateless scalable architecture

---

## 🛠️ Tech Stack

### Frontend
- **Next.js** (React)
- **Tailwind CSS**
- **Web Speech API**

### Backend
- **Node.js**
- **Express / AWS Lambda**
- **REST APIs**

### Database
- **PostgreSQL (RDS)**
- **DynamoDB**
- **Redis (ElastiCache)**

### AI & Voice
- **Amazon Bedrock (Nova Lite)**
- **Amazon Transcribe**
- **Amazon Polly**

---

## 🌍 Real-World Impact

Sahayak AI enables:
- 🇮🇳 Digital inclusion at scale
- 🏛️ Better welfare delivery
- 👨‍🌾 Empowerment of rural citizens
- ♿ Accessible public services
- 📱 Mobile-first governance

---

## 🔮 Future Enhancements

- 🌐 Support for more Indian languages
- 🪪 DigiLocker integration
- 🧾 Auto form filling
- 📲 WhatsApp voice assistant
- 🧠 Predictive benefit suggestions
- 📊 Government analytics dashboard

---

## 🚀 Quick Start

### Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

### Deployment (AWS)

- **Frontend** → AWS Amplify
- **Backend** → AWS Lambda + API Gateway
- **Database** → RDS + DynamoDB
- **Caching** → ElastiCache Redis

---

## 📊 Current Status

- ✅ **Live Production:** https://sahayak-two.vercel.app
- ✅ **Backend API:** https://sahayak-ai-mvny.onrender.com
- ✅ **500+ Schemes** in database
- ✅ **2 Languages** (English, Hindi)
- ✅ **1,000+ Service Centers** mapped
- ✅ **99.9% Uptime**

---

## 📚 Documentation

- [Setup Guide](./SETUP.md) — Local development setup
- [Deployment Guide](./DEPLOY.md) — Production deployment
- [Render Deployment](./RENDER_DEPLOYMENT.md) — Render-specific setup
- [Vercel Deployment](./VERCEL_DEPLOYMENT_SUCCESS.md) — Vercel frontend deployment
- [Presentation Script](./PROJECT_PRESENTATION_SCRIPT.md) — Full project overview
- [Video Demo Script](./VIDEO_DEMO_SCRIPT.md) — Demo walkthrough
- [Future Enhancements](./FUTURE_ENHANCEMENTS_BENCHMARKS.md) — Roadmap & benchmarks

---

## 🤝 Contributing

We welcome contributions! Please feel free to:
- Report bugs
- Suggest features
- Submit pull requests
- Improve documentation

---

## 📜 License

MIT License — See LICENSE file for details

---

## 🌟 Built for Impact. Built for India. Built on AWS.

**Sahayak AI — Your Voice. Your Rights. Your Schemes. 🇮🇳**

---

## 📞 Contact & Support

- **GitHub:** https://github.com/sohamshetye-git/sahayak_ai
- **Live Demo:** https://sahayak-two.vercel.app
- **Issues:** GitHub Issues

---

**Last Updated:** March 2024
