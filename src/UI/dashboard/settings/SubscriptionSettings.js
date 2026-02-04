import React from 'react';
import { PlanBadge, CreditsIndicator } from '../../entitlements';
import { useCheckout } from '../../../hooks/useCheckout';
import './SubscriptionSettings.css';

function SubscriptionSettings({ userId, user, entitlements }) {
  const { startSubscription, purchaseCreditPack, openCustomerPortal, isLoading, error } = useCheckout(user);

  const isPlus = entitlements?.isPlus;
  const isFree = !isPlus;

  const handleUpgrade = async () => {
    await startSubscription();
  };

  const handleManageSubscription = async () => {
    await openCustomerPortal();
  };

  return (
    <div className="subscription-settings">
      <div className="settings-section-header">
        <h3 className="settings-section-title">Subscription</h3>
        <div className="settings-gradient-icon" />
      </div>

      <p className="subscription-settings__description">
        Manage your plan and see your usage.
      </p>

      <div className="subscription-settings__plan">
        <div className="subscription-settings__plan-info">
          <span className="subscription-settings__plan-label">Current Plan</span>
          <PlanBadge tier={entitlements?.plan || 'free'} />
        </div>

        {isPlus && entitlements?.planActiveUntil && (
          <p className="subscription-settings__plan-until">
            Active until {new Date(entitlements.planActiveUntil).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            })}
          </p>
        )}
      </div>

      <div className="subscription-settings__credits">
        <CreditsIndicator
          total={entitlements?.credits?.total || 0}
          monthly={entitlements?.credits?.monthly || 0}
          pack={entitlements?.credits?.pack || 0}
          monthlyLimit={entitlements?.credits?.monthlyLimit || 0}
          resetDate={entitlements?.credits?.resetDate}
          onBuyMore={purchaseCreditPack}
        />
      </div>

      {error && (
        <div className="subscription-settings__error">
          {error}
        </div>
      )}

      <div className="subscription-settings__actions">
        {isFree ? (
          <button
            className="subscription-settings__upgrade-btn"
            onClick={handleUpgrade}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Upgrade to Plus'}
          </button>
        ) : (
          <button
            className="subscription-settings__manage-btn"
            onClick={handleManageSubscription}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Manage Subscription'}
          </button>
        )}
      </div>

      {isFree && (
        <div className="subscription-settings__benefits">
          <h4 className="subscription-settings__benefits-title">Plus includes:</h4>
          <ul className="subscription-settings__benefits-list">
            <li>200 credits per month</li>
            <li>~2 full birth chart analyses (75 credits each)</li>
            <li>~3 relationship analyses (60 credits each)</li>
            <li>Daily horoscope access</li>
            <li>Mix and match credits as you like</li>
          </ul>
          <div className="subscription-settings__credit-pack-promo">
            <p>Need fewer credits? <button onClick={purchaseCreditPack} className="subscription-settings__link-button">Buy 100 credits for $10</button></p>
          </div>
        </div>
      )}
    </div>
  );
}

export default SubscriptionSettings;
