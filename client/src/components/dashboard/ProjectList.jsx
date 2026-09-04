import ProjectCard from './ProjectCard';

export default function ProjectList({ projects, onDelete }) {
  if (projects.length === 0) {
    return (
      <p className="empty-state">
        No projects yet — create one above, or run <code>npm run seed</code> in{' '}
        <code>server/</code> for demo data.
      </p>
    );
  }

  return (
    <div className="project-list">
      {projects.map((project) => (
        <ProjectCard key={project._id} project={project} onDelete={onDelete} />
      ))}
    </div>
  );
}
