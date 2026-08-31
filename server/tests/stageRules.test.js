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

  it('allows manually activating a stage once the previous one is done', async () => {
    const project = await createProject();
    const editing = await createDepartment('Editing');
    const stage0 = await request(app)
      .post(`/api/projects/${project._id}/stages`)
      .send({ name: 'Editing', order: 0, plannedEnd: '2026-09-01' });
    const stage1 = await request(app)
      .post(`/api/projects/${project._id}/stages`)
      .send({ name: 'Color Grading', order: 1, plannedEnd: '2026-09-10' });
    const task = await request(app)
      .post(`/api/stages/${stage0.body._id}/tasks`)
      .send({ title: 'Rough cut', departmentId: editing._id, dueDate: '2026-08-20' });
    await request(app).put(`/api/tasks/${task.body._id}`).send({ status: 'done' });
    await request(app).put(`/api/stages/${stage0.body._id}`).send({ status: 'done' });

    // Completing stage0 already cascaded stage1 to active (unlockNextStage
    // writes that directly, bypassing validateStatusTransition). To
    // actually exercise the *manual* activation rule — as opposed to the
    // cascade — relock it first, then reactivate it through the normal
    // PUT path, which must go through the same "previous stage done?"
    // check and succeed.
    await request(app).put(`/api/stages/${stage1.body._id}`).send({ status: 'locked' });
    const res = await request(app)
      .put(`/api/stages/${stage1.body._id}`)
      .send({ status: 'active' });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('active');
  });

  it('always allows reactivating the first stage regardless of neighbors', async () => {
    const project = await createProject();
    const stage0 = await request(app)
      .post(`/api/projects/${project._id}/stages`)
      .send({ name: 'Editing', order: 0, plannedEnd: '2026-09-01' });
    expect(stage0.body.status).toBe('active');

    // Relock it, then reactivate — order 0 has no predecessor to check,
    // so this must succeed unconditionally.
    await request(app).put(`/api/stages/${stage0.body._id}`).send({ status: 'locked' });
    const res = await request(app)
      .put(`/api/stages/${stage0.body._id}`)
      .send({ status: 'active' });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('active');
  });

  it('completes the last stage in a pipeline without a next stage to unlock', async () => {
    const project = await createProject();
    const editing = await createDepartment('Editing');
    const stage0 = await request(app)
      .post(`/api/projects/${project._id}/stages`)
      .send({ name: 'Editing', order: 0, plannedEnd: '2026-09-01' });
    const task = await request(app)
      .post(`/api/stages/${stage0.body._id}/tasks`)
      .send({ title: 'Rough cut', departmentId: editing._id, dueDate: '2026-08-20' });
    await request(app).put(`/api/tasks/${task.body._id}`).send({ status: 'done' });

    const res = await request(app)
      .put(`/api/stages/${stage0.body._id}`)
      .send({ status: 'done' });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('done');
  });

  it('notifies a department only once even with multiple blocking tasks', async () => {
    const project = await createProject();
    const editing = await createDepartment('Editing');
    const stage0 = await request(app)
      .post(`/api/projects/${project._id}/stages`)
      .send({ name: 'Editing', order: 0, plannedEnd: '2026-09-01' });
    // Two incomplete tasks, same department.
    await request(app)
      .post(`/api/stages/${stage0.body._id}/tasks`)
      .send({ title: 'Rough cut', departmentId: editing._id, dueDate: '2026-08-20' });
    await request(app)
      .post(`/api/stages/${stage0.body._id}/tasks`)
      .send({ title: 'Sound sync', departmentId: editing._id, dueDate: '2026-08-21' });

    await request(app).put(`/api/stages/${stage0.body._id}`).send({ status: 'done' });

    const notifications = await request(app).get('/api/notifications');
    const blocking = notifications.body.filter((n) => n.type === 'task_incomplete');
    expect(blocking).toHaveLength(1);
  });

  it('rejects marking a stage done if it was never activated', async () => {
    const project = await createProject();
    const stage0 = await request(app)
      .post(`/api/projects/${project._id}/stages`)
      .send({ name: 'Editing', order: 0, plannedEnd: '2026-09-01' });
    const stage1 = await request(app)
      .post(`/api/projects/${project._id}/stages`)
      .send({ name: 'Color Grading', order: 1, plannedEnd: '2026-09-10' });
    expect(stage1.body.status).toBe('locked');

    const res = await request(app)
      .put(`/api/stages/${stage1.body._id}`)
      .send({ status: 'done' });
    expect(res.status).toBe(409);
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
