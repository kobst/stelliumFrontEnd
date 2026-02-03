import React from 'react';
import { PlanBadge, AnalysisQuotaCard, QuestionsIndicator } from '../../entitlements';
import { useCheckout } from '../../../hooks/useCheckout';
import './SubscriptionSettings.css';

function SubscriptionSettings({ userId, user, entitlements }) {
  const { startSubscription, openCustomerPortal, isLoading, error } = useCheckout(user);

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

      <div className="subscription-settings__quotas">
        <AnalysisQuotaCard
          remaining={entitlements?.monthlyAnalysesRemaining || 0}
          resetDate={entitlements?.analysesResetDate}
          isPlus={isPlus}
        />

        <QuestionsIndicator
          questionsRemaining={entitlements?.questionsRemaining || 0}
          monthlyQuestions={entitlements?.monthlyQuestions || 0}
          purchasedQuestions={entitlements?.purchasedQuestions || 0}
          resetDate={entitlements?.questionsResetDate}
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
            <li>3 monthly birth chart or relationship analyses</li>
            <li>Daily horoscope access</li>
            <li>10 monthly questions to ask Stellium</li>
            <li>40% discount on additional purchases</li>
          </ul>
        </div>
      )}
    </div>
  );
}

export default SubscriptionSettings;
