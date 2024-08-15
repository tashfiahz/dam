import React from 'react';
import styles from './confirmationModal.module.css'; 

function ConfirmationModal({ message, onConfirm, onCancel }) {
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.confirmationModal}>
        <p>{message}</p>
        <div className={styles.modalButtons}>
          <button className={styles.confirmButton} onClick={onConfirm}>Yes</button>
          <button className={styles.cancelButton} onClick={onCancel}>No</button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmationModal;
