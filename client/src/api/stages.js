import { request } from './client';

export const updateStage = (id, data) =>
  request(`/api/stages/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const listTasksForStage = (stageId) => request(`/api/stages/${stageId}/tasks`);
export const createTask = (stageId, data) =>
  request(`/api/stages/${stageId}/tasks`, { method: 'POST', body: JSON.stringify(data) });
