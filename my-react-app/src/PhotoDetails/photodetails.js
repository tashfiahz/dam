import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import styles from './photodetails.module.css';
import { Link } from 'react-router-dom';
import logo from '../Homepage/penguin.png';

function PhotoDetails() {
  const navigate = useNavigate();
  const { projectname, name } = useParams();
  const [userId, setUserId] = useState(null);
  const [newName, setNewName] = useState(name);
  const [newProject, setNewProject] = useState(projectname);
  const [projects, setProjects] = useState([]);
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [wordCount, setWordCount] = useState(description.split(' ').length);
  const [selectedTags, setSelectedTags] = useState([]);
  const [inputTag, setInputTag] = useState('');
  const [similarPhotos, setSimilarPhotos] = useState([]);

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
  }

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
  }

  const getMediaFile = async (user, name, projectname) => {
    try {
      const response = await fetch('https://dambackend.onrender.com/retrieve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user, name, projectname }),
      });
      const data = await response.json();
      if (data[0]) {
        setUrl(data[0].url);
        setDescription(data[0].description);
        setSelectedTags(data[0].tags);
      }
      return data[0].url;
    } catch (error) {
      console.error(error);
    }
  }

  const getSimilarPhotos = async (url) => {
    try {
      const response = await fetch('https://dambackend.onrender.com/image_search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });
      const data = await response.json();
      setSimilarPhotos(data);
    } catch (error) {
      console.error(error);
    }
  }

  const updateMedia = async () => {
    try {
      const response = await fetch('https://dambackend.onrender.com/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          userId,
          oldName: name,
          oldProject: projectname,
          project: newProject,
          description,
          name: newName,
          tags: selectedTags
        }),
      });
      const data = await response.json();
      console.log(data);
      navigate(`/${projectname}`);
    } catch (error) {
      console.error(error);
    }
  }

  const deleteMedia = async () => {
    const confirm = window.confirm('Are you sure you want to delete this media?');
    if (confirm) {
      try {
        const response = await fetch('https://dambackend.onrender.com/remove', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            userId,
            project: projectname,
            name
          }),
        });
        const data = await response.json();
        console.log(data);
        navigate(`/${projectname}`);
      } catch (error) {
        console.error(error);
      }
    }
  }

  const handleTagClick = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleInputChange = (e) => {
    setInputTag(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && inputTag.trim() !== '') {
      e.preventDefault();
      const newTag = inputTag.trim();
      if (!selectedTags.includes(newTag)) {
        setSelectedTags([...selectedTags, newTag]);
      }
      setInputTag('');
    } else if (e.key === 'Backspace' && inputTag === '') {
      e.preventDefault();
      if (selectedTags.length > 0) {
        setSelectedTags(selectedTags.slice(0, -1));
      }
    }
  };

  const handleDescriptionChange = (event) => {
    const text = event.target.value;
    const words = text.split(/\s+/).filter(Boolean).length;
    setDescription(text);
    setWordCount(words);
  };

  useEffect(() => {
    const handleFirstRender = async () => {
      try {
        const id = await getUserId();
        if (id) {
          await getProjects(id);
        }
        if (id && name && projectname) {
          const link = await getMediaFile(id, name, projectname);
          setWordCount(description.split(" ").length);
          await getSimilarPhotos(link);
        }
      } catch (error) {
        console.error(error);
      }
    }
    handleFirstRender();
  }, [name, projectname]);

  useEffect(() => {
    if (wordCount > 400) {
      const truncatedText = description.split(/\s+/).slice(0, 400).join(' ');
      setDescription(truncatedText);
      setWordCount(400);
    }
  }, [description, wordCount]);

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <Link to="/homepage">
          <img src={logo} alt="Logo" className={styles.homePageLogo} />
        </Link>
        <Link to="/homepage" className={styles.titleLink}>
          <h1 className={styles.homePagetitle}>DAM.IO</h1>
        </Link>
      </div>
      <div className={styles.content}>
        <div className={styles.imageWithMetadata}>
          <div className={styles.imageContainer}>
            <img src={url} alt="Main" className={styles.mainImage} />
          </div>
          <div className={styles.detailsContainer}>
            <div className={styles.title}>
              <label>Title:</label>
              <input 
                type="text" 
                className={styles.titleInput}
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
            <div className={styles.type}>
              <span id="mediaType" className={styles.mediaType}>Type: Photo</span>
            </div>
            <div className={styles.projectsw}>
              <label htmlFor="project">Project:  </label>
              <select 
                id="project" 
                className={styles.dropdown}
                value={newProject}
                onChange={(e) => setNewProject(e.target.value)}
              >
                {projects.map((project) => (
                  <option key={project} value={project}>
                    {project}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.tags}>
              <label>Select Tags:</label>
              <div className={styles.tagsContainer}>
                {selectedTags.map(tag => (
                  <button
                    key={tag}
                    className={styles.tagButton}
                    onClick={() => handleTagClick(tag)}
                  >
                    {tag}
                  </button>
                ))}
                <input
                  type="text"
                  value={inputTag}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  className={styles.tagInput}
                  placeholder="Type and press Enter"
                />
              </div>
            </div>
          </div>
        </div>
        <div className={styles.descriptionContainer}>
          <label>Description:</label>
          <textarea
            className={styles.descriptionInput}
            value={description}
            onChange={handleDescriptionChange}
            maxLength="2000" 
            placeholder="Enter description (up to 400 words)"
          />
          <div id="wordCount" className={styles.wordCount}>{wordCount} / 400 words</div>
        </div>
        <div className={styles.similarImagesContainer}>
          <label>Similar Images:</label>
          <div className={styles.similarImages}>
            {similarPhotos.map((photo, index) => (
              <img 
                key={index}
                src={photo.image_url}
                alt={`Similar image ${index + 1}`}
                onClick={() => window.location.href = photo.source_url}
                className={styles.similarImage}
              />
            ))}
          </div>
        </div>
        <div className={styles.buttonGroup}>
          <button className={styles.saveButton} onClick={() => updateMedia()}>Save</button>
          <button className={styles.deleteButton} onClick={() => deleteMedia()}>Delete</button>
        </div>
      </div>
    </div>
  );
}

export default PhotoDetails;
