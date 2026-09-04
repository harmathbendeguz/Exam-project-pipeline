import { request } from './client';

export const listProjects = () => request('/api/projects');
export const getProject = (id) => request(`/api/projects/${id}`);
export const createProject = (data) =>
  request('/api/projects', { method: 'POST', body: JSON.stringify(data) });
export const updateProject = (id, data) =>
  request(`/api/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteProject = (id) => request(`/api/projects/${id}`, { method: 'DELETE' });
export const listStagesForProject = (projectId) => request(`/api/projects/${projectId}/stages`);
export const createStage = (projectId, data) =>
  request(`/api/projects/${projectId}/stages`, { method: 'POST', body: JSON.stringify(data) });
