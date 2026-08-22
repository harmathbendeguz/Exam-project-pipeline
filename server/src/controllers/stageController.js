const stageService = require('../services/stageService');
const asyncHandler = require('../utils/asyncHandler');

// Nested under /api/projects/:id/stages
const listByProject = asyncHandler(async (req, res) => {
  const stages = await stageService.listStagesForProject(req.params.id);
  res.json(stages);
});

const createForProject = asyncHandler(async (req, res) => {
  const stage = await stageService.createStageForProject(req.params.id, req.body);
  res.status(201).json(stage);
});

// Flat, under /api/stages/:id
const getStage = asyncHandler(async (req, res) => {
  const stage = await stageService.getStage(req.params.id);
  res.json(stage);
});

const updateStage = asyncHandler(async (req, res) => {
  const stage = await stageService.updateStage(req.params.id, req.body);
  res.json(stage);
});

const deleteStage = asyncHandler(async (req, res) => {
  await stageService.deleteStage(req.params.id);
  res.status(204).send();
});

module.exports = { listByProject, createForProject, getStage, updateStage, deleteStage };
