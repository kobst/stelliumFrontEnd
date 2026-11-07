import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LiveHoroscopeWorkspace from './LiveHoroscopeWorkspace';
import { useAuth } from '../../context/AuthContext';
import { fetchUser, getLatestHoroscope, getTransitWindows, getTransitFrames, fetchHoroscopeChatHistory, generateCustomHoroscope } from '../../Utilities/api';
import { initialHoroscope } from './horoscopeData';

jest.mock('../../Utilities/api', () => ({
  fetchUser: jest.fn(), getLatestHoroscope: jest.fn(), getTransitWindows: jest.fn(), getTransitFrames: jest.fn(),
  fetchHoroscopeChatHistory: jest.fn(), generateCustomHoroscope: jest.fn(),
}));
jest.mock('../../context/AuthContext', () => ({ useAuth: jest.fn() }));
jest.mock('../../Utilities/analytics', () => ({ trackChatMessageSent: jest.fn(), trackCreditWallHit: jest.fn() }));
jest.mock('../../Utilities/entitlementsStore', () => {
  const state = { plan: 'PLUS', isSubscriptionActive: true, pricingModel: 'simple', credits: { total: 5 },
    hasEnoughCredits: () => true, getChatQuestionsRemaining: () => 5, fetchEntitlements: jest.fn(),
    applyOptimisticCreditSpend: jest.fn(), restoreCredits: jest.fn() };
  return { __esModule: true, default: (selector) => selector(state), testState: state };
});
jest.mock('../../Utilities/store', () => {
  const state = { userPlanets: [], userAspects: [], userHouses: [], userPatterns: {} };
  return { __esModule: true, default: (selector) => selector(state) };
});
jest.mock('../../UI/shared/Ephemeris', () => () => <div>Account chart</div>);
jest.mock('../../UI/entitlements/InsufficientCreditsModal', () => () => null);
jest.mock('../../UI/gravityChat/StreamingTextReveal', () => ({ __esModule: true, default: ({ text }) => <p>{text}</p> }));

const mount = () => render(<MemoryRouter><LiveHoroscopeWorkspace /></MemoryRouter>);
const account = (id = 'account-a') => useAuth.mockReturnValue({ stelliumUser: { _id: id, firstName: id } });
const ask = (text) => {
  fireEvent.change(screen.getByRole('textbox', { name: 'Your message' }), { target: { value: text } });
  fireEvent.click(screen.getByRole('button', { name: 'Send message' }));
};
let scrollIntoView;

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
  localStorage.setItem('ag_horoscope_workspace_account-a', JSON.stringify(initialHoroscope('2026-10-23')));
  scrollIntoView = jest.fn();
  Element.prototype.scrollIntoView = scrollIntoView;
  account();
  const allowance = jest.requireMock('../../Utilities/entitlementsStore').testState;
  allowance.plan = 'PLUS';
  allowance.hasEnoughCredits = () => true;
  fetchUser.mockImplementation(async (id) => ({ firstName: id, birthChart: { planets: [{ name: 'Mars', sign: 'Cancer', norm_degree: 20, full_degree: 110 }] } }));
  getLatestHoroscope.mockImplementation(async (id, type) => ({ horoscope: {
    interpretation: `${id} ${type} forecast.\n\nVenus square natal Mars invites reflection.`,
    startDate: '2026-10-01', endDate: '2026-10-31',
  } }));
  getTransitWindows.mockResolvedValue({ transitEvents: [{ id: 'venus-mars', transitingPlanet: 'Venus', aspect: 'square', targetPlanet: 'Mars', start: '2026-10-20', exact: '2026-10-23T12:00:00', end: '2026-10-26' }] });
  getTransitFrames.mockResolvedValue([]);
  fetchHoroscopeChatHistory.mockImplementation(async (id) => [{ id: `${id}-history`, role: 'assistant', content: `${id} saved discussion` }]);
  generateCustomHoroscope.mockResolvedValue({ horoscope: { interpretation: 'A reply grounded in the selected transit.' } });
});

it('loads all three saved periods without generating anything or replacing the service discussion', async () => {
  const view = mount();
  await screen.findByText('account-a weekly forecast.');
  await screen.findByText('account-a saved discussion');
  fireEvent.click(screen.getByRole('button', { name: 'Today', exact: true }));
  await screen.findByText('account-a daily forecast.');
  fireEvent.click(screen.getByRole('button', { name: 'This month', exact: true }));
  await screen.findByText('account-a monthly forecast.');
  expect(screen.getByText('account-a saved discussion')).toBeTruthy();
  expect(fetchHoroscopeChatHistory).toHaveBeenCalledTimes(1);
  expect(generateCustomHoroscope).not.toHaveBeenCalled();
  expect(scrollIntoView).not.toHaveBeenCalled();
  view.unmount(); mount();
  await screen.findByText('account-a monthly forecast.');
  await screen.findByText('account-a saved discussion');
  expect(fetchHoroscopeChatHistory).toHaveBeenCalledTimes(2);
});

it('sends explicit transit context through the real chat panel while retaining the reading', async () => {
  mount();
  await screen.findByText('account-a weekly forecast.');
  await screen.findByText('account-a saved discussion');
  const reading = screen.getByRole('article', { name: 'This week horoscope reading' });
  fireEvent.click(within(reading).getByRole('button', { name: 'Explore Venus square natal Mars ↗' }));
  expect(generateCustomHoroscope).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Ask about this transit ↗' }));
  await waitFor(() => expect(document.querySelector('.ask-panel__context-chips').textContent).toContain('Venus square natal Mars'));
  ask('How can I approach this?');
  await screen.findByText('A reply grounded in the selected transit.');
  expect(generateCustomHoroscope).toHaveBeenCalledWith('account-a', expect.objectContaining({
    query: 'How can I approach this?', period: 'weekly', selectedTransits: [expect.objectContaining({ transitingPlanet: 'Venus', targetPlanet: 'Mars' })],
  }));
  expect(screen.getByRole('article', { name: 'This week horoscope reading' })).toBe(reading);
  expect(scrollIntoView).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Today', exact: true }));
  await screen.findByText('account-a daily forecast.');
  expect(document.querySelector('.ask-panel__context-chips')).toBeNull();
  expect(screen.getByText('A reply grounded in the selected transit.')).toBeTruthy();
});

it('does not leak reading, conversation or selection state when the account changes', async () => {
  const view = mount();
  await screen.findByText('account-a weekly forecast.');
  await screen.findByText('account-a saved discussion');
  account('account-b');
  view.rerender(<MemoryRouter><LiveHoroscopeWorkspace /></MemoryRouter>);
  await screen.findByText('account-b weekly forecast.');
  await screen.findByText('account-b saved discussion');
  expect(screen.queryByText('account-a weekly forecast.')).toBeNull();
  expect(screen.queryByText('account-a saved discussion')).toBeNull();
});

it('does not attach an unrelated latest reading when exploring outside its coverage', async () => {
  mount();
  await screen.findByText('account-a weekly forecast.');
  await screen.findByText('account-a saved discussion');
  fireEvent.click(screen.getByRole('button', { name: 'Explore transits ↗' }));
  fireEvent.change(screen.getByLabelText('Explore date'), { target: { value: '2026-12-10' } });
  await waitFor(() => expect(screen.getByRole('button', { name: /reading covers.*return/ })).toBeTruthy());
  ask('Tell me about this date, not the old forecast.');
  await screen.findByText('A reply grounded in the selected transit.');
  expect(generateCustomHoroscope.mock.calls[0][1]).not.toHaveProperty('period');
  expect(generateCustomHoroscope.mock.calls[0][1].startDate).toBe(new Date('2026-12-10T00:00:00').toISOString());
});

it('restores a newly answered question from service history after remounting', async () => {
  const history = [];
  fetchHoroscopeChatHistory.mockImplementation(async () => [...history]);
  generateCustomHoroscope.mockImplementationOnce(async (id, request) => {
    history.push({ id: 'new-question', role: 'user', content: request.query }, { id: 'new-answer', role: 'assistant', content: 'An answer restored from service history.' });
    return { horoscope: { interpretation: 'An answer restored from service history.' } };
  });
  const view = mount();
  await screen.findByText('account-a weekly forecast.');
  await waitFor(() => expect(screen.queryByText('Loading chat history...')).toBeNull());
  ask('Remember this horoscope question.');
  await screen.findByText('An answer restored from service history.');
  view.unmount(); mount();
  await screen.findByText('Remember this horoscope question.');
  await screen.findByText('An answer restored from service history.');
  expect(generateCustomHoroscope).toHaveBeenCalledTimes(1);
});

it('keeps the real chat allowance gate in effect', async () => {
  const allowance = jest.requireMock('../../Utilities/entitlementsStore').testState;
  allowance.plan = 'FREE';
  // Simple pricing gates on the free-question counter, not the legacy credit wallet.
  allowance.getChatQuestionsRemaining = () => 0;
  allowance.hasEnoughCredits = () => false;
  mount();
  await screen.findByText('account-a weekly forecast.');
  await screen.findByText('account-a saved discussion');
  ask('A question without remaining allowance.');
  expect(generateCustomHoroscope).not.toHaveBeenCalled();
  expect(screen.getByRole('textbox', { name: 'Your message' }).value).toBe('A question without remaining allowance.');
});
