import { useCallback, useEffect, useState } from 'react';
import { listProjects, createProject as createProjectRequest, deleteProject as deleteProjectRequest } from '../api/projects';
import ProjectList from '../components/dashboard/ProjectList';
import NewProjectForm from '../components/dashboard/NewProjectForm';

export default function DashboardPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // Loads the project list once on mount. useCallback keeps this the
  // same function across re-renders so it's safe to list as the effect's
  // only dependency below, instead of disabling the lint rule.
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

  if (loading) return <p className="page-status">Loading…</p>;
  if (error) return <p className="page-status page-status--error">{error}</p>;

  async function handleCreate(data) {
    await createProject(data);
    setShowForm(false);
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-page__header">
        <h1>Projects</h1>
        <button type="button" className="btn" onClick={() => setShowForm((s) => !s)}>
          {showForm ? 'Cancel' : '+ New Project'}
        </button>
      </div>
      {showForm && <NewProjectForm onCreate={handleCreate} onCancel={() => setShowForm(false)} />}
      <ProjectList projects={projects} onDelete={deleteProject} />
    </div>
  );
}
