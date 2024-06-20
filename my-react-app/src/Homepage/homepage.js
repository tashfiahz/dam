import React from 'react';
import styles from './homepage.module.css'; // Import styles for HomePage component
import logo from './penguin.png'; 

function HomePage() {
  const handleSearch = () => {
    // Perform search functionality here
    console.log('Searching...');
  };

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
        <div className={styles.centeredContainer}>
          <div className={styles.searchBar}>
            <input type="text" placeholder="Search..." />
            <button className={styles.searchButton} onClick={handleSearch}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                <path d="M21.7 20.3l-4.5-4.5c1-1.3 1.6-3 1.6-4.8 0-4.4-3.6-8-8-8s-8 3.6-8 8 3.6 8 8 8c1.8 0 3.5-0.6 4.8-1.6l4.5 4.5c0.2 0.2 0.5 0.3 0.7 0.3s0.5-0.1 0.7-0.3c0.4-0.4 0.4-1 0-1.4zM9.9 16.1c-3.3 0-6-2.7-6-6s2.7-6 6-6 6 2.7 6 6-2.7 6-6 6z"/>
              </svg>
            </button>
          </div>
        </div>
        {/* Content goes here */}
      </div>
    </div>
  );
}



export default HomePage;
