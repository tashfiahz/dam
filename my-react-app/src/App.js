import React from 'react';
import { Link } from 'react-router-dom';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <Link to="/homepage" className="title">DAM.IO</Link>
      </header>
    </div>
  );
}

export default App;
