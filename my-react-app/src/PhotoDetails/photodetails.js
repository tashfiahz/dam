import React, { useState, useEffect } from 'react';
import styles from './photodetails.module.css'; 
import { Link } from 'react-router-dom';
import logo from '../penguin.png';

function PhotoDetails({ filetype }) {  // Accept `filetype` as a prop
  const [selectedTags, setSelectedTags] = useState([]);
  const [inputTag, setInputTag] = useState('');
  const [description, setDescription] = useState('');
  const [wordCount, setWordCount] = useState(0);

  const handleTagClick = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
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

  const handleInputChange = (e) => {
    setInputTag(e.target.value);
  };

  const handleDescriptionChange = (event) => {
    const text = event.target.value;
    const words = text.split(/\s+/).filter(Boolean).length;
    setDescription(text);
    setWordCount(words);
  };

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
        <div className={styles.imageContainer}>
          <img src="https://via.placeholder.com/300x200" alt="Main" className={styles.mainImage} />
        </div>
        <div className={styles.mainContainer}>
          <div className={styles.detailsContainer}>
            <div className={styles.title}>
              <label>Title:</label>
              <input type="text" className={styles.titleInput} />
            </div>

            {/* Media Type Section */}
            <div className={styles.type}>
              <label htmlFor="mediaType">Type:</label>
              <input
                type="text"
                id="mediaType"
                className={styles.typeInput}
                value={filetype === 'photo' ? 'Photo' : 'Video'}
                readOnly
              />
            </div>

            {/* Project Section */}
            <div className={styles.projects}>
              <label htmlFor="project">Project:</label>
              <select id="project" className={styles.dropdown}>
                {/* Dynamically populate options from your project list */}
                <option value="project1">Project 1</option>
                <option value="testingProject">Testing Project</option>
                <option value="tashProject">Tash Project</option>
              </select>
            </div>

            <div className={styles.tags}>
              <label>Select Tags:</label>
              <div className={styles.tagsBox}>
                <input
                  type="text"
                  value={inputTag}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  className={styles.tagInput}
                  placeholder="Type and press Enter"
                />
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
                <img src="https://via.placeholder.com/150" alt="Similar 1" />
                <img src="https://via.placeholder.com/150" alt="Similar 2" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PhotoDetails;
