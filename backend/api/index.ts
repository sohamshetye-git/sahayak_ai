import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import path from 'path';
import { handler as chatHandler } from '../src/handlers/chat';
import { handler as eligibilityHandler } from '../src/handlers/eligibility';
import { handler as schemesHandler } from '../src/handlers/schemes';
import { handler as serviceCentersHandler } from '../src/handlers/service-centers';
import { handler as applicationsHandler } from '../src/handlers/applications';

// Load environment variables
config({ path: path.resolve(__dirname, '../../.env') });

const app = express();

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

  const result = await chatHandler(event);
  res.status(result.statusCode).json(JSON.parse(result.body));
});

// Eligibility check endpoint
app.post('/api/check-eligibility', async (req, res) => {
  const event = {
    body: JSON.stringify(req.body),
    headers: req.headers,
  } as any;

  const result = await eligibilityHandler(event);
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

  const result = await schemesHandler(event);
  res.status(result.statusCode).json(JSON.parse(result.body));
});

app.get('/api/schemes/:schemeId', async (req, res) => {
  const event = {
    pathParameters: { schemeId: req.params.schemeId },
    queryStringParameters: req.query,
    headers: req.headers,
  } as any;

  const result = await schemesHandler(event);
  res.status(result.statusCode).json(JSON.parse(result.body));
});

app.get('/api/schemes', async (req, res) => {
  const event = {
    queryStringParameters: req.query,
    headers: req.headers,
  } as any;

  const result = await schemesHandler(event);
  res.status(result.statusCode).json(JSON.parse(result.body));
});

// Service centers endpoint
app.get('/api/service-centers', async (req, res) => {
  const event = {
    queryStringParameters: req.query,
    headers: req.headers,
  } as any;

  const result = await serviceCentersHandler(event);
  res.status(result.statusCode).json(JSON.parse(result.body));
});

// Applications endpoints
app.get('/api/applications/:applicationId', async (req, res) => {
  const event = {
    httpMethod: 'GET',
    pathParameters: { applicationId: req.params.applicationId },
    headers: req.headers,
  } as any;

  const result = await applicationsHandler(event);
  res.status(result.statusCode).json(JSON.parse(result.body));
});

app.get('/api/applications', async (req, res) => {
  const event = {
    httpMethod: 'GET',
    queryStringParameters: req.query,
    headers: req.headers,
  } as any;

  const result = await applicationsHandler(event);
  res.status(result.statusCode).json(JSON.parse(result.body));
});

app.post('/api/applications', async (req, res) => {
  const event = {
    httpMethod: 'POST',
    body: JSON.stringify(req.body),
    headers: req.headers,
  } as any;

  const result = await applicationsHandler(event);
  res.status(result.statusCode).json(JSON.parse(result.body));
});

app.put('/api/applications/:applicationId', async (req, res) => {
  const event = {
    httpMethod: 'PUT',
    pathParameters: { applicationId: req.params.applicationId },
    body: JSON.stringify(req.body),
    headers: req.headers,
  } as any;

  const result = await applicationsHandler(event);
  res.status(result.statusCode).json(JSON.parse(result.body));
});

export default app;
