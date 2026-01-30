import { useMemo, useEffect, useCallback } from 'react';
import useEntitlementsStore from '../Utilities/entitlementsStore';

const TRIAL_DURATION_DAYS = 7;

// Pricing constants
const PRICING = {
  BIRTH_CHART: {
    free: 20,
    plus: 12, // 40% discount
  },
  RELATIONSHIP: {
    free: 10,
    plus: 6, // 40% discount
  },
  SUBSCRIPTION: 20, // per month
  QUESTION_PACK: 10,
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
        isTrialActive: false,
        trialDaysRemaining: 0,
        canAccessWeekly: false,
        canAccessAskStelliumHoroscope: false,
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

    // Calculate trial status (7 days from account creation)
    const createdAt = user?.createdAt ? new Date(user.createdAt) : null;
    const now = new Date();

    let isTrialActive = false;
    let trialDaysRemaining = 0;

    if (createdAt && tier === 'free') {
      const trialEndDate = new Date(createdAt);
      trialEndDate.setDate(trialEndDate.getDate() + TRIAL_DURATION_DAYS);

      const timeDiff = trialEndDate.getTime() - now.getTime();
      trialDaysRemaining = Math.max(0, Math.ceil(timeDiff / (1000 * 60 * 60 * 24)));
      isTrialActive = trialDaysRemaining > 0;
    }

    // Calculate access permissions
    // Weekly horoscope: Plus+ OR active trial
    const canAccessWeekly = isPremiumOrHigher || isTrialActive;

    // Ask Stellium (horoscope): Plus+ OR active trial
    const canAccessAskStelliumHoroscope = isPremiumOrHigher || isTrialActive;

    return {
      tier,
      isTrialActive,
      trialDaysRemaining,
      canAccessWeekly,
      canAccessAskStelliumHoroscope,
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
      // Plan info
      plan: store.plan,
      isPlus,
      isFree: store.plan === 'FREE' || !store.plan,
      planActiveUntil: store.planActiveUntil,
      isSubscriptionActive: store.isSubscriptionActive,
      hasEverSubscribed: store.hasEverSubscribed,

      // Quotas
      monthlyAnalysesRemaining: store.analyses.remaining,
      analysesResetDate: store.analyses.resetDate,

      questionsRemaining: store.questions.total,
      monthlyQuestions: store.questions.monthly,
      purchasedQuestions: store.questions.purchased,
      questionsResetDate: store.questions.resetDate,

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

      // Pricing based on tier
      birthChartPrice: isPlus ? PRICING.BIRTH_CHART.plus : PRICING.BIRTH_CHART.free,
      relationshipPrice: isPlus ? PRICING.RELATIONSHIP.plus : PRICING.RELATIONSHIP.free,
      subscriptionPrice: PRICING.SUBSCRIPTION,
      questionPackPrice: PRICING.QUESTION_PACK,
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

  const checkAndUseAnalysis = useCallback(
    (entityType, entityId) => {
      if (user?._id) {
        return store.checkAndUseAnalysis(user._id, entityType, entityId);
      }
      return Promise.resolve({ success: false, error: 'No user' });
    },
    [user?._id, store.checkAndUseAnalysis]
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
      // Plus users with remaining quota can access
      if (storeEntitlements.isPlus && store.analyses.remaining > 0) {
        return true;
      }
      return false;
    },
    [store.isAnalysisUnlocked, storeEntitlements.isPlus, store.analyses.remaining]
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
      checkAndUseAnalysis,
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
      checkAndUseAnalysis,
      useQuestion,
      isAnalysisUnlocked,
      canAccess360Analysis,
      store.reset,
    ]
  );
}

export default useEntitlements;
