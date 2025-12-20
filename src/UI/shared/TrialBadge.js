import React from 'react';
import './TrialBadge.css';

/**
 * Badge component for trial-unlocked content.
 * Shows during the 7-day trial period.
 */
function TrialBadge({
  text = 'Unlocked for your first 7 days',
  variant = 'default' // 'default' | 'small'
}) {
  return (
    <span className={`trial-badge trial-badge--${variant}`}>
      <span className="trial-badge__icon">&#10024;</span>
      {text}
    </span>
  );
}

export default TrialBadge;
