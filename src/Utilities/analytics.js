import posthog from 'posthog-js';

/**
 * Analytics wrapper around PostHog.
 * All tracking goes through this module so the provider can be swapped later.
 */

const POSTHOG_KEY = process.env.REACT_APP_POSTHOG_KEY;
const POSTHOG_HOST = process.env.REACT_APP_POSTHOG_HOST || 'https://us.i.posthog.com';

let initialized = false;

export function initAnalytics() {
  if (initialized || !POSTHOG_KEY) {
    if (!POSTHOG_KEY) {
      console.warn('[Analytics] REACT_APP_POSTHOG_KEY not set — analytics disabled');
    }
    return;
  }

  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    autocapture: true,
    capture_pageview: true,
    capture_pageleave: true,
    persistence: 'localStorage+cookie',
  });

  initialized = true;
}

/**
 * Identify a user after signup/login
 */
export function identifyUser(userId, properties = {}) {
  if (!initialized) return;
  posthog.identify(userId, properties);
}

/**
 * Reset identity on logout
 */
export function resetUser() {
  if (!initialized) return;
  posthog.reset();
}

/**
 * Track a custom event
 */
export function track(eventName, properties = {}) {
  if (!initialized) return;
  posthog.capture(eventName, properties);
}

// ── Specific event helpers ──────────────────────────────────────────

export function trackSignupCompleted(userId, userData = {}) {
  track('signup_completed', {
    user_id: userId,
    has_birth_time: userData.time !== 'unknown',
  });
}

export function trackChartViewed(chartId, { isGuest = false } = {}) {
  track('chart_viewed', { chart_id: chartId, is_guest: isGuest });
}

export function trackAnalysisStarted(chartId) {
  track('analysis_started', { chart_id: chartId });
}

export function trackAnalysisCompleted(chartId) {
  track('analysis_completed', { chart_id: chartId });
}

export function trackCreditWallHit(trigger, { creditsNeeded, creditsAvailable } = {}) {
  track('credit_wall_hit', {
    trigger,
    credits_needed: creditsNeeded,
    credits_available: creditsAvailable,
  });
}

export function trackUpgradeModalViewed(trigger) {
  track('upgrade_modal_viewed', { trigger });
}

export function trackUpgradeModalDismissed() {
  track('upgrade_modal_dismissed');
}

export function trackCheckoutStarted(type) {
  track('checkout_started', { checkout_type: type });
}

export function trackCheckoutCompleted(type, purchaseType = null) {
  track('checkout_completed', {
    checkout_type: type,
    purchase_type: purchaseType,
  });
}

export function trackChatMessageSent(contentType) {
  track('chat_message_sent', { content_type: contentType });
}

export function trackHoroscopeGenerated(period) {
  track('horoscope_generated', { period });
}

export function trackRelationshipCreated() {
  track('relationship_created');
}

export function trackPricingPageViewed(source = 'direct') {
  track('pricing_page_viewed', { source });
}

export function trackLandingCTAClicked(ctaName) {
  track('landing_cta_clicked', { cta: ctaName });
}
