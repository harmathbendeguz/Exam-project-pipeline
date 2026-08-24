require('dotenv').config();

const http = require('http');
const app = require('./app');
const connectDB = require('./config/db');
const socket = require('./socket');
const delayChecker = require('./jobs/delayChecker');

const PORT = process.env.PORT || 3000;

async function start() {
  await connectDB();

  // Socket.IO attaches to the raw http.Server, not the Express app —
  // that's why this file (and only this file) builds one explicitly.
  const server = http.createServer(app);
  socket.init(server);
  delayChecker.start();

  server.listen(PORT, () => {
    console.log(`PostFlow API listening on port ${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start PostFlow API:', err);
  process.exit(1);
});
