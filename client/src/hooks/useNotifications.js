import { useEffect, useState } from 'react';
import { listNotifications, markNotificationRead } from '../api/notifications';
import { getSocket } from '../socket';

// Fetches the notification history once, then stays live: any
// 'notification:new' event the server broadcasts (stage_unlocked,
// task_incomplete, task_delayed) gets prepended immediately, no polling.
export function useNotifications() {
  const [notifications, setNotifications] = useState([]);

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

  return { notifications, unreadCount, markRead };
}
