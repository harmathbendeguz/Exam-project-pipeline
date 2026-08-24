const request = require('supertest');
const app = require('../src/app');
const db = require('./dbHandler');
const notificationService = require('../src/services/notificationService');

beforeAll(() => db.connect());
afterEach(() => db.clearDatabase());
afterAll(() => db.closeDatabase());

describe('Notification read API', () => {
  it('lists notifications, newest first, and supports filtering', async () => {
    const department = await request(app)
      .post('/api/departments')
      .send({ name: 'Sound', email: 'sound@postflow.dev' });

    await notificationService.notify({
      departmentId: department.body._id,
      type: 'task_delayed',
      message: 'first',
    });
    await notificationService.notify({
      departmentId: department.body._id,
      type: 'task_delayed',
      message: 'second',
    });

    const res = await request(app).get('/api/notifications');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body[0].message).toBe('second'); // newest first

    const filtered = await request(app).get(
      `/api/notifications?departmentId=${department.body._id}&read=false`
    );
    expect(filtered.body).toHaveLength(2);
  });

  it('marks a notification as read', async () => {
    const department = await request(app)
      .post('/api/departments')
      .send({ name: 'Sound', email: 'sound@postflow.dev' });
    const notification = await notificationService.notify({
      departmentId: department.body._id,
      type: 'task_delayed',
      message: 'overdue',
    });

    const res = await request(app).patch(`/api/notifications/${notification._id}/read`);
    expect(res.status).toBe(200);
    expect(res.body.read).toBe(true);
  });

  it('returns 404 marking a nonexistent notification as read', async () => {
    const res = await request(app).patch('/api/notifications/000000000000000000000000/read');
    expect(res.status).toBe(404);
  });
});
