import { useProjects } from '../hooks/useProjects';
import ProjectList from '../components/dashboard/ProjectList';

export default function DashboardPage() {
  const { projects, loading, error } = useProjects();

  if (loading) return <p className="page-status">Loading…</p>;
  if (error) return <p className="page-status page-status--error">{error}</p>;

  return (
    <div className="dashboard-page">
      <h1>Projects</h1>
      <ProjectList projects={projects} />
    </div>
  );
}
