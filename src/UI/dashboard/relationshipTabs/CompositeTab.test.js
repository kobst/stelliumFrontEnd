import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import CompositeTab from './CompositeTab';

jest.mock('../../gravityChat/GravityChatPanel', () => () => null);
jest.mock('../chartTabs/GravityChatCta', () => () => null);
jest.mock('../../shared/Ephemeris', () => () => <div>Composite wheel</div>);
jest.mock('../../shared/AspectMiniChart', () => ({
  __esModule: true,
  default: ({ from, to, theme }) => <div data-theme={theme}>{from.name} and {to.name} diagram</div>,
  aspectKindFor: () => 'flowing',
}));

it('renders the interpretation and parchment chart details with expandable aspects', () => {
  const { container } = render(<CompositeTab isCelebrity relationship={{
    compositeSummary: { summary: 'The composite interpretation.' },
    compositeChart: {
      planets: [
        { name: 'Sun', sign: 'Taurus', norm_degree: 4, full_degree: 34 },
        { name: 'Moon', sign: 'Aquarius', norm_degree: 14, full_degree: 314 },
      ],
      houses: [{ house: 1, sign: 'Gemini', degree: 80 }],
      aspects: [{ aspectedPlanet: 'Sun', aspectingPlanet: 'Moon', aspectType: 'trine', orb: 1.2 }],
    },
  }} />);
  expect(screen.getByText('The composite interpretation.')).toBeTruthy();
  expect(container.querySelector('.cts-root--ink')).toBeTruthy();
  expect(container.querySelector('.chart-grid')).toBeNull();
  expect(screen.getByText('Composite wheel')).toBeTruthy();
  expect(screen.getByRole('heading', { name: 'Planetary positions' })).toBeTruthy();
  const aspect = screen.getByRole('button', { name: /Sun.*Trine.*Moon/ });
  fireEvent.click(aspect);
  expect(aspect.getAttribute('aria-expanded')).toBe('true');
  expect(screen.getByText('Sun and Moon diagram').getAttribute('data-theme')).toBe('ink');
});
