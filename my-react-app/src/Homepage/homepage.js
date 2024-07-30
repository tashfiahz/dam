import React, { useEffect, useState } from 'react';
import { signOut } from "supertokens-auth-react/recipe/session";
import styles from './homepage.module.css';
import logo from './penguin.png';
import UploadModal from './uploadModal'; // Import the UploadModal component

function HomePage() {
  /*
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  */
  const [username, setUsername] = useState(null);
  const [projects, setProjects] = useState([]);

  //GET USERNAME, PASS IT DOWN TO ANY COMPONENTS THAT MAKE REQUESTS TO THE BACKEND
  const getUserName = async () => {
    try {
      const response = await fetch('http://localhost:3501/get_username', {
        method: 'GET'
      });
      const data = await response.json();
      if (data.emails && data.emails.length > 0) {
        const email = data.emails[0];
        const user = email.split('@')[0];
        setUsername(user);
        return user;
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
        body: JSON.stringify({ username: user }),
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
        body: JSON.stringify({ username: user }),
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
      if (user) {
        await checkBucket(user);
        await getProjects(user);
      }
    };
    handleFirstLogin();
  }, [])

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
          body: JSON.stringify({ username, project: projectname }),
        });
        setProjects((prevprojects) => [...prevprojects, projectname]);
      } catch (error) {
        console.error(error);
      }
    }
  }

  const handleDeleteProject = async (projectname) => {
    try {
      await fetch('http://localhost:3501/delete-project', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, project: projectname }),
      });
      setProjects((prevprojects) => prevprojects.filter((project) => project !== projectname));
    } catch (error) {
      console.error(error);
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
          body: JSON.stringify({ username, project: oldprojectname, newproject: newprojectname}),
        });
        setProjects((prevprojects) => prevprojects.map((project) => (project === oldprojectname ? newprojectname : project)));
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleSearch = () => {
    // Perform search functionality here
    console.log('Searching...');
  };

  /*
  const openModal = () => {
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const handleFileDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    handleFile(file);
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    handleFile(file);
  };

  const handleFile = (file) => {
    setSelectedFile(file);
    closeModal(); // Close modal after selecting the file 
    // Handle further processing of the file (e.g., upload to server, display preview, etc.)
    console.log('Selected file:', file);
  };

  const handleUploadButton = () => {
    openModal(); // Open the modal when Upload button is clicked
  };
  */

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <img src={logo} alt="Logo" className={styles.homePageLogo} style={{ width: '50px', height: '50px' }} />
        <h1 className={styles.homePagetitle}>DAM.IO</h1>
        {/*}
          <div className={styles.filterSection}>
            <h2>Media:</h2>
            <label htmlFor="photo">
              <input type="checkbox" id="photo" name="photo" />
              Photo
            </label>
            <label htmlFor="video">
              <input type="checkbox" id="video" name="video" />
              Video
            </label>
          </div>
        */}
      </div>
      <div className={styles.mainContent}>
        <div className={styles.header}>
          <div className={styles.searchBar}>
            <input type="text" placeholder="Search..." />
            <button className={styles.searchButton} onClick={handleSearch}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                <path d="M21.7 20.3l-4.5-4.5c1-1.3 1.6-3 1.6-4.8 0-4.4-3.6-8-8-8s-8 3.6-8 8 3.6 8 8 8c1.8 0 3.5-0.6 4.8-1.6l4.5 4.5c0.2 0.2 0.5 0.3 0.7 0.3s0.5-0.1 0.7-0.3c0.4-0.4 0.4-1 0-1.4zM9.9 16.1c-3.3 0-6-2.7-6-6s2.7-6 6-6 6 2.7 6 6-2.7 6-6 6z"/>
              </svg>
            </button>
          </div>
          <li className={styles.signOut} onClick={onLogOut}>Sign Out</li>
        </div>
      <div className={styles.content}>
        {/*}
        <button className={styles.uploadButton} onClick={handleUploadButton}> + Upload</button>
        */}
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
                    <td>{project}</td>
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
      {/* Upload Modal */}
      {/*}
      {modalOpen && (
        <UploadModal
          closeModal={closeModal}
          handleFileDrop={handleFileDrop}
          handleFileSelect={handleFileSelect}
        />
      )}
      */}
    </div>
  );
}

export default HomePage;
