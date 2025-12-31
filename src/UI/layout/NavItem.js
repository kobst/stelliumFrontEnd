import React from 'react';
import './NavItem.css';

function NavItem({ id, label, icon, isActive, onClick, variant = 'primary' }) {
  const handleClick = () => {
    if (onClick) {
      onClick(id);
    }
  };

  return (
    <button
      className={`nav-item nav-item--${variant} ${isActive ? 'nav-item--active' : ''}`}
      onClick={handleClick}
      aria-current={isActive ? 'page' : undefined}
    >
      {icon && <span className="nav-item__icon">{icon}</span>}
      <span className="nav-item__label">{label}</span>
    </button>
  );
}

export default NavItem;
