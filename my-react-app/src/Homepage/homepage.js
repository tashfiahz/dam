import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signOut } from "supertokens-auth-react/recipe/session";
import styles from './homepage.module.css';
import logo from './penguin.png';

function HomePage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState(null);
  const [userId, setUserId] = useState(null);
  const [projects, setProjects] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [searchType, setSearchType] = useState('name');

  //GET USERNAME FOR DISPLAY
  const getUserName = async () => {
    try {
      const response = await fetch('http://localhost:3501/get_user_info', {
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
  }

  //GET USERID PASS IT DOWN TO ANY COMPONENTS THAT MAKE REQUESTS TO THE BACKEND
  const getUserId = async () => {
    try {
      const response = await fetch('http://localhost:3501/get_user_info', {
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
  }

  const checkBucket = async (user) => {
    try {
      await fetch('http://localhost:3501/check-bucket', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user }),
      });
    } catch (error) {
      console.error(error)
    }
  };

  const getProjects = async (user) => {
    try {
      const response = await fetch('http://localhost:3501/retrieve-projects', {
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
  }

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
  }, [])

  //From https://supertokens.com/docs/passwordless/pre-built-ui/sign-out
  const onLogOut = async () => {
    await signOut();
    window.location.href = "/auth";
  }

  const handleCreateProject = async () => {
    const projectname = prompt("Enter new project name:");
    if (projectname) {
      try {
        await fetch('http://localhost:3501/create-project', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId, project: projectname }),
        });
        setProjects((prevprojects) => [...prevprojects, projectname]);
      } catch (error) {
        console.error(error);
      }
    }
  }

  const handleDeleteProject = async (projectname) => {
    const confirm = window.confirm('Are you sure you want to delete this project?');
    if (confirm) {
      try {
        await fetch('http://localhost:3501/delete-project', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId, project: projectname }),
        });
        setProjects((prevprojects) => prevprojects.filter((project) => project !== projectname));
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleRenameProject = async (oldprojectname) => {
    const newprojectname = prompt("Enter new project name:");
    if (newprojectname) {
      try {
        await fetch('http://localhost:3501/rename-project', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId, project: oldprojectname, newproject: newprojectname}),
        });
        setProjects((prevprojects) => prevprojects.map((project) => (project === oldprojectname ? newprojectname : project)));
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleProjectClick = (projectname) => {
    navigate(`/${projectname}`);
  }

  const handleSearchClick = () => {
    navigate(`/search/${searchType}/${searchInput}`);
  }

  const handleSearchEnter = (e) => {
    if (e.key === 'Enter') {
      navigate(`/search/${searchType}/${searchInput}`);
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <Link to="/hompage">
          <img src={logo} alt="Logo" className={styles.homePageLogo} style={{ width: '50px', height: '50px' }} />
        </Link>
        <Link to="/homepage">
          <h1 className={styles.homePagetitle}>DAM.IO</h1>
        </Link>
      </div>
      <div className={styles.mainContent}>
        <div className={styles.header}>
          <div className={styles.searchBar}>
            <input 
              type="text" 
              placeholder="Search..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleSearchEnter}
            />
            <button className={styles.searchButton} onClick={handleSearchClick}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                <path d="M21.7 20.3l-4.5-4.5c1-1.3 1.6-3 1.6-4.8 0-4.4-3.6-8-8-8s-8 3.6-8 8 3.6 8 8 8c1.8 0 3.5-0.6 4.8-1.6l4.5 4.5c0.2 0.2 0.5 0.3 0.7 0.3s0.5-0.1 0.7-0.3c0.4-0.4 0.4-1 0-1.4zM9.9 16.1c-3.3 0-6-2.7-6-6s2.7-6 6-6 6 2.7 6 6-2.7 6-6 6z"/>
              </svg>
            </button>
            <select
              className={styles.searchTypeDropdown}
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
            >
              <option value="name">Name</option>
              <option value="tag">Tag</option>
            </select>
          </div>
          <li className={styles.signOut} onClick={onLogOut}>Sign Out</li>
        </div>
      <div className={styles.content}>
        <div>
            {username ? <h1>Hello, {username}</h1> : <h1>Loading...</h1>}
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
                      <button onClick={() => handleRenameProject(project)}>Rename</button>
                      <button onClick={() => handleDeleteProject(project)}>Delete</button>
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
    </div>
  );
}

export default HomePage;
