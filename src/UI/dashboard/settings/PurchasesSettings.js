import React, { useEffect, useState } from 'react';
import { getPurchaseHistory } from '../../../Utilities/entitlementsApi';
import { useCheckout } from '../../../hooks/useCheckout';

const PRODUCT_LABELS = {
  NATAL_REPORT: 'Natal report',
  RELATIONSHIP_REPORT: 'Relationship report',
  PLUS_SUBSCRIPTION: 'Plus subscription',
};

function productLabel(type) {
  if (PRODUCT_LABELS[type]) return PRODUCT_LABELS[type];
  if (!type) return 'Purchase';
  const words = type.replace(/_/g, ' ').toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

function formatAmount(cents, currency = 'usd') {
  if (typeof cents !== 'number') return '';
  const value = cents / 100;
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: (currency || 'usd').toUpperCase(),
    }).format(value);
  } catch (e) {
    return `$${value.toFixed(2)}`;
  }
}

function formatDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/**
 * Lists a user's completed one-time report purchases. Shown to everyone —
 * Plus subscribers still buy à-la-carte reports once their monthly quota is
 * used. Plus users also get a link to the Stripe portal for subscription
 * invoices.
 */
function PurchasesSettings({ userId, user, entitlements }) {
  const { openCustomerPortal, isLoading: portalLoading } = useCheckout(user);
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isPlus = !!entitlements?.isPlus;

  useEffect(() => {
    let cancelled = false;
    if (!userId) {
      setLoading(false);
      return undefined;
    }
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const list = await getPurchaseHistory(userId);
        if (!cancelled) setPurchases(list);
      } catch (loadError) {
        console.error('Error loading purchases:', loadError);
        if (!cancelled) setError('We couldn’t load your purchases.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [userId]);

  return (
    <div className="purchases-settings">
      <div className="settings-section-header">
        <h3 className="settings-section-title">Purchases</h3>
      </div>
      <p className="purchases-settings__description">
        Your one-time report purchases.
        {isPlus ? ' Subscription invoices are in the billing portal below.' : ''}
      </p>

      {loading ? (
        <p className="purchases-settings__state">Loading your purchases…</p>
      ) : error ? (
        <p className="purchases-settings__state purchases-settings__state--error">{error}</p>
      ) : purchases.length === 0 ? (
        <p className="purchases-settings__empty">
          No purchases yet. Reports you unlock will show up here.
        </p>
      ) : (
        <ul className="purchases-settings__list">
          {purchases.map((purchase) => (
            <li key={purchase.id} className="purchases-settings__row">
              <div className="purchases-settings__row-main">
                <span className="purchases-settings__item">{productLabel(purchase.productType)}</span>
                <span className="purchases-settings__date">{formatDate(purchase.purchasedAt)}</span>
              </div>
              <span className="purchases-settings__amount">
                {formatAmount(purchase.amount, purchase.currency)}
              </span>
            </li>
          ))}
        </ul>
      )}

      {isPlus && (
        <button
          type="button"
          className="purchases-settings__portal"
          onClick={() => openCustomerPortal()}
          disabled={portalLoading}
        >
          {portalLoading ? 'Loading…' : 'Manage subscription & invoices'}
        </button>
      )}
    </div>
  );
}

export default PurchasesSettings;
