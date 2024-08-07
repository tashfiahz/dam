import React, { useState } from 'react';
import styles from './homepage.module.css';
import { Link } from 'react-router-dom';
import logo from './penguin.png';
import UploadModal from './UploadModal/uploadModal'; 

function HomePage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleSearch = () => {
    // Perform search functionality here
    console.log('Searching...');
  };

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
    closeModal(); // Close modal after selecting the file (you can adjust this behavior as needed)
    // Handle further processing of the file 
    console.log('Selected file:', file);
  };

  const handleUploadButton = () => {
    openModal(); // Open the modal when Upload button is clicked
  };

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <img src={logo} alt='Logo' className={styles.homePageLogo} style={{ width: '50px', height: '50px' }} />
        <h1 className={styles.homePagetitle}>
          <Link to="/homepage" className={styles.homePagetitleLink}>DAM.IO</Link>
        </h1>
        <Link to='/Projects' className={styles.projectsTab}>Projects</Link>
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
        <button className={styles.uploadButton} onClick={handleUploadButton}> + Upload</button>
        
        <div className={styles.imageContainer}>
          <Link to='/photodetails'>
            <img src="https://via.placeholder.com/200x100" alt="Main" className={styles.mainImage} />
          </Link>
          <Link to="/videodetails">
            <img src="https://via.placeholder.com/200x100" alt="Test" className={styles.mainImage} style={{ marginTop: '20px' }} />
          </Link>
        </div>

        {/* Upload Modal */}
        {modalOpen && (
          <UploadModal
            closeModal={closeModal}
            handleFileDrop={handleFileDrop}
            handleFileSelect={handleFileSelect}
          />
        )}
      </div>
    </div>
  );
}

export default HomePage;
