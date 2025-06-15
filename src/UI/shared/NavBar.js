import React from 'react';
import { NavLink } from 'react-router-dom';
import './NavBar.css';

function NavBar() {
  return (
    <nav className="navbar">
      <ul>
        <li><NavLink to="/">Home</NavLink></li>
        <li><NavLink to="/admin">Admin</NavLink></li>
        <li><NavLink to="/synastry">Synastry</NavLink></li>
        <li><NavLink to="/compositeDashboard">Composite</NavLink></li>
        <li><NavLink to="/signUpConfirmation">Confirmation</NavLink></li>
      </ul>
    </nav>
  );
}

export default NavBar;
