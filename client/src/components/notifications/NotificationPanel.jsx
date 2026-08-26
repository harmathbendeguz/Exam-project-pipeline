import NotificationItem from './NotificationItem';

export default function NotificationPanel({ notifications, onMarkRead, onClose }) {
  return (
    <div className="notification-panel">
      <div className="notification-panel__header">
        <h2>Notifications</h2>
        <button type="button" className="notification-panel__close" onClick={onClose} aria-label="Close">
          ×
        </button>
      </div>
      {notifications.length === 0 ? (
        <p className="notification-panel__empty">Nothing yet — you're all caught up.</p>
      ) : (
        <ul className="notification-panel__list">
          {notifications.map((n) => (
            <NotificationItem key={n._id} notification={n} onMarkRead={onMarkRead} />
          ))}
        </ul>
      )}
    </div>
  );
}
