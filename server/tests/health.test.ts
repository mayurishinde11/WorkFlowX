import request from 'supertest';
import express from 'express';

const app = express();
app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'WorkFlowX API is running' });
});

describe('Health Check', () => {
  it('should return success true', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});