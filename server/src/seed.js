// Bonus dev tool: `npm run seed` wipes and repopulates Project/Stage with
// one demo pipeline, so the API (and later the frontend) has something
// realistic to point at without manual Postman/curl setup each time.
require('dotenv').config();

const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Project = require('./models/Project');
const Stage = require('./models/Stage');

const STAGE_NAMES = ['Editing', 'Color Grading', 'Sound Mixing', 'VFX', 'Final Review'];
const DAY_MS = 24 * 60 * 60 * 1000;

async function seed() {
  await connectDB();

  await Stage.deleteMany({});
  await Project.deleteMany({});

  const project = await Project.create({
    title: 'Demo Film Project',
    client: 'Acme Studios',
    description: 'Seed data for local development and demos.',
    deadline: new Date(Date.now() + 60 * DAY_MS),
    status: 'in_progress',
  });

  const stages = await Promise.all(
    STAGE_NAMES.map((name, index) =>
      Stage.create({
        projectId: project._id,
        name,
        order: index,
        status: index === 0 ? 'active' : 'locked',
        plannedEnd: new Date(Date.now() + (index + 1) * 10 * DAY_MS),
      })
    )
  );

  console.log(`Seeded project "${project.title}" with ${stages.length} stages.`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
