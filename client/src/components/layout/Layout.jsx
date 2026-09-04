import Header from './Header';
import ToastStack from '../notifications/ToastStack';

export default function Layout({ children }) {
  return (
    <div className="layout">
      <Header />
      <main className="layout__content">{children}</main>
      <ToastStack />
    </div>
  );
}
