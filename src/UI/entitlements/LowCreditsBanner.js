import React, { useState } from 'react';
import './LowCreditsBanner.css';

function LowCreditsBanner({ credits, onGetMore }) {
  const [dismissed, setDismissed] = useState(false);

  const total = credits?.total ?? 0;
  const monthlyLimit = credits?.monthlyLimit ?? 0;
  const resetDate = credits?.resetDate;

  // Show when credits <= 25% of monthly limit (and limit is > 0)
  const threshold = monthlyLimit > 0 ? monthlyLimit * 0.25 : 20;
  const shouldShow = total > 0 && total <= threshold && !dismissed;

  // Also check sessionStorage for dismissal
  const sessionKey = 'lowCreditsBannerDismissed';
  if (typeof window !== 'undefined' && sessionStorage.getItem(sessionKey)) {
    return null;
  }

  if (!shouldShow) return null;

  const formatResetDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem(sessionKey, 'true');
  };

  return (
    <div className="low-credits-banner">
      <div className="low-credits-banner__icon">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
      </div>
      <div className="low-credits-banner__text">
        <span className="low-credits-banner__message">
          Running low on credits — You have {total} credit{total !== 1 ? 's' : ''} remaining.
        </span>
        {resetDate && (
          <span className="low-credits-banner__reset">
            Monthly credits refill {formatResetDate(resetDate)}.
          </span>
        )}
      </div>
      <div className="low-credits-banner__actions">
        <button className="low-credits-banner__cta" onClick={onGetMore}>
          Get More Credits
        </button>
        <button className="low-credits-banner__dismiss" onClick={handleDismiss}>
          Dismiss
        </button>
      </div>
    </div>
  );
}

export default LowCreditsBanner;
