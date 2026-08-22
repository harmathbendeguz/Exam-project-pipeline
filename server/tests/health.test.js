// No dbHandler here on purpose: app.js never opens a DB connection itself
// (only server.js does), so the health check is testable with zero setup.
const request = require('supertest');
const app = require('../src/app');

describe('GET /api/health', () => {
  it('returns { status: "ok" }', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});
