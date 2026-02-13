import React, { useEffect, useCallback } from 'react';
import useEntitlementsStore from '../../Utilities/entitlementsStore';
import './InsufficientCreditsModal.css';

function InsufficientCreditsModal({
  isOpen,
  onClose,
  creditsNeeded = 1,
  creditsAvailable = 0,
  onBuyCredits,
  onSubscribe,
}) {
  const plan = useEntitlementsStore((state) => state.plan);
  const resetDate = useEntitlementsStore((state) => state.credits.resetDate);
  const isPlusUser = plan === 'PLUS' || plan === 'PREMIUM';

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const formatResetDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="insufficient-modal__backdrop" onClick={handleBackdropClick}>
      <div className="insufficient-modal" role="dialog" aria-modal="true">
        <button className="insufficient-modal__close" onClick={onClose} aria-label="Close">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="insufficient-modal__header">
          <div className="insufficient-modal__icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          <h2 className="insufficient-modal__title">Not Enough Credits</h2>
          <p className="insufficient-modal__description">
            You need {creditsNeeded} credit{creditsNeeded !== 1 ? 's' : ''} but only have {creditsAvailable}.
          </p>
        </div>

        <div className="insufficient-modal__actions">
          {!isPlusUser && (
            <button className="insufficient-modal__btn insufficient-modal__btn--primary" onClick={onSubscribe}>
              Upgrade to Plus (200 credits/mo)
            </button>
          )}
          <button
            className={`insufficient-modal__btn ${isPlusUser ? 'insufficient-modal__btn--primary' : 'insufficient-modal__btn--secondary'}`}
            onClick={onBuyCredits}
          >
            Buy 100 Credits ($10)
          </button>
          {isPlusUser && resetDate && (
            <p className="insufficient-modal__reset-info">
              Monthly credits refill {formatResetDate(resetDate)}
            </p>
          )}
        </div>

        <button className="insufficient-modal__dismiss" onClick={onClose}>
          Dismiss
        </button>
      </div>
    </div>
  );
}

export default InsufficientCreditsModal;
