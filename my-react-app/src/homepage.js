import React from 'react';
import styles from './homepage.css';

function HomePage() {
  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <h2>Filters</h2>
        <label htmlFor="photo">Photo</label>
        <input type="checkbox" id="photo" name="photo" />
        <label htmlFor="video">Video</label>
        <input type="checkbox" id="video" name="video" />
      </div>
      <div className={styles.content}>
        <h1>Welcome to the Filter Selection Page</h1>
        <p>Use the sidebar to select filters.</p>
      </div>
    </div>
  );
}

export default HomePage;
