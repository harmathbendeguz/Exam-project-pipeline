import { request } from './client';

export const updateTask = (id, data) =>
  request(`/api/tasks/${id}`, { method: 'PUT', body: JSON.stringify(data) });
