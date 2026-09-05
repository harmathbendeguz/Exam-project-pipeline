import { useCallback, useEffect, useRef, useState } from 'react';
import { getSocket } from '../../socket';
import { NOTIFICATION_TYPE_LABEL } from '../../constants/notificationTypes';

const AUTO_DISMISS_MS = 6000;

export default function ToastStack() {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Transient popups for the same 'notification:new' event the bell
  // (NotificationBell) already listens for — this doesn't touch that
  // history/unread-count state at all, it just mirrors the live stream
  // into its own short-lived list so a toast can appear and fade
  // independently of the bell.
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

  if (toasts.length === 0) return null;

  return (
    <div className="toast-stack" role="status" aria-live="polite">
      {toasts.map(({ id, notification }) => (
        <div key={id} className={`toast toast--${notification.type}`}>
          <span className="toast__badge">
            {NOTIFICATION_TYPE_LABEL[notification.type] || notification.type}
          </span>
          <p className="toast__message">{notification.message}</p>
          <button
            type="button"
            className="toast__close"
            onClick={() => dismiss(id)}
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
