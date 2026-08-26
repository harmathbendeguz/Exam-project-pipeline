import { Link } from 'react-router-dom';
import NotificationBell from '../notifications/NotificationBell';

export default function Header() {
  return (
    <header className="header">
      <Link to="/" className="header__brand">
        PostFlow
      </Link>
      <NotificationBell />
    </header>
  );
}
