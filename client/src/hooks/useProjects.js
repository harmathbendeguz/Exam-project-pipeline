import { useEffect, useState, useCallback } from 'react';
import {
  listProjects,
  createProject as createProjectRequest,
  deleteProject as deleteProjectRequest,
} from '../api/projects';

export function useProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setProjects(await listProjects());
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function createProject(data) {
    await createProjectRequest(data);
    await refresh();
  }

  async function deleteProject(id) {
    await deleteProjectRequest(id);
    await refresh();
  }

  return { projects, loading, error, refresh, createProject, deleteProject };
}
