import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import styles from './App.module.css'; // Import the styles for App component
import HomePage from './Homepage/homepage'; // Import the component for your homepage

function App() {
  return (
    <Router>
      <div className={styles.App}>
        <header className={styles['App-header']}>
          <div className={styles['title-container']}>
            <div className={styles.circle}></div>
            <Link to="/homepage" className={styles.title}>DAM.IO</Link>
          </div>
        </header>
        <Routes>
          <Route path="/homepage" element={<HomePage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
