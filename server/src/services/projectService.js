const projectRepository = require('../repositories/projectRepository');
const stageRepository = require('../repositories/stageRepository');
const taskRepository = require('../repositories/taskRepository');
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

  // Cascade: without this, deleting a Project leaves its Stages (and
  // their Tasks) behind as orphans — still in the database, but
  // unreachable through any nested route, since those all require the
  // parent to exist first.
  const stages = await stageRepository.findByProjectId(id);
  await taskRepository.deleteByStageIds(stages.map((stage) => stage._id));
  await stageRepository.deleteByProjectId(id);

  return project;
}

module.exports = {
  listProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
};
