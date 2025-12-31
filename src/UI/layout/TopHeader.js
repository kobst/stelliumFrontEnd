import React from 'react';
import { useNavigate } from 'react-router-dom';
import './TopHeader.css';

function TopHeader({ user, onMenuToggle }) {
  const navigate = useNavigate();

  // Get user's subscription tier
  const getUserPlan = () => {
    const plan = user?.subscription?.tier || 'free';
    return plan.toLowerCase();
  };

  const getPlanDisplay = () => {
    const plan = getUserPlan();
    switch (plan) {
      case 'premium':
        return { label: 'Premium', className: 'plan-premium' };
      case 'pro':
        return { label: 'Pro', className: 'plan-pro' };
      default:
        return { label: 'Free', className: 'plan-free' };
    }
  };

  const isPaidPlan = () => {
    const plan = getUserPlan();
    return plan === 'premium' || plan === 'pro';
  };

  const handleUpgradeClick = () => {
    navigate('/pricingTable');
  };

  const handleManageClick = () => {
    // Placeholder for subscription management
    console.log('Manage subscription clicked - to be implemented');
  };

  const planInfo = getPlanDisplay();

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
        <span className="top-header__branding">Stellium</span>
      </div>

      <div className="top-header__right">
        <div className="top-header__plan-status">
          <span className={`top-header__plan-pill ${planInfo.className}`}>
            {planInfo.label}
          </span>
          {isPaidPlan() ? (
            <button
              className="top-header__action-button top-header__action-button--manage"
              onClick={handleManageClick}
            >
              Manage
            </button>
          ) : (
            <button
              className="top-header__action-button top-header__action-button--upgrade"
              onClick={handleUpgradeClick}
            >
              Upgrade
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

export default TopHeader;
