import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function ComingSoonPage() {
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === process.env.REACT_APP_PASSWORD) {
      localStorage.setItem('isAuthenticated', 'true');
      navigate('/prototype');
    } else {
      alert('Incorrect Password');
    }
  };


  return (
    <div>
      <h1>Coming Soon</h1>
      <p>Our website is under construction. Please check back later.</p>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          value={password}
          onChange={handlePasswordChange}
          placeholder="Enter password"
        />
        <button type="submit">Access Prototype</button>
      </form>
    </div>
  );
}

export default ComingSoonPage;