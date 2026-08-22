const taskService = require('../services/taskService');
const asyncHandler = require('../utils/asyncHandler');

// Nested under /api/stages/:id/tasks
const listByStage = asyncHandler(async (req, res) => {
  const tasks = await taskService.listTasksForStage(req.params.id);
  res.json(tasks);
});

const createForStage = asyncHandler(async (req, res) => {
  const task = await taskService.createTaskForStage(req.params.id, req.body);
  res.status(201).json(task);
});

// Flat, under /api/tasks/:id
const getTask = asyncHandler(async (req, res) => {
  const task = await taskService.getTask(req.params.id);
  res.json(task);
});

const updateTask = asyncHandler(async (req, res) => {
  const task = await taskService.updateTask(req.params.id, req.body);
  res.json(task);
});

const deleteTask = asyncHandler(async (req, res) => {
  await taskService.deleteTask(req.params.id);
  res.status(204).send();
});

module.exports = { listByStage, createForStage, getTask, updateTask, deleteTask };
