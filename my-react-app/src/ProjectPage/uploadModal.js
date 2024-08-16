import React, { useState } from 'react';
import styles from './uploadModal.module.css';
import Notifications from './notification';
import uploadImage from './upload.png';

function UploadModal({ closeModal, userId, projectname }) {
  const [isDraggingOver, setIsDraggingOver] = useState(false); 
  const [file, setFile] = useState(null);
  const [notification, setNotification] = useState(null);

  const handleFileDrop = (event) => {
    event.preventDefault();
    setIsDraggingOver(false);
    const file = event.dataTransfer.files[0];
    if (file && isValidFile(file)) {
      setFile(file);
    } else {
      setNotification('Please upload a valid photo or video file. Photos can be .jpeg, .png, .svg, or .gif. Videos can be .mp4, .webm, or .ogg.');
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && isValidFile(file)) {
      setFile(file);
    } else {
      setNotification('Please upload a valid photo or video file. Photos can be .jpeg, .png, .svg, or .gif. Videos can be .mp4, .webm, or .ogg.');
    }
  };

  //Valid file types from https://www.w3schools.com/tags/tag_video.asp#:~:text=There%20are%20three%20supported%20video,MP4%2C%20WebM%2C%20and%20OGG. and https://www.w3schools.com/html/html_images.asp
  //Get file type from https://www.geeksforgeeks.org/javascript-webapi-file-file-type-property/
  const isValidFile = (file) => {
    const types = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml', 'video/mp4', 'video/webm', 'video/ogg'];
    return types.includes(file.type);
  }

  const handleDragEnter = (e) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDraggingOver(false);
  };

  const handleUpload = async () => {
    if (!file) {
      setNotification('Please select a file to upload.');
      return;
    }

    const filetype = file.type.startsWith('image') ? 'photo' : 'video';
    const filename = file.name;

    const fileData = new FormData();
    fileData.append('file', file);
    fileData.append('userId', userId);

    try {
      const filegcs = await fetch('https://dambackend.onrender.com/upload-gcs', {
        method: 'POST',
        body: fileData,
      });

      if (!filegcs.ok) {
        const uploadResult = await filegcs.json();
        setNotification('File upload failed: ' + uploadResult.message);
        return;
      }

      const { url: fileUrl } = await filegcs.json();

      const metadata = {
        userId,
        projectname,
        filetype,
        filename,
        url: fileUrl
      };

      const metadataResponse = await fetch('https://dambackend.onrender.com/upload-mongo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(metadata),
      });

      if (metadataResponse.ok) {
        setNotification('File uploaded successfully.');
        setTimeout(closeModal, 2000);  
      } else {
        const metadataResult = await metadataResponse.json();
        setNotification('Failed to store metadata: ' + metadataResult.message);
      }
    } catch (error) {
      console.error('Error uploading file and metadata:', error);
      setNotification('Upload failed: ' + error.message);
    }
  };

  const handleFileSelectClick = () => {
    document.getElementById('fileInput').click(); 
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.uploadModal}>
        <div className={styles.modalHeader}>
          <h2>Upload Assets</h2>
          <button className={styles.modalCloseButton} onClick={closeModal}>X</button>
        </div>
        <div className={styles.modalContent}>
          <div className={styles.initialStage}>
            <div
              className={`${styles.dropArea} ${isDraggingOver ? styles.dragFileChange : ''}`}
              onDrop={handleFileDrop}
              onDragOver={handleDragEnter}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onClick={handleFileSelectClick} 
            >
              <img src={uploadImage} alt="Upload Icon" className={styles.uploadIcon} />
              <u>Click here</u> or drag and drop
              <h4 style={{ color: "lightgray", fontSize: "13px" }}>
                Accepted file types for photos are .jpeg, .png, .svg, or .gif. Videos can be .mp4, .webm, or .ogg.
              </h4>
              <input
                id="fileInput"
                type="file"
                style={{ display: 'none' }}
                onChange={handleFileSelect}
              />
            </div>
            {file && (
              <div className={styles.fileInfo}>
                <p><strong>File Name:</strong> {file.name}</p>
                <p><strong>File Type:</strong> {file.type}</p>
                <p><strong>File Size:</strong> {(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            )}
            <button className={`${styles.modalUploadButton} ${styles.lightBlueButton}`} onClick={handleUpload}>Upload</button> 
          </div>
        </div>
        {notification && (
          <Notifications
            message={notification}
            onClose={() => setNotification(null)}
          />
        )}
      </div>
    </div>
  );
}

export default UploadModal;
