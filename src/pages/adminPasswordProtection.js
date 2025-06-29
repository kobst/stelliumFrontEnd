import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './passwordProtection.css';

const AdminPasswordProtection = ({ children }) => {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // Check if already authenticated as admin in session storage
  useEffect(() => {
    const authenticated = sessionStorage.getItem('isAdminAuthenticated') === 'true';
    setIsAdminAuthenticated(authenticated);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (password === (process.env.REACT_APP_ADMIN_PASSWORD || 'admin')) {
      setIsAdminAuthenticated(true);
      sessionStorage.setItem('isAdminAuthenticated', 'true');
      setError('');
    } else {
      setError('Incorrect admin password');
      setPassword('');
    }
  };

  if (!isAdminAuthenticated) {
    return (
      <div className="password-protection">
        <div className="password-container">
          <h2>Admin Access Required</h2>
          <p>Please enter the admin password to continue</p>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="admin-password">Admin Password:</label>
              <input
                type="password"
                id="admin-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
              />
            </div>
            {error && <div className="error-message">{error}</div>}
            <button type="submit">Enter Admin Area</button>
          </form>
          <button 
            className="back-button" 
            onClick={() => navigate('/')}
            style={{ marginTop: '1rem' }}
          >
            Back to Main Site
          </button>
        </div>
      </div>
    );
  }

  return children;
};

export default AdminPasswordProtection;