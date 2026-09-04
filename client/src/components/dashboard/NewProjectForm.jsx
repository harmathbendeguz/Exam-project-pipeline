import { useState } from 'react';

export default function NewProjectForm({ onCreate, onCancel }) {
  const [title, setTitle] = useState('');
  const [client, setClient] = useState('');
  const [deadline, setDeadline] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await onCreate({ title, client: client || undefined, deadline });
    } catch (err) {
      // Whatever the API rejected (e.g. a missing required field) shows
      // up here verbatim, same pattern as the stage-completion panel.
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <form className="new-project-form" onSubmit={handleSubmit}>
      <div className="new-project-form__row">
        <label>
          Title
          <input value={title} onChange={(e) => setTitle(e.target.value)} required />
        </label>
        <label>
          Client
          <input value={client} onChange={(e) => setClient(e.target.value)} />
        </label>
        <label>
          Deadline
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            required
          />
        </label>
      </div>
      {error && <p className="new-project-form__error">{error}</p>}
      <div className="new-project-form__actions">
        <button type="submit" className="btn" disabled={busy}>
          {busy ? 'Creating…' : 'Create project'}
        </button>
        <button type="button" className="btn btn--secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
