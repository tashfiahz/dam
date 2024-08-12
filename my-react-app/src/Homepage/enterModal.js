import React, { useState } from 'react';
import styles from './enterModal.module.css'; 

const EnterModal = ({ isOpen, onClose, onSubmit, initialProjectName }) => {
  const [projectName, setProjectName] = useState(initialProjectName || '');

  const handleSubmit = () => {
    if (projectName.trim()) {
      onSubmit(projectName);
      setProjectName('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <h2>{initialProjectName ? 'Rename Project' : 'Create New Project'}</h2>
        <input
          type="text"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          placeholder="Enter project name"
        />
        <button onClick={handleSubmit}>Submit</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
};

export default EnterModal;
