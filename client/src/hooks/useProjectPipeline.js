import { useEffect, useState, useCallback } from 'react';
import { getProject, listStagesForProject, createStage as createStageForProject } from '../api/projects';
import { listTasksForStage, updateStage } from '../api/stages';
import { updateTask } from '../api/tasks';

// Owns everything the pipeline view needs: the project, its stages, and
// every stage's tasks — plus the two mutations (complete a task, complete
// a stage) that actually drive the pipeline forward. Components just call
// these and re-render; none of them touch the API layer directly.
export function useProjectPipeline(projectId) {
  const [project, setProject] = useState(null);
  const [stages, setStages] = useState([]);
  const [tasksByStage, setTasksByStage] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [projectData, stageData] = await Promise.all([
        getProject(projectId),
        listStagesForProject(projectId),
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
  }, [projectId]);

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
    await createStageForProject(projectId, { ...data, order: stages.length });
    await refresh();
  }

  return {
    project,
    stages,
    tasksByStage,
    loading,
    error,
    completeTask,
    completeStage,
    assignTask,
    createStage,
    refresh,
  };
}
