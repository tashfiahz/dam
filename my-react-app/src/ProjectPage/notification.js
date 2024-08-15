import React from 'react';
import styles from './notification.module.css';

function Notifications({ message, onClose }) {
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.notificationModal}>
        <p>{message}</p>
        <button className={styles.modalCloseButton} onClick={onClose}>Ok</button>
      </div>
    </div>
  );
}

export default Notifications;