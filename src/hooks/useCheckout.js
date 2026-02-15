import { useState, useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  createSubscriptionCheckout,
  createPurchaseCheckout,
  openCustomerPortal as apiOpenCustomerPortal,
} from '../Utilities/entitlementsApi';
import useEntitlementsStore from '../Utilities/entitlementsStore';

/**
 * Hook to handle Stripe checkout flows and post-checkout return
 * @param {Object} user - The user object
 * @param {Function} onSuccess - Callback on successful purchase/subscription
 * @returns {Object} Checkout functions and state
 */
export function useCheckout(user, onSuccess) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const location = useLocation();
  const navigate = useNavigate();
  const refreshAfterPurchase = useEntitlementsStore((state) => state.refreshAfterPurchase);

  // Handle post-checkout URL parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const upgraded = params.get('upgraded');
    const purchased = params.get('purchased');
    const purchaseType = params.get('type');

    if (upgraded === 'true' || purchased === 'true') {
      // Show success message
      if (upgraded === 'true') {
        setSuccessMessage('Welcome to Plus! Your subscription is now active.');
      } else if (purchased === 'true') {
        const typeMessages = {
          BIRTH_CHART: 'Birth chart analysis unlocked!',
          RELATIONSHIP: 'Relationship analysis unlocked!',
          QUESTION_PACK: 'Question pack added to your account!', // Legacy
          CREDIT_PACK: '100 credits added to your account!',
        };
        setSuccessMessage(typeMessages[purchaseType] || 'Purchase successful!');
      }
      setShowSuccessToast(true);

      // Refresh entitlements after Stripe webhook processing
      if (user?._id) {
        refreshAfterPurchase(user._id, 2000);
      }

      // Clean up URL parameters
      const newParams = new URLSearchParams(location.search);
      newParams.delete('upgraded');
      newParams.delete('purchased');
      newParams.delete('type');
      newParams.delete('session_id');

      const newSearch = newParams.toString();
      const newUrl = `${location.pathname}${newSearch ? `?${newSearch}` : ''}`;
      navigate(newUrl, { replace: true });

      // Call success callback
      if (onSuccess) {
        onSuccess(upgraded === 'true' ? 'subscription' : 'purchase');
      }

      // Auto-hide toast after 5 seconds
      setTimeout(() => {
        setShowSuccessToast(false);
      }, 5000);
    }
  }, [location.search, user?._id, navigate, location.pathname, onSuccess, refreshAfterPurchase]);

  /**
   * Build success/cancel URLs for checkout
   */
  const buildCheckoutUrls = useCallback(
    (purchaseType = null, entityId = null) => {
      const baseUrl = window.location.origin;
      const currentPath = location.pathname;

      let successParams = purchaseType
        ? `purchased=true&type=${purchaseType}`
        : 'upgraded=true';

      if (entityId) {
        successParams += `&entityId=${entityId}`;
      }

      return {
        successUrl: `${baseUrl}${currentPath}?${successParams}`,
        cancelUrl: `${baseUrl}${currentPath}?checkout=cancelled`,
      };
    },
    [location.pathname]
  );

  /**
   * Start Plus subscription checkout
   */
  const startSubscription = useCallback(async () => {
    if (!user?._id) {
      setError('Please sign in to subscribe');
      return { success: false, error: 'Not signed in' };
    }

    setIsLoading(true);
    setError(null);

    try {
      const { successUrl, cancelUrl } = buildCheckoutUrls();
      const result = await createSubscriptionCheckout(user._id, successUrl, cancelUrl);

      if (result?.checkoutUrl) {
        // Redirect to Stripe checkout
        window.location.href = result.checkoutUrl;
        return { success: true };
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (err) {
      console.error('Error starting subscription checkout:', err);
      setError(err.message || 'Failed to start checkout');
      setIsLoading(false);
      return { success: false, error: err.message };
    }
  }, [user?._id, buildCheckoutUrls]);

  /**
   * Purchase analysis for a specific entity
   * @param {string} entityType - 'BIRTH_CHART' | 'RELATIONSHIP'
   * @param {string} entityId - ID of the entity to unlock
   */
  const purchaseAnalysis = useCallback(
    async (entityType, entityId) => {
      if (!user?._id) {
        setError('Please sign in to purchase');
        return { success: false, error: 'Not signed in' };
      }

      if (!entityType || !entityId) {
        setError('Invalid analysis type or ID');
        return { success: false, error: 'Invalid parameters' };
      }

      setIsLoading(true);
      setError(null);

      try {
        const { successUrl, cancelUrl } = buildCheckoutUrls(entityType, entityId);
        const result = await createPurchaseCheckout(
          user._id,
          entityType,
          entityId,
          successUrl,
          cancelUrl
        );

        if (result?.checkoutUrl) {
          // Redirect to Stripe checkout
          window.location.href = result.checkoutUrl;
          return { success: true };
        } else {
          throw new Error('No checkout URL received');
        }
      } catch (err) {
        console.error('Error starting purchase checkout:', err);
        setError(err.message || 'Failed to start checkout');
        setIsLoading(false);
        return { success: false, error: err.message };
      }
    },
    [user?._id, buildCheckoutUrls]
  );

  /**
   * Purchase credit pack (100 credits for $10)
   */
  const purchaseCreditPack = useCallback(async () => {
    if (!user?._id) {
      setError('Please sign in to purchase');
      return { success: false, error: 'Not signed in' };
    }

    setIsLoading(true);
    setError(null);

    try {
      const { successUrl, cancelUrl } = buildCheckoutUrls('CREDIT_PACK');
      const result = await createPurchaseCheckout(
        user._id,
        'CREDIT_PACK',
        null,
        successUrl,
        cancelUrl
      );

      if (result?.checkoutUrl) {
        // Redirect to Stripe checkout
        window.location.href = result.checkoutUrl;
        return { success: true };
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (err) {
      console.error('Error starting credit pack checkout:', err);
      setError(err.message || 'Failed to start checkout');
      setIsLoading(false);
      return { success: false, error: err.message };
    }
  }, [user?._id, buildCheckoutUrls]);

  /**
   * Open Stripe customer portal for subscription management
   */
  const openCustomerPortal = useCallback(async () => {
    if (!user?._id) {
      setError('Please sign in to manage subscription');
      return { success: false, error: 'Not signed in' };
    }

    setIsLoading(true);
    setError(null);

    try {
      const returnUrl = `${window.location.origin}${location.pathname}`;
      const result = await apiOpenCustomerPortal(user._id, returnUrl);

      if (result?.portalUrl) {
        // Redirect to Stripe portal
        window.location.href = result.portalUrl;
        return { success: true };
      } else {
        throw new Error('No portal URL received');
      }
    } catch (err) {
      console.error('Error opening customer portal:', err);
      setError(err.message || 'Failed to open billing portal');
      setIsLoading(false);
      return { success: false, error: err.message };
    }
  }, [user?._id, location.pathname]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Dismiss success toast
   */
  const dismissSuccessToast = useCallback(() => {
    setShowSuccessToast(false);
  }, []);

  return {
    // State
    isLoading,
    error,
    showSuccessToast,
    successMessage,

    // Actions
    startSubscription,
    purchaseAnalysis,
    purchaseCreditPack,
    openCustomerPortal,
    clearError,
    dismissSuccessToast,
  };
}

export default useCheckout;
