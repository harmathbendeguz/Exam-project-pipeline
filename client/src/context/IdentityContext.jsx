import { createContext, useContext, useEffect, useState } from 'react';
import { listUsers } from '../api/users';

const STORAGE_KEY = 'postflow:userId';
const IdentityContext = createContext(null);

// "Who am I" — attribution only, not authentication (mirrors the User
// model itself: no password, nothing here gates access to anything).
// Fetches the User list once and remembers the chosen one in
// localStorage, so it survives a reload but is private to this browser.
// Shared via context because both the header picker and the task
// assignee dropdowns need the same User list and the same choice.
export function IdentityProvider({ children }) {
  const [users, setUsers] = useState([]);
  const [userId, setUserIdState] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || '';
    } catch {
      return '';
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listUsers()
      .then((list) => {
        setUsers(list);
        // The remembered id may no longer exist (e.g. a reseeded db) —
        // don't keep pointing at a ghost user.
        setUserIdState((current) => (list.some((u) => u._id === current) ? current : ''));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function setUserId(id) {
    setUserIdState(id);
    try {
      if (id) localStorage.setItem(STORAGE_KEY, id);
      else localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Private browsing / storage disabled — the choice just won't
      // survive a reload, which is fine for a convenience feature.
    }
  }

  const user = users.find((u) => u._id === userId) || null;

  return (
    <IdentityContext.Provider value={{ users, userId, user, setUserId, loading }}>
      {children}
    </IdentityContext.Provider>
  );
}

export function useIdentity() {
  const ctx = useContext(IdentityContext);
  if (!ctx) throw new Error('useIdentity must be used within an IdentityProvider');
  return ctx;
}
