// Week 1: CRUD only. Week 2 adds the pipeline rules:
//   - a new stage starts 'active' if it's the first in the pipeline
//     (order 0), 'locked' otherwise — computed here, never trusted from
//     client input.
//   - a stage can only become 'active' if the previous stage is 'done'.
//   - a stage can only become 'done' if it's currently 'active' AND every
//     task under it is 'done'; otherwise the transition is rejected and
//     the blocking departments are notified (task_incomplete).
//   - completing a stage cascades: the next stage flips locked -> active,
//     and every department with a task in it is notified (stage_unlocked).
const stageRepository = require('../repositories/stageRepository');
const projectRepository = require('../repositories/projectRepository');
const taskRepository = require('../repositories/taskRepository');
const notificationService = require('../services/notificationService');
const { NotFoundError, ConflictError } = require('../utils/errors');

async function listStagesForProject(projectId) {
  const project = await projectRepository.findById(projectId);
  if (!project) throw new NotFoundError(`Project ${projectId} not found`);
  return stageRepository.findByProjectId(projectId);
}

async function createStageForProject(projectId, data) {
  const project = await projectRepository.findById(projectId);
  if (!project) throw new NotFoundError(`Project ${projectId} not found`);

  const status = data.order === 0 ? 'active' : 'locked';
  return stageRepository.create({ ...data, projectId, status });
}

async function getStage(id) {
  const stage = await stageRepository.findById(id);
  if (!stage) throw new NotFoundError(`Stage ${id} not found`);
  return stage;
}

async function updateStage(id, data) {
  const current = await stageRepository.findById(id);
  if (!current) throw new NotFoundError(`Stage ${id} not found`);

  if (data.status && data.status !== current.status) {
    await validateStatusTransition(current, data.status);
  }

  const updated = await stageRepository.updateById(id, data);

  if (data.status === 'done' && current.status !== 'done') {
    await unlockNextStage(current);
  }

  return updated;
}

async function deleteStage(id) {
  const stage = await stageRepository.deleteById(id);
  if (!stage) throw new NotFoundError(`Stage ${id} not found`);
  // Cascade: a Task with no Stage is an orphan nothing can reach again.
  await taskRepository.deleteByStageIds([id]);
  return stage;
}

async function validateStatusTransition(stage, newStatus) {
  if (newStatus === 'active') {
    if (stage.order === 0) return; // first stage may always (re)activate
    const previous = await stageRepository.findByProjectAndOrder(stage.projectId, stage.order - 1);
    if (!previous || previous.status !== 'done') {
      throw new ConflictError(
        `Cannot activate stage "${stage.name}" — the previous stage isn't done yet`
      );
    }
    return;
  }

  if (newStatus === 'done') {
    if (stage.status !== 'active') {
      throw new ConflictError(`Cannot complete stage "${stage.name}" — it isn't active`);
    }
    const tasks = await taskRepository.findByStageId(stage._id);
    const incomplete = tasks.filter((task) => task.status !== 'done');
    if (incomplete.length > 0) {
      await notifyDepartments(incomplete, 'task_incomplete', (task) =>
        `Task "${task.title}" is blocking stage "${stage.name}" from completing`
      );
      throw new ConflictError(
        `Cannot complete stage "${stage.name}" — ${incomplete.length} task(s) not done`
      );
    }
  }
}

async function unlockNextStage(stage) {
  const next = await stageRepository.findByProjectAndOrder(stage.projectId, stage.order + 1);
  if (!next || next.status !== 'locked') return;

  await stageRepository.updateById(next._id, { status: 'active' });

  const tasks = await taskRepository.findByStageId(next._id);
  await notifyDepartments(tasks, 'stage_unlocked', () => `Stage "${next.name}" is now active`);
}

// Notifies each distinct department represented in `tasks` once, using
// `messageFor(task)` to build that department's message.
async function notifyDepartments(tasks, type, messageFor) {
  const seen = new Set();
  await Promise.all(
    tasks
      .filter((task) => {
        const key = String(task.departmentId);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .map((task) =>
        notificationService.notify({
          departmentId: task.departmentId,
          taskId: task._id,
          type,
          message: messageFor(task),
        })
      )
  );
}

module.exports = {
  listStagesForProject,
  createStageForProject,
  getStage,
  updateStage,
  deleteStage,
};
