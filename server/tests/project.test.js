const request = require('supertest');
const app = require('../src/app');
const db = require('./dbHandler');

beforeAll(() => db.connect());
afterEach(() => db.clearDatabase());
afterAll(() => db.closeDatabase());

describe('Project CRUD', () => {
  it('creates a project and defaults status to planning', async () => {
    const res = await request(app)
      .post('/api/projects')
      .send({ title: 'Odesa Spot', deadline: '2026-12-01' });
    expect(res.status).toBe(201);
    expect(res.body.title).toBe('Odesa Spot');
    expect(res.body.status).toBe('planning');
  });

  it('rejects a missing required deadline', async () => {
    const res = await request(app).post('/api/projects').send({ title: 'No Deadline' });
    expect(res.status).toBe(400);
  });

  it('lists projects', async () => {
    await request(app).post('/api/projects').send({ title: 'Odesa Spot', deadline: '2026-12-01' });
    const res = await request(app).get('/api/projects');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });

  it('gets a project by id', async () => {
    const created = await request(app)
      .post('/api/projects')
      .send({ title: 'Odesa Spot', deadline: '2026-12-01' });
    const res = await request(app).get(`/api/projects/${created.body._id}`);
    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Odesa Spot');
  });

  it('returns 404 for a nonexistent id', async () => {
    const res = await request(app).get('/api/projects/000000000000000000000000');
    expect(res.status).toBe(404);
  });

  it('returns 404 updating a nonexistent project', async () => {
    const res = await request(app)
      .put('/api/projects/000000000000000000000000')
      .send({ status: 'in_progress' });
    expect(res.status).toBe(404);
  });

  it('updates a project status', async () => {
    const created = await request(app)
      .post('/api/projects')
      .send({ title: 'Odesa Spot', deadline: '2026-12-01' });
    const res = await request(app)
      .put(`/api/projects/${created.body._id}`)
      .send({ status: 'in_progress' });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('in_progress');
  });

  it('deletes a project', async () => {
    const created = await request(app)
      .post('/api/projects')
      .send({ title: 'Odesa Spot', deadline: '2026-12-01' });
    const res = await request(app).delete(`/api/projects/${created.body._id}`);
    expect(res.status).toBe(204);

    const after = await request(app).get(`/api/projects/${created.body._id}`);
    expect(after.status).toBe(404);
  });

  it('returns 404 deleting a nonexistent project', async () => {
    const res = await request(app).delete('/api/projects/000000000000000000000000');
    expect(res.status).toBe(404);
  });

  it('cascades: deleting a project also deletes its stages and their tasks', async () => {
    const department = await request(app)
      .post('/api/departments')
      .send({ name: 'Editing', email: 'editing@postflow.dev' });
    const project = await request(app)
      .post('/api/projects')
      .send({ title: 'Odesa Spot', deadline: '2026-12-01' });
    const stage = await request(app)
      .post(`/api/projects/${project.body._id}/stages`)
      .send({ name: 'Editing', order: 0, plannedEnd: '2026-09-01' });
    const task = await request(app)
      .post(`/api/stages/${stage.body._id}/tasks`)
      .send({ title: 'Rough cut', departmentId: department.body._id, dueDate: '2026-08-20' });

    const res = await request(app).delete(`/api/projects/${project.body._id}`);
    expect(res.status).toBe(204);

    const stageAfter = await request(app).get(`/api/stages/${stage.body._id}`);
    expect(stageAfter.status).toBe(404);
    const taskAfter = await request(app).get(`/api/tasks/${task.body._id}`);
    expect(taskAfter.status).toBe(404);
  });
});
