require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 3000;

async function start() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`PostFlow API listening on port ${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start PostFlow API:', err);
  process.exit(1);
});
