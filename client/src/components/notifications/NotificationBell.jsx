import { useEffect, useState } from 'react';
import { listNotifications, markNotificationRead } from '../../api/notifications';
import { getSocket } from '../../socket';
import NotificationPanel from './NotificationPanel';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);

  // Fetches the notification history once, then stays live: any
  // 'notification:new' event the server broadcasts (stage_unlocked,
  // task_incomplete, task_delayed) gets prepended immediately, no polling.
  useEffect(() => {
    listNotifications().then(setNotifications).catch(() => {});

    const socket = getSocket();
    const onNew = (notification) => setNotifications((prev) => [notification, ...prev]);
    socket.on('notification:new', onNew);
    return () => socket.off('notification:new', onNew);
  }, []);

  async function markRead(id) {
    const updated = await markNotificationRead(id);
    setNotifications((prev) => prev.map((n) => (n._id === id ? updated : n)));
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="notification-bell">
      <button
        type="button"
        className="notification-bell__button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Notifications"
      >
        🔔
        {unreadCount > 0 && <span className="notification-bell__count">{unreadCount}</span>}
      </button>
      {open && (
        <NotificationPanel
          notifications={notifications}
          onMarkRead={markRead}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}
