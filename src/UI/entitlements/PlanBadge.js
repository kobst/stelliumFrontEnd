import React from 'react';
import './PlanBadge.css';

/**
 * Badge component showing user's subscription tier
 * @param {string} tier - The subscription tier ('free' | 'plus' | 'premium' | 'pro')
 * @param {boolean} compact - Use compact styling
 * @param {function} onClick - Optional click handler
 */
function PlanBadge({ tier = 'free', compact = false, onClick }) {
  let normalizedTier = tier?.toLowerCase() || 'free';

  // Normalize "premium" to "plus" for display consistency
  if (normalizedTier === 'premium') {
    normalizedTier = 'plus';
  }

  const tierConfig = {
    free: {
      label: 'FREE',
      className: 'plan-badge--free',
    },
    plus: {
      label: 'PLUS',
      className: 'plan-badge--plus',
    },
    pro: {
      label: 'PRO',
      className: 'plan-badge--pro',
    },
  };

  const config = tierConfig[normalizedTier] || tierConfig.free;

  return (
    <span
      className={`plan-badge ${config.className} ${compact ? 'plan-badge--compact' : ''} ${onClick ? 'plan-badge--clickable' : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {config.label}
    </span>
  );
}

export default PlanBadge;
