import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import ServiceLibrary, { serviceState, ServiceNavigation, navigationGroups } from './ServiceLibrary';
jest.mock('../../Utilities/api', () => ({}));
const self = { _id: 'self', firstName: 'Eva', lastName: 'Hanson', analysisStatus: { level: 'complete' }, updatedAt: '2026-10-30T12:00:00Z' };
const guest = { _id: 'guest', firstName: 'Partner', analysisStatus: { level: 'overview' } };
const pair = { _id: 'pair', userA_id: 'self', userB_id: 'guest', userA_name: 'Eva Hanson', userB_name: 'Partner', relationshipAnalysisStatus: { level: 'scores' } };
const library = { people: [self, guest], relationships: [pair], services: [
  { id: 'birthchart:self', contentId: 'self', kind: 'birthchart', title: 'Eva Hanson’s birth chart', record: self },
  { id: 'birthchart:guest', contentId: 'guest', kind: 'birthchart', title: 'Partner’s birth chart', record: guest },
  { id: 'relationship:pair', contentId: 'pair', kind: 'relationship', title: 'Eva Hanson & Partner', record: pair },
  { id: 'horoscope:self', contentId: 'self', kind: 'horoscope', title: 'My horoscopes' },
] };
const access = { birthCharts: ['guest'], relationships: [] };
it('groups services and separates saved content from unlocked access', () => {
  render(<ServiceLibrary library={library} account={self} access={access} onOpen={jest.fn()} />);
  for (const name of ['You', 'People', 'Relationships']) expect(screen.getByRole('region', { name })).toBeTruthy();
  expect(screen.queryByRole('region', { name: 'Horoscopes' })).toBeNull();
  expect(within(screen.getByRole('region', { name: 'People' })).queryByRole('article', { name: 'Eva Hanson' })).toBeNull();
  const ownCard = within(screen.getByRole('article', { name: 'Eva Hanson' }));
  expect(ownCard.getByText('Detailed reading saved')).toBeTruthy();
  expect(ownCard.queryByText('Detailed access unlocked')).toBeNull();
  expect(ownCard.queryByText(/Purchased|Unread|Last chat/)).toBeNull();
  expect(ownCard.getByText(/Updated/)).toBeTruthy();
  const guestCard = within(screen.getByRole('article', { name: 'Partner' }));
  expect(guestCard.getByText('Overview available')).toBeTruthy();
  expect(guestCard.getByText('Detailed access unlocked')).toBeTruthy();
});
it('supports search, status filters and an empty-result reset', () => {
  render(<ServiceLibrary library={library} account={self} access={access} onOpen={jest.fn()} />);
  fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'eva' } });
  expect(screen.getAllByRole('article')).toHaveLength(2);
  fireEvent.change(screen.getByLabelText('Reading status'), { target: { value: 'detailed' } });
  expect(screen.getAllByRole('article')).toHaveLength(1);
  fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'missing' } });
  expect(screen.getAllByRole('article')).toHaveLength(1);
  expect(screen.getByRole('article', { name: 'Eva Hanson' })).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Clear filters' }));
  expect(screen.getAllByRole('article')).toHaveLength(3);
});
it('connects a person to their relationships and a relationship back to their charts', () => {
  const open = jest.fn(); render(<ServiceLibrary library={library} account={self} access={access} onOpen={open} />);
  fireEvent.click(within(screen.getByRole('article', { name: 'Eva Hanson' })).getByRole('button', { name: /In 1 relationship/ }));
  expect(screen.getAllByRole('article')).toHaveLength(2);
  fireEvent.click(screen.getByRole('button', { name: 'Eva Hanson’s chart ↗' }));
  expect(open).toHaveBeenCalledWith('birthchart:self');
  fireEvent.click(screen.getByRole('button', { name: /Clear person filter/ }));
  expect(screen.getAllByRole('article')).toHaveLength(3);
});
it('does not fabricate availability or purchase state from missing metadata', () => {
  expect(serviceState({ kind: 'birthchart', contentId: 'missing' }, access)).toMatchObject({ state: 'unknown', unlocked: false });
  expect(serviceState({ kind: 'birthchart', record: { analysisStatus: { level: 'complete', workflowStatus: 'completed_with_failures' } } })).toMatchObject({ state: 'attention' });
});

it('pins owner readings and forecasts ahead of search without changing their service IDs', () => {
  const open = jest.fn(); render(<ServiceLibrary library={library} account={self} access={access} onOpen={open} />);
  const owner = within(screen.getByRole('region', { name: 'You' }));
  fireEvent.click(owner.getByRole('button', { name: /Open reading & discussion/ }));
  expect(open).toHaveBeenLastCalledWith('birthchart:self');
  fireEvent.click(owner.getByRole('button', { name: /Open forecasts & discussion/ }));
  expect(open).toHaveBeenLastCalledWith('horoscope:self');
  expect(screen.getByRole('region', { name: 'You' }).compareDocumentPosition(screen.getByRole('searchbox')) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  expect(within(screen.getByRole('article', { name: 'Partner' })).queryByText(/forecasts/i)).toBeNull();
  expect(within(screen.getByRole('region', { name: 'Relationships' })).queryByText(/forecasts/i)).toBeNull();
});

it('groups desktop and mobile navigation under You, People, Relationships', () => {
  const groups = navigationGroups(library, self._id);
  expect(groups.map(group => group.title)).toEqual(['You', 'People', 'Relationships']);
  expect(groups[0].services.map(service => service.id)).toEqual(['birthchart:self', 'horoscope:self']);
  expect(groups[1].services.map(service => service.id)).toEqual(['birthchart:guest']);
  const open = jest.fn();
  render(<ServiceNavigation library={library} account={self} active={library.services[3]} access={access} onOpen={open} />);
  const forecast = screen.getByRole('button', { name: /Your forecasts/ });
  expect(forecast.getAttribute('aria-current')).toBe('page');
  fireEvent.click(forecast); expect(open).toHaveBeenCalledWith('horoscope:self');
});

it('retains owner forecasts when the owner chart cannot be loaded', () => {
  const partial = { ...library, services: library.services.filter(service => service.id !== 'birthchart:self') };
  render(<ServiceLibrary library={partial} account={self} access={access} onOpen={jest.fn()} />);
  const owner = within(screen.getByRole('region', { name: 'You' }));
  expect(owner.getByText(/birth chart could not be loaded/)).toBeTruthy();
  expect(owner.getByRole('button', { name: /Open forecasts & discussion/ })).toBeTruthy();
});
