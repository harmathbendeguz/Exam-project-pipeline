import { useCallback, useEffect, useRef, useState } from 'react';
import { getSocket } from '../socket';

const AUTO_DISMISS_MS = 6000;

// Transient popups for the same 'notification:new' event useNotifications
// already listens for — this hook doesn't touch that history/unread-count
// state at all, it just mirrors the live stream into its own short-lived
// list so a toast can appear and fade independently of the bell.
export function useToasts() {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    const socket = getSocket();
    function onNew(notification) {
      const id = ++nextId.current;
      setToasts((prev) => [...prev, { id, notification }]);
      setTimeout(() => dismiss(id), AUTO_DISMISS_MS);
    }
    socket.on('notification:new', onNew);
    return () => socket.off('notification:new', onNew);
  }, [dismiss]);

  return { toasts, dismiss };
}
