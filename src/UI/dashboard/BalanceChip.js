import React, { useEffect, useRef, useState } from 'react';
import { CREDIT_COSTS } from '../../Utilities/creditCosts';

const GoldDiamond = ({ size = 10 }) => (
  <svg width={size} height={size} viewBox="0 0 11 11" aria-hidden="true">
    <path d="M5.5 0.5 L10.5 5.5 L5.5 10.5 L0.5 5.5 Z" fill="#e9c349" />
  </svg>
);

/**
 * Plan-aware balance chip + popover for the dashboard top nav.
 *
 * The chip's headline number is always the universal spendable credit balance.
 * The popover carries the plan/quota nuance:
 *  - Subscribed (Plus): plan badge + "X of N reports left" meter, then purchased credits.
 *  - Not subscribed (Free): no reports meter; credits balance + an upgrade prompt.
 *
 * @param {object} props
 * @param {object} props.entitlements - resolved entitlements (isPlus, plan, fullReportQuota, credits)
 * @param {object} props.credits - live credits from the entitlements store ({ total, pack, ... })
 * @param {() => void} props.onManage - open subscription management
 * @param {() => void} props.onBuyCredits - open the buy-credits flow
 */
function BalanceChip({ entitlements, credits, onManage, onBuyCredits }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const handleClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    const handleKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  const isPlus = !!entitlements?.isPlus;
  const pack = credits?.pack ?? entitlements?.credits?.pack ?? 0;
  const total = credits?.total ?? entitlements?.credits?.total ?? 0;
  // Spendable balance: Plus spends purchased (pack) credits; Free spends its full balance.
  const creditBalance = isPlus ? pack : total;

  const quota = entitlements?.fullReportQuota || {};
  const reportsLimit = quota.limit || (isPlus ? 3 : 0);
  const reportsRemaining = quota.remaining ?? 0;
  const meterPct = reportsLimit > 0
    ? Math.max(0, Math.min(100, (reportsRemaining / reportsLimit) * 100))
    : 0;

  const handleManage = () => {
    setOpen(false);
    onManage?.();
  };
  const handleBuy = () => {
    setOpen(false);
    onBuyCredits?.();
  };

  return (
    <div className="md-balance-wrap" ref={wrapRef}>
      <button
        type="button"
        className="md-balance-chip"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <GoldDiamond />
        <span className="md-balance-chip__num">{creditBalance}</span>
        <span className="md-balance-chip__lbl">credits</span>
        <span className="md-balance-chip__chev">▾</span>
      </button>

      <div className={`md-balance-pop${open ? ' open' : ''}`} role="menu">
        <div className="md-pop-thread" />
        <div className="md-pop-body">
          <div className="md-pop-row">
            <span className="md-pop-plan">
              <span className="md-pop-plan-label">Your plan</span>
              <span className="md-pop-plan-badge">{isPlus ? 'PLUS' : 'FREE'}</span>
            </span>
            <button type="button" className="md-pop-manage" onClick={handleManage}>
              {isPlus ? 'Manage' : 'Upgrade'}
            </button>
          </div>

          <div className="md-pop-divider" />

          {isPlus ? (
            <div className="md-pop-metric">
              <div className="md-pop-metric-top">
                <span className="md-pop-label">Included reports</span>
                <span className="md-pop-val md-pop-val--reports">
                  {reportsRemaining} of {reportsLimit} left
                </span>
              </div>
              <div className="md-pop-meter">
                <div className="md-pop-meter__fill" style={{ width: `${meterPct}%` }} />
              </div>
              <div className="md-pop-sub">Resets next billing period · natal or relationship</div>
            </div>
          ) : (
            <div className="md-pop-upsell">
              <div className="md-pop-upsell__text">
                Unlock 3 included reports each billing period with Plus.
              </div>
              <button type="button" className="md-pop-upgrade" onClick={handleManage}>
                Upgrade to Plus
              </button>
            </div>
          )}

          <div className="md-pop-divider" />

          <div className="md-pop-metric">
            <div className="md-pop-metric-top">
              <span className="md-pop-label">{isPlus ? 'Purchased credits' : 'Credits'}</span>
              <span className="md-pop-val md-pop-val--credits">{creditBalance}</span>
            </div>
            <div className="md-pop-sub">
              {isPlus
                ? 'Never expire · used for extra reports & Ask Stellium'
                : 'Used for reports & Ask Stellium'}
            </div>
            <div className="md-pop-costs">
              <div className="md-pop-cost-row">
                Natal report <span className="md-pop-cost-row__c">{CREDIT_COSTS.FULL_NATAL} credits</span>
              </div>
              <div className="md-pop-cost-row">
                Relationship report <span className="md-pop-cost-row__c">{CREDIT_COSTS.FULL_RELATIONSHIP} credits</span>
              </div>
              <div className="md-pop-cost-row">
                Ask Stellium <span className="md-pop-cost-row__c">
                  {CREDIT_COSTS.ASK_STELLIUM} {CREDIT_COSTS.ASK_STELLIUM === 1 ? 'credit' : 'credits'}
                </span>
              </div>
            </div>
          </div>

          <button type="button" className="md-pop-buy" onClick={handleBuy}>
            Buy credits
          </button>
        </div>
      </div>
    </div>
  );
}

export default BalanceChip;
