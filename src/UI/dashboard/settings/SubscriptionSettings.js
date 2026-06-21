import React, { useState } from 'react';
import { useCheckout } from '../../../hooks/useCheckout';
import { CREDIT_COSTS } from '../../../Utilities/creditCosts';
import './SubscriptionSettings.css';

const PACKS = [
  { id: '100', credits: 100, price: '$10', per: '$0.10 / credit' },
  { id: '250', credits: 250, price: '$20', per: '$0.08 / credit', tag: 'Best value' }
];

function SubscriptionSettings({ userId, user, entitlements, onNavigateTab }) {
  const { startSubscription, purchaseCreditPack, openCustomerPortal, isLoading, error } = useCheckout(user);
  const [selectedPack, setSelectedPack] = useState('250');

  const isPlus = !!entitlements?.isPlus;
  const planLabel = (entitlements?.plan || (isPlus ? 'plus' : 'free')).toUpperCase();

  const reportsLimit = entitlements?.fullReportQuota?.limit || (isPlus ? 3 : 0);
  const reportsRemaining = entitlements?.fullReportQuota?.remaining ?? 0;
  const meterPct = reportsLimit > 0
    ? Math.max(0, Math.min(100, (reportsRemaining / reportsLimit) * 100))
    : 0;

  const creditBalance = isPlus
    ? (entitlements?.credits?.pack || 0)
    : (entitlements?.credits?.total || 0);

  const activePack = PACKS.find((p) => p.id === selectedPack) || PACKS[0];
  const askCost = CREDIT_COSTS.ASK_STELLIUM;

  const handleBuy = () => purchaseCreditPack(selectedPack);
  const handleManage = () => openCustomerPortal();
  const handleUpgrade = () => startSubscription();

  return (
    <div className="subscription-settings">
      <div className="settings-section-header">
        <h3 className="settings-section-title">Subscription</h3>
      </div>
      <p className="ss-sub">Manage your plan and see your usage.</p>

      {/* Current plan */}
      <div className="ss-card">
        <div className="ss-plan-row">
          <span className="ss-plan-lbl">Current Plan</span>
          <span className="ss-plan-badge">{planLabel}</span>
        </div>
        {isPlus && entitlements?.planActiveUntil && (
          <p className="ss-plan-until">
            Active until {new Date(entitlements.planActiveUntil).toLocaleDateString('en-US', {
              month: 'long', day: 'numeric', year: 'numeric'
            })}
          </p>
        )}
      </div>

      {/* Included reports (Plus only) */}
      {isPlus && (
        <div className="ss-card ss-card--tonal">
          <div className="ss-card-label">
            <span className="ss-ic ss-ic--lilac">◷</span> Included Reports
          </div>
          <div className="ss-metric">
            <span className={`ss-metric__n ss-metric__n--reports${reportsRemaining === 0 ? ' ss-metric__n--zero' : ''}`}>
              {reportsRemaining}
            </span>
            <span className="ss-metric__unit">of {reportsLimit} reports remaining</span>
          </div>
          <div className="ss-meter"><div className="ss-meter__fill" style={{ width: `${meterPct}%` }} /></div>
          <div className="ss-note">
            Use on birth charts or relationships. Additional reports use purchased credits. Resets next billing period.
          </div>
        </div>
      )}

      {/* Purchased credits + pack picker */}
      <div className="ss-card ss-card--tonal">
        <div className="ss-card-label ss-card-label--gold">
          <span className="ss-ic ss-ic--gold">⚡</span> Purchased Credits
        </div>
        <div className="ss-metric">
          <span className="ss-metric__n ss-metric__n--credits">{creditBalance}</span>
          <span className="ss-metric__unit">remaining</span>
        </div>
        <div className="ss-note">Pack credits never expire.</div>

        <div className="ss-costs">
          <div className="ss-costs__lbl">Credit costs</div>
          <div className="ss-costs__row">
            Birth chart report <span className="ss-costs__c">{CREDIT_COSTS.FULL_NATAL} credits</span>
          </div>
          <div className="ss-costs__row">
            Relationship report <span className="ss-costs__c">{CREDIT_COSTS.FULL_RELATIONSHIP} credits</span>
          </div>
          <div className="ss-costs__row">
            Ask Stellium question <span className="ss-costs__c">{askCost} {askCost === 1 ? 'credit' : 'credits'}</span>
          </div>
        </div>

        <div className="ss-pack-label">Add credits</div>
        <div className="ss-pack-grid">
          {PACKS.map((pack) => (
            <button
              key={pack.id}
              type="button"
              className={`ss-pack${pack.tag ? ' ss-pack--tagged' : ''}${selectedPack === pack.id ? ' ss-pack--active' : ''}`}
              onClick={() => setSelectedPack(pack.id)}
              aria-pressed={selectedPack === pack.id}
            >
              {pack.tag && <span className="ss-pack__tag">{pack.tag}</span>}
              <span className="ss-pack__radio" />
              <div className="ss-pack__credits">{pack.credits}<span className="ss-pack__unit">credits</span></div>
              <div className="ss-pack__price">{pack.price} <span className="ss-pack__per">{pack.per}</span></div>
            </button>
          ))}
        </div>

        <button type="button" className="ss-buy" onClick={handleBuy} disabled={isLoading}>
          {isLoading ? 'Loading…' : `Buy ${activePack.credits} credits — ${activePack.price}`}
        </button>
      </div>

      {error && <div className="ss-error">{error}</div>}

      <div className="ss-links">
        <button
          type="button"
          className="ss-text-link"
          onClick={() => onNavigateTab && onNavigateTab('transactions')}
        >
          View Transaction History →
        </button>
      </div>

      <button
        type="button"
        className="ss-manage"
        onClick={isPlus ? handleManage : handleUpgrade}
        disabled={isLoading}
      >
        {isLoading ? 'Loading…' : (isPlus ? 'Manage Subscription' : 'Upgrade to Plus')}
      </button>
    </div>
  );
}

export default SubscriptionSettings;
