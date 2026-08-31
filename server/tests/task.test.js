const request = require('supertest');
const app = require('../src/app');
const db = require('./dbHandler');

beforeAll(() => db.connect());
afterEach(() => db.clearDatabase());
afterAll(() => db.closeDatabase());

async function createStage() {
  const project = await request(app)
    .post('/api/projects')
    .send({ title: 'Odesa Spot', deadline: '2026-12-01' });
  const stage = await request(app)
    .post(`/api/projects/${project.body._id}/stages`)
    .send({ name: 'Editing', order: 0, plannedEnd: '2026-09-01' });
  const department = await request(app)
    .post('/api/departments')
    .send({ name: 'Editing', email: 'editing@postflow.dev' });
  return { stage: stage.body, department: department.body };
}

describe('Task CRUD', () => {
  it('creates a task under a stage, defaulting to todo', async () => {
    const { stage, department } = await createStage();
    const res = await request(app)
      .post(`/api/stages/${stage._id}/tasks`)
      .send({ title: 'Rough cut', departmentId: department._id, dueDate: '2026-08-20' });
    expect(res.status).toBe(201);
    expect(res.body.status).toBe('todo');
    expect(res.body.stageId).toBe(stage._id);
  });

  it('returns 404 creating a task under a nonexistent stage', async () => {
    const { department } = await createStage();
    const res = await request(app)
      .post('/api/stages/000000000000000000000000/tasks')
      .send({ title: 'Rough cut', departmentId: department._id, dueDate: '2026-08-20' });
    expect(res.status).toBe(404);
  });

  it('rejects a task missing a required field', async () => {
    const { stage } = await createStage();
    const res = await request(app)
      .post(`/api/stages/${stage._id}/tasks`)
      .send({ title: 'Rough cut' }); // missing departmentId and dueDate
    expect(res.status).toBe(400);
  });

  it('returns 404 listing tasks for a nonexistent stage', async () => {
    const res = await request(app).get('/api/stages/000000000000000000000000/tasks');
    expect(res.status).toBe(404);
  });

  it('lists tasks for a stage', async () => {
    const { stage, department } = await createStage();
    await request(app)
      .post(`/api/stages/${stage._id}/tasks`)
      .send({ title: 'Rough cut', departmentId: department._id, dueDate: '2026-08-20' });

    const res = await request(app).get(`/api/stages/${stage._id}/tasks`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });

  it('gets a task by id', async () => {
    const { stage, department } = await createStage();
    const task = await request(app)
      .post(`/api/stages/${stage._id}/tasks`)
      .send({ title: 'Rough cut', departmentId: department._id, dueDate: '2026-08-20' });

    const res = await request(app).get(`/api/tasks/${task.body._id}`);
    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Rough cut');
  });

  it('returns 404 getting a nonexistent task', async () => {
    const res = await request(app).get('/api/tasks/000000000000000000000000');
    expect(res.status).toBe(404);
  });

  it('updates a task', async () => {
    const { stage, department } = await createStage();
    const task = await request(app)
      .post(`/api/stages/${stage._id}/tasks`)
      .send({ title: 'Rough cut', departmentId: department._id, dueDate: '2026-08-20' });

    const res = await request(app)
      .put(`/api/tasks/${task.body._id}`)
      .send({ status: 'in_progress' });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('in_progress');
  });

  it('returns 404 updating a nonexistent task', async () => {
    const res = await request(app)
      .put('/api/tasks/000000000000000000000000')
      .send({ status: 'done' });
    expect(res.status).toBe(404);
  });

  it('deletes a task', async () => {
    const { stage, department } = await createStage();
    const task = await request(app)
      .post(`/api/stages/${stage._id}/tasks`)
      .send({ title: 'Rough cut', departmentId: department._id, dueDate: '2026-08-20' });

    const res = await request(app).delete(`/api/tasks/${task.body._id}`);
    expect(res.status).toBe(204);

    const after = await request(app).get(`/api/tasks/${task.body._id}`);
    expect(after.status).toBe(404);
  });

  it('returns 404 deleting a nonexistent task', async () => {
    const res = await request(app).delete('/api/tasks/000000000000000000000000');
    expect(res.status).toBe(404);
  });
});
