import { useMemo, useEffect, useCallback } from 'react';
import useEntitlementsStore from '../Utilities/entitlementsStore';

// Pricing constants (simple pricing model — one-time report purchases).
// Kept flat: the same price applies regardless of tier.
const PRICING = {
  BIRTH_CHART: {
    free: 9.99,
    plus: 9.99,
  },
  RELATIONSHIP: {
    free: 7.99,
    plus: 7.99,
  },
  SUBSCRIPTION: 14.99, // per month
};

/**
 * Central hook for calculating user entitlements based on subscription and trial status.
 * Now integrates with the entitlements store for real-time quota tracking.
 *
 * @param {Object} user - The user object from the backend
 * @returns {Object} Entitlement flags and values
 */
export function useEntitlements(user) {
  // Get store state and actions
  const store = useEntitlementsStore();

  // Fetch entitlements when user changes
  useEffect(() => {
    if (user?._id && !store.lastFetched) {
      store.fetchEntitlements(user._id);
    }
  }, [user?._id, store.lastFetched, store.fetchEntitlements]);

  // Memoize legacy entitlements (backward compatibility)
  const legacyEntitlements = useMemo(() => {
    // Default values for no user
    if (!user) {
      return {
        tier: 'free',
        isPremiumOrHigher: false,
        isProUser: false,
      };
    }

    // Get subscription tier from user object (legacy)
    let tier = user?.subscription?.tier?.toLowerCase() || 'free';
    // Normalize 'premium' to 'plus' for consistency
    if (tier === 'premium') tier = 'plus';
    const isPremiumOrHigher = tier === 'plus' || tier === 'pro';
    const isProUser = tier === 'pro';

    return {
      tier,
      isPremiumOrHigher,
      isProUser,
    };
  }, [user]);

  // Memoize new entitlements from store
  const storeEntitlements = useMemo(() => {
    // Treat both 'PLUS' and 'PREMIUM' as the paid tier
    const isPaidTier = store.plan === 'PLUS' || store.plan === 'PREMIUM';
    const isPlus = isPaidTier && store.isSubscriptionActive;

    return {
      // Which pricing model the backend is enforcing
      pricingModel: store.pricingModel,
      isSimplePricing: store.pricingModel === 'simple',

      // Plan info
      plan: store.plan,
      isPlus,
      isFree: store.plan === 'FREE' || !store.plan,
      planActiveUntil: store.planActiveUntil,
      isSubscriptionActive: store.isSubscriptionActive,
      hasEverSubscribed: store.hasEverSubscribed,

      // Credits (legacy; zero under simple pricing)
      credits: {
        total: store.credits.total,
        monthly: store.credits.monthly,
        pack: store.credits.pack,
        monthlyLimit: store.credits.monthlyLimit,
        resetDate: store.credits.resetDate,
      },

      // Simple-pricing chat allowances
      freeQuestions: store.freeQuestions,
      dailyQuestionsRemaining: store.dailyQuestionsRemaining,
      chatQuestionsRemaining: store.getChatQuestionsRemaining(),
      canAskQuestion: store.canAskQuestion(),

      fullReportQuota: {
        limit: store.fullReportQuota.limit,
        remaining: store.fullReportQuota.remaining,
        resetsAt: store.fullReportQuota.resetsAt,
      },

      // Horoscope access
      canAccessDaily: store.horoscopeAccess.daily || isPlus,
      canAccessWeeklyHoroscope: store.horoscopeAccess.weekly,
      canAccessMonthlyHoroscope: store.horoscopeAccess.monthly,

      // Unlocked items
      unlockedBirthCharts: store.unlockedAnalyses.birthCharts,
      unlockedRelationships: store.unlockedAnalyses.relationships,

      // Loading state
      isLoading: store.isLoading,
      error: store.error,

      // One-time report / subscription prices (simple pricing)
      birthChartPrice: isPlus ? PRICING.BIRTH_CHART.plus : PRICING.BIRTH_CHART.free,
      relationshipPrice: isPlus ? PRICING.RELATIONSHIP.plus : PRICING.RELATIONSHIP.free,
      subscriptionPrice: PRICING.SUBSCRIPTION,
    };
  }, [store]);

  // Actions
  const refreshEntitlements = useCallback(() => {
    if (user?._id) {
      return store.fetchEntitlements(user._id);
    }
  }, [user?._id, store.fetchEntitlements]);

  const refreshAfterPurchase = useCallback(
    (delayMs = 2000) => {
      if (user?._id) {
        return store.refreshAfterPurchase(user._id, delayMs);
      }
    },
    [user?._id, store.refreshAfterPurchase]
  );

  const useQuestion = useCallback(() => {
    if (user?._id) {
      return store.useQuestion(user._id);
    }
    return Promise.resolve({ success: false, error: 'No user' });
  }, [user?._id, store.useQuestion]);

  const isAnalysisUnlocked = useCallback(
    (entityType, entityId) => {
      return store.isAnalysisUnlocked(entityType, entityId);
    },
    [store.isAnalysisUnlocked]
  );

  const canAccess360Analysis = useCallback(
    (entityType, entityId) => {
      // If already unlocked (purchased or used quota), allow access
      if (store.isAnalysisUnlocked(entityType, entityId)) {
        return true;
      }
      return store.canStartFullReport(entityType);
    },
    [store.isAnalysisUnlocked, store.canStartFullReport]
  );

  // Combine legacy and new entitlements
  return useMemo(
    () => ({
      // Legacy fields (backward compatibility)
      ...legacyEntitlements,

      // New store-based fields
      ...storeEntitlements,

      // Actions
      refreshEntitlements,
      refreshAfterPurchase,
      useQuestion,
      isAnalysisUnlocked,
      canAccess360Analysis,

      // Reset (for logout)
      reset: store.reset,
    }),
    [
      legacyEntitlements,
      storeEntitlements,
      refreshEntitlements,
      refreshAfterPurchase,
      useQuestion,
      isAnalysisUnlocked,
      canAccess360Analysis,
      store.reset,
    ]
  );
}

export default useEntitlements;
