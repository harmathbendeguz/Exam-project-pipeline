// Mocking mailer here (rather than relying on the console-log fallback)
// lets these tests assert *who* an alert would go to, not just that
// nothing throws.
jest.mock('../src/mailer', () => ({ sendAlert: jest.fn().mockResolvedValue(undefined) }));

const request = require('supertest');
const app = require('../src/app');
const db = require('./dbHandler');
const mailer = require('../src/mailer');

beforeAll(() => db.connect());
afterEach(async () => {
  await db.clearDatabase();
  mailer.sendAlert.mockClear();
});
afterAll(() => db.closeDatabase());

describe('Notification email alerts', () => {
  it("emails the task's assignee, not the department, when one is set", async () => {
    const department = await request(app)
      .post('/api/departments')
      .send({ name: 'Editing', email: 'editing@postflow.dev' });
    const user = await request(app)
      .post('/api/users')
      .send({ name: 'Alex', email: 'alex@postflow.dev', departmentId: department.body._id });
    const project = await request(app)
      .post('/api/projects')
      .send({ title: 'Odesa Spot', deadline: '2026-12-01' });
    const stage = await request(app)
      .post(`/api/projects/${project.body._id}/stages`)
      .send({ name: 'Editing', order: 0, plannedEnd: '2026-09-01' });
    await request(app)
      .post(`/api/stages/${stage.body._id}/tasks`)
      .send({
        title: 'Rough cut',
        departmentId: department.body._id,
        assigneeId: user.body._id,
        dueDate: '2026-08-20',
      });

    // Attempting to complete the stage with the task still open fires a
    // task_incomplete notification — should go to Alex, not "editing@".
    await request(app).put(`/api/stages/${stage.body._id}`).send({ status: 'done' });

    expect(mailer.sendAlert).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'alex@postflow.dev' })
    );
  });

  it("falls back to the department's email when a task has no assignee", async () => {
    const department = await request(app)
      .post('/api/departments')
      .send({ name: 'Editing', email: 'editing@postflow.dev' });
    const project = await request(app)
      .post('/api/projects')
      .send({ title: 'Odesa Spot', deadline: '2026-12-01' });
    const stage = await request(app)
      .post(`/api/projects/${project.body._id}/stages`)
      .send({ name: 'Editing', order: 0, plannedEnd: '2026-09-01' });
    await request(app)
      .post(`/api/stages/${stage.body._id}/tasks`)
      .send({ title: 'Rough cut', departmentId: department.body._id, dueDate: '2026-08-20' });

    await request(app).put(`/api/stages/${stage.body._id}`).send({ status: 'done' });

    expect(mailer.sendAlert).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'editing@postflow.dev' })
    );
  });
});
