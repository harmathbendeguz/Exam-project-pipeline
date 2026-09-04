import { useIdentity } from '../../context/IdentityContext';

export default function IdentityPicker() {
  const { users, userId, setUserId, loading } = useIdentity();

  if (loading) return null;

  return (
    <label className="identity-picker">
      <span className="identity-picker__label">Acting as</span>
      <select value={userId} onChange={(e) => setUserId(e.target.value)}>
        <option value="">— pick who you are —</option>
        {users.map((u) => (
          <option key={u._id} value={u._id}>
            {u.name}
          </option>
        ))}
      </select>
    </label>
  );
}
