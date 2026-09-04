import { useState } from 'react';
import { useProjects } from '../hooks/useProjects';
import ProjectList from '../components/dashboard/ProjectList';
import NewProjectForm from '../components/dashboard/NewProjectForm';

export default function DashboardPage() {
  const { projects, loading, error, createProject, deleteProject } = useProjects();
  const [showForm, setShowForm] = useState(false);

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
