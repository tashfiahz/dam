import React, { useState } from 'react';
import styles from './photodetails.module.css';
import { Link } from 'react-router-dom';
import logo from '../penguin.png';

function PhotoDetails() {
  const [selectedTags, setSelectedTags] = useState([]);
  const tags = ["Cake", "Cats", "Penguins", "Dogs", "Falls", "Tech"];

  const handleTagClick = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

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
        <div className={styles.detailsContainer}>
          <div className={styles.row}>
            <label>Title:</label>
            <input type="text" className={styles.titleInput} />
          </div>
          <div className={styles.row}>
            <label>Type:</label>
            <button className={styles.typeButton}>Photo</button>
          </div>
          <div className={styles.row}>
            <label>Project:</label>
            <button className={styles.projectButton}>Project 1</button>
          </div>
          <div className={styles.row}>
            <label>Select Tags:</label>
            <div className={styles.tagsContainer}>
              {tags.map(tag => (
                <button
                  key={tag}
                  className={`${styles.tagButton} ${selectedTags.includes(tag) ? styles.selectedTag : ''}`}
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
          <textarea className={styles.descriptionInput}></textarea>
        </div>
        <div className={styles.similarImagesContainer}>
          <label>Similar Images:</label>
          <div className={styles.similarImages}>
            <img src="https://via.placeholder.com/150" alt="Similar 1" />
            <img src="https://via.placeholder.com/150" alt="Similar 2" />
          </div>
          <button className={styles.selectButton}>Select</button>
        </div>
        <button className={styles.saveButton}>Save</button>
      </div>
    </div>
  );
}

export default PhotoDetails;
