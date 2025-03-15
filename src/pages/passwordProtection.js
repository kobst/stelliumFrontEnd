import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './passwordProtection.css';

const PasswordProtection = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // Check if already authenticated in session storage
  useEffect(() => {
    const authenticated = sessionStorage.getItem('isAuthenticated') === 'true';
    setIsAuthenticated(authenticated);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (password === process.env.REACT_APP_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem('isAuthenticated', 'true');
      setError('');
    } else {
      setError('Incorrect password');
      setPassword('');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="password-protection">
        <div className="password-container">
          <h2>This site is password protected</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="password">Password:</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
              />
            </div>
            {error && <div className="error-message">{error}</div>}
            <button type="submit">Enter</button>
          </form>
        </div>
      </div>
    );
  }

  return children;
};

export default PasswordProtection;