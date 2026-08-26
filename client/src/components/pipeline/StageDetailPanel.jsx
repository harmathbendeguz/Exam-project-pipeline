import { useState } from 'react';

const TASK_STATUS_LABEL = {
  todo: 'To do',
  in_progress: 'In progress',
  done: 'Done',
  delayed: 'Delayed',
};

export default function StageDetailPanel({ stage, tasks, onCompleteTask, onCompleteStage, onClose }) {
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  async function handleCompleteStage() {
    setBusy(true);
    setError(null);
    try {
      await onCompleteStage(stage._id);
    } catch (err) {
      // The 409 from stageService's rule check (e.g. "2 task(s) not done")
      // lands here verbatim, so the panel can show exactly why it was blocked.
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <aside className="stage-panel">
      <div className="stage-panel__header">
        <h2>{stage.name}</h2>
        <button type="button" className="stage-panel__close" onClick={onClose} aria-label="Close">
          ×
        </button>
      </div>
      <span className={`status-badge status-badge--stage-${stage.status}`}>{stage.status}</span>

      <ul className="stage-panel__tasks">
        {tasks.length === 0 && <li className="stage-panel__empty">No tasks yet.</li>}
        {tasks.map((task) => (
          <li key={task._id} className="task-row">
            <div>
              <p className="task-row__title">{task.title}</p>
              <p className="task-row__meta">{TASK_STATUS_LABEL[task.status]}</p>
            </div>
            {task.status !== 'done' && (
              <button type="button" onClick={() => onCompleteTask(task._id)}>
                Mark done
              </button>
            )}
          </li>
        ))}
      </ul>

      {stage.status === 'active' && (
        <button
          type="button"
          className="stage-panel__complete"
          onClick={handleCompleteStage}
          disabled={busy}
        >
          {busy ? 'Completing…' : 'Complete stage'}
        </button>
      )}
      {error && <p className="stage-panel__error">{error}</p>}
    </aside>
  );
}
