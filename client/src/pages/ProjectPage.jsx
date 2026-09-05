import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProjectPipeline } from '../hooks/useProjectPipeline';
import PipelineView from '../components/pipeline/PipelineView';
import StageDetailPanel from '../components/pipeline/StageDetailPanel';
import NewStageForm from '../components/pipeline/NewStageForm';

export default function ProjectPage() {
  const { id } = useParams();
  const {
    project,
    stages,
    tasksByStage,
    loading,
    error,
    completeTask,
    completeStage,
    assignTask,
    createStage,
  } = useProjectPipeline(id);
  const [selectedStageId, setSelectedStageId] = useState(null);
  const [showStageForm, setShowStageForm] = useState(false);

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
