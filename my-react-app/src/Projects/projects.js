import React from 'react';
import { Link } from 'react-router-dom';
import styles from './projects.module.css';
import logo from './penguin.png'; // Ensure this file path is correct

const Projects = ({ username }) => {
  const [projects, setProjects] = React.useState([]);

  const handleCreateProject = async () => {
    const projectname = prompt('Enter new project name:');
    if (projectname) {
      try {
        await fetch('http://localhost:3501/create-project', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, project: projectname }),
        });
        setProjects((prevProjects) => [...prevProjects, projectname]);
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleDeleteProject = async (projectname) => {
    try {
      await fetch('http://localhost:3501/delete-project', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, project: projectname }),
      });
      setProjects((prevProjects) => prevProjects.filter((project) => project !== projectname));
    } catch (error) {
      console.error(error);
    }
  };

  const handleRenameProject = async (oldProjectName) => {
    const newProjectName = prompt('Enter new project name:');
    if (newProjectName) {
      try {
        await fetch('http://localhost:3501/rename-project', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, project: oldProjectName, newProject: newProjectName }),
        });
        setProjects((prevProjects) =>
          prevProjects.map((project) => (project === oldProjectName ? newProjectName : project))
        );
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <div className={styles.container}>
    <div className={styles.container}>
      <div className={styles.sidebar}>
      <Link to="/homepage">
      <img src={logo} alt='Logo' className={styles.homePageLogo} style={{ width: '50px', height: '50px' }} />
          <h1 className={styles.homePagetitle}>DAM.IO</h1>
        </Link>
        <Link to='/Projects' className={styles.projectsTab}>Projects</Link>
      </div>
      <div className={styles.mainContent}>
        {projects.length > 0 ? (
          <div className={styles.tableContainer}>
            <table>
              <thead>
                <tr>
                  <th className={styles.projectNameColumn}>Project Name</th>
                  <th className={styles.actionColumn}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => (
                  <tr key={project}>
                    <td>{project}</td>
                    <td>
                      <button onClick={() => handleRenameProject(project)}>Rename</button>
                      <button onClick={() => handleDeleteProject(project)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button className={styles.createProjectButton} onClick={handleCreateProject}>
              + Create Project
            </button>
          </div>
        ) : (
          <div className={styles.noProjects}>
            <p>No projects, click Create Project to get started</p>
            <button className={styles.createProjectButtonCenter} onClick={handleCreateProject}>
              + Create Project
            </button>
          </div>
        )}
      </div>
    </div>
    </div>
  );
};

export default Projects;
