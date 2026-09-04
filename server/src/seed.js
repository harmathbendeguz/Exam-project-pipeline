// Dev tool: `npm run seed` wipes and repopulates the database with one
// full demo pipeline (departments, a project, stages, and tasks) plus a
// second project with no stages yet, so the API and frontend both have
// something realistic — and not entirely empty-state — to point at
// without manual Postman/curl setup each time.
require('dotenv').config();

const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Project = require('./models/Project');
const Stage = require('./models/Stage');
const Task = require('./models/Task');
const Department = require('./models/Department');
const Notification = require('./models/Notification');
const User = require('./models/User');

const DAY_MS = 24 * 60 * 60 * 1000;
const inDays = (n) => new Date(Date.now() + n * DAY_MS);

const STAGES = [
  { name: 'Editing', department: 'Editing' },
  { name: 'Color Grading', department: 'Color' },
  { name: 'Sound Mixing', department: 'Sound' },
  { name: 'VFX', department: 'VFX' },
  { name: 'Final Review', department: 'Post Supervisor' },
];

// One person per department, so the "who am I" picker and every
// assignee dropdown have real choices without any manual setup.
const USER_NAMES = {
  Editing: 'Alex Kovács',
  Color: 'Bianka Tóth',
  Sound: 'Csaba Nagy',
  VFX: 'Dóra Szabó',
  'Post Supervisor': 'Erik Farkas',
};

async function seed() {
  await connectDB();

  await Promise.all([
    Notification.deleteMany({}),
    Task.deleteMany({}),
    Stage.deleteMany({}),
    Project.deleteMany({}),
    Department.deleteMany({}),
    User.deleteMany({}),
  ]);

  const departments = {};
  for (const { department } of STAGES) {
    if (departments[department]) continue;
    departments[department] = await Department.create({
      name: department,
      email: `${department.toLowerCase().replace(/\s+/g, '-')}@postflow.dev`,
    });
  }

  const users = {};
  for (const [department, name] of Object.entries(USER_NAMES)) {
    users[department] = await User.create({
      name,
      email: `${name.split(' ')[0].toLowerCase()}@postflow.dev`,
      departmentId: departments[department]._id,
    });
  }

  const project = await Project.create({
    title: 'Demo Film Project',
    client: 'Acme Studios',
    description: 'Seed data for local development and demos.',
    deadline: inDays(60),
    status: 'in_progress',
  });

  for (const [index, { name, department }] of STAGES.entries()) {
    const stage = await Stage.create({
      projectId: project._id,
      name,
      order: index,
      status: index === 0 ? 'active' : 'locked',
      plannedEnd: inDays((index + 1) * 10),
    });

    await Task.create({
      stageId: stage._id,
      departmentId: departments[department]._id,
      title: `${name} — first pass`,
      dueDate: inDays((index + 1) * 10 - 3),
      // Give the active first stage one finished task, so the pipeline
      // demo shows partial progress rather than either extreme.
      status: index === 0 ? 'done' : 'todo',
    });
    await Task.create({
      stageId: stage._id,
      departmentId: departments[department]._id,
      // Give each stage's review task an assignee, so the per-user
      // progress view (GET /api/users/:id/tasks) has real data spread
      // across every department, not just one.
      assigneeId: users[department]._id,
      title: `${name} — review`,
      dueDate: inDays((index + 1) * 10 - 1),
    });
  }

  // A second project with no stages yet, so the dashboard shows more than
  // one card and the project view's empty state is reachable without
  // writing data by hand.
  await Project.create({
    title: 'Untitled Doc Short',
    client: 'Indie Client',
    deadline: inDays(90),
    status: 'planning',
  });

  console.log(`Seeded ${Object.keys(departments).length} departments.`);
  console.log(`Seeded ${Object.keys(users).length} users.`);
  console.log(`Seeded project "${project.title}" with ${STAGES.length} stages and tasks.`);
  console.log('Seeded a second, stage-less project ("Untitled Doc Short").');

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
