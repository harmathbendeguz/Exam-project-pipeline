import { request } from './client';

export const listUsers = () => request('/api/users');
