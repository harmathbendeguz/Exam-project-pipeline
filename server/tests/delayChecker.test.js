const request = require('supertest');
const app = require('../src/app');
const db = require('./dbHandler');
const delayChecker = require('../src/jobs/delayChecker');

beforeAll(() => db.connect());
afterEach(() => db.clearDatabase());
afterAll(() => db.closeDatabase());

describe('delayChecker.checkForDelays', () => {
  it('flips an overdue task to delayed and notifies its department', async () => {
    const project = await request(app)
      .post('/api/projects')
      .send({ title: 'Odesa Spot', deadline: '2026-12-01' });
    const department = await request(app)
      .post('/api/departments')
      .send({ name: 'Sound', email: 'sound@postflow.dev' });
    const stage = await request(app)
      .post(`/api/projects/${project.body._id}/stages`)
      .send({ name: 'Sound Mix', order: 0, plannedEnd: '2026-09-01' });
    const task = await request(app)
      .post(`/api/stages/${stage.body._id}/tasks`)
      .send({ title: 'Mix reel', departmentId: department.body._id, dueDate: '2020-01-01' }); // already overdue

    const flipped = await delayChecker.checkForDelays();
    expect(flipped).toBe(1);

    const after = await request(app).get(`/api/tasks/${task.body._id}`);
    expect(after.body.status).toBe('delayed');

    const notifications = await request(app).get('/api/notifications');
    expect(
      notifications.body.some((n) => n.type === 'task_delayed' && n.taskId === task.body._id)
    ).toBe(true);
  });

  it('leaves on-time tasks alone', async () => {
    const project = await request(app)
      .post('/api/projects')
      .send({ title: 'Odesa Spot', deadline: '2026-12-01' });
    const department = await request(app)
      .post('/api/departments')
      .send({ name: 'Sound', email: 'sound@postflow.dev' });
    const stage = await request(app)
      .post(`/api/projects/${project.body._id}/stages`)
      .send({ name: 'Sound Mix', order: 0, plannedEnd: '2026-09-01' });
    await request(app)
      .post(`/api/stages/${stage.body._id}/tasks`)
      .send({ title: 'Mix reel', departmentId: department.body._id, dueDate: '2099-01-01' });

    const flipped = await delayChecker.checkForDelays();
    expect(flipped).toBe(0);
  });
});
