const request = require('supertest');
const app = require('../src/app');
const db = require('./dbHandler');

beforeAll(() => db.connect());
afterEach(() => db.clearDatabase());
afterAll(() => db.closeDatabase());

async function createDepartment() {
  const res = await request(app)
    .post('/api/departments')
    .send({ name: 'Editing', email: 'editing@postflow.dev' });
  return res.body;
}

describe('User CRUD', () => {
  it('creates a user', async () => {
    const department = await createDepartment();
    const res = await request(app)
      .post('/api/users')
      .send({ name: 'Alex Kovacs', email: 'alex@postflow.dev', departmentId: department._id });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Alex Kovacs');
  });

  it('rejects a missing required field', async () => {
    const res = await request(app).post('/api/users').send({ name: 'No Department' });
    expect(res.status).toBe(400);
  });

  it('rejects a duplicate email', async () => {
    const department = await createDepartment();
    await request(app)
      .post('/api/users')
      .send({ name: 'Alex', email: 'alex@postflow.dev', departmentId: department._id });
    const res = await request(app)
      .post('/api/users')
      .send({ name: 'Alex Two', email: 'alex@postflow.dev', departmentId: department._id });
    expect(res.status).toBe(409);
  });

  it('lists users', async () => {
    const department = await createDepartment();
    await request(app)
      .post('/api/users')
      .send({ name: 'Alex', email: 'alex@postflow.dev', departmentId: department._id });
    const res = await request(app).get('/api/users');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });

  it('gets a user by id', async () => {
    const department = await createDepartment();
    const created = await request(app)
      .post('/api/users')
      .send({ name: 'Alex', email: 'alex@postflow.dev', departmentId: department._id });
    const res = await request(app).get(`/api/users/${created.body._id}`);
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Alex');
  });

  it('returns 404 for a nonexistent user', async () => {
    const res = await request(app).get('/api/users/000000000000000000000000');
    expect(res.status).toBe(404);
  });

  it('updates a user', async () => {
    const department = await createDepartment();
    const created = await request(app)
      .post('/api/users')
      .send({ name: 'Alex', email: 'alex@postflow.dev', departmentId: department._id });
    const res = await request(app)
      .put(`/api/users/${created.body._id}`)
      .send({ name: 'Alex K.' });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Alex K.');
  });

  it('deletes a user', async () => {
    const department = await createDepartment();
    const created = await request(app)
      .post('/api/users')
      .send({ name: 'Alex', email: 'alex@postflow.dev', departmentId: department._id });
    const res = await request(app).delete(`/api/users/${created.body._id}`);
    expect(res.status).toBe(204);

    const after = await request(app).get(`/api/users/${created.body._id}`);
    expect(after.status).toBe(404);
  });

  it("lists a user's assigned tasks across stages", async () => {
    const department = await createDepartment();
    const user = await request(app)
      .post('/api/users')
      .send({ name: 'Alex', email: 'alex@postflow.dev', departmentId: department._id });
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
        departmentId: department._id,
        assigneeId: user.body._id,
        dueDate: '2026-08-20',
      });
    // A task with no assignee shouldn't show up in Alex's list.
    await request(app)
      .post(`/api/stages/${stage.body._id}/tasks`)
      .send({ title: 'Unassigned task', departmentId: department._id, dueDate: '2026-08-21' });

    const res = await request(app).get(`/api/users/${user.body._id}/tasks`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].title).toBe('Rough cut');
  });

  it("returns 404 listing tasks for a nonexistent user", async () => {
    const res = await request(app).get('/api/users/000000000000000000000000/tasks');
    expect(res.status).toBe(404);
  });
});
