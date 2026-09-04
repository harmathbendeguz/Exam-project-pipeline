import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProjectPipeline } from '../hooks/useProjectPipeline';
import PipelineView from '../components/pipeline/PipelineView';
import StageDetailPanel from '../components/pipeline/StageDetailPanel';

export default function ProjectPage() {
  const { id } = useParams();
  const { project, stages, tasksByStage, loading, error, completeTask, completeStage, assignTask } =
    useProjectPipeline(id);
  const [selectedStageId, setSelectedStageId] = useState(null);

  if (loading) return <p className="page-status">Loading…</p>;
  if (error) return <p className="page-status page-status--error">{error}</p>;
  if (!project) return null;

  const selectedStage = stages.find((s) => s._id === selectedStageId);

  return (
    <div className="project-page">
      <div className="project-page__header">
        <Link to="/" className="project-page__back">
          ← Projects
        </Link>
        <h1>{project.title}</h1>
        {project.client && <p className="project-page__client">{project.client}</p>}
      </div>

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
