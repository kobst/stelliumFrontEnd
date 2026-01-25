import React from 'react';
import './AnalysisQuotaCard.css';

/**
 * Card showing monthly analysis quota status
 */
function AnalysisQuotaCard({
  remaining = 0,
  banked = 0,
  resetDate = null,
  isPlus = false,
  compact = false,
  onUpgradeClick,
}) {
  const total = remaining + banked;
  const formatResetDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (!isPlus) {
    return (
      <div className={`analysis-quota-card analysis-quota-card--free ${compact ? 'analysis-quota-card--compact' : ''}`}>
        <div className="analysis-quota-card__header">
          <svg
            className="analysis-quota-card__icon"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4l2 2" />
          </svg>
          <span className="analysis-quota-card__title">Monthly Analyses</span>
        </div>
        <p className="analysis-quota-card__upgrade-text">
          Upgrade to Plus to get 2 analyses per month
        </p>
        {onUpgradeClick && (
          <button className="analysis-quota-card__upgrade-btn" onClick={onUpgradeClick}>
            Upgrade to Plus
          </button>
        )}
      </div>
    );
  }

  const isEmpty = total === 0;
  const isLow = total === 1;

  return (
    <div className={`analysis-quota-card ${compact ? 'analysis-quota-card--compact' : ''}`}>
      <div className="analysis-quota-card__header">
        <svg
          className="analysis-quota-card__icon"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4l2 2" />
        </svg>
        <span className="analysis-quota-card__title">Monthly Analyses</span>
      </div>

      <div className={`analysis-quota-card__count ${isLow ? 'analysis-quota-card__count--low' : ''} ${isEmpty ? 'analysis-quota-card__count--empty' : ''}`}>
        <span className="analysis-quota-card__number">{total}</span>
        <span className="analysis-quota-card__available">available</span>
      </div>

      {!compact && (
        <div className="analysis-quota-card__breakdown">
          <div className="analysis-quota-card__breakdown-item">
            <span className="analysis-quota-card__breakdown-label">This month:</span>
            <span className="analysis-quota-card__breakdown-value">{remaining}</span>
          </div>
          {banked > 0 && (
            <div className="analysis-quota-card__breakdown-item">
              <span className="analysis-quota-card__breakdown-label">Banked:</span>
              <span className="analysis-quota-card__breakdown-value">{banked}</span>
            </div>
          )}
        </div>
      )}

      {!compact && resetDate && (
        <div className="analysis-quota-card__reset">
          Resets {formatResetDate(resetDate)}
        </div>
      )}

      {!compact && (
        <p className="analysis-quota-card__note">
          Use on birth charts or relationships. Unused analyses roll over!
        </p>
      )}
    </div>
  );
}

export default AnalysisQuotaCard;
