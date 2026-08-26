import { request } from './client';

export const listDepartments = () => request('/api/departments');
