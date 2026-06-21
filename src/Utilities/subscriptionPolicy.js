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
