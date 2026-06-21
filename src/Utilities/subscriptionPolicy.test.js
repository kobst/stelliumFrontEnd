import { canStartFullReport } from './subscriptionPolicy';
import { CREDIT_COSTS } from './creditCosts';

describe('canStartFullReport', () => {
  it('uses the pooled quota for Plus natal and relationship reports', () => {
    expect(canStartFullReport({ entityType: 'BIRTH_CHART', isPlus: true, quotaRemaining: 1 })).toBe(true);
    expect(canStartFullReport({ entityType: 'RELATIONSHIP', isPlus: true, quotaRemaining: 1 })).toBe(true);
  });

  it('uses purchased credits for Plus overage after quota is exhausted', () => {
    expect(canStartFullReport({
      entityType: 'RELATIONSHIP',
      isPlus: true,
      quotaRemaining: 0,
      packCredits: CREDIT_COSTS.FULL_RELATIONSHIP,
    })).toBe(true);
    expect(canStartFullReport({
      entityType: 'BIRTH_CHART',
      isPlus: true,
      quotaRemaining: 0,
      packCredits: CREDIT_COSTS.FULL_NATAL - 1,
      totalCredits: CREDIT_COSTS.FULL_NATAL + 100,
    })).toBe(false);
  });

  it('uses the total credit balance for free users', () => {
    expect(canStartFullReport({
      entityType: 'BIRTH_CHART',
      isPlus: false,
      totalCredits: CREDIT_COSTS.FULL_NATAL,
    })).toBe(true);
  });
});
