const projectRepository = require('../repositories/projectRepository');
const { NotFoundError } = require('../utils/errors');

async function listProjects() {
  return projectRepository.findAll();
}

async function getProject(id) {
  const project = await projectRepository.findById(id);
  if (!project) throw new NotFoundError(`Project ${id} not found`);
  return project;
}

async function createProject(data) {
  return projectRepository.create(data);
}

async function updateProject(id, data) {
  const project = await projectRepository.updateById(id, data);
  if (!project) throw new NotFoundError(`Project ${id} not found`);
  return project;
}

async function deleteProject(id) {
  const project = await projectRepository.deleteById(id);
  if (!project) throw new NotFoundError(`Project ${id} not found`);
  return project;
}

module.exports = {
  listProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
};
