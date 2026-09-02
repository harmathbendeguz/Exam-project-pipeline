// Shared by every test file that needs a real database. Spins up an
// in-memory MongoDB per test run instead of requiring Docker/a real Mongo
// to be running wherever `npm test` executes — including this dev machine.
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongod;

async function connect() {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());

  // mongoose.connect() resolving does NOT mean unique indexes (Department
  // .name, User.email, Stage's compound {projectId, order}...) have
  // finished building — MongoDB builds them in the background. Without
  // this, a test can occasionally slip a duplicate past a unique index
  // that simply isn't ready yet: a real, intermittent flake, not
  // hypothetical (caught it failing ~2 times in 5 full-suite runs before
  // this fix). Model.init() resolves once its indexes are actually built.
  await Promise.all(Object.values(mongoose.connection.models).map((model) => model.init()));
}

async function clearDatabase() {
  const { collections } = mongoose.connection;
  await Promise.all(Object.values(collections).map((c) => c.deleteMany({})));
}

async function closeDatabase() {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongod.stop();
}

module.exports = { connect, clearDatabase, closeDatabase };
