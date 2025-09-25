import React from 'react';
import { NavLink } from 'react-router-dom';
import './NavBar.css';

function NavBar() {
  return (
    <nav className="navbar">
      <ul>
        <li><NavLink to="/">Home</NavLink></li>
        <li><NavLink to="/pricingTable">Pricing</NavLink></li>
      </ul>
    </nav>
  );
}

export default NavBar;
