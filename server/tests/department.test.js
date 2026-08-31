const request = require('supertest');
const app = require('../src/app');
const db = require('./dbHandler');

beforeAll(() => db.connect());
afterEach(() => db.clearDatabase());
afterAll(() => db.closeDatabase());

describe('Department CRUD', () => {
  it('creates a department', async () => {
    const res = await request(app)
      .post('/api/departments')
      .send({ name: 'Sound', email: 'sound@postflow.dev' });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Sound');
    expect(res.body._id).toBeDefined();
  });

  it('rejects a missing required field', async () => {
    const res = await request(app).post('/api/departments').send({ name: 'NoEmail' });
    expect(res.status).toBe(400);
  });

  it('rejects a duplicate name', async () => {
    await request(app).post('/api/departments').send({ name: 'Sound', email: 'a@postflow.dev' });
    const res = await request(app).post('/api/departments').send({ name: 'Sound', email: 'b@postflow.dev' });
    expect(res.status).toBe(409);
  });

  it('lists departments', async () => {
    await request(app).post('/api/departments').send({ name: 'Sound', email: 'sound@postflow.dev' });
    const res = await request(app).get('/api/departments');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });

  it('gets a department by id', async () => {
    const created = await request(app)
      .post('/api/departments')
      .send({ name: 'Sound', email: 'sound@postflow.dev' });
    const res = await request(app).get(`/api/departments/${created.body._id}`);
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Sound');
  });

  it('returns 404 for a nonexistent id', async () => {
    const res = await request(app).get('/api/departments/000000000000000000000000');
    expect(res.status).toBe(404);
  });

  it('returns 400 for a malformed id', async () => {
    const res = await request(app).get('/api/departments/not-a-valid-id');
    expect(res.status).toBe(400);
  });

  it('returns 404 updating a nonexistent department', async () => {
    const res = await request(app)
      .put('/api/departments/000000000000000000000000')
      .send({ email: 'new@postflow.dev' });
    expect(res.status).toBe(404);
  });

  it('updates a department', async () => {
    const created = await request(app)
      .post('/api/departments')
      .send({ name: 'Sound', email: 'sound@postflow.dev' });
    const res = await request(app)
      .put(`/api/departments/${created.body._id}`)
      .send({ email: 'new@postflow.dev' });
    expect(res.status).toBe(200);
    expect(res.body.email).toBe('new@postflow.dev');
  });

  it('deletes a department', async () => {
    const created = await request(app)
      .post('/api/departments')
      .send({ name: 'Sound', email: 'sound@postflow.dev' });
    const res = await request(app).delete(`/api/departments/${created.body._id}`);
    expect(res.status).toBe(204);

    const after = await request(app).get(`/api/departments/${created.body._id}`);
    expect(after.status).toBe(404);
  });

  it('returns 404 deleting a nonexistent department', async () => {
    const res = await request(app).delete('/api/departments/000000000000000000000000');
    expect(res.status).toBe(404);
  });
});
