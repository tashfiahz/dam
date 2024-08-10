import React, { useState } from 'react';
import styles from './uploadModal.module.css';
import uploadImage from './upload.png';

function UploadModal({ closeModal, handleFileDrop, handleFileSelect }) {
  const [uploadStage, setUploadStage] = useState(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isDraggingOver, setIsDraggingOver] = useState(false); // State to track drag over state
  const [uploadMediaType, setUploadMediaType] = useState(''); // New state for the drop-down
  const [file, setFile] = useState(null);

  const handleFileDropEvent = (e) => {
    e.preventDefault();
    setIsDraggingOver(false);
    handleFileDrop(e);
    //  setFile(e.dataTransfer.files[0]); // Set the file state when a file is dropped
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDraggingOver(false);
  };

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
  };

  const handleNext = () => {
    setUploadStage(2);
  };

  const handleUpload = async () => {
    console.log(`Title: ${title}, Description: ${description}, Media Type: ${uploadMediaType}`);
    if (!file) {
      alert('Please select a file to upload.');
      return;
    }

    const fileData = new FormData();
    fileData.append('file', file);

    try {
      const filegcs = await fetch('http://localhost:3500/upload-gcs', {
        method: 'POST',
        body: fileData,
      });

      if (!filegcs.ok) {
        const uploadResult = await filegcs.json();
        alert('File upload failed: ' + uploadResult.message);
        return;
      }

      const { url: fileUrl } = await filegcs.json();

      const metadata = {
        tag: title,
        type: uploadMediaType,
        description: description,
        url: fileUrl,
      };

      const metadataResponse = await fetch('http://localhost:3500/upload-metadata', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(metadata),
      });

      if (metadataResponse.ok) {
        alert('File and metadata uploaded successfully.');
        closeModal();
      } else {
        const metadataResult = await metadataResponse.json();
        alert('Failed to store metadata: ' + metadataResult.message);
      }
    } catch (error) {
      console.error('Error uploading file and metadata:', error);
      alert('Upload failed: ' + error.message);
    }


  };

  const handleBack = () => {
    setUploadStage(1);
  };

  const handleFileSelectClick = () => {
    document.getElementById('fileInput').click(); // Click the file input element
  };

  const handleFileInputChange = (e) => {
    //setFile(e.target.files[0]);
    handleFileSelect(e);
  };

  const handleUploadMediaTypeChange = (e) => setUploadMediaType(e.target.value);

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.uploadModal}>
        <div className={styles.modalHeader}>
          <h2>Upload Assets</h2>
          <button className={styles.modalCloseButton} onClick={closeModal}>X</button>
        </div>
        <div className={styles.modalContent}>
          {uploadStage === 1 && (
            <div className={styles.initialStage}>
              <div
                className={`${styles.dropArea} ${isDraggingOver ? styles.dragFileChange : ''}`}
                onDrop={handleFileDropEvent}
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
                  onChange={handleFileInputChange}
                />
              </div>
              <button className={`${styles.modalNextButton} ${styles.lightBlueButton}`} onClick={handleNext}>Next Step</button>
            </div>
          )}
          {uploadStage === 2 && (
            <div className={styles.uploadStage}>
              <input
                type="text"
                placeholder="Enter title..."
                value={title}
                onChange={handleTitleChange}
                className={styles.titleInput}
              />
              <select
                value={uploadMediaType}
                onChange={handleUploadMediaTypeChange}
                className={styles.uploadMediaTypeSelect}
              >
                <option value="">Select media type...</option>
                <option value="cake">cake</option>
                <option value="penguin">penguin</option>
                <option value="waterfall">waterfall</option>
                <option value="school">school</option>
                <option value="finances">finances</option>
                <option value="meme">meme</option>
              </select>

              <textarea
                placeholder="Enter description..."
                value={description}
                onChange={handleDescriptionChange}
                className={styles.descriptionTextarea}
              />
             
             <button className={`${styles.modalUploadButton} ${styles.lightBlueButton}`} onClick={handleUpload}>Upload</button> 
             <button className={`${styles.modalBackButton} ${styles.lightBlueButton} ${styles.backButton}`} onClick={handleBack}>&#8249;</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UploadModal;