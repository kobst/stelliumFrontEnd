import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './DashboardHeader.css';

function DashboardHeader({ user }) {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  // Get user's subscription tier
  const getUserPlan = () => {
    // Subscription data is in user.subscription.tier
    const plan = user?.subscription?.tier || 'free';
    return plan.toLowerCase();
  };

  const getPlanDisplay = () => {
    const plan = getUserPlan();
    switch (plan) {
      case 'premium':
      case 'plus':
        return { label: 'Plus', className: 'plan-premium' };
      case 'pro':
        return { label: 'Pro', className: 'plan-pro' };
      default:
        return { label: 'Free', className: 'plan-free' };
    }
  };

  const isPaidPlan = () => {
    const plan = getUserPlan();
    return plan === 'plus' || plan === 'premium' || plan === 'pro';
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

  // Get sun sign if available
  const getSunSign = () => {
    if (!user?.birthChart?.planets) return null;
    const sun = user.birthChart.planets.find(p => p.name === 'Sun');
    return sun?.sign || null;
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const handleSettingsClick = () => {
    // Placeholder for settings modal
    console.log('Settings clicked - to be implemented');
  };

  const handleUpgradeClick = () => {
    navigate('/pricingTable');
  };

  const handleManageClick = () => {
    // Placeholder for subscription management
    console.log('Manage subscription clicked - to be implemented');
  };

  const planInfo = getPlanDisplay();

  const sunSign = getSunSign();

  return (
    <header className="dashboard-header">
      <div className="dashboard-header-left">
        <button className="logout-button" onClick={handleLogout}>
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
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          <span>Log out</span>
        </button>
      </div>

      <div className="dashboard-header-center">
        <div className="user-info">
          <div className="user-avatar">
            {user?.profilePhotoUrl ? (
              <img src={user.profilePhotoUrl} alt={getFullName()} />
            ) : (
              <span className="user-initials">{getInitials()}</span>
            )}
          </div>
          <div className="user-details">
            <h1 className="user-name">{getFullName()}</h1>
            {sunSign && (
              <span className="user-sign">{sunSign} Sun</span>
            )}
          </div>
        </div>
      </div>

      <div className="dashboard-header-right">
        <div className="plan-status">
          <span className={`plan-pill ${planInfo.className}`}>
            {planInfo.label}
          </span>
          {isPaidPlan() ? (
            <button className="plan-action-button manage" onClick={handleManageClick}>
              Manage
            </button>
          ) : (
            <button className="plan-action-button upgrade" onClick={handleUpgradeClick}>
              Upgrade
            </button>
          )}
        </div>
        <button className="settings-button" onClick={handleSettingsClick}>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
          </svg>
        </button>
      </div>
    </header>
  );
}

export default DashboardHeader;
