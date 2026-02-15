import create from 'zustand';
import {
  getEntitlements,
  getUnlockedAnalyses,
  useAnalysis as apiUseAnalysis,
  useQuestion as apiUseQuestion,
} from './entitlementsApi';
import { CREDIT_COSTS } from './creditCosts';

// Default/initial state
const initialState = {
  // Plan info
  plan: null, // 'FREE' | 'PLUS' | null
  planActiveUntil: null,
  isSubscriptionActive: false,
  hasEverSubscribed: false,

  // Credits (unified system)
  credits: {
    total: 0,        // monthly + pack
    monthly: 0,      // from monthly allotment
    pack: 0,         // purchased credits (never expire)
    monthlyLimit: 0, // tier's monthly allotment
    resetDate: null,
  },

  // Unlocked analyses
  unlockedAnalyses: {
    birthCharts: [],
    relationships: [],
  },

  // Horoscope access
  horoscopeAccess: {
    daily: false,
    weekly: true,
    monthly: true,
  },

  // Toast notification
  toast: { message: '', type: 'info', isVisible: false },

  // Loading states
  isLoading: false,
  error: null,
  lastFetched: null,
};

const useEntitlementsStore = create((set, get) => ({
  ...initialState,

  // ========== ACTIONS ==========

  showToast: (message, type = 'info') => {
    set({ toast: { message, type, isVisible: true } });
    setTimeout(() => {
      set((state) => state.toast.message === message
        ? { toast: { ...state.toast, isVisible: false } }
        : state
      );
    }, 4000);
  },

  dismissToast: () => {
    set({ toast: { message: '', type: 'info', isVisible: false } });
  },

  /**
   * Fetch entitlements and unlocked analyses from backend
   */
  fetchEntitlements: async (userId) => {
    if (!userId) {
      console.warn('fetchEntitlements called without userId');
      return;
    }

    set({ isLoading: true, error: null });

    try {
      // Fetch both entitlements and unlocked analyses in parallel
      const [entitlementsData, unlockedData] = await Promise.all([
        getEntitlements(userId),
        getUnlockedAnalyses(userId),
      ]);

      // Parse entitlements response
      const plan = entitlementsData?.plan || 'FREE';
      // Map 'premium' to 'plus' for legacy support
      const normalizedPlan = plan.toUpperCase() === 'PREMIUM' ? 'PLUS' : plan.toUpperCase();
      const isPlus = normalizedPlan === 'PLUS';

      set({
        plan: normalizedPlan,
        planActiveUntil: entitlementsData?.planActiveUntil
          ? new Date(entitlementsData.planActiveUntil)
          : null,
        isSubscriptionActive: entitlementsData?.isSubscriptionActive || false,
        hasEverSubscribed: entitlementsData?.hasEverSubscribed || false,

        credits: {
          total: entitlementsData?.credits?.total || 0,
          monthly: entitlementsData?.credits?.monthly || 0,
          pack: entitlementsData?.credits?.pack || 0,
          monthlyLimit: entitlementsData?.credits?.monthlyLimit || 0,
          resetDate: entitlementsData?.credits?.resetDate
            ? new Date(entitlementsData.credits.resetDate)
            : null,
        },

        horoscopeAccess: {
          daily: isPlus || entitlementsData?.horoscopeAccess?.daily || false,
          weekly: true, // Always available
          monthly: true, // Always available
        },

        unlockedAnalyses: {
          birthCharts: unlockedData?.birthCharts || [],
          relationships: unlockedData?.relationships || [],
        },

        isLoading: false,
        error: null,
        lastFetched: new Date(),
      });

      return { success: true };
    } catch (error) {
      console.error('Error fetching entitlements:', error);
      set({
        isLoading: false,
        error: error.message || 'Failed to fetch entitlements',
      });
      return { success: false, error: error.message };
    }
  },

  /**
   * Refresh entitlements after Stripe checkout return
   * Includes a delay to allow webhook processing
   */
  refreshAfterPurchase: async (userId, delayMs = 2000) => {
    set({ isLoading: true });

    // Wait for webhook to process
    await new Promise((resolve) => setTimeout(resolve, delayMs));

    // Then fetch fresh data
    return get().fetchEntitlements(userId);
  },

  /**
   * Check if analysis is unlocked and optionally use quota to unlock
   */
  checkAndUseAnalysis: async (userId, entityType, entityId) => {
    if (!userId) return { success: false, error: 'No user ID' };

    const state = get();

    // Check if already unlocked
    const isUnlocked = state.isAnalysisUnlocked(entityType, entityId);
    if (isUnlocked) {
      return { success: true, alreadyUnlocked: true };
    }

    // Check if has enough credits for this analysis
    const costBirthChart = 75;
    const costRelationship = 60;
    const normalizedType = (entityType || '').toUpperCase();
    const cost = normalizedType === 'BIRTH_CHART' ? costBirthChart : costRelationship;
    if (state.credits.total < cost) {
      return { success: false, error: 'Not enough credits' };
    }

    // Use quota via API
    try {
      set({ isLoading: true });
      const result = await apiUseAnalysis(userId, entityType, entityId);

      // Refresh entitlements to get updated credits and unlocks
      await get().fetchEntitlements(userId);

      const updatedCredits = get().credits.total;
      get().showToast(`${cost} credits used. ${updatedCredits} remaining.`, 'success');

      return { success: true, result };
    } catch (error) {
      set({ isLoading: false, error: error.message });
      return { success: false, error: error.message };
    }
  },

  /**
   * Use a question credit
   */
  useQuestion: async (userId) => {
    if (!userId) return { success: false, error: 'No user ID' };

    try {
      set({ isLoading: true });
      const result = await apiUseQuestion(userId);

      // Refresh entitlements to update credits after question usage
      await get().fetchEntitlements(userId);
      set({ isLoading: false });

      const updatedCredits = get().credits.total;
      get().showToast(`1 credit used. ${updatedCredits} remaining.`, 'info');

      return { success: true, result };
    } catch (error) {
      set({ isLoading: false, error: error.message });
      return { success: false, error: error.message };
    }
  },

  /**
   * Reset store to initial state (e.g., on logout)
   */
  reset: () => {
    set(initialState);
  },

  // ========== HELPERS / SELECTORS ==========

  /**
   * Check if user is on Plus plan (also accepts 'PREMIUM' for backward compatibility)
   */
  isPlusUser: () => {
    const state = get();
    const isPaidTier = state.plan === 'PLUS' || state.plan === 'PREMIUM';
    return isPaidTier && state.isSubscriptionActive;
  },

  /**
   * Check if user can access daily horoscope
   */
  canAccessDailyHoroscope: () => {
    const state = get();
    return state.horoscopeAccess.daily || state.isPlusUser();
  },

  /**
   * Check if a specific analysis is unlocked
   */
  isAnalysisUnlocked: (entityType, entityId) => {
    const state = get();
    if (entityType === 'BIRTH_CHART') {
      return state.unlockedAnalyses.birthCharts.includes(entityId);
    } else if (entityType === 'RELATIONSHIP') {
      return state.unlockedAnalyses.relationships.includes(entityId);
    }
    return false;
  },

  /**
   * Check if user can access 360 analysis for an entity
   * (Either Plus user with quota OR already purchased/unlocked)
   */
  canAccess360Analysis: (entityType, entityId) => {
    const state = get();

    // Check if already unlocked
    if (state.isAnalysisUnlocked(entityType, entityId)) {
      return true;
    }

    // Check if user has enough credits to unlock
    const costBirthChart = 75;
    const costRelationship = 60;
    const cost = entityType === 'birthChart' ? costBirthChart : costRelationship;
    
    return state.credits.total >= cost;
  },

  /**
   * Check if user has enough credits
   */
  hasEnoughCredits: (cost) => {
    const state = get();
    return state.credits.total >= cost;
  },

  /**
   * Get current credit balance
   */
  getCredits: () => {
    const state = get();
    return state.credits;
  },

  /**
   * Get credits breakdown for display
   */
  getCreditsBreakdown: () => {
    const state = get();
    return {
      total: state.credits.total,
      monthly: state.credits.monthly,
      pack: state.credits.pack,
      monthlyLimit: state.credits.monthlyLimit,
      resetDate: state.credits.resetDate,
    };
  },

  /**
   * Check if user can create a relationship
   */
  canCreateRelationship: () => {
    const state = get();
    return state.credits.total >= CREDIT_COSTS.RELATIONSHIP_OVERVIEW;
  },

  /**
   * Get credits reset date
   */
  getCreditsResetDate: () => {
    const state = get();
    return state.credits.resetDate;
  },
}));

export default useEntitlementsStore;
