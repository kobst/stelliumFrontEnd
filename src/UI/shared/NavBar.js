import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useEnvironment } from '../../contexts/EnvironmentContext';
import './NavBar.css';

function NavBar() {
  const location = useLocation();
  const { currentEnvironment, isProduction } = useEnvironment();
  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <nav className="navbar">
      <ul>
        <li><NavLink to="/">Home</NavLink></li>
        <li><NavLink to="/pricingTable">Pricing</NavLink></li>
        <li><NavLink to="/admin">Admin</NavLink></li>
      </ul>
      {isAdminPage && (
        <div className={`environment-badge ${currentEnvironment}`}>
          <span className="env-indicator">
            {isProduction() ? '🔴 PROD' : '🟡 DEV'}
          </span>
        </div>
      )}
    </nav>
  );
}

export default NavBar;
