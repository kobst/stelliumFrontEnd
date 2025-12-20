import { useMemo } from 'react';

const TRIAL_DURATION_DAYS = 7;

/**
 * Central hook for calculating user entitlements based on subscription and trial status.
 *
 * @param {Object} user - The user object from the backend
 * @returns {Object} Entitlement flags and values
 */
export function useEntitlements(user) {
  return useMemo(() => {
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

    // Get subscription tier
    const tier = user?.subscription?.tier?.toLowerCase() || 'free';
    const isPremiumOrHigher = tier === 'premium' || tier === 'pro';
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
    // Weekly horoscope: Premium+ OR active trial
    const canAccessWeekly = isPremiumOrHigher || isTrialActive;

    // Ask Stellium (horoscope): Premium+ OR active trial
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
}

export default useEntitlements;
