const taskRepository = require('../repositories/taskRepository');
const stageRepository = require('../repositories/stageRepository');
const { NotFoundError } = require('../utils/errors');

async function listTasksForStage(stageId) {
  const stage = await stageRepository.findById(stageId);
  if (!stage) throw new NotFoundError(`Stage ${stageId} not found`);
  return taskRepository.findByStageId(stageId);
}

async function createTaskForStage(stageId, data) {
  const stage = await stageRepository.findById(stageId);
  if (!stage) throw new NotFoundError(`Stage ${stageId} not found`);
  return taskRepository.create({ ...data, stageId });
}

async function getTask(id) {
  const task = await taskRepository.findById(id);
  if (!task) throw new NotFoundError(`Task ${id} not found`);
  return task;
}

async function updateTask(id, data) {
  const task = await taskRepository.updateById(id, data);
  if (!task) throw new NotFoundError(`Task ${id} not found`);
  return task;
}

async function deleteTask(id) {
  const task = await taskRepository.deleteById(id);
  if (!task) throw new NotFoundError(`Task ${id} not found`);
  return task;
}

module.exports = {
  listTasksForStage,
  createTaskForStage,
  getTask,
  updateTask,
  deleteTask,
};
