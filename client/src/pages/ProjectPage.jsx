import { useCallback, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProject, listStagesForProject, createStage as createStageForProject } from '../api/projects';
import { listTasksForStage, updateStage } from '../api/stages';
import { updateTask } from '../api/tasks';
import PipelineView from '../components/pipeline/PipelineView';
import StageDetailPanel from '../components/pipeline/StageDetailPanel';
import NewStageForm from '../components/pipeline/NewStageForm';

export default function ProjectPage() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [stages, setStages] = useState([]);
  const [tasksByStage, setTasksByStage] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStageId, setSelectedStageId] = useState(null);
  const [showStageForm, setShowStageForm] = useState(false);

  // Loads the project, its stages, and every stage's tasks together.
  // Every mutation below (complete a task, complete a stage, assign,
  // create a stage) calls this again afterwards, so the pipeline view
  // always reflects what the server actually has, not an optimistic guess.
  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [projectData, stageData] = await Promise.all([
        getProject(id),
        listStagesForProject(id),
      ]);
      stageData.sort((a, b) => a.order - b.order);

      const taskLists = await Promise.all(stageData.map((stage) => listTasksForStage(stage._id)));
      const byStage = {};
      stageData.forEach((stage, i) => {
        byStage[stage._id] = taskLists[i];
      });

      setProject(projectData);
      setStages(stageData);
      setTasksByStage(byStage);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function completeTask(taskId) {
    await updateTask(taskId, { status: 'done' });
    await refresh();
  }

  // '' from the "Unassigned" option means "clear it" — sent as null so
  // Mongoose unsets the field rather than casting an empty string.
  async function assignTask(taskId, assigneeId) {
    await updateTask(taskId, { assigneeId: assigneeId || null });
    await refresh();
  }

  // Throws on a rule violation (e.g. 409 "task(s) not done") so the caller
  // can show it inline instead of it disappearing into the console.
  async function completeStage(stageId) {
    await updateStage(stageId, { status: 'done' });
    await refresh();
  }

  // The simplest possible "add a stage": append it after every existing
  // one. `order` is computed here, never asked for in the form — the
  // pipeline is sequential, so "next slot" is the only order that ever
  // makes sense for a stage created from the UI.
  async function createStage(data) {
    await createStageForProject(id, { ...data, order: stages.length });
    await refresh();
  }

  if (loading) return <p className="page-status">Loading…</p>;
  if (error) return <p className="page-status page-status--error">{error}</p>;
  if (!project) return null;

  const selectedStage = stages.find((s) => s._id === selectedStageId);

  async function handleCreateStage(data) {
    await createStage(data);
    setShowStageForm(false);
  }

  return (
    <div className="project-page">
      <div className="project-page__header">
        <Link to="/" className="project-page__back">
          ← Projects
        </Link>
        <div className="project-page__title-row">
          <h1>{project.title}</h1>
          <button type="button" className="btn" onClick={() => setShowStageForm((s) => !s)}>
            {showStageForm ? 'Cancel' : '+ New Stage'}
          </button>
        </div>
        {project.client && <p className="project-page__client">{project.client}</p>}
      </div>

      {showStageForm && (
        <NewStageForm onCreate={handleCreateStage} onCancel={() => setShowStageForm(false)} />
      )}

      <div
        className={`project-page__body${selectedStage ? ' project-page__body--with-panel' : ''}`}
      >
        {stages.length === 0 ? (
          <p className="empty-state">No stages yet for this project.</p>
        ) : (
          <PipelineView
            stages={stages}
            tasksByStage={tasksByStage}
            onSelectStage={setSelectedStageId}
            selectedStageId={selectedStageId}
          />
        )}
        {selectedStage && (
          <StageDetailPanel
            stage={selectedStage}
            tasks={tasksByStage[selectedStage._id] || []}
            onCompleteTask={completeTask}
            onCompleteStage={completeStage}
            onAssignTask={assignTask}
            onClose={() => setSelectedStageId(null)}
          />
        )}
      </div>
    </div>
  );
}
