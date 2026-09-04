import { useToasts } from '../../hooks/useToasts';
import { NOTIFICATION_TYPE_LABEL } from '../../constants/notificationTypes';

export default function ToastStack() {
  const { toasts, dismiss } = useToasts();

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
