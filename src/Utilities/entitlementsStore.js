import create from 'zustand';
import {
  getEntitlements,
  getUnlockedAnalyses,
  useAnalysis as apiUseAnalysis,
  useQuestion as apiUseQuestion,
} from './entitlementsApi';

// Default/initial state
const initialState = {
  // Plan info
  plan: null, // 'FREE' | 'PLUS' | null
  planActiveUntil: null,
  isSubscriptionActive: false,
  hasEverSubscribed: false,

  // Analyses quota
  analyses: {
    remaining: 0,
    banked: 0,
    total: 0,
    resetDate: null,
  },

  // Questions quota
  questions: {
    monthly: 0,
    purchased: 0,
    total: 0,
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

  // Loading states
  isLoading: false,
  error: null,
  lastFetched: null,
};

const useEntitlementsStore = create((set, get) => ({
  ...initialState,

  // ========== ACTIONS ==========

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
      // Treat 'PREMIUM' as equivalent to 'PLUS' for access checks
      const isPlus = plan === 'PLUS' || plan === 'PREMIUM';

      set({
        plan,
        planActiveUntil: entitlementsData?.planActiveUntil
          ? new Date(entitlementsData.planActiveUntil)
          : null,
        isSubscriptionActive: entitlementsData?.isSubscriptionActive || false,
        hasEverSubscribed: entitlementsData?.hasEverSubscribed || false,

        analyses: {
          remaining: entitlementsData?.analyses?.remaining || 0,
          banked: entitlementsData?.analyses?.banked || 0,
          total: entitlementsData?.analyses?.total || 0,
          resetDate: entitlementsData?.analyses?.resetDate
            ? new Date(entitlementsData.analyses.resetDate)
            : null,
        },

        questions: {
          monthly: entitlementsData?.questions?.monthly || 0,
          purchased: entitlementsData?.questions?.purchased || 0,
          total: entitlementsData?.questions?.total || 0,
          resetDate: entitlementsData?.questions?.resetDate
            ? new Date(entitlementsData.questions.resetDate)
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

    // Check if has remaining quota
    if (state.analyses.remaining <= 0) {
      return { success: false, error: 'No analyses remaining' };
    }

    // Use quota via API
    try {
      set({ isLoading: true });
      const result = await apiUseAnalysis(userId, entityType, entityId);

      // Refresh entitlements to get updated counts
      await get().fetchEntitlements(userId);

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

    const state = get();

    // Check if has remaining questions
    if (state.questions.total <= 0) {
      return { success: false, error: 'No questions remaining' };
    }

    try {
      set({ isLoading: true });
      const result = await apiUseQuestion(userId);

      // Update local state optimistically
      set((state) => ({
        questions: {
          ...state.questions,
          total: Math.max(0, state.questions.total - 1),
          monthly: state.questions.monthly > 0
            ? state.questions.monthly - 1
            : state.questions.monthly,
          purchased: state.questions.monthly <= 0 && state.questions.purchased > 0
            ? state.questions.purchased - 1
            : state.questions.purchased,
        },
        isLoading: false,
      }));

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

    // Plus users with remaining quota can access
    if (state.isPlusUser() && state.analyses.remaining > 0) {
      return true;
    }

    return false;
  },

  /**
   * Check if user has questions remaining
   */
  hasQuestionsRemaining: () => {
    const state = get();
    return state.questions.total > 0;
  },

  /**
   * Get total analyses available (remaining + banked)
   */
  getAnalysesAvailable: () => {
    const state = get();
    return state.analyses.remaining + state.analyses.banked;
  },
}));

export default useEntitlementsStore;
