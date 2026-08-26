import { request } from './client';

export const listNotifications = () => request('/api/notifications');
export const markNotificationRead = (id) =>
  request(`/api/notifications/${id}/read`, { method: 'PATCH' });
