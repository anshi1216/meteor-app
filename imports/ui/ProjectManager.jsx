import React, { useState, useMemo } from "react";
import { useTracker } from "meteor/react-meteor-data";
import { Meteor } from "meteor/meteor";
import { ProjectsCollection } from "../api/ProjectsCollection";
import { TasksCollection } from "../api/TasksCollection";

/* -------------------- Project Card -------------------- */
const ProjectCard = ({ project, taskCount, onClick }) => (
  <div
    className="project-card"
    onClick={onClick}
    style={{ cursor: "pointer" }}
  >
    <h3>{project.name}</h3>
    <span className="task-count">{taskCount} tasks</span>
  </div>
);

/* -------------------- Modal -------------------- */
const ProjectModal = ({ project, tasks, onClose }) => (
  <div className="modal-overlay" onClick={onClose}>
    <div className="modal" onClick={(e) => e.stopPropagation()}>
      <h3>{project.name} Tasks</h3>

      <ul>
        {tasks.map((task) => (
          <li key={task._id}>{task.text}</li>
        ))}
      </ul>

      <button className="close-btn" onClick={onClose}>
        Close
      </button>
    </div>
  </div>
);

/* -------------------- Main Component -------------------- */
const ProjectManager = () => {
  const [projectName, setProjectName] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  const { projects, tasks, isLoading } = useTracker(() => {
    const projectsHandle = Meteor.subscribe("projects");
    const tasksHandle = Meteor.subscribe("tasks");

    return {
      isLoading: !projectsHandle.ready() || !tasksHandle.ready(),
      projects: ProjectsCollection.find().fetch(),
      tasks: TasksCollection.find().fetch(),
    };
  });

  /* Memoized Task Grouping */
  const tasksByProject = useMemo(() => {
    return tasks.reduce((acc, task) => {
      if (!acc[task.projectId]) acc[task.projectId] = [];
      acc[task.projectId].push(task);
      return acc;
    }, {});
  }, [tasks]);

  const selectedProject = projects.find(
    (project) => project._id === selectedProjectId
  );

  const createProject = () => {
    if (!projectName.trim()) return;

    Meteor.call("projects.insert", projectName, (err) => {
      if (err) alert(err.reason);
      else setProjectName("");
    });
  };

  if (isLoading) return <p>Loading...</p>;

  return (
    <div className="project-manager">
      <h2 className="project-title">📁 Projects (React)</h2>

      <div className="project-create">
        <input
          className="project-input"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          placeholder="New Project Name"
        />
        <button className="project-btn" onClick={createProject}>
          Create
        </button>
      </div>

      <div className="project-grid">
        {projects.map((project) => (
          <ProjectCard
            key={project._id}
            project={project}
            taskCount={tasksByProject[project._id]?.length || 0}
            onClick={() => setSelectedProjectId(project._id)}
          />
        ))}
      </div>

      {selectedProject && (
        <ProjectModal
          project={selectedProject}
          tasks={tasksByProject[selectedProject._id] || []}
          onClose={() => setSelectedProjectId(null)}
        />
      )}
    </div>
  );
};

export default ProjectManager;
