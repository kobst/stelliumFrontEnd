import React, { useEffect, useCallback } from 'react';
import useEntitlementsStore from '../../Utilities/entitlementsStore';
import { useAuth } from '../../context/AuthContext';
import useCheckout from '../../hooks/useCheckout';
import './InsufficientCreditsModal.css';

const dollars = (cents) => `$${(cents / 100).toFixed(2)}`;

// One-time report prices (cents), mirroring the backend pricingConfig.
const REPORT_PRICE_CENTS = { BIRTH_CHART: 999, RELATIONSHIP: 799 };

/**
 * Paywall modal. Under the legacy credit model it shows the credit-shortfall
 * copy; under simple pricing it reads the backend gate response (`gate`: the
 * 402/429 body with `code` and `options`) and drives upgrade / one-time report
 * purchase directly through Stripe checkout.
 */
function InsufficientCreditsModal({
  isOpen,
  onClose,
  creditsNeeded = 1,
  creditsAvailable = 0,
  onBuyCredits,
  onSubscribe,
  reportType = null,
  // Simple pricing:
  gate = null,
  entityType = null,
  entityId = null,
}) {
  const pricingModel = useEntitlementsStore((state) => state.pricingModel);
  const plan = useEntitlementsStore((state) => state.plan);
  const creditResetDate = useEntitlementsStore((state) => state.credits.resetDate);
  const quotaResetDate = useEntitlementsStore((state) => state.fullReportQuota.resetsAt);
  const isPlusUser = plan === 'PLUS' || plan === 'PREMIUM';
  const resetDate = isPlusUser && reportType ? quotaResetDate : creditResetDate;

  const { stelliumUser } = useAuth();
  const { startSubscription, purchaseReport, isLoading } = useCheckout(stelliumUser);

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

  const Shell = ({ title, description, children }) => (
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
          <h2 className="insufficient-modal__title">{title}</h2>
          <p className="insufficient-modal__description">{description}</p>
        </div>
        <div className="insufficient-modal__actions">{children}</div>
        <button className="insufficient-modal__dismiss" onClick={onClose}>
          Dismiss
        </button>
      </div>
    </div>
  );

  // ---- Simple pricing: render from the backend gate contract, or synthesize
  // one from the entity when the paywall is a client-side pre-check ----
  if (pricingModel === 'simple') {
    const resolvedEntityType =
      entityType || (reportType === 'RELATIONSHIP' ? 'RELATIONSHIP' : reportType === 'BIRTH_CHART' ? 'BIRTH_CHART' : null);

    let code = gate?.code;
    let options = gate?.options;
    if (!code) {
      if (resolvedEntityType) {
        // Report pre-check (AnalysisTab): free users buy, Plus users past quota buy.
        code = isPlusUser ? 'REPORT_QUOTA_EXHAUSTED' : 'PURCHASE_REQUIRED';
        options = {
          upgrade: !isPlusUser,
          purchase: {
            productType: resolvedEntityType === 'RELATIONSHIP' ? 'RELATIONSHIP_REPORT' : 'NATAL_REPORT',
            priceCents: REPORT_PRICE_CENTS[resolvedEntityType],
          },
        };
      } else {
        code = 'UPGRADE_REQUIRED';
        options = {};
      }
    }
    options = options || {};
    const priceCents = options.purchase?.priceCents;

    const upgradeBtn = (variant = 'primary') => (
      <button
        className={`insufficient-modal__btn insufficient-modal__btn--${variant}`}
        onClick={() => startSubscription()}
        disabled={isLoading}
      >
        Upgrade to Plus — $14.99/mo
      </button>
    );

    const buyReportBtn = (variant = 'primary') => (
      <button
        className={`insufficient-modal__btn insufficient-modal__btn--${variant}`}
        onClick={() => purchaseReport(resolvedEntityType, entityId)}
        disabled={isLoading || !resolvedEntityType || !entityId}
      >
        Buy this report{priceCents ? ` — ${dollars(priceCents)}` : ''}
      </button>
    );

    if (code === 'DAILY_LIMIT_REACHED') {
      return (
        <Shell
          title="Daily limit reached"
          description="You've asked 50 questions today — that's the fair-use cap. It resets at midnight UTC."
        />
      );
    }

    if (code === 'FREE_LIMIT_REACHED') {
      return (
        <Shell
          title="You've used your free questions"
          description="Upgrade to Plus for 50 questions a day, daily horoscopes, and 3 full reports every month."
        >
          {upgradeBtn('primary')}
        </Shell>
      );
    }

    if (code === 'PURCHASE_REQUIRED') {
      return (
        <Shell
          title="Unlock this report"
          description={`Buy this full report${priceCents ? ` for a one-time ${dollars(priceCents)}` : ''} — it unlocks permanently and includes 5 chat questions. Or go Plus for 3 reports a month.`}
        >
          {buyReportBtn('primary')}
          {options.upgrade && upgradeBtn('secondary')}
        </Shell>
      );
    }

    if (code === 'REPORT_QUOTA_EXHAUSTED') {
      return (
        <Shell
          title="Included reports used"
          description={`You've used your 3 included reports${resetDate ? ` (they reset ${formatResetDate(resetDate)})` : ''}. Buy this one now${priceCents ? ` for ${dollars(priceCents)}` : ''} — it unlocks permanently.`}
        >
          {buyReportBtn('primary')}
        </Shell>
      );
    }

    // UPGRADE_REQUIRED and any unknown code
    return (
      <Shell
        title="A Plus feature"
        description="This is included with Plus — along with daily horoscopes, custom transit readings, 50 questions a day, and 3 full reports a month."
      >
        {upgradeBtn('primary')}
      </Shell>
    );
  }

  // ---- Legacy credit model (unchanged) ----
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
          <h2 className="insufficient-modal__title">
            {isPlusUser && reportType ? 'Included Reports Used' : 'Not Enough Credits'}
          </h2>
          <p className="insufficient-modal__description">
            {isPlusUser && reportType
              ? `Your included report quota is exhausted. This additional ${reportType === 'BIRTH_CHART' ? 'birth-chart' : 'relationship'} report needs ${creditsNeeded} purchased credits; you have ${creditsAvailable}.`
              : `You need ${creditsNeeded} credit${creditsNeeded !== 1 ? 's' : ''} but only have ${creditsAvailable}.`}
          </p>
        </div>

        <div className="insufficient-modal__actions">
          {!isPlusUser && (
            <button className="insufficient-modal__btn insufficient-modal__btn--primary" onClick={onSubscribe}>
              Upgrade to Plus (3 reports/month)
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
              Included reports reset {formatResetDate(resetDate)}
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
