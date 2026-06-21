import React from 'react';
import './CreditsIndicator.css';

/**
 * Indicator showing remaining credits count
 */
function CreditsIndicator({
  total = 0,
  monthly = 0,
  pack = 0,
  monthlyLimit = 0,
  resetDate = null,
  compact = false,
  onBuyMore,
  isPlus = false,
}) {
  // Plus no longer has a monthly credit allowance. Any legacy monthly balance
  // returned by the API must not be presented as purchased/non-expiring credit.
  const displayedTotal = isPlus ? pack : total;

  const formatResetDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const isLow = displayedTotal > 0 && displayedTotal <= 20;
  const isEmpty = displayedTotal === 0;

  return (
    <div className={`credits-indicator ${compact ? 'credits-indicator--compact' : ''}`}>
      <div className="credits-indicator__header">
        <svg
          className="credits-indicator__icon"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
        <span className="credits-indicator__label">{isPlus ? 'Purchased Credits' : 'Credits'}</span>
      </div>

      <div className={`credits-indicator__count ${isLow ? 'credits-indicator__count--low' : ''} ${isEmpty ? 'credits-indicator__count--empty' : ''}`}>
        <span className="credits-indicator__number">{displayedTotal}</span>
        <span className="credits-indicator__remaining">remaining</span>
      </div>

      {!isPlus && !compact && monthlyLimit > 0 && (
        <div className="credits-indicator__progress" title="Monthly credit usage">
          <div className="credits-indicator__progress-bar">
            <div
              className={`credits-indicator__progress-fill ${
                monthly / monthlyLimit <= 0.25
                  ? monthly === 0
                    ? 'credits-indicator__progress-fill--empty'
                    : 'credits-indicator__progress-fill--low'
                  : ''
              }`}
              style={{ width: `${Math.min((monthly / monthlyLimit) * 100, 100)}%` }}
            />
          </div>
          <span className="credits-indicator__progress-label">
            Monthly: {monthly} of {monthlyLimit} remaining
          </span>
          {pack > 0 && (
            <span className="credits-indicator__pack-note">
              + {pack} pack credits (never expire)
            </span>
          )}
        </div>
      )}

      {!compact && total > 0 && !isPlus && (
        <div className="credits-indicator__breakdown">
          <span
            className="credits-indicator__breakdown-item"
            title={resetDate ? `Monthly credits used first. Reset on ${formatResetDate(resetDate)}` : 'Monthly credits used first'}
          >
            {monthly} monthly
          </span>
          <span
            className="credits-indicator__breakdown-item"
            title="Pack credits never expire"
          >
            {pack} pack
          </span>
        </div>
      )}

      {!compact && (
        <div className="credits-indicator__info">
          {!isPlus && resetDate && monthly > 0 && (
            <div className="credits-indicator__reset">
              Monthly credits reset {formatResetDate(resetDate)}
            </div>
          )}
          {pack > 0 && (
            <div className="credits-indicator__pack-info">
              Pack credits never expire
            </div>
          )}
        </div>
      )}

      {!compact && (
        <>
        <h5 className="credits-indicator__costs-heading">Credit Costs</h5>
        <div className="credits-indicator__usage-hints">
          <div className="credits-indicator__hint">
            <span className="credits-indicator__hint-label">Birth Chart:</span>
            <span className="credits-indicator__hint-value">75 credits</span>
          </div>
          <div className="credits-indicator__hint">
            <span className="credits-indicator__hint-label">Relationship:</span>
            <span className="credits-indicator__hint-value">60 credits</span>
          </div>
          {!isPlus && (
            <div className="credits-indicator__hint">
              <span className="credits-indicator__hint-label">Ask Question:</span>
              <span className="credits-indicator__hint-value">1 credit</span>
            </div>
          )}
        </div>
        </>
      )}

      {onBuyMore && (
        <button className="credits-indicator__buy-btn" onClick={onBuyMore}>
          {isPlus ? 'Buy Credits' : (isEmpty || isLow ? 'Upgrade Plan' : 'Buy Credits')}
        </button>
      )}
    </div>
  );
}

export default CreditsIndicator;
