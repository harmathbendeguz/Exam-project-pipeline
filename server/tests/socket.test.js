// Every other test file only requires app.js, so socket.js's init() never
// runs anywhere else in the suite — this file exercises it directly with
// a real (unlistened) http.Server, using a real socket.io-client to prove
// emit() actually reaches a connected client, not just that it doesn't throw.
const http = require('http');
const { io: ioClient } = require('socket.io-client');
const socket = require('../src/socket');

describe('socket.js', () => {
  it('emit() is a safe no-op before init() has run', () => {
    // A fresh require cache would be needed to truly test the pre-init
    // state; here we just confirm calling emit with no listener attached
    // never throws, which is what every notification-creating test in
    // this suite already implicitly relies on.
    expect(() => socket.emit('notification:new', { hello: 'world' })).not.toThrow();
  });

  it('init() attaches Socket.IO to a real server and emit() reaches a connected client', async () => {
    const server = http.createServer();
    socket.init(server);
    await new Promise((resolve) => server.listen(0, resolve));
    const port = server.address().port;

    const client = ioClient(`http://localhost:${port}`, { transports: ['websocket'] });
    await new Promise((resolve, reject) => {
      client.on('connect', resolve);
      client.on('connect_error', reject);
    });

    const received = new Promise((resolve) => client.once('ping', resolve));
    socket.emit('ping', { ok: true });
    const payload = await received;
    expect(payload).toEqual({ ok: true });

    client.close();
    await new Promise((resolve) => server.close(resolve));
  });
});
