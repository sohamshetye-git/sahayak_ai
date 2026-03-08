/**
 * Local Development Server
 * Simple Express server for local testing
 */

import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import path from 'path';
import { handler as chatHandler } from './handlers/chat';
import { handler as eligibilityHandler } from './handlers/eligibility';
import { handler as schemesHandler } from './handlers/schemes';
import { handler as serviceCentersHandler } from './handlers/service-centers';
import { handler as applicationsHandler } from './handlers/applications';

// Load .env from root directory
const envPath = path.resolve(__dirname, '../../.env');
console.log('Loading .env from:', envPath);
config({ path: envPath });
console.log('Environment loaded. AI_PROVIDER:', process.env.AI_PROVIDER);
console.log('GEMINI_API_KEY present:', !!process.env.GEMINI_API_KEY);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  const event = {
    body: JSON.stringify(req.body),
    headers: req.headers,
  } as any;

  const result = await chatHandler(event, {} as any, {} as any);
  res.status(result.statusCode).json(JSON.parse(result.body));
});

// Eligibility check endpoint
app.post('/api/check-eligibility', async (req, res) => {
  const event = {
    body: JSON.stringify(req.body),
    headers: req.headers,
  } as any;

  const result = await eligibilityHandler(event, {} as any, {} as any);
  res.status(result.statusCode).json(JSON.parse(result.body));
});

// Schemes endpoints
app.get('/api/schemes/:schemeId/workflow', async (req, res) => {
  const event = {
    pathParameters: { schemeId: req.params.schemeId },
    queryStringParameters: req.query,
    path: `/api/schemes/${req.params.schemeId}/workflow`,
    headers: req.headers,
  } as any;

  const result = await schemesHandler(event, {} as any, {} as any);
  res.status(result.statusCode).json(JSON.parse(result.body));
});

app.get('/api/schemes/:schemeId', async (req, res) => {
  const event = {
    pathParameters: { schemeId: req.params.schemeId },
    queryStringParameters: req.query,
    headers: req.headers,
  } as any;

  const result = await schemesHandler(event, {} as any, {} as any);
  res.status(result.statusCode).json(JSON.parse(result.body));
});

app.get('/api/schemes', async (req, res) => {
  const event = {
    queryStringParameters: req.query,
    headers: req.headers,
  } as any;

  const result = await schemesHandler(event, {} as any, {} as any);
  res.status(result.statusCode).json(JSON.parse(result.body));
});

// Service centers endpoint
app.get('/api/service-centers', async (req, res) => {
  const event = {
    queryStringParameters: req.query,
    headers: req.headers,
  } as any;

  const result = await serviceCentersHandler(event, {} as any, {} as any);
  res.status(result.statusCode).json(JSON.parse(result.body));
});

// Applications endpoints
app.get('/api/applications/:applicationId', async (req, res) => {
  const event = {
    httpMethod: 'GET',
    pathParameters: { applicationId: req.params.applicationId },
    headers: req.headers,
  } as any;

  const result = await applicationsHandler(event, {} as any, {} as any);
  res.status(result.statusCode).json(JSON.parse(result.body));
});

app.get('/api/applications', async (req, res) => {
  const event = {
    httpMethod: 'GET',
    queryStringParameters: req.query,
    headers: req.headers,
  } as any;

  const result = await applicationsHandler(event, {} as any, {} as any);
  res.status(result.statusCode).json(JSON.parse(result.body));
});

app.post('/api/applications', async (req, res) => {
  const event = {
    httpMethod: 'POST',
    body: JSON.stringify(req.body),
    headers: req.headers,
  } as any;

  const result = await applicationsHandler(event, {} as any, {} as any);
  res.status(result.statusCode).json(JSON.parse(result.body));
});

app.put('/api/applications/:applicationId', async (req, res) => {
  const event = {
    httpMethod: 'PUT',
    pathParameters: { applicationId: req.params.applicationId },
    body: JSON.stringify(req.body),
    headers: req.headers,
  } as any;

  const result = await applicationsHandler(event, {} as any, {} as any);
  res.status(result.statusCode).json(JSON.parse(result.body));
});

app.listen(PORT, () => {
  console.log(`✓ Local server running on http://localhost:${PORT}`);
  console.log(`✓ API endpoints:`);
  console.log(`  - POST http://localhost:${PORT}/api/chat`);
  console.log(`  - POST http://localhost:${PORT}/api/check-eligibility`);
  console.log(`  - GET  http://localhost:${PORT}/api/schemes`);
  console.log(`  - GET  http://localhost:${PORT}/api/schemes/:schemeId`);
  console.log(`  - GET  http://localhost:${PORT}/api/schemes/:schemeId/workflow`);
  console.log(`  - GET  http://localhost:${PORT}/api/service-centers`);
  console.log(`  - GET  http://localhost:${PORT}/api/applications`);
  console.log(`  - POST http://localhost:${PORT}/api/applications`);
  console.log(`  - PUT  http://localhost:${PORT}/api/applications/:applicationId`);
});
