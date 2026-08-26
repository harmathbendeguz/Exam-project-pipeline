import { Link } from 'react-router-dom';

const STATUS_LABEL = {
  planning: 'Planning',
  in_progress: 'In progress',
  completed: 'Completed',
};

export default function ProjectCard({ project }) {
  return (
    <Link to={`/projects/${project._id}`} className="project-card">
      <div className="project-card__top">
        <h3 className="project-card__title">{project.title}</h3>
        <span className={`status-badge status-badge--${project.status}`}>
          {STATUS_LABEL[project.status] || project.status}
        </span>
      </div>
      {project.client && <p className="project-card__client">{project.client}</p>}
      <p className="project-card__deadline">
        Deadline: {new Date(project.deadline).toLocaleDateString()}
      </p>
    </Link>
  );
}
