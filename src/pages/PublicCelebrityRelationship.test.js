import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import PublicCelebrityRelationship from './PublicCelebrityRelationship';
import { fetchRelationshipAnalysis, getCelebrityRelationships } from '../Utilities/api';

jest.mock('../Utilities/api', () => ({
  fetchRelationshipAnalysis: jest.fn(),
  getCelebrityRelationships: jest.fn(),
  fetchUser: jest.fn(),
}));
jest.mock('../context/AuthContext', () => ({ useAuth: () => ({ isFullyAuthenticated: false }) }));
jest.mock('../UI/ink/InkNav', () => () => null);
jest.mock('../UI/publicInk/InkPublicFooter', () => () => null);
jest.mock('../UI/shared/chartScene', () => ({ ChartScene: () => <div>Relationship wheel</div> }));
jest.mock('../UI/gravityChat/GravityChatPanel', () => () => null);
jest.mock('../UI/dashboard/chartTabs/GravityChatCta', () => () => null);
jest.mock('../UI/dashboard/relationshipTabs/AnalysisTab', () => () => <p>Dimension analysis</p>);
jest.mock('../UI/dashboard/relationshipTabs/ChartsTab', () => () => <p>Both chart details</p>);
jest.mock('../UI/dashboard/relationshipTabs/CompositeTab', () => () => <p>Composite details</p>);

it('opens the combined overview and keeps the remaining tabs navigable', async () => {
  const fixture = {
    _id: 'pair',
    userA_firstName: 'Zendaya',
    userB_firstName: 'Tom',
    initialOverview: 'The relationship overview narrative.',
    userA_birthChart: { planets: [{ name: 'Sun', sign: 'Virgo', full_degree: 160 }] },
    userB_birthChart: { planets: [{ name: 'Sun', sign: 'Gemini', full_degree: 70 }] },
  };
  getCelebrityRelationships.mockResolvedValue([fixture]);
  fetchRelationshipAnalysis.mockResolvedValue({});
  render(
    <MemoryRouter initialEntries={['/celebrity-relationships/pair']}>
      <Routes>
        <Route path="/celebrity-relationships/:compositeId" element={<PublicCelebrityRelationship />} />
      </Routes>
    </MemoryRouter>
  );

  const overview = await screen.findByRole('tab', { name: /Overview/ });
  expect(overview.getAttribute('aria-selected')).toBe('true');
  expect(screen.queryByRole('tab', { name: /Scores/ })).toBeNull();
  expect(screen.getByText('The relationship overview narrative.')).toBeTruthy();
  expect(screen.getByText('Relationship wheel')).toBeTruthy();
  expect(screen.getAllByRole('tab')).toHaveLength(4);

  for (const name of ['Composite', 'Both Charts', '360 Analysis', 'Overview']) {
    const tab = screen.getByRole('tab', { name: new RegExp(name) });
    fireEvent.click(tab);
    expect(tab.getAttribute('aria-selected')).toBe('true');
    const panel = document.getElementById(tab.getAttribute('aria-controls'));
    expect(panel.getAttribute('aria-hidden')).toBe('false');
  }
});
