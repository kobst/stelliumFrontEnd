import React, { useState, useEffect } from 'react';
import './WelcomeBanner.css';

const STORAGE_KEY = 'stellium_welcome_banner_dismissed';

/**
 * Dismissible welcome banner for users in their trial period.
 * Shows "Welcome - your first week includes expanded insights."
 * Dismissal is persisted in localStorage.
 */
function WelcomeBanner({ isTrialActive, trialDaysRemaining }) {
  const [isDismissed, setIsDismissed] = useState(true); // Start hidden to prevent flash

  useEffect(() => {
    // Check localStorage for dismissal
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (dismissed) {
      setIsDismissed(true);
      return;
    }

    // Only show if user is in trial period
    if (isTrialActive) {
      setIsDismissed(false);
    }
  }, [isTrialActive]);

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setIsDismissed(true);
  };

  if (isDismissed || !isTrialActive) {
    return null;
  }

  return (
    <div className="welcome-banner">
      <div className="welcome-banner__content">
        <span className="welcome-banner__icon">&#10024;</span>
        <p className="welcome-banner__text">
          <strong>Welcome</strong> &#8212; your first week includes expanded insights.
          {trialDaysRemaining && (
            <span className="welcome-banner__days">
              {' '}({trialDaysRemaining} day{trialDaysRemaining !== 1 ? 's' : ''} remaining)
            </span>
          )}
        </p>
      </div>
      <button
        className="welcome-banner__dismiss"
        onClick={handleDismiss}
        aria-label="Dismiss banner"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}

export default WelcomeBanner;
