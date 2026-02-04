import React, { useState } from 'react';
import UpgradeModal from '../entitlements/UpgradeModal';
import './LockedContent.css';

/**
 * Reusable component for displaying locked premium content.
 * Shows what's inside, why it's valuable, and how to unlock.
 *
 * Enhanced to support:
 * - Purchase option for one-time buy
 * - Quota usage for Plus members
 * - UpgradeModal integration
 */
function LockedContent({
  title,
  description,
  features = [],
  ctaText = 'Upgrade to Plus',
  variant = 'default', // 'default' | 'compact'
  onUpgradeClick,
  // New props for enhanced functionality
  userId,
  showPurchaseOption = false,
  analysisType, // 'BIRTH_CHART' | 'RELATIONSHIP'
  analysisId,
  purchasePrice,
  showUseQuotaOption = false,
  quotaRemaining = 0,
  onUseQuota,
  onPurchase,
  isPlus = false,
  isLoading = false,
}) {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const handleUpgradeClick = () => {
    if (onUpgradeClick) {
      onUpgradeClick();
    } else {
      setShowUpgradeModal(true);
    }
  };

  const handleUseQuota = async () => {
    if (!onUseQuota) return;

    setActionLoading(true);
    try {
      await onUseQuota(analysisType, analysisId);
    } finally {
      setActionLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!onPurchase) return;

    setActionLoading(true);
    try {
      await onPurchase(analysisType, analysisId);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubscribe = () => {
    // This will be passed from parent with checkout hook
    if (onUpgradeClick) {
      onUpgradeClick();
    }
    setShowUpgradeModal(false);
  };

  const handleModalPurchase = () => {
    handlePurchase();
    setShowUpgradeModal(false);
  };

  const loading = isLoading || actionLoading;

  // Determine credit cost for this analysis type
  const creditCost = (analysisType === 'RELATIONSHIP') ? 60 : 75;

  // Determine which buttons to show (credits-based)
  const canUseCredits = showUseQuotaOption && quotaRemaining >= creditCost;
  const canPurchase = showPurchaseOption && onPurchase;

  return (
    <>
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
          {/* Option 1: Use monthly quota (Plus users with available quota) */}
          {canUseCredits && (
            <button
              className="locked-content__quota-button"
              onClick={handleUseQuota}
              disabled={loading}
            >
              {loading ? 'Unlocking...' : `Use ${creditCost} credits (You have ${quotaRemaining})`}
            </button>
          )}

          {/* Option 2: One-time purchase */}
          {canPurchase && purchasePrice && (
            <button
              className="locked-content__purchase-button"
              onClick={handlePurchase}
              disabled={loading}
            >
              {loading ? 'Processing...' : `Purchase for $${purchasePrice}`}
            </button>
          )}

          {/* Option 3: Upgrade to Plus (default for free users) */}
          {!isPlus && (
            <button
              className="locked-content__cta-button"
              onClick={handleUpgradeClick}
              disabled={loading}
            >
              {ctaText}
            </button>
          )}

          {/* Plus user with no quota - show purchase only */}
          {isPlus && !canUseCredits && !canPurchase && (
            <p className="locked-content__no-quota">
              Not enough credits to unlock.
              {purchasePrice && ` You can purchase this analysis for $${purchasePrice}.`}
            </p>
          )}
        </div>

        {/* Price comparison for free users */}
        {!isPlus && showPurchaseOption && purchasePrice && (
          <div className="locked-content__price-info">
            <span className="locked-content__price-current">
              ${purchasePrice} one-time
            </span>
            <span className="locked-content__price-divider">or</span>
            <span className="locked-content__price-plus">
              Included with Plus ($20/mo)
            </span>
          </div>
        )}
      </div>

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onSubscribe={handleSubscribe}
        onPurchase={canPurchase ? handleModalPurchase : undefined}
        isLoading={loading}
        purchaseOption={
          canPurchase && purchasePrice
            ? {
                label: `Unlock ${analysisType === 'BIRTH_CHART' ? 'Birth Chart' : 'Relationship'} Analysis`,
                price: purchasePrice,
                description: 'One-time purchase for this specific analysis',
              }
            : null
        }
      />
    </>
  );
}

export default LockedContent;
