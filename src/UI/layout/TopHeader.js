import React, { useState, useRef, useEffect } from 'react';
import PlanBadge from '../entitlements/PlanBadge';
import CreditsIndicator from '../entitlements/CreditsIndicator';
import useEntitlementsStore from '../../Utilities/entitlementsStore';
import './TopHeader.css';

const NAV_ITEMS = [
  { id: 'horoscope', label: 'Home' },
  { id: 'birth-charts', label: 'My Birth Chart' },
  { id: 'relationships', label: 'My Relationships' }
];

function TopHeader({ user, onMenuToggle, currentSection, onNavClick, onLogout }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [creditsPopoverOpen, setCreditsPopoverOpen] = useState(false);
  const dropdownRef = useRef(null);
  const creditsPopoverRef = useRef(null);
  const credits = useEntitlementsStore((state) => state.credits);

  // Get user's subscription tier
  const getUserPlan = () => {
    const plan = user?.subscription?.tier || 'free';
    return plan.toLowerCase();
  };

  const getPlanDisplay = () => {
    const plan = getUserPlan();
    switch (plan) {
      case 'premium':
      case 'plus':
        return 'Plus Member';
      case 'pro':
        return 'Pro Member';
      default:
        return 'Free Member';
    }
  };

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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (creditsPopoverRef.current && !creditsPopoverRef.current.contains(event.target)) {
        setCreditsPopoverOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavClick = (sectionId) => {
    if (onNavClick) {
      onNavClick(sectionId);
    }
  };

  const toggleDropdown = () => {
    setDropdownOpen(prev => !prev);
  };

  const handleSettingsClick = () => {
    setDropdownOpen(false);
    if (onNavClick) {
      onNavClick('settings');
    }
  };

  const handleSignOut = () => {
    setDropdownOpen(false);
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <header className="top-header">
      <div className="top-header__left">
        {/* Mobile menu toggle */}
        <button
          className="top-header__menu-toggle"
          onClick={onMenuToggle}
          aria-label="Toggle navigation menu"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        {/* Branding */}
        <span className="top-header__branding">STELLIUM</span>
      </div>

      {/* Center Navigation */}
      <nav className="top-header__nav">
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            className={`top-header__nav-item ${currentSection === item.id ? 'top-header__nav-item--active' : ''}`}
            onClick={() => handleNavClick(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {/* Right section - Credits + Profile */}
      <div className="top-header__right">
        {/* Credit balance pill */}
        <div className="top-header__credits-wrapper" ref={creditsPopoverRef}>
          <button
            className={`top-header__credits ${
              credits.total === 0 ? 'top-header__credits--empty' :
              credits.monthlyLimit > 0 && credits.total <= credits.monthlyLimit * 0.25 ? 'top-header__credits--low' :
              credits.total <= 20 ? 'top-header__credits--low' : ''
            }`}
            onClick={() => setCreditsPopoverOpen((prev) => !prev)}
            aria-label="View credits"
            title="Click to view credit details"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
            <span className="top-header__credits-count">{credits.total}</span>
          </button>

          {creditsPopoverOpen && (
            <div className="top-header__credits-popover">
              <CreditsIndicator
                total={credits.total}
                monthly={credits.monthly}
                pack={credits.pack}
                monthlyLimit={credits.monthlyLimit}
                resetDate={credits.resetDate}
                onBuyMore={() => {
                  setCreditsPopoverOpen(false);
                  if (onNavClick) onNavClick('settings:subscription');
                }}
              />
            </div>
          )}
        </div>

        <div className="top-header__profile-section" ref={dropdownRef}>
        <div className="top-header__profile" onClick={toggleDropdown}>
          <div className="top-header__profile-info">
            <span className="top-header__username">{getFullName()}</span>
            <PlanBadge tier={getUserPlan()} compact />
          </div>
          <div className="top-header__avatar">
            {user?.profilePhotoUrl ? (
              <img src={user.profilePhotoUrl} alt={getFullName()} />
            ) : (
              <span className="top-header__avatar-initials">{getInitials()}</span>
            )}
          </div>
        </div>

        {dropdownOpen && (
          <div className="top-header__dropdown">
            <button className="top-header__dropdown-item" onClick={handleSettingsClick}>
              Settings
            </button>
            <button className="top-header__dropdown-item top-header__dropdown-item--signout" onClick={handleSignOut}>
              Sign Out
            </button>
          </div>
        )}
        </div>
      </div>
    </header>
  );
}

export default TopHeader;
