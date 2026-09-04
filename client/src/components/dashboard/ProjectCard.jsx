import { Link } from 'react-router-dom';

const STATUS_LABEL = {
  planning: 'Planning',
  in_progress: 'In progress',
  completed: 'Completed',
};

export default function ProjectCard({ project, onDelete }) {
  function handleDelete(e) {
    // The whole card is a <Link> — without these, a click on the button
    // would also navigate to the project page underneath it.
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm(`Delete "${project.title}"? This also deletes its stages and tasks.`)) {
      onDelete(project._id);
    }
  }

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
      <div className="project-card__footer">
        <button type="button" className="project-card__delete" onClick={handleDelete}>
          Delete
        </button>
      </div>
    </Link>
  );
}
