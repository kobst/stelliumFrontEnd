import { CREDIT_COSTS } from './creditCosts';

export const canStartFullReport = ({
  entityType,
  isPlus,
  quotaRemaining = 0,
  packCredits = 0,
  totalCredits = 0,
}) => {
  if (isPlus && quotaRemaining > 0) return true;

  const cost = (entityType || '').toUpperCase() === 'RELATIONSHIP'
    ? CREDIT_COSTS.FULL_RELATIONSHIP
    : CREDIT_COSTS.FULL_NATAL;

  return isPlus ? packCredits >= cost : totalCredits >= cost;
};

/**
 * Whether the chat composer should let a question through before calling the
 * backend. Plus users are never gated client-side; the server enforces the
 * daily fair-use limit and answers 429, which the panel already handles.
 * Free users are gated on the counter that matches the pricing model: the
 * simple-pricing free-question allowance, or the legacy credit balance.
 * The backend remains authoritative either way.
 */
export const canSendChatQuestion = ({
  isPlus,
  pricingModel,
  chatQuestionsRemaining = 0,
  creditsTotal = 0,
}) => {
  if (isPlus) return true;
  if (pricingModel === 'simple') return chatQuestionsRemaining > 0;
  return creditsTotal > 0;
};
