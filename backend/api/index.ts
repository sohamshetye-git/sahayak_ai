import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import path from 'path';

// Load environment variables first
config({ path: path.resolve(__dirname, '../../.env') });
config({ path: path.resolve(__dirname, '../../.env.production') });

import { handler as chatHandler } from '../src/handlers/chat';
import { handler as eligibilityHandler } from '../src/handlers/eligibility';
import { handler as schemesHandler } from '../src/handlers/schemes';
import { handler as serviceCentersHandler } from '../src/handlers/service-centers';
import { handler as applicationsHandler } from '../src/handlers/applications';

// Import initialization functions for warmup
import { getOrchestrator, getEligibilityEngine, getRankingEngine, loadSchemesData } from '../src/handlers/chat';

const app = express();

// Add request logging for debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

app.use(cors({
  origin: ['https://sahayak-two.vercel.app', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: Date.now(),
    env: process.env.NODE_ENV,
    version: '1.0.0'
  });
});

// Simple ping endpoint for keeping function warm
app.get('/ping', (req, res) => {
  res.json({ 
    status: 'pong', 
    timestamp: Date.now(),
    uptime: process.uptime()
  });
});

// Warm-up endpoint (initializes backend components)
app.get('/warmup', async (req, res) => {
  try {
    console.log('[WARMUP] Backend warming initiated');
    
    // Initialize all components
    const startTime = Date.now();
    
    // These will trigger lazy initialization
    const orch = getOrchestrator();
    const eligEngine = getEligibilityEngine();
    const rankEngine = getRankingEngine();
    const schemes = loadSchemesData();
    
    const duration = Date.now() - startTime;
    
    res.json({ 
      status: 'warmed',
      duration: `${duration}ms`,
      components: {
        orchestrator: !!orch,
        eligibilityEngine: !!eligEngine,
        rankingEngine: !!rankEngine,
        schemes: schemes.length
      },
      timestamp: Date.now()
    });
  } catch (error: any) {
    console.error('[WARMUP] Error:', error);
    res.status(500).json({ 
      status: 'error',
      message: error.message,
      timestamp: Date.now()
    });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Sahayak AI Backend API',
    status: 'running',
    timestamp: Date.now(),
    env: {
      NODE_ENV: process.env.NODE_ENV,
      hasGeminiKey: !!process.env.GEMINI_API_KEY,
      hasOpenAIKey: !!process.env.OPENAI_API_KEY,
      hasGroqKey: !!process.env.GROQ_API_KEY,
      hasSarvamKey: !!process.env.SARVAM_API_KEY
    }
  });
});

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const event = {
      body: JSON.stringify(req.body),
      headers: req.headers,
    } as any;

    const result = await chatHandler(event);
    res.status(result.statusCode).json(JSON.parse(result.body));
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Eligibility check endpoint
app.post('/api/check-eligibility', async (req, res) => {
  try {
    const event = {
      body: JSON.stringify(req.body),
      headers: req.headers,
    } as any;

    const result = await eligibilityHandler(event);
    res.status(result.statusCode).json(JSON.parse(result.body));
  } catch (error) {
    console.error('Eligibility error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Schemes endpoints
app.get('/api/schemes/:schemeId/workflow', async (req, res) => {
  try {
    const event = {
      pathParameters: { schemeId: req.params.schemeId },
      queryStringParameters: req.query,
      path: `/api/schemes/${req.params.schemeId}/workflow`,
      headers: req.headers,
    } as any;

    const result = await schemesHandler(event);
    res.status(result.statusCode).json(JSON.parse(result.body));
  } catch (error) {
    console.error('Schemes workflow error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/schemes/:schemeId', async (req, res) => {
  try {
    const event = {
      pathParameters: { schemeId: req.params.schemeId },
      queryStringParameters: req.query,
      headers: req.headers,
    } as any;

    const result = await schemesHandler(event);
    res.status(result.statusCode).json(JSON.parse(result.body));
  } catch (error) {
    console.error('Schemes error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/schemes', async (req, res) => {
  try {
    const event = {
      queryStringParameters: req.query,
      headers: req.headers,
    } as any;

    const result = await schemesHandler(event);
    res.status(result.statusCode).json(JSON.parse(result.body));
  } catch (error) {
    console.error('Schemes list error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Service centers endpoint
app.get('/api/service-centers', async (req, res) => {
  try {
    const event = {
      queryStringParameters: req.query,
      headers: req.headers,
    } as any;

    const result = await serviceCentersHandler(event);
    res.status(result.statusCode).json(JSON.parse(result.body));
  } catch (error) {
    console.error('Service centers error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Applications endpoints
app.get('/api/applications/:applicationId', async (req, res) => {
  try {
    const event = {
      httpMethod: 'GET',
      pathParameters: { applicationId: req.params.applicationId },
      headers: req.headers,
    } as any;

    const result = await applicationsHandler(event);
    res.status(result.statusCode).json(JSON.parse(result.body));
  } catch (error) {
    console.error('Application get error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/applications', async (req, res) => {
  try {
    const event = {
      httpMethod: 'GET',
      queryStringParameters: req.query,
      headers: req.headers,
    } as any;

    const result = await applicationsHandler(event);
    res.status(result.statusCode).json(JSON.parse(result.body));
  } catch (error) {
    console.error('Applications list error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/applications', async (req, res) => {
  try {
    const event = {
      httpMethod: 'POST',
      body: JSON.stringify(req.body),
      headers: req.headers,
    } as any;

    const result = await applicationsHandler(event);
    res.status(result.statusCode).json(JSON.parse(result.body));
  } catch (error) {
    console.error('Application create error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/applications/:applicationId', async (req, res) => {
  try {
    const event = {
      httpMethod: 'PUT',
      pathParameters: { applicationId: req.params.applicationId },
      body: JSON.stringify(req.body),
      headers: req.headers,
    } as any;

    const result = await applicationsHandler(event);
    res.status(result.statusCode).json(JSON.parse(result.body));
  } catch (error) {
    console.error('Application update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Catch all 404
app.use((req, res) => {
  console.log(`404 - Route not found: ${req.method} ${req.path}`);
  res.status(404).json({ 
    error: 'Not found',
    path: req.path,
    method: req.method
  });
});

// Global error handler
app.use((error: any, req: any, res: any, next: any) => {
  console.error('Global error handler:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: error.message,
    timestamp: Date.now()
  });
});

export default app;
