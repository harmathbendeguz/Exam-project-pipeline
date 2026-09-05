import { useState } from 'react';

// Deliberately minimal: just a name and a planned end date. `order` is
// never asked for here — the pipeline is sequential, so the hook always
// appends the new stage after every existing one (see useProjectPipeline's
// createStage). Same shape as NewProjectForm, one field simpler.
export default function NewStageForm({ onCreate, onCancel }) {
  const [name, setName] = useState('');
  const [plannedEnd, setPlannedEnd] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await onCreate({ name, plannedEnd });
    } catch (err) {
      // Same pattern as NewProjectForm: show the API's own message verbatim.
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <form className="inline-form" onSubmit={handleSubmit}>
      <div className="inline-form__row">
        <label>
          Stage name
          <input value={name} onChange={(e) => setName(e.target.value)} required autoFocus />
        </label>
        <label>
          Planned end
          <input
            type="date"
            value={plannedEnd}
            onChange={(e) => setPlannedEnd(e.target.value)}
            required
          />
        </label>
      </div>
      {error && <p className="inline-form__error">{error}</p>}
      <div className="inline-form__actions">
        <button type="submit" className="btn" disabled={busy}>
          {busy ? 'Creating…' : 'Create stage'}
        </button>
        <button type="button" className="btn btn--secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
