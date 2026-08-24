// Single place that owns the Socket.IO server instance. server.js calls
// init() once at startup with the real http.Server. Everything else
// (notificationService, the cron job) only ever calls emit() — they don't
// need to know whether a socket server is even running.
const { Server } = require('socket.io');

let io;

function init(server) {
  io = new Server(server, { cors: { origin: '*' } });
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);
  });
  return io;
}

// Safe to call even when init() never ran — e.g. tests only require
// app.js, never server.js, so io stays undefined and this just no-ops
// instead of throwing.
function emit(event, payload) {
  if (io) io.emit(event, payload);
}

module.exports = { init, emit };
