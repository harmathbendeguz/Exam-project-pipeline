// Plain CRUD paths for Stage. Pipeline-rule behavior (sequential unlock,
// completion gating) is covered separately in stageRules.test.js — this
// file is deliberately just "does the CRUD layer work."
const request = require('supertest');
const app = require('../src/app');
const db = require('./dbHandler');

beforeAll(() => db.connect());
afterEach(() => db.clearDatabase());
afterAll(() => db.closeDatabase());

async function createProject() {
  const res = await request(app)
    .post('/api/projects')
    .send({ title: 'Odesa Spot', deadline: '2026-12-01' });
  return res.body;
}

describe('Stage CRUD', () => {
  it('lists stages for a project, ordered', async () => {
    const project = await createProject();
    await request(app)
      .post(`/api/projects/${project._id}/stages`)
      .send({ name: 'Color Grading', order: 1, plannedEnd: '2026-09-10' });
    await request(app)
      .post(`/api/projects/${project._id}/stages`)
      .send({ name: 'Editing', order: 0, plannedEnd: '2026-09-01' });

    const res = await request(app).get(`/api/projects/${project._id}/stages`);
    expect(res.status).toBe(200);
    expect(res.body.map((s) => s.name)).toEqual(['Editing', 'Color Grading']);
  });

  it('returns 404 listing stages for a nonexistent project', async () => {
    const res = await request(app).get('/api/projects/000000000000000000000000/stages');
    expect(res.status).toBe(404);
  });

  it('returns 404 creating a stage under a nonexistent project', async () => {
    const res = await request(app)
      .post('/api/projects/000000000000000000000000/stages')
      .send({ name: 'Editing', order: 0, plannedEnd: '2026-09-01' });
    expect(res.status).toBe(404);
  });

  it('returns 404 updating a nonexistent stage', async () => {
    const res = await request(app)
      .put('/api/stages/000000000000000000000000')
      .send({ name: 'Renamed' });
    expect(res.status).toBe(404);
  });

  it('gets a stage by id', async () => {
    const project = await createProject();
    const stage = await request(app)
      .post(`/api/projects/${project._id}/stages`)
      .send({ name: 'Editing', order: 0, plannedEnd: '2026-09-01' });

    const res = await request(app).get(`/api/stages/${stage.body._id}`);
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Editing');
  });

  it('returns 404 getting a nonexistent stage', async () => {
    const res = await request(app).get('/api/stages/000000000000000000000000');
    expect(res.status).toBe(404);
  });

  it('updates a stage field unrelated to status', async () => {
    const project = await createProject();
    const stage = await request(app)
      .post(`/api/projects/${project._id}/stages`)
      .send({ name: 'Editing', order: 0, plannedEnd: '2026-09-01' });

    const res = await request(app)
      .put(`/api/stages/${stage.body._id}`)
      .send({ plannedEnd: '2026-10-01' });
    expect(res.status).toBe(200);
    expect(new Date(res.body.plannedEnd).toISOString()).toBe(new Date('2026-10-01').toISOString());
  });

  it('deletes a stage', async () => {
    const project = await createProject();
    const stage = await request(app)
      .post(`/api/projects/${project._id}/stages`)
      .send({ name: 'Editing', order: 0, plannedEnd: '2026-09-01' });

    const res = await request(app).delete(`/api/stages/${stage.body._id}`);
    expect(res.status).toBe(204);

    const after = await request(app).get(`/api/stages/${stage.body._id}`);
    expect(after.status).toBe(404);
  });

  it('returns 404 deleting a nonexistent stage', async () => {
    const res = await request(app).delete('/api/stages/000000000000000000000000');
    expect(res.status).toBe(404);
  });

  it('cascades: deleting a stage also deletes its tasks', async () => {
    const project = await createProject();
    const department = await request(app)
      .post('/api/departments')
      .send({ name: 'Editing', email: 'editing@postflow.dev' });
    const stage = await request(app)
      .post(`/api/projects/${project._id}/stages`)
      .send({ name: 'Editing', order: 0, plannedEnd: '2026-09-01' });
    const task = await request(app)
      .post(`/api/stages/${stage.body._id}/tasks`)
      .send({ title: 'Rough cut', departmentId: department.body._id, dueDate: '2026-08-20' });

    await request(app).delete(`/api/stages/${stage.body._id}`);

    const taskAfter = await request(app).get(`/api/tasks/${task.body._id}`);
    expect(taskAfter.status).toBe(404);
  });
});
