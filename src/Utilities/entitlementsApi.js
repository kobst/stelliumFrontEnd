import { authenticatedFetch } from './api';
import { HTTP_POST, CONTENT_TYPE_HEADER, APPLICATION_JSON } from './constants';

const SERVER_URL = process.env.REACT_APP_SERVER_URL;

/**
 * Get user entitlements (plan, quotas, etc.)
 * @param {string} userId - The user ID
 * @returns {Promise<object>} Entitlements data
 */
export const getEntitlements = async (userId) => {
  try {
    const response = await authenticatedFetch(`${SERVER_URL}/users/${userId}/entitlements`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching entitlements:', error);
    throw error;
  }
};

/**
 * Get list of unlocked analyses for a user
 * @param {string} userId - The user ID
 * @returns {Promise<object>} Unlocked analyses data
 */
export const getUnlockedAnalyses = async (userId) => {
  try {
    const response = await authenticatedFetch(`${SERVER_URL}/users/${userId}/entitlements/unlocked`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching unlocked analyses:', error);
    throw error;
  }
};

/**
 * Check if user can access a specific analysis
 * @param {string} userId - The user ID
 * @param {string} entityType - Type of analysis ('BIRTH_CHART' | 'RELATIONSHIP')
 * @param {string} entityId - ID of the entity (chart or relationship)
 * @returns {Promise<object>} Access check result
 */
export const checkAnalysisAccess = async (userId, entityType, entityId) => {
  try {
    const response = await authenticatedFetch(`${SERVER_URL}/users/${userId}/entitlements/check-analysis`, {
      method: HTTP_POST,
      body: JSON.stringify({ entityType, entityId }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error checking analysis access:', error);
    throw error;
  }
};

/**
 * Use an analysis quota to unlock an analysis
 * @param {string} userId - The user ID
 * @param {string} entityType - Type of analysis ('BIRTH_CHART' | 'RELATIONSHIP')
 * @param {string} entityId - ID of the entity (chart or relationship)
 * @returns {Promise<object>} Result of using the quota
 */
export const useAnalysis = async (userId, entityType, entityId) => {
  try {
    const response = await authenticatedFetch(`${SERVER_URL}/users/${userId}/entitlements/use-analysis`, {
      method: HTTP_POST,
      body: JSON.stringify({ entityType, entityId }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error using analysis quota:', error);
    throw error;
  }
};

/**
 * Use a question credit
 * @param {string} userId - The user ID
 * @returns {Promise<object>} Result of using the question
 */
export const useQuestion = async (userId) => {
  try {
    const response = await authenticatedFetch(`${SERVER_URL}/users/${userId}/entitlements/use-question`, {
      method: HTTP_POST,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error using question credit:', error);
    throw error;
  }
};

/**
 * Initialize entitlements for a new user (creates free tier)
 * @param {string} userId - The user ID
 * @returns {Promise<object>} Initialized entitlements
 */
export const initializeEntitlements = async (userId) => {
  try {
    const response = await authenticatedFetch(`${SERVER_URL}/users/${userId}/entitlements/initialize`, {
      method: HTTP_POST,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error initializing entitlements:', error);
    throw error;
  }
};

/**
 * Create a subscription checkout session
 * @param {string} userId - The user ID
 * @param {string} successUrl - URL to redirect on success
 * @param {string} cancelUrl - URL to redirect on cancel
 * @returns {Promise<object>} Checkout session data with URL
 */
export const createSubscriptionCheckout = async (userId, successUrl, cancelUrl) => {
  try {
    const response = await authenticatedFetch(`${SERVER_URL}/users/${userId}/checkout/create-subscription`, {
      method: HTTP_POST,
      body: JSON.stringify({ successUrl, cancelUrl }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating subscription checkout:', error);
    throw error;
  }
};

/**
 * Create a one-time purchase checkout session
 * @param {string} userId - The user ID
 * @param {string} productType - Type of product ('BIRTH_CHART' | 'RELATIONSHIP' | 'QUESTION_PACK')
 * @param {string|null} entityId - ID of the entity to purchase (null for question packs)
 * @param {string} successUrl - URL to redirect on success
 * @param {string} cancelUrl - URL to redirect on cancel
 * @returns {Promise<object>} Checkout session data with URL
 */
export const createPurchaseCheckout = async (userId, productType, entityId, successUrl, cancelUrl) => {
  try {
    const body = { productType, successUrl, cancelUrl };
    if (entityId) {
      body.entityId = entityId;
    }

    const response = await authenticatedFetch(`${SERVER_URL}/users/${userId}/checkout/create-purchase`, {
      method: HTTP_POST,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating purchase checkout:', error);
    throw error;
  }
};

/**
 * Open the Stripe customer portal
 * @param {string} userId - The user ID
 * @param {string} returnUrl - URL to redirect after portal session
 * @returns {Promise<object>} Portal session data with URL
 */
export const openCustomerPortal = async (userId, returnUrl) => {
  try {
    const response = await authenticatedFetch(`${SERVER_URL}/users/${userId}/checkout/portal`, {
      method: HTTP_POST,
      body: JSON.stringify({ returnUrl }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error opening customer portal:', error);
    throw error;
  }
};

/**
 * Get available products and pricing
 * @returns {Promise<object>} Products data
 */
export const getProducts = async () => {
  try {
    const response = await fetch(`${SERVER_URL}/checkout/products`, {
      method: 'GET',
      headers: {
        [CONTENT_TYPE_HEADER]: APPLICATION_JSON,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};
