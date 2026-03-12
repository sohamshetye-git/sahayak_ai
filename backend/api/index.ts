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
  res.status(404).json({ error: 'Not found' });
});

export default app;
