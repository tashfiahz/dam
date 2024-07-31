import React from 'react';
import { Link } from 'react-router-dom';
import styles from './landingpage.module.css'; // Create this CSS file for landing page specific styles

function LandingPage() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleContainer}>
          <div className={styles.circle}></div>
          <Link to="/homepage" className={styles.title}>DAM.IO</Link>
        </div>
      </header>
    </div>
  );
}

export default LandingPage;