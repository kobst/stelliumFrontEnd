import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LockedContent.css';

/**
 * Reusable component for displaying locked premium content.
 * Shows what's inside, why it's valuable, and how to unlock.
 */
function LockedContent({
  title,
  description,
  features = [],
  ctaText = 'Upgrade to Plus',
  variant = 'default', // 'default' | 'compact'
  onUpgradeClick,
}) {
  const navigate = useNavigate();

  const handleUpgrade = () => {
    if (onUpgradeClick) {
      onUpgradeClick();
    } else {
      navigate('/pricingTable');
    }
  };

  return (
    <div className={`locked-content locked-content--${variant}`}>
      <div className="locked-content__icon">
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      </div>

      <h3 className="locked-content__title">{title}</h3>

      {description && (
        <p className="locked-content__description">{description}</p>
      )}

      {features.length > 0 && (
        <div className="locked-content__features">
          <p className="locked-content__features-label">Includes:</p>
          <ul className="locked-content__features-list">
            {features.map((feature, index) => (
              <li key={index} className="locked-content__feature-item">
                <span className="locked-content__feature-check">&#10003;</span>
                {feature}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="locked-content__actions">
        <button
          className="locked-content__cta-button"
          onClick={handleUpgrade}
        >
          {ctaText}
        </button>
      </div>
    </div>
  );
}

export default LockedContent;
