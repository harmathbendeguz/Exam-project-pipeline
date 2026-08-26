const TYPE_LABEL = {
  task_delayed: 'Delayed',
  task_incomplete: 'Blocking',
  stage_unlocked: 'Unlocked',
};

export default function NotificationItem({ notification, onMarkRead }) {
  return (
    <li className={`notification-item${notification.read ? '' : ' notification-item--unread'}`}>
      <span className={`notification-item__badge notification-item__badge--${notification.type}`}>
        {TYPE_LABEL[notification.type] || notification.type}
      </span>
      <div className="notification-item__body">
        <p className="notification-item__message">{notification.message}</p>
        <time className="notification-item__time">
          {new Date(notification.createdAt).toLocaleString()}
        </time>
      </div>
      {!notification.read && (
        <button
          type="button"
          className="notification-item__mark-read"
          onClick={() => onMarkRead(notification._id)}
        >
          Mark read
        </button>
      )}
    </li>
  );
}
