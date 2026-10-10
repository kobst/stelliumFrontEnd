import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import InkRelationshipPage from './InkRelationshipPage';
import { fetchRelationshipAnalysis, getUserCompositeCharts } from '../Utilities/api';

jest.mock('../Utilities/api', () => ({
  fetchRelationshipAnalysis: jest.fn(),
  getUserCompositeCharts: jest.fn(),
  fetchUser: jest.fn(),
}));
jest.mock('../Utilities/entitlementsStore', () => {
  const state = {
    credits: { total: 0, pack: 0 },
    fullReportQuota: { remaining: 0 },
    plan: 'FREE',
    unlockedAnalyses: { relationships: [] },
    isAnalysisUnlocked: () => false,
  };
  return { __esModule: true, default: (select) => select(state) };
});
jest.mock('../UI/entitlements/InsufficientCreditsModal', () => () => null);
jest.mock('../UI/ink/InkNav', () => () => null);
jest.mock('../UI/shared/chartScene', () => ({ ChartScene: () => <div>Relationship wheel</div> }));
jest.mock('../UI/gravityChat/GravityChatPanel', () => () => null);
jest.mock('../UI/dashboard/chartTabs/ChartTabSummary', () => ({ theme, showWheel, planets }) => (
  <div data-testid="composite-details" data-theme={theme} data-show-wheel={String(showWheel)}>{planets.length} composite bodies</div>
));

it('shows the API composite summary without requiring full analysis or truncating it', async () => {
  getUserCompositeCharts.mockResolvedValue([{
    _id: 'pair', userA_name: 'Eva Hanson', userB_name: 'Aaron',
    compositeChart: { planets: [{ name: 'Sun', sign: 'Libra', full_degree: 190, norm_degree: 10 }] },
  }]);
  fetchRelationshipAnalysis.mockResolvedValue({
    compositeSummary: { summary: 'First paragraph.\n\nSecond paragraph.\n\nThird paragraph.\n\nFourth paragraph.' },
  });
  render(
    <MemoryRouter initialEntries={['/dashboard/user/relationship/pair']}>
      <Routes>
        <Route path="/dashboard/:userId/relationship/:compositeId" element={<InkRelationshipPage />} />
      </Routes>
    </MemoryRouter>
  );
  fireEvent.click(await screen.findByRole('tab', { name: /Composite/ }));
  expect(screen.getByText('First paragraph.')).toBeTruthy();
  expect(screen.getByText('Fourth paragraph.')).toBeTruthy();
  expect(screen.queryByText('Composite interpretation is not available yet.')).toBeNull();
  const details = screen.getByTestId('composite-details');
  expect(details.getAttribute('data-theme')).toBe('ink');
  expect(details.getAttribute('data-show-wheel')).toBe('false');
});
