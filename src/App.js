import React, { useState } from 'react';
import SimpleForm from './UI/SimpleForm';
import RawBirthDataComponent from './UI/RawBirthDataComponent';
import TabbedBigFourMenu from './UI/TabbedBigFourComponent';
import Emphemeris from './UI/Ephemeris';
import useStore from './Utilities/store'; // Import the store

import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');

  // Replace 'your_hardcoded_password' with the password you want to use
  const PASSWORD = process.env.REACT_APP_PASSWORD || 'your_hardcoded_password';

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === PASSWORD) {
      setIsAuthenticated(true);
    } else {
      alert('Incorrect Password');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="App">
        <header className="App-header">
          StelliumAI
        </header>
        <form onSubmit={handleSubmit}>
          <input 
            type="password" 
            value={password} 
            onChange={handlePasswordChange} 
            placeholder="Enter password" 
          />
          <button type="submit">Login</button>
        </form>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="App-header">
        StelliumAI
      </header>
      <SimpleForm />
      <Emphemeris />
      <RawBirthDataComponent />  
      <TabbedBigFourMenu />
    </div>
  );
}

export default App;
