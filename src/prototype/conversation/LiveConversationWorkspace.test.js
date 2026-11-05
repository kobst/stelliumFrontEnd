import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LiveConversationWorkspace from './LiveConversationWorkspace';
import { useAuth } from '../../context/AuthContext';
import * as api from '../../Utilities/api';

jest.mock('../../Utilities/api', () => ({ fetchUser: jest.fn(), getUserSubjects: jest.fn(), getUserCompositeCharts: jest.fn(), fetchAnalysis: jest.fn(), fetchRelationshipAnalysis: jest.fn(), fetchEnhancedChatHistory: jest.fn(), fetchRelationshipEnhancedChatHistory: jest.fn(), enhancedChatForUserBirthChart: jest.fn(), enhancedChatForRelationship: jest.fn() }));
jest.mock('../../context/AuthContext', () => ({ useAuth: jest.fn() }));
jest.mock('../../Utilities/analytics', () => ({ trackChatMessageSent: jest.fn(), trackCreditWallHit: jest.fn() }));
jest.mock('../../Utilities/entitlementsStore', () => {
  const state = { plan: 'PLUS', isSubscriptionActive: true, pricingModel: 'simple', credits: { total: 5 }, hasEnoughCredits: () => true, getChatQuestionsRemaining: () => 5, fetchEntitlements: jest.fn().mockResolvedValue({ success: true }), applyOptimisticCreditSpend: jest.fn(), restoreCredits: jest.fn() };
  const hook = selector => selector ? selector(state) : state;
  hook.getState = () => state;
  return { __esModule: true, default: hook };
});
jest.mock('../../Utilities/store', () => ({ __esModule: true, default: selector => selector({ userPlanets: [], userAspects: [], userHouses: [], userPatterns: {} }) }));
jest.mock('../../UI/shared/Ephemeris', () => props => <div data-testid="chart">{props.planets.map(p => p.name).join(',')} / {props.transits.map(p => p.name).join(',')}</div>);
jest.mock('../../UI/entitlements/InsufficientCreditsModal', () => () => null);
jest.mock('../../UI/gravityChat/StreamingTextReveal', () => ({ __esModule: true, default: ({ text }) => <p>{text}</p> }));
jest.mock('./LiveHoroscopeWorkspace', () => () => <p>Live horoscope workspace</p>);
jest.mock('./LiveCreateDialog', () => () => null);
const oldUrl = process.env.REACT_APP_SERVER_URL;
const planet = (name, degree) => ({ name, full_degree: degree, norm_degree: degree % 30, sign: 'Libra' });
const pair = { _id: 'pair', userA_id: 'self', userB_id: 'guest', userA_name: 'Account', userB_name: 'Partner', compositeChart: { planets: [planet('Venus', 45)] }, synastryAspects: [] };
const factor = { source: 'synastry', code: 'real-factor', description: 'Sun trine Moon', starRating: 3, orb: 2 };
const mount = (service = 'birthchart:self') => render(<MemoryRouter initialEntries={[`/?service=${service}`]}><LiveConversationWorkspace /></MemoryRouter>);
beforeEach(() => {
  jest.clearAllMocks(); process.env.REACT_APP_SERVER_URL = 'https://api.dev.stellium.ai/';
  window.scrollTo = jest.fn(); Element.prototype.scrollIntoView = jest.fn();
  window.innerWidth = 1440;
  useAuth.mockReturnValue({ stelliumUser: { _id: 'self', firstName: 'Account' } });
  api.fetchUser.mockImplementation(async id => ({ _id: id, firstName: id, birthChart: { planets: [planet('Sun', 185)], aspects: [], houses: [] } }));
  api.getUserSubjects.mockResolvedValue([{ _id: 'guest', firstName: 'Partner', birthChart: { planets: [planet('Moon', 120)] } }]);
  api.getUserCompositeCharts.mockResolvedValue([pair]);
  api.fetchAnalysis.mockResolvedValue({ interpretation: { basicAnalysis: { overview: 'Real overview prose.' }, broadCategoryAnalyses: { PERSONALITY_IDENTITY: { overview: 'Real detailed chapter.' } } } });
  api.fetchRelationshipAnalysis.mockResolvedValue({ initialOverview: 'Actual relationship overview.', scoredItems: [factor] });
  api.fetchEnhancedChatHistory.mockImplementation(async id => [{ role: 'assistant', content: `${id} saved discussion` }]);
  api.fetchRelationshipEnhancedChatHistory.mockResolvedValue([{ role: 'assistant', content: 'Saved relationship discussion' }]);
  api.enhancedChatForUserBirthChart.mockResolvedValue({ answer: 'Account answer' });
  api.enhancedChatForRelationship.mockResolvedValue({ answer: 'Relationship answer' });
});
afterAll(() => { process.env.REACT_APP_SERVER_URL = oldUrl; });
it('loads saved reading and history, retaining the same chat across overview and detail', async () => {
  mount(); await screen.findByText('Real overview prose.'); await screen.findByText('self saved discussion');
  const input = screen.getByRole('textbox', { name: 'Your message' });
  fireEvent.change(input, { target: { value: 'Unsent question' } });
  fireEvent.click(screen.getByRole('button', { name: 'Detailed reading', exact: true }));
  expect(screen.getByText('Real detailed chapter.')).toBeTruthy();
  expect(screen.getByRole('textbox', { name: 'Your message' })).toBe(input);
  expect(input.value).toBe('Unsent question');
  expect(api.fetchEnhancedChatHistory).toHaveBeenCalledTimes(1);
  expect(api.enhancedChatForUserBirthChart).not.toHaveBeenCalled();
});
it('sends actual placement context through the existing Ask API', async () => {
  mount(); await screen.findByText('self saved discussion');
  fireEvent.click(screen.getByRole('button', { name: 'Include Sun in Libra in question' }));
  await waitFor(() => expect(document.querySelector('.ask-panel__context-chips').textContent).toContain('Sun in Libra'));
  fireEvent.change(screen.getByRole('textbox', { name: 'Your message' }), { target: { value: 'What does this mean?' } });
  fireEvent.click(screen.getByRole('button', { name: 'Send message' }));
  await screen.findByText('Account answer');
  expect(api.enhancedChatForUserBirthChart).toHaveBeenCalledWith('self', expect.objectContaining({ selectedAspects: [expect.objectContaining({ planet: 'Sun', sign: 'Libra', degree: 5 })] }));
});
it('stages selected prose without auto-sending or discarding an existing draft', async () => {
  mount(); await screen.findByText('self saved discussion');
  const text = screen.getByText('Real overview prose.').firstChild;
  const range = document.createRange(); range.selectNodeContents(text);
  const selection = window.getSelection(); selection.removeAllRanges(); selection.addRange(range);
  const input = screen.getByRole('textbox', { name: 'Your message' });
  fireEvent.change(input, { target: { value: 'My existing question' } });
  fireEvent.mouseUp(screen.getByRole('article', { name: 'Saved reading' }));
  fireEvent.click(screen.getByRole('button', { name: 'Ask about selection' }));
  await waitFor(() => expect(input.value).toContain('Real overview prose.'));
  expect(input.value).toContain('My existing question');
  expect(api.enhancedChatForUserBirthChart).not.toHaveBeenCalled();
  selection.removeAllRanges();
});
it('uses synastry and composite data and forwards the exact saved scored item', async () => {
  mount('relationship:pair'); await screen.findByText('Saved relationship discussion');
  expect(screen.getByTestId('chart').textContent).toBe('Sun / Moon');
  fireEvent.click(within(screen.getByRole('group', { name: 'Relationship chart' })).getByRole('button', { name: 'Composite' }));
  expect(screen.getByTestId('chart').textContent).toBe('Venus / ');
  fireEvent.click(within(screen.getByRole('group', { name: 'Relationship chart' })).getByRole('button', { name: 'Synastry' }));
  expect(screen.getByLabelText('3 stars')).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Include Sun trine Moon in question' }));
  fireEvent.change(screen.getByRole('textbox', { name: 'Your message' }), { target: { value: 'How does this affect us?' } });
  fireEvent.click(screen.getByRole('button', { name: 'Send message' }));
  await screen.findByText('Relationship answer');
  expect(api.enhancedChatForRelationship).toHaveBeenCalledWith('pair', 'How does this affect us?', [factor]);
});
it('clears prior account content on account switch', async () => {
  const view = mount(); await screen.findByText('self saved discussion');
  useAuth.mockReturnValue({ stelliumUser: { _id: 'other', firstName: 'Other' } });
  view.rerender(<MemoryRouter><LiveConversationWorkspace /></MemoryRouter>);
  await screen.findByText('Welcome, Other.');
  expect(screen.queryByText('self saved discussion')).toBeNull();
  expect(screen.queryByText('Real overview prose.')).toBeNull();
});
it('keeps unavailable detail missing and links to the existing access flow', async () => {
  api.fetchAnalysis.mockResolvedValue({ error: 'No analysis found' });
  mount(); await screen.findByText('No overview is saved yet.');
  fireEvent.click(screen.getByRole('button', { name: 'Detailed reading', exact: true }));
  expect(screen.getByText('No detailed reading is saved yet.')).toBeTruthy();
  expect(screen.getByRole('link', { name: /existing service to check access/ }).getAttribute('href')).toBe('/dashboard/self/chart/self');
});

it('starts at a grouped dashboard and opens a service with its saved discussion', async () => {
  mount('');
  await screen.findByRole('region', { name: 'Your sky dashboard' });
  expect(screen.queryByRole('complementary', { name: 'Your services' })).toBeNull();
  fireEvent.click(within(screen.getByRole('article', { name: 'self' })).getByRole('button', { name: /Open reading/ }));
  await screen.findByText('self saved discussion');
  const nav = within(screen.getByRole('complementary', { name: 'Your services' }));
  expect(nav.getByRole('region', { name: 'People' })).toBeTruthy();
  expect(nav.getByRole('region', { name: 'Relationships' })).toBeTruthy();
  fireEvent.click(nav.getByRole('button', { name: /Your sky dashboard/ }));
  await screen.findByRole('region', { name: 'Your sky dashboard' });
});

it('keeps a usable composer with no prior messages and retries failed history', async () => {
  api.fetchEnhancedChatHistory.mockRejectedValueOnce(new Error('Network unavailable')).mockResolvedValueOnce([{ role: 'assistant', content: 'Restored discussion' }]);
  mount();
  await screen.findByText(/Your saved discussion could not be loaded/);
  expect(screen.getByRole('textbox', { name: 'Your message' })).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Retry discussion' }));
  await screen.findByText('Restored discussion');
  expect(screen.queryByText(/Your saved discussion could not be loaded/)).toBeNull();
  expect(api.fetchEnhancedChatHistory).toHaveBeenCalledTimes(2);
});
