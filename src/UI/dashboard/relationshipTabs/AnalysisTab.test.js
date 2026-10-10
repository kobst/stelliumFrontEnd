import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AnalysisTab from './AnalysisTab';

jest.mock('../../../Utilities/api', () => ({}));
jest.mock('../../../Utilities/entitlementsStore', () => ({
  __esModule: true,
  default: (select) => select({
    credits: { total: 0, pack: 0 },
    fullReportQuota: { remaining: 0 },
    plan: 'FREE',
  }),
}));
jest.mock('../../entitlements/InsufficientCreditsModal', () => () => null);
jest.mock('../../gravityChat/GravityChatPanel', () => () => null);
jest.mock('../chartTabs/GravityChatCta', () => () => null);
jest.mock('../../shared/AspectMiniChart', () => ({
  __esModule: true,
  default: () => null,
  aspectKindFor: () => 'flowing',
}));

it('keeps dimension navigation, narratives and stars without exposing numeric scores', () => {
  const names = ['Harmony', 'Passion', 'Connection', 'Stability', 'Growth'];
  const relationship = {
    completeAnalysis: Object.fromEntries(names.map((name) => [name, {
      synastry: { supportPanel: `${name} support narrative` },
    }])),
    clusterScoring: {
      clusters: Object.fromEntries(names.map((name, index) => [name, {
        score: 20 + index,
        keystoneAspects: [{ description: `${name} aspect` }],
      }])),
      scoredItems: names.map((name) => ({
        id: name,
        description: `${name} aspect`,
        source: 'synastry',
        clusterContributions: [{ cluster: name, score: 8.7, starRating: 3 }],
      })),
    },
  };
  const { container } = render(
    <MemoryRouter>
      <AnalysisTab relationship={relationship} compositeId="pair" isCelebrity />
    </MemoryRouter>
  );

  names.forEach((name) => {
    fireEvent.click(screen.getByRole('button', { name, exact: true }));
    expect(screen.getByText(`${name} support narrative`)).toBeTruthy();
    expect(screen.getAllByLabelText('3 stars')).toHaveLength(2);
    expect(container.textContent).not.toMatch(/\d+%|8\.7/);
    expect(container.querySelector('[title^="Score:"]')).toBeNull();
    expect(container.querySelector('.panel-aspects__strength-bar')).toBeNull();
  });
});
