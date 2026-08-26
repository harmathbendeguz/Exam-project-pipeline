// One shared Socket.IO connection for the whole app, opened lazily on
// first use so importing this module never has a side effect on its own.
import { io } from 'socket.io-client';
import { BASE_URL } from './api/client';

let socket;

export function getSocket() {
  if (!socket) {
    socket = io(BASE_URL);
  }
  return socket;
}
