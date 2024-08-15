import React, { useEffect, useState } from 'react';
import { signOut } from "supertokens-auth-react/recipe/session";
import { useNavigate, Link } from 'react-router-dom';
import styles from './homepage.module.css';
import logo from './penguin.png';
import EnterModal from './enterModal';
import signOutIcon from "./signout.png";

function HomePage() {
  const [username, setUsername] = useState(null);
  const [userId, setUserId] = useState(null);
  const [projects, setProjects] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [currentProject, setCurrentProject] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [searchType, setSearchType] = useState('name');

  const navigate = useNavigate();

  const getUserName = async () => {
    try {
      const response = await fetch('https://dambackend.onrender.com/get_user_info', {
        method: 'GET'
      });
      const data = await response.json();
      if (data.emails && data.emails.length > 0) {
        const email = data.emails[0];
        const user = email.split('@')[0];
        setUsername(user.toLowerCase());
        return user;
      }
    } catch (error) {
      console.error(error);
    }
  };

  const getUserId = async () => {
    try {
      const response = await fetch('https://dambackend.onrender.com/get_user_info', {
        method: 'GET'
      });
      const data = await response.json();
      if (data.id) {
        const id = data.id;
        setUserId(id);
        return id;
      }
    } catch (error) {
      console.error(error);
    }
  };

  const checkBucket = async (user) => {
    try {
      await fetch('https://dambackend.onrender.com/check-bucket', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user }),
      });
    } catch (error) {
      console.error(error);
    }
  };

  const getProjects = async (user) => {
    try {
      const response = await fetch('https://dambackend.onrender.com/retrieve-projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user }),
      });
      const data = await response.json();
      setProjects(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const handleFirstLogin = async () => {
      const user = await getUserName();
      const id = await getUserId();
      if (id) {
        await checkBucket(id);
        await getProjects(id);
      }
    };
    handleFirstLogin();
  }, []);


  const onLogOut = async () => {
    await signOut();
    window.location.href = "/auth";
  }

  const handleCreateProject = () => {
    setModalType('create');
    setModalOpen(true);
  };

  const handleRenameProject = (projectname) => {
    setCurrentProject(projectname);
    setModalType('rename');
    setModalOpen(true);
  };


  const handleDeleteProject = async (projectname) => {
    try {
      await fetch('http://dambackend.onrender.com/delete-project', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, project: projectname }),
      });
      setProjects((prevProjects) => prevProjects.filter((project) => project !== projectname));
    } catch (error) {
      console.error(error);
    }
  };

  const handleProjectClick = (projectname) => {
    navigate(`/${projectname}`);
  };

  const handleSearchClick = () => {
    navigate(`/search/${searchType}/${searchInput}`);
  };

  const handleSearchEnter = (e) => {
    if (e.key === 'Enter') {
      navigate(`/search/${searchType}/${searchInput}`);
    }
  };

  const handleModalSubmit = async (projectName) => {
    if (modalType === 'create') {
      try {
        await fetch('https://dambackend.onrender.com/create-project', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId, project: projectName }),
        });
        setProjects((prevProjects) => [...prevProjects, projectName]);
      } catch (error) {
        console.error(error);
      }
    } else if (modalType === 'rename') {
      try {
        await fetch('https://dambackend.onrender.com/rename-project', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId, project: currentProject, newproject: projectName }),
        });
        setProjects((prevProjects) =>
          prevProjects.map((project) => (project === currentProject ? projectName : project))
        );
      } catch (error) {
        console.error(error);
      }
    }
    setModalOpen(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <img src={logo} alt="Logo" className={styles.homePageLogo} style={{ width: '50px', height: '50px' }} />
        <h1 className={styles.homePagetitle}>DAM.IO</h1>
      </div>
      <div className={styles.mainContent}>
        <div className={styles.header}>
          <div className={styles.searchBar}>
            <select
              className={styles.searchTypeDropdown}
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              style={{ marginRight: '8px' }}
            >
              <option value="name">Project Name</option>
              <option value="tag">Tag</option>
            </select>
            <input
              type="text"
              placeholder="Search..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleSearchEnter}
            />
            <button className={styles.searchButton} onClick={handleSearchClick}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                <path d="M21.7 20.3l-4.5-4.5c1-1.3 1.6-3 1.6-4.8 0-4.4-3.6-8-8-8s-8 3.6-8 8 3.6 8 8 8c1.8 0 3.5-0.6 4.8-1.6l4.5 4.5c0.2 0.2 0.5 0.3 0.7 0.3s0.5-0.1 0.7-0.3c0.4-0.4 0.4-1 0-1.4zM9.9 16.1c-3.3 0-6-2.7-6-6s2.7-6 6-6 6 2.7 6 6-2.7 6-6 6z" />
              </svg>
            </button>
          </div>
        </div>
        <div className={styles.signOutContainer}>
              <li className={styles.signOut} onClick={onLogOut}>
                <img src={signOutIcon} alt="Sign Out" />
                Sign Out
              </li>
            </div>
        <div className={styles.content}>
          <div style={{ textAlign: 'center' }}>
            {username ? <h1>Welcome to {username}'s DAM</h1> : <h1>Loading...</h1>}
          </div>
          {projects.length > 0 ? (
            <>
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
                        <td onClick={() => handleProjectClick(project)}>{project}</td>
                        <td>
                          <button onClick={() => handleRenameProject(project)} style={{ padding: '6px' }}>Rename</button>
                          <button onClick={() => handleDeleteProject(project)} style={{ backgroundColor: '#8860D0', opacity: 0.6, color: 'white', border: 'none', padding: '6px', borderRadius: '5px', cursor: 'pointer' }}>
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button className={styles.createProjectButton} onClick={handleCreateProject}> + Create Project</button>
            </>
          ) : (
            <div className={styles.noProjects}>
              <p>No projects, click Create Project to get started</p>
              <button className={styles.createProjectButtonCenter} onClick={handleCreateProject}> + Create Project</button>
            </div>
          )}
        </div>
      </div>

      <EnterModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleModalSubmit}
        initialProjectName={modalType === 'rename' ? currentProject : ''}
      />
    </div>
  );
}

export default HomePage;
