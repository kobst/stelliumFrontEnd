import { canStartFullReport, canSendChatQuestion } from './subscriptionPolicy';
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

describe('canSendChatQuestion', () => {
  it('lets Plus users send regardless of counters (backend enforces fair use)', () => {
    expect(canSendChatQuestion({ isPlus: true, pricingModel: 'simple', chatQuestionsRemaining: 0, creditsTotal: 0 })).toBe(true);
    expect(canSendChatQuestion({ isPlus: true, pricingModel: 'credits', chatQuestionsRemaining: 0, creditsTotal: 0 })).toBe(true);
  });

  it('under simple pricing gates free users on the free-question counter, not legacy credits', () => {
    expect(canSendChatQuestion({ isPlus: false, pricingModel: 'simple', chatQuestionsRemaining: 5, creditsTotal: 0 })).toBe(true);
    expect(canSendChatQuestion({ isPlus: false, pricingModel: 'simple', chatQuestionsRemaining: 0, creditsTotal: 10 })).toBe(false);
  });

  it('under credit pricing gates free users on the credit balance', () => {
    expect(canSendChatQuestion({ isPlus: false, pricingModel: 'credits', chatQuestionsRemaining: 0, creditsTotal: 1 })).toBe(true);
    expect(canSendChatQuestion({ isPlus: false, pricingModel: 'credits', chatQuestionsRemaining: 5, creditsTotal: 0 })).toBe(false);
  });

  it('treats missing counters as zero', () => {
    expect(canSendChatQuestion({ isPlus: false, pricingModel: 'simple' })).toBe(false);
    expect(canSendChatQuestion({ isPlus: false, pricingModel: 'credits' })).toBe(false);
  });
});
