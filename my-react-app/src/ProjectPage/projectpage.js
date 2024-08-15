import React, { useEffect, useState } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { signOut } from "supertokens-auth-react/recipe/session";
import styles from './projectpage.module.css';
import logo from './penguin.png';
import UploadModal from './uploadModal'; // Import the UploadModal component
import playbutton from './playbutton.png'

function ProjectPage() {
  const navigate = useNavigate();
  const { projectname } = useParams();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [username, setUsername] = useState(null);
  const [userId, setUserId] = useState(null);
  const [media, setMedia] = useState([]);
  const [filterPhotos, setFilterPhotos] = useState(true);
  const [filterVideos, setFilterVideos] = useState(true);
  const [sortOrder, setSortOrder] = useState('a-z');
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('name');
  const [filteredMedia, setFilteredMedia] = useState([]);

  //GET USERNAME FOR DISPLAY
  const getUserName = async () => {
    try {
      const response = await fetch('http://dambackend.onrender.com/get_user_info', {
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
      const response = await fetch('http://dambackend.onrender.com/get_user_info', {
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

  const getMedia = async (userId, projectname) => {
    try {
      const response = await fetch('http://dambackend.onrender.com/retrieve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, projectname })
      });
      const data = await response.json();
      setMedia(data);
      setFilteredMedia(data);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    const handleFirstRender = async () => {
      const user = await getUserName();
      const id = await getUserId();
      if (id && projectname) {
        await getMedia(id, projectname);
      }
    };
    handleFirstRender();
  }, [])

  useEffect(() => {
    handleSearch();
  }, [filterPhotos, filterVideos, searchQuery, media, sortOrder])

  const onLogOut = async () => {
    await signOut();
    navigate('/auth');
  }

  const handleSearch = () => {
    //can be used for both checkbox filters and search
    const filtered = media.filter(item => {
      //incorporate checked filters in search
      const typeMatch = (filterPhotos && item.type === 'photo') || (filterVideos && item.type === 'video');
      const searchMatch = searchType === 'name' ? item.name.toLowerCase().includes(searchQuery.toLowerCase()) : item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      //if both are true for media, keep it in filtered array
      return typeMatch  && searchMatch;
    });
    setFilteredMedia(filtered);
  };

  const handleSearchClick = () => {
    setSearchQuery(searchInput);
    setSearchInput('');
  }

  const handleSearchEnter = (e) => {
    if (e.key === 'Enter') {
      setSearchQuery(searchInput);
      setSearchInput('');
    }
  }

  const openModal = () => {
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    getMedia(userId, projectname)
  };

  const handleUploadButton = () => {
    openModal(); // Open the modal when Upload button is clicked
  };

  const handlePhotoCheck = () => {
    setFilterPhotos(!filterPhotos);
  }

  const handleVideoCheck = () => {
    setFilterVideos(!filterVideos);
  }

  const handleSortOrder = (e) => {
    setSortOrder(e.target.value);
  }

  const handleProjectClick = () => {
    window.location.reload();
  }

  //Sorting strings from https://stackoverflow.com/questions/52030110/sorting-strings-in-descending-order-in-javascript-most-efficiently
  const sortedMedia = filteredMedia.sort((x, y) => {
    if (sortOrder === 'a-z') {
      return x.name.localeCompare(y.name);
    }
    else {
      return y.name.localeCompare(x.name);
    }
  })

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <Link to="/homepage">
          <img src={logo} alt="Logo" className={styles.homePageLogo} />
        </Link>
        <Link to="/homepage" className={styles.titleLink}>
          <h1 className={styles.homePagetitle}>DAM.IO</h1>
        </Link>
        <div className={styles.filterSection}>
          <h2>Media:</h2>
          <label htmlFor="photo">
            <input type="checkbox" id="photo" name="photo" checked={filterPhotos} onChange={handlePhotoCheck} />
            Photo
          </label>
          <label htmlFor="video">
            <input type="checkbox" id="video" name="video" checked={filterVideos} onChange={handleVideoCheck} />
            Video
          </label>
          <div className={styles.sortSection}>
            <h2>Sort By:</h2>
            <select id="sortOrder" value={sortOrder} onChange={handleSortOrder}>
              <option value="a-z">A-Z</option>
              <option value="z-a">Z-A</option>
            </select>
          </div>
        </div>
      </div>
      <div className={styles.mainContent}>
        <div className={styles.header}>
          <div className={styles.searchBar}>
            <input 
              type="text" 
              placeholder="Search in project..."
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
              <h1 onClick={handleProjectClick}>{projectname}</h1>
          </div>
          {sortedMedia.length > 0 ? (
            <div>
              <div className={styles.mediaGrid}>
                {sortedMedia.map((item, index) => (
                  <div key={index} className={styles.mediaItem} onClick={() => navigate(`/${item.project}/${item.type}/${item.name}`)}>
                    {item.type === 'photo' ? (
                      <div className={styles.thumbnailContainer}> 
                        <img src={item.url} alt={item.name} className={styles.thumbnail} />
                      </div>
                    ) : (
                      <div className={styles.thumbnailContainer}>
                          <img src={playbutton} alt="play button" className={styles.playButton} />
                      </div>
                    )}
                    <p className={styles.mediaName}>{item.name}</p> 
                  </div>
                ))}
              </div>
              <div className={styles.uploadButtonContainer}>
                <button className={styles.uploadButtonRight} onClick={handleUploadButton}> + Upload</button>
              </div>
            </div>
          ) : (
            <div className={styles.emptyMessage}>
              <p>No media, click Upload to get started</p>
              <button className={styles.uploadButton} onClick={handleUploadButton}> + Upload</button>
            </div>
          )}
          {/* Upload Modal */}
          {modalOpen && (
            <UploadModal
              closeModal={closeModal}
              userId={userId}
              projectname={projectname}
            />
          )}
        </div>
      </div>
    </div>
  )};

export default ProjectPage;
