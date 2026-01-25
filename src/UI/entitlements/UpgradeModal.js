import React, { useEffect, useCallback } from 'react';
import './UpgradeModal.css';

/**
 * Modal component for Plus subscription CTA with optional one-time purchase
 */
function UpgradeModal({
  isOpen,
  onClose,
  onSubscribe,
  onPurchase,
  isLoading = false,
  title = 'Upgrade to Plus',
  description,
  purchaseOption = null, // { label, price, description }
  subscriptionPrice = 20,
  features = [
    'Daily horoscope access',
    '2 analyses per month (rollover allowed)',
    '10 questions per month',
    '40% off all purchases',
  ],
}) {
  // Handle escape key
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape' && !isLoading) {
        onClose();
      }
    },
    [onClose, isLoading]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !isLoading) {
      onClose();
    }
  };

  return (
    <div className="upgrade-modal__backdrop" onClick={handleBackdropClick}>
      <div className="upgrade-modal" role="dialog" aria-modal="true" aria-labelledby="upgrade-modal-title">
        <button
          className="upgrade-modal__close"
          onClick={onClose}
          disabled={isLoading}
          aria-label="Close modal"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="upgrade-modal__header">
          <div className="upgrade-modal__icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </div>
          <h2 id="upgrade-modal-title" className="upgrade-modal__title">{title}</h2>
          {description && <p className="upgrade-modal__description">{description}</p>}
        </div>

        <div className="upgrade-modal__content">
          {/* Subscription Option */}
          <div className="upgrade-modal__option upgrade-modal__option--primary">
            <div className="upgrade-modal__option-badge">RECOMMENDED</div>
            <h3 className="upgrade-modal__option-title">Plus Subscription</h3>
            <div className="upgrade-modal__option-price">
              <span className="upgrade-modal__price-amount">${subscriptionPrice}</span>
              <span className="upgrade-modal__price-period">/month</span>
            </div>
            <ul className="upgrade-modal__features">
              {features.map((feature, index) => (
                <li key={index} className="upgrade-modal__feature">
                  <span className="upgrade-modal__feature-check">&#10003;</span>
                  {feature}
                </li>
              ))}
            </ul>
            <button
              className="upgrade-modal__button upgrade-modal__button--primary"
              onClick={onSubscribe}
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : 'Subscribe Now'}
            </button>
          </div>

          {/* One-time Purchase Option (if available) */}
          {purchaseOption && (
            <div className="upgrade-modal__option upgrade-modal__option--secondary">
              <h3 className="upgrade-modal__option-title">{purchaseOption.label}</h3>
              <div className="upgrade-modal__option-price">
                <span className="upgrade-modal__price-amount">${purchaseOption.price}</span>
                <span className="upgrade-modal__price-period">one-time</span>
              </div>
              {purchaseOption.description && (
                <p className="upgrade-modal__option-description">{purchaseOption.description}</p>
              )}
              <button
                className="upgrade-modal__button upgrade-modal__button--secondary"
                onClick={onPurchase}
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : 'Purchase'}
              </button>
            </div>
          )}
        </div>

        <p className="upgrade-modal__footer">
          Cancel anytime. Secure checkout powered by Stripe.
        </p>
      </div>
    </div>
  );
}

export default UpgradeModal;
