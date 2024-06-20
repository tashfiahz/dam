import React from 'react';
import styles from './homepage.module.css'; // Import styles for HomePage component
import logo from './penguin.png'; 

function HomePage() {
  console.log('Rendering HomePage component');
  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <img src={logo} alt="Logo" className={styles.logo} style={{ width: '50px', height: '50px' }} />
        <h1 className={styles.title}>DAM.IO</h1>
        <div className={styles.filterSection}>
          <h2>Filters</h2>
          <label htmlFor="photo">
            <input type="checkbox" id="photo" name="photo" />
            Photo
          </label>
          <label htmlFor="video">
            <input type="checkbox" id="video" name="video" />
            Video
          </label>
        </div>
      </div>
      <div className={styles.content}>
        {/* Content goes here */}
      </div>
    </div>
  );
}

export default HomePage;
