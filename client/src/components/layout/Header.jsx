import { Link } from 'react-router-dom';
import IdentityPicker from './IdentityPicker';
import NotificationBell from '../notifications/NotificationBell';

export default function Header() {
  return (
    <header className="header">
      <Link to="/" className="header__brand">
        PostFlow
      </Link>
      <div className="header__actions">
        <IdentityPicker />
        <NotificationBell />
      </div>
    </header>
  );
}
