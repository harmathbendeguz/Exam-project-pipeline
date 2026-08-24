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

async function createDepartment(name = 'Editing') {
  const res = await request(app)
    .post('/api/departments')
    .send({ name, email: `${name.toLowerCase()}@postflow.dev` });
  return res.body;
}

describe('Stage sequential rules', () => {
  it('order 0 starts active, later orders start locked', async () => {
    const project = await createProject();

    const stage0 = await request(app)
      .post(`/api/projects/${project._id}/stages`)
      .send({ name: 'Editing', order: 0, plannedEnd: '2026-09-01' });
    expect(stage0.body.status).toBe('active');

    const stage1 = await request(app)
      .post(`/api/projects/${project._id}/stages`)
      .send({ name: 'Color Grading', order: 1, plannedEnd: '2026-09-10' });
    expect(stage1.body.status).toBe('locked');
  });

  it('rejects activating a stage before the previous one is done', async () => {
    const project = await createProject();
    await request(app)
      .post(`/api/projects/${project._id}/stages`)
      .send({ name: 'Editing', order: 0, plannedEnd: '2026-09-01' });
    const stage1 = await request(app)
      .post(`/api/projects/${project._id}/stages`)
      .send({ name: 'Color Grading', order: 1, plannedEnd: '2026-09-10' });

    const res = await request(app)
      .put(`/api/stages/${stage1.body._id}`)
      .send({ status: 'active' });
    expect(res.status).toBe(409);
  });

  it('rejects completing a stage that still has incomplete tasks, and notifies the blocking department', async () => {
    const project = await createProject();
    const department = await createDepartment('Editing');
    const stage0 = await request(app)
      .post(`/api/projects/${project._id}/stages`)
      .send({ name: 'Editing', order: 0, plannedEnd: '2026-09-01' });
    await request(app)
      .post(`/api/stages/${stage0.body._id}/tasks`)
      .send({ title: 'Rough cut', departmentId: department._id, dueDate: '2026-08-20' });

    const res = await request(app)
      .put(`/api/stages/${stage0.body._id}`)
      .send({ status: 'done' });
    expect(res.status).toBe(409);

    const notifications = await request(app).get('/api/notifications');
    expect(notifications.body.some((n) => n.type === 'task_incomplete')).toBe(true);
  });

  it('completes a stage once its tasks are done, and cascades the next stage to active with a notification', async () => {
    const project = await createProject();
    const editing = await createDepartment('Editing');
    const color = await createDepartment('Color');

    const stage0 = await request(app)
      .post(`/api/projects/${project._id}/stages`)
      .send({ name: 'Editing', order: 0, plannedEnd: '2026-09-01' });
    const stage1 = await request(app)
      .post(`/api/projects/${project._id}/stages`)
      .send({ name: 'Color Grading', order: 1, plannedEnd: '2026-09-10' });

    const task = await request(app)
      .post(`/api/stages/${stage0.body._id}/tasks`)
      .send({ title: 'Rough cut', departmentId: editing._id, dueDate: '2026-08-20' });
    // A task must exist in stage1 for the stage_unlocked notification to have someone to notify.
    await request(app)
      .post(`/api/stages/${stage1.body._id}/tasks`)
      .send({ title: 'Grade reel', departmentId: color._id, dueDate: '2026-09-05' });

    await request(app).put(`/api/tasks/${task.body._id}`).send({ status: 'done' });

    const complete = await request(app)
      .put(`/api/stages/${stage0.body._id}`)
      .send({ status: 'done' });
    expect(complete.status).toBe(200);
    expect(complete.body.status).toBe('done');

    const nextStage = await request(app).get(`/api/stages/${stage1.body._id}`);
    expect(nextStage.body.status).toBe('active');

    const notifications = await request(app).get('/api/notifications');
    expect(notifications.body.some((n) => n.type === 'stage_unlocked')).toBe(true);
  });
});
