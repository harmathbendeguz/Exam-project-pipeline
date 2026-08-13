const projectService = require('../services/projectService');
const asyncHandler = require('../utils/asyncHandler');

const listProjects = asyncHandler(async (req, res) => {
  const projects = await projectService.listProjects();
  res.json(projects);
});

const getProject = asyncHandler(async (req, res) => {
  const project = await projectService.getProject(req.params.id);
  res.json(project);
});

const createProject = asyncHandler(async (req, res) => {
  const project = await projectService.createProject(req.body);
  res.status(201).json(project);
});

const updateProject = asyncHandler(async (req, res) => {
  const project = await projectService.updateProject(req.params.id, req.body);
  res.json(project);
});

const deleteProject = asyncHandler(async (req, res) => {
  await projectService.deleteProject(req.params.id);
  res.status(204).send();
});

module.exports = {
  listProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
};
