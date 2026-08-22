// Week 1: CRUD only. No sequential-unlock rules yet (Week 2) — but a
// Stage still can't be created under a Project that doesn't exist, so
// that referential check lives here, not in the repository.
const stageRepository = require('../repositories/stageRepository');
const projectRepository = require('../repositories/projectRepository');
const { NotFoundError } = require('../utils/errors');

async function listStagesForProject(projectId) {
  const project = await projectRepository.findById(projectId);
  if (!project) throw new NotFoundError(`Project ${projectId} not found`);
  return stageRepository.findByProjectId(projectId);
}

async function createStageForProject(projectId, data) {
  const project = await projectRepository.findById(projectId);
  if (!project) throw new NotFoundError(`Project ${projectId} not found`);
  return stageRepository.create({ ...data, projectId });
}

async function getStage(id) {
  const stage = await stageRepository.findById(id);
  if (!stage) throw new NotFoundError(`Stage ${id} not found`);
  return stage;
}

async function updateStage(id, data) {
  const stage = await stageRepository.updateById(id, data);
  if (!stage) throw new NotFoundError(`Stage ${id} not found`);
  return stage;
}

async function deleteStage(id) {
  const stage = await stageRepository.deleteById(id);
  if (!stage) throw new NotFoundError(`Stage ${id} not found`);
  return stage;
}

module.exports = {
  listStagesForProject,
  createStageForProject,
  getStage,
  updateStage,
  deleteStage,
};
