import React from 'react';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ConversationPrototype from './ConversationPrototype';
import { STORAGE_KEY } from './model';
import { askPassage } from './referenceTestUtils';

jest.mock('../../UI/shared/Ephemeris', () => () => <div>Sample wheel</div>);
jest.mock('../../UI/shared/AspectMiniChart', () => () => <div>Sample aspect diagram</div>);

const mount = () => render(<MemoryRouter initialEntries={['/prototype/conversation']}><ConversationPrototype /></MemoryRouter>);
const send = (text) => {
  fireEvent.change(screen.getByRole('textbox', { name: 'Your question' }), { target: { value: text } });
  fireEvent.click(screen.getByRole('button', { name: 'Send question' }));
};
const openService = (name) => fireEvent.click(within(screen.getByRole('complementary', { name: 'Your services' })).getByRole('button', { name: new RegExp(name) }));

beforeEach(() => { localStorage.removeItem(STORAGE_KEY); jest.useFakeTimers(); });
afterEach(() => { jest.clearAllTimers(); jest.useRealTimers(); });

it('completes the report, passage question, reading restoration and library round trip', () => {
  const view = mount();
  send('I want a full compatibility report');
  fireEvent.click(screen.getByRole('button', { name: 'Maya & Theo' }));
  expect(screen.getAllByText(/Theo’s birth time is unknown/).length).toBeGreaterThan(0);
  fireEvent.click(screen.getByRole('button', { name: 'Use sample included report' }));
  expect(screen.getByText(/Preparing your sample reading/)).toBeTruthy();
  act(() => jest.advanceTimersByTime(1600));
  fireEvent.click(screen.getByRole('button', { name: 'Open the reading ↗' }));
  fireEvent.click(screen.getByRole('button', { name: /03.*Attraction/ }));
  Object.defineProperty(window, 'scrollY', { configurable: true, value: 135 });
  fireEvent.scroll(window);
  act(() => jest.advanceTimersByTime(20));
  askPassage();
  expect(screen.getByRole('group', { name: 'Question references' }).textContent).toContain('Attraction · Synastry');
  send('How could I put that into practice?');
  expect(screen.getByRole('log').textContent).toContain('Attraction · Synastry');
  // Leaving for home does not replace the service’s history or reading position.
  fireEvent.click(screen.getByRole('button', { name: 'Home', exact: true }));
  fireEvent.click(screen.getByRole('button', { name: 'Your sky', exact: true }));
  fireEvent.click(screen.getByRole('button', { name: /Maya & Theo · A relationship reading/ }));
  expect(screen.getByRole('button', { name: /03.*Attraction/ }).getAttribute('aria-current')).toBe('step');
  expect(document.documentElement.scrollTop).toBe(135);
  view.unmount();
  mount();
  fireEvent.click(screen.getByRole('button', { name: 'Your sky', exact: true }));
  fireEvent.click(screen.getByRole('button', { name: /Maya & Theo · A relationship reading/ }));
  expect(screen.getByRole('button', { name: /03.*Attraction/ }).getAttribute('aria-current')).toBe('step');
});

it('resumes each product discussion across home visits and reloads without adding threads', () => {
  const view = mount();
  expect(screen.queryByRole('button', { name: /New conversation/ })).toBeNull();
  send('What does my Venus sign mean?');
  fireEvent.click(screen.getByRole('button', { name: 'Home', exact: true }));
  expect(screen.queryByRole('log').textContent).toBe('');
  send('What does my week look like?');
  expect(screen.getByRole('log').textContent).not.toContain('Venus sign');
  openService('Maya’s birth chart');
  expect(screen.getByRole('log').textContent).toContain('What does my Venus sign mean?');
  expect(screen.getByRole('log').textContent).not.toContain('What does my week look like?');
  fireEvent.click(screen.getByRole('button', { name: 'Home', exact: true }));
  send('Give me a short birth chart reading');
  expect(screen.getByRole('log').textContent).toContain('What does my Venus sign mean?');
  expect(screen.getByRole('log').textContent).toContain('A short reading');
  expect(JSON.parse(localStorage.getItem(STORAGE_KEY)).threads).toHaveLength(4);
  view.unmount(); mount();
  expect(screen.getByRole('log').textContent).toContain('What does my Venus sign mean?');
  openService('Maya’s horoscopes');
  expect(screen.getByRole('log').textContent).toContain('What does my week look like?');
});

it('selects a transit from the table, sends its existing Ask payload and restores its exact moment', () => {
  const view = mount();
  openService('Maya’s horoscopes');
  expect(screen.queryByRole('combobox', { name: 'Discuss' })).toBeNull();
  expect(screen.queryByRole('button', { name: 'A relationship reading', exact: true })).toBeNull();
  expect(screen.queryByRole('dialog')).toBeNull();
  expect(screen.queryByRole('region', { name: 'Calendar scrub track' })).toBeNull();
  expect(screen.getByRole('article', { name: 'This week horoscope reading' })).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Explore transits ↗' }));
  expect(screen.getByRole('region', { name: 'Explore transits' })).toBeTruthy();
  expect(document.body.style.overflow).toBe('');
  expect(screen.getByRole('region', { name: 'Calendar scrub track' })).toBeTruthy();
  const sky = screen.getByRole('region', { name: 'Sky and transits workspace' });
  fireEvent.click(within(sky).getByRole('button', { name: 'All transits', exact: true }));
  fireEvent.click(within(sky).getByRole('button', { name: 'Include Venus square natal Mars in question' }));
  expect(screen.getByRole('log').textContent).toBe('');
  fireEvent.click(screen.getByRole('button', { name: /Scrub to.*Oct 24/ }));
  expect(screen.getByRole('region', { name: 'Explore transits' })).toBeTruthy();
  expect(screen.getByRole('group', { name: 'Question references' }).textContent).toContain('Venus square natal Mars');
  expect(screen.getByRole('log').textContent).toBe('');
  send('Explain this influence');
  expect(screen.getByRole('log').textContent).toContain('Venus square natal Mars');
  const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
  const messages = stored.threads.find((thread) => thread.id === 'horoscope:maya').messages;
  expect(messages).toHaveLength(2);
  expect(messages[0].askContext.selectedTransits).toEqual([messages[0].references[0].data]);
  expect(messages[0].references[0].data).toMatchObject({ transitingPlanet: 'Venus', targetPlanet: 'Mars' });
  expect(stored.pendingReferences).toEqual([]);
  expect(stored.horoscope.bodiesMode).toBe('all');
  view.unmount(); mount();
  expect(screen.getByRole('log').textContent).toContain('Explain this influence');
  fireEvent.click(screen.getByRole('button', { name: 'Return to source: Venus square natal Mars' }));
  act(() => jest.advanceTimersByTime(20));
  expect(screen.getByRole('region', { name: 'Explore transits' })).toBeTruthy();
  expect(JSON.parse(localStorage.getItem(STORAGE_KEY)).horoscope.playhead).toBe(new Date('2026-10-23T12:00:00').getTime());
  fireEvent.click(screen.getByRole('button', { name: 'Close explorer ✕' }));
  fireEvent.click(screen.getByRole('button', { name: 'Explore transits ↗' }));
  expect(screen.getByRole('button', { name: /Scrub to.*Oct 23/ }).getAttribute('aria-current')).toBe('date');
  fireEvent.click(screen.getByRole('button', { name: 'Close explorer ✕' }));
  expect(document.body.style.overflow).toBe('');
  expect(screen.getByRole('button', { name: 'Explore transits ↗' })).toBe(document.activeElement);
  fireEvent.click(screen.getByRole('button', { name: 'Today', exact: true }));
  expect(screen.getByRole('article', { name: 'Today horoscope reading' })).toBeTruthy();
  expect(JSON.parse(localStorage.getItem(STORAGE_KEY)).horoscope.anchor).toBe('2026-10-23');
  fireEvent.click(screen.getByRole('button', { name: 'This month', exact: true }));
  expect(screen.getByRole('article', { name: 'This month horoscope reading' })).toBeTruthy();
  expect(screen.getByRole('textbox', { name: 'Your question' })).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Explore transits ↗' }));
  fireEvent.click(screen.getByRole('button', { name: 'Close explorer ✕' }));
  expect(screen.queryByRole('region', { name: 'Explore transits' })).toBeNull();
  expect(screen.getByRole('log').textContent).toContain('Explain this influence');
});

it('shares selected transits between the reading and explorer without duplicating context', () => {
  mount();
  openService('Maya’s horoscopes');
  const reading = screen.getByRole('article', { name: 'This week horoscope reading' });
  fireEvent.click(within(reading).getByRole('button', { name: 'Include Venus square natal Mars in question' }));
  expect(reading.querySelector('.is-transit-passage').textContent).toContain('Venus');
  expect(JSON.parse(localStorage.getItem(STORAGE_KEY)).horoscope.playhead).toBe(new Date('2026-10-23T12:00:00').getTime());
  expect(screen.getByRole('region', { name: 'Explore transits' })).toBeTruthy();
  expect(screen.queryByRole('dialog')).toBeNull();
  fireEvent.click(within(screen.getByRole('region', { name: 'Sky and transits workspace' })).getByRole('button', { name: 'Include Mercury trine natal Jupiter in question' }));
  expect(within(reading).getByRole('button', { name: 'Include Mercury trine natal Jupiter in question' }).getAttribute('aria-pressed')).toBe('true');
  expect(within(reading).getByRole('button', { name: 'Include Venus square natal Mars in question' }).getAttribute('aria-pressed')).toBe('true');
  expect(screen.getByRole('group', { name: 'Question references' }).querySelectorAll('.cp-reference-chip')).toHaveLength(2);
  expect(screen.queryByRole('button', { name: 'Return discussion below reading' })).toBeNull();
  send('What does this mean for me?');
  expect(screen.getByRole('article', { name: 'This week horoscope reading' })).toBe(reading);
  expect(screen.getByRole('log').textContent).toContain('Venus square natal Mars');
  expect(screen.getByRole('log').textContent).toContain('What does this mean for me?');
  expect(screen.queryByRole('group', { name: 'Question references' })).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Ask about this reading' }));
  expect(screen.getByRole('textbox', { name: 'Your question' })).toBe(document.activeElement);
});

it('keeps a failed generation retryable without repeating the access step', () => {
  mount();
  fireEvent.change(screen.getByLabelText('Report access scenario'), { target: { value: 'locked' } });
  fireEvent.click(screen.getByLabelText('Simulate next generation failure'));
  send('Full compatibility report for Alex');
  fireEvent.click(screen.getByRole('button', { name: /Simulate purchase/ }));
  act(() => jest.advanceTimersByTime(1600));
  expect(screen.getByRole('alert').textContent).toContain('generation failed');
  fireEvent.click(screen.getByRole('button', { name: 'Retry sample generation' }));
  act(() => jest.advanceTimersByTime(1600));
  expect(screen.getByRole('button', { name: 'Open the reading ↗' })).toBeTruthy();
  expect(screen.queryByRole('button', { name: /Simulate purchase/ })).toBeNull();
});

it('saves a dated forecast and keeps the expanded view tied to its original period', () => {
  mount();
  send('What does my week look like?');
  fireEvent.click(screen.getByRole('button', { name: 'Open forecast ↗' }));
  expect(within(screen.getByRole('region', { name: 'Reading content' })).getByText('19–25 October 2026')).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: '← Back to conversation' }));
  send('What does my Venus sign mean?');
  expect(within(screen.getByRole('log')).getByText('Sample aspect diagram')).toBeTruthy();
});
