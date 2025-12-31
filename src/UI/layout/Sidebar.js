import React from 'react';
import NavItem from './NavItem';
import './Sidebar.css';

const PRIMARY_NAV_ITEMS = [
  { id: 'horoscope', label: 'Horoscope' },
  { id: 'birth-charts', label: 'Birth Charts' },
  { id: 'relationships', label: 'Relationships' }
];

const SECONDARY_NAV_ITEMS = [
  { id: 'ask-stellium', label: 'Ask Stellium' },
  { id: 'settings', label: 'Settings' }
];

function Sidebar({ user, currentSection, onNavClick, isOpen, onClose, onLogout }) {
  // Get user's initials for avatar placeholder
  const getInitials = () => {
    if (!user) return '?';
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  // Get full name
  const getFullName = () => {
    if (!user) return 'User';
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    return `${firstName} ${lastName}`.trim() || 'User';
  };

  // Get sun sign if available
  const getSunSign = () => {
    if (!user?.birthChart?.planets) return null;
    const sun = user.birthChart.planets.find(p => p.name === 'Sun');
    return sun?.sign || null;
  };

  const sunSign = getSunSign();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="sidebar-overlay"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside className={`sidebar ${isOpen ? 'sidebar--open' : ''}`}>
        {/* Profile Section */}
        <div className="sidebar__profile">
          <div className="sidebar__avatar">
            {user?.profilePhotoUrl ? (
              <img src={user.profilePhotoUrl} alt={getFullName()} />
            ) : (
              <span className="sidebar__avatar-initials">{getInitials()}</span>
            )}
          </div>
          <h2 className="sidebar__username">{getFullName()}</h2>
          {sunSign && (
            <span className="sidebar__sun-sign">{sunSign} Sun</span>
          )}
        </div>

        {/* Primary Navigation */}
        <nav className="sidebar__nav sidebar__nav--primary" aria-label="Primary navigation">
          {PRIMARY_NAV_ITEMS.map(item => (
            <NavItem
              key={item.id}
              id={item.id}
              label={item.label}
              isActive={currentSection === item.id}
              onClick={onNavClick}
              variant="primary"
            />
          ))}
        </nav>

        {/* Divider */}
        <div className="sidebar__divider" />

        {/* Secondary Navigation */}
        <nav className="sidebar__nav sidebar__nav--secondary" aria-label="Secondary navigation">
          {SECONDARY_NAV_ITEMS.map(item => (
            <NavItem
              key={item.id}
              id={item.id}
              label={item.label}
              isActive={currentSection === item.id}
              onClick={onNavClick}
              variant="secondary"
            />
          ))}
        </nav>

        {/* Logout Button */}
        <div className="sidebar__footer">
          <button className="sidebar__logout" onClick={onLogout}>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span>Log out</span>
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
