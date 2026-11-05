import React from 'react';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ConversationPrototype from './ConversationPrototype';
import { initialState, STORAGE_KEY } from './model';
import { askPassage } from './referenceTestUtils';

jest.mock('../../UI/shared/Ephemeris', () => () => <div>Optional chart</div>);
jest.mock('../../UI/shared/AspectMiniChart', () => () => <div>Optional aspect</div>);
const mount = (owned = true) => {
  const state = initialState();
  state.settings.access = owned ? 'owned' : 'locked';
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  return render(<MemoryRouter><ConversationPrototype /></MemoryRouter>);
};
const openService = (label) => fireEvent.click(within(screen.getByRole('complementary', { name: 'Your services' })).getByRole('button', { name: new RegExp(label) }));
const send = (text) => { fireEvent.change(screen.getByRole('textbox', { name: 'Your question' }), { target: { value: text } }); fireEvent.click(screen.getByRole('button', { name: 'Send question' })); };
beforeEach(() => { localStorage.clear(); jest.useFakeTimers(); });
afterEach(() => { jest.clearAllTimers(); jest.useRealTimers(); });

it('keeps chart context optional, shows the cap, and returns source chips to hidden rows', () => {
  mount(); openService('Maya’s birth chart');
  const picker = document.querySelector('.cp-chart-picker');
  expect(picker.open).toBe(false);
  expect(document.querySelectorAll('.cp-sample-note')).toHaveLength(1);
  fireEvent.click(picker.querySelector('summary'));
  expect(picker.open).toBe(true);
  for (const label of ['Sun in Libra', 'Moon in Leo', 'Venus square Mars']) fireEvent.click(screen.getByRole('button', { name: `Include ${label} in question` }));
  expect(picker.querySelector('summary').textContent).toContain('3 of 3 selected');
  const fourth = screen.getByRole('button', { name: 'Include Venus in Aries in question' });
  expect(fourth.getAttribute('aria-disabled')).toBe('true');
  fireEvent.click(fourth);
  expect(screen.getByRole('group', { name: 'Question references' }).querySelectorAll('.cp-reference-chip')).toHaveLength(3);
  send('How do these work together?');
  act(() => jest.advanceTimersByTime(400));
  expect(picker.querySelector('summary').textContent).toContain('0 of 3 selected');
  expect(screen.getByRole('log').querySelectorAll('.cp-source-chip')).toHaveLength(3);
  expect(screen.getByRole('log').querySelectorAll('.cp-reference-bubble')).toHaveLength(0);
  fireEvent.click(picker.querySelector('summary'));
  expect(picker.open).toBe(false);
  fireEvent.click(screen.getByRole('button', { name: 'Return to source: Venus square Mars' }));
  act(() => jest.advanceTimersByTime(40));
  expect(picker.open).toBe(true);
  expect(document.activeElement.getAttribute('aria-label')).toBe('Include Venus square Mars in question');
});

it('takes birth chart overview and detailed passages into the same discussion and restores the chapter', () => {
  mount();
  openService('Maya’s birth chart');
  const overview = screen.getByRole('article', { name: 'Maya birth chart overview' });
  expect(screen.getByRole('log').textContent).toBe('');
  askPassage(overview.querySelector('.cp-reference-text'));
  expect(screen.getByRole('group', { name: 'Question references' }).textContent).toContain('Birth chart overview');
  send('How can I make this practical?');
  expect(screen.getByRole('log').textContent).toContain('Birth chart overview');
  fireEvent.click(screen.getByRole('button', { name: 'Detailed reading' }));
  expect(screen.getByRole('navigation', { name: 'Report chapters' }).querySelectorAll('button')).toHaveLength(6);
  fireEvent.click(screen.getByRole('button', { name: /04.*Career & ambition/ }));
  Object.defineProperty(window, 'scrollY', { configurable: true, value: 120 });
  fireEvent.scroll(window);
  act(() => jest.advanceTimersByTime(40));
  askPassage();
  send('Tell me more about this work pattern.');
  expect(screen.getByRole('log').textContent).toContain('Career & ambition');
  fireEvent.click(screen.getByRole('button', { name: 'Your sky', exact: true }));
  fireEvent.click(screen.getByRole('button', { name: /Maya · A birth chart reading/ }));
  expect(screen.getByRole('button', { name: /04.*Career & ambition/ }).getAttribute('aria-current')).toBe('step');
  expect(document.documentElement.scrollTop).toBe(120);
  expect(JSON.parse(localStorage.getItem(STORAGE_KEY)).threads).toHaveLength(4);
});

it('keeps relationship stars and unknown-time notes, with an explicit missing composite state', () => {
  mount(); openService('Maya & Theo');
  expect(screen.getByLabelText('3 stars')).toBeTruthy();
  expect(screen.getByLabelText('4 stars')).toBeTruthy();
  expect(screen.getByRole('article', { name: 'Maya & Theo relationship overview' }).textContent).toContain('Theo’s birth time is unknown');
  expect(screen.queryByText(/\d+%/)).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Detailed reading' }));
  fireEvent.click(screen.getByRole('button', { name: 'Composite', exact: true }));
  expect(screen.getByRole('status').textContent).toContain('No composite interpretation is available');
  expect(screen.queryByRole('button', { name: 'Ask about passage 1' })).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Synastry', exact: true }));
  expect(document.querySelector('.cp-reading-prose .cp-reference-text')).toBeTruthy();
});

it('keeps a composite passage, its lens and its couple attached to the discussion', () => {
  mount(); openService('Maya & Alex');
  fireEvent.click(screen.getByRole('button', { name: 'Detailed reading' }));
  fireEvent.click(screen.getByRole('button', { name: 'Composite', exact: true }));
  askPassage();
  expect(screen.getByRole('group', { name: 'Question references' }).textContent).toContain('The connection · Composite');
  send('What can we try together?');
  expect(screen.getByRole('log').textContent).toContain('Maya and Alex');
  fireEvent.click(screen.getByRole('button', { name: /^Return to source:/ }));
  expect(screen.getByRole('button', { name: 'Composite', exact: true }).getAttribute('aria-pressed')).toBe('true');
});

it('keeps detailed birth chart access explicit and retryable instead of bypassing the report gate', () => {
  mount(false); openService('Maya’s birth chart');
  fireEvent.click(screen.getByRole('button', { name: 'Detailed reading' }));
  expect(screen.queryByRole('region', { name: 'Dedicated reading view' })).toBeNull();
  expect(screen.getByRole('button', { name: /Simulate purchase/ })).toBeTruthy();
  expect(within(screen.getByRole('log')).queryByRole('button', { name: /Simulate purchase/ })).toBeNull();
  expect(screen.getByRole('region', { name: 'Detailed reading access' })).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Detailed reading' }));
  expect(screen.getAllByRole('button', { name: /Simulate purchase/ })).toHaveLength(1);
  fireEvent.click(screen.getByRole('button', { name: /Simulate purchase/ }));
  act(() => jest.advanceTimersByTime(1600));
  fireEvent.click(screen.getByRole('button', { name: 'Open the reading ↗' }));
  expect(screen.getByRole('navigation', { name: 'Report chapters' })).toBeTruthy();
});

it('keeps the detailed reading and the same composer mounted through passage questions', () => {
  mount(); openService('Maya’s birth chart');
  const composer = screen.getByRole('textbox', { name: 'Your question' });
  fireEvent.click(screen.getByRole('button', { name: 'Detailed reading' }));
  const reading = screen.getByRole('region', { name: 'Dedicated reading view' });
  expect(screen.getByRole('textbox', { name: 'Your question' })).toBe(composer);
  composer.form.scrollIntoView = jest.fn();
  const focus = jest.spyOn(composer, 'focus');
  askPassage();
  expect(document.activeElement).toBe(composer);
  expect(focus).toHaveBeenCalledWith({ preventScroll: true });
  expect(composer.form.scrollIntoView).not.toHaveBeenCalled();
  expect(screen.getByRole('log').textContent).toBe('');
  send('How can I use this insight?');
  expect(screen.getByRole('region', { name: 'Dedicated reading view' })).toBe(reading);
  expect(screen.getByRole('log').textContent).toContain('How can I use this insight?');
  expect(screen.queryByRole('button', { name: 'Give conversation more space' })).toBeNull();
  expect(screen.getByRole('textbox', { name: 'Your question' })).toBe(composer);
  fireEvent.click(within(screen.getByRole('navigation', { name: 'Reading views' })).getByRole('button', { name: 'Overview', exact: true }));
  expect(screen.getByRole('article', { name: 'Maya birth chart overview' })).toBeTruthy();
  expect(screen.getByRole('textbox', { name: 'Your question' })).toBe(composer);
  expect(screen.getByRole('log').textContent).toContain('How can I use this insight?');
});

it('switches existing services from page navigation without adding chats or leaking context', () => {
  mount(); openService('Maya & Theo');
  const overview = screen.getByRole('article', { name: 'Maya & Theo relationship overview' });
  askPassage(overview.querySelector('.cp-reference-text'));
  expect(screen.getByRole('group', { name: 'Question references' }).textContent).toContain('Relationship overview');
  fireEvent.change(screen.getByRole('combobox', { name: 'Your services' }), { target: { value: 'birthchart:maya' } });
  expect(screen.getByRole('article', { name: 'Maya birth chart overview' })).toBeTruthy();
  expect(screen.queryByRole('group', { name: 'Question references' })).toBeNull();
  expect(screen.getByRole('textbox', { name: 'Your question' }).form.querySelector('select')).toBeNull();
  expect(JSON.parse(localStorage.getItem(STORAGE_KEY)).threads).toHaveLength(4);
});

it('returns to the quoted chapter, lens and paragraph after navigating elsewhere', () => {
  mount(); openService('Maya & Alex');
  fireEvent.click(screen.getByRole('button', { name: 'Detailed reading' }));
  fireEvent.click(screen.getByRole('button', { name: 'Composite', exact: true }));
  askPassage(document.querySelectorAll('.cp-reading-prose .cp-reference-text')[1]);
  send('Help us apply this together.');
  fireEvent.click(screen.getByRole('button', { name: /03.*Attraction/ }));
  fireEvent.click(screen.getByRole('button', { name: 'Synastry', exact: true }));
  fireEvent.click(screen.getByRole('button', { name: /^Return to source:/ }));
  expect(screen.getByRole('button', { name: /01.*The connection/ }).getAttribute('aria-current')).toBe('step');
  expect(screen.getByRole('button', { name: 'Composite', exact: true }).getAttribute('aria-pressed')).toBe('true');
  act(() => jest.advanceTimersByTime(40));
  expect(document.activeElement.dataset.referenceSource).toContain(':connection:composite:1');
  screen.getByRole('textbox', { name: 'Your question' }).focus();
  fireEvent.click(screen.getByRole('button', { name: /^Return to source:/ }));
  act(() => jest.advanceTimersByTime(40));
  expect(document.activeElement.dataset.referenceSource).toContain(':connection:composite:1');
  openService('Maya & Theo');
  expect(screen.getByRole('log').textContent).not.toContain('Help us apply this together.');
  expect(screen.queryByRole('region', { name: 'Dedicated reading view' })).toBeNull();
  openService('Maya & Alex');
  expect(screen.getByRole('log').textContent).toContain('Help us apply this together.');
  expect(JSON.parse(localStorage.getItem(STORAGE_KEY)).threads).toHaveLength(4);
});

it('keeps failed report access in the reading region across service changes and reloads', () => {
  const view = mount(false); openService('Maya’s birth chart');
  fireEvent.click(screen.getByLabelText('Simulate next generation failure'));
  fireEvent.click(screen.getByRole('button', { name: 'Detailed reading' }));
  fireEvent.click(screen.getByRole('button', { name: /Simulate purchase/ }));
  openService('Maya & Theo');
  act(() => jest.advanceTimersByTime(1600));
  expect(screen.queryByRole('alert')).toBeNull();
  openService('Maya’s birth chart');
  fireEvent.click(screen.getByRole('button', { name: 'Detailed reading' }));
  expect(screen.getByRole('region', { name: 'Detailed reading access' }).textContent).toContain('failed');
  view.unmount();
  render(<MemoryRouter initialEntries={['/?view=detail']}><ConversationPrototype /></MemoryRouter>);
  expect(within(screen.getByRole('log')).queryByRole('button', { name: 'Retry sample generation' })).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Retry sample generation' }));
  act(() => jest.advanceTimersByTime(1600));
  expect(screen.getByRole('button', { name: 'Open the reading ↗' })).toBeTruthy();
  expect(screen.queryByRole('button', { name: /Simulate purchase/ })).toBeNull();
});
