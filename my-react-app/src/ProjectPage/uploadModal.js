import React, { useState } from 'react';
import styles from './uploadModal.module.css';
import uploadImage from './upload.png';

function UploadModal({ closeModal, userId, projectname }) {
  const [isDraggingOver, setIsDraggingOver] = useState(false); // State to track drag over state
  const [file, setFile] = useState(null);

  const handleFileDrop = (event) => {
    event.preventDefault();
    setIsDraggingOver(false);
    const file = event.dataTransfer.files[0];
    if (file && isValidFile(file)) {
      setFile(file);
    }
    else {
      alert('Please upload a valid photo or video file. Photos can be .jpeg, .png, .svg, or .gif. Videos can be .mp4, .webm, or .ogg.');
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && isValidFile(file)) {
      setFile(file);
    }
    else {
      alert('Please upload a valid photo or video file. Photos can be .jpeg, .png, .svg, or .gif. Videos can be .mp4, .webm, or .ogg.')
    }
  };

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
      alert('Please select a file to upload.');
      return;
    }

    const filetype = file.type.startsWith('image') ? 'photo' : 'video';
    const filename = file.name;

    const fileData = new FormData();
    fileData.append('file', file);
    fileData.append('userId', userId);

    try {
      // Step 1: Upload the file to GCS and get the URL
      const filegcs = await fetch('http://localhost:3501/upload-gcs', {
        method: 'POST',
        body: fileData,
      });

      if (!filegcs.ok) {
        const uploadResult = await filegcs.json();
        alert('File upload failed: ' + uploadResult.message);
        return;
      }

      const { url: fileUrl } = await filegcs.json();

      // Step 2: Collect metadata and send it to MongoDB
      const metadata = {
        userId,
        projectname,
        filetype,
        filename,
        url: fileUrl
      };

      const metadataResponse = await fetch('http://localhost:3501/upload-mongo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(metadata),
      });

      if (metadataResponse.ok) {
        alert('File uploaded successfully.');
        closeModal();
      } 
      else {
        const metadataResult = await metadataResponse.json();
        alert('Failed to store metadata: ' + metadataResult.message);
      }
    } catch (error) {
      console.error('Error uploading file and metadata:', error);
      alert('Upload failed: ' + error.message);
    }
  };

  const handleFileSelectClick = () => {
    document.getElementById('fileInput').click(); // Click the file input element
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
              onClick={handleFileSelectClick} // Open file selection on click
            >
              <img src={uploadImage} alt="Upload Icon" className={styles.uploadIcon} />
              <u>Click here</u> or drag and drop
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
      </div>
    </div>
  );
}

export default UploadModal;
