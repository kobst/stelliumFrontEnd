import React, { useRef } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import useReplyReveal from './useReplyReveal';

function Harness({ target, enabled = true }) {
  const transcript = useRef(null), input = useRef(null);
  useReplyReveal(target, transcript, input, enabled);
  return <><nav className="cp-product-navigation" /><div ref={transcript}><article tabIndex={-1} data-message="reply">New reply</article></div><form><textarea ref={input} /></form></>;
}
beforeEach(() => { jest.useFakeTimers(); jest.spyOn(window, 'scrollTo').mockImplementation(() => {}); });
afterEach(() => { jest.clearAllTimers(); jest.useRealTimers(); jest.restoreAllMocks(); });

it('waits for layout, targets the sent reply, and rechecks after dock resizing', () => {
  render(<Harness target="reply" />);
  document.querySelector('nav').getBoundingClientRect = () => ({ height: 60 });
  document.querySelector('form').getBoundingClientRect = () => ({ top: 600 });
  screen.getByText('New reply').getBoundingClientRect = () => ({ top: 1200, bottom: 1400 });
  expect(window.scrollTo).not.toHaveBeenCalled();
  act(() => jest.advanceTimersByTime(40));
  expect(window.scrollTo).toHaveBeenCalledWith({ top: window.scrollY + 1120, behavior: 'instant' });
  expect(document.activeElement).toBe(screen.getByText('New reply'));
  act(() => jest.advanceTimersByTime(260));
  expect(window.scrollTo).toHaveBeenCalledTimes(2);
});

it('does not reveal history on mount and does not replay a handled send after view navigation', () => {
  const view = render(<Harness target={null} />);
  act(() => jest.advanceTimersByTime(400));
  expect(window.scrollTo).not.toHaveBeenCalled();
  view.rerender(<Harness target="reply" />);
  screen.getByText('New reply').getBoundingClientRect = () => ({ top: 1200, bottom: 1400 });
  act(() => jest.advanceTimersByTime(400));
  window.scrollTo.mockClear();
  view.rerender(<Harness target="reply" enabled={false} />);
  view.rerender(<Harness target="reply" />);
  act(() => jest.advanceTimersByTime(400));
  expect(window.scrollTo).not.toHaveBeenCalled();
});

it('cancels the settle check when the user navigates or scrolls', () => {
  render(<Harness target="reply" />);
  screen.getByText('New reply').getBoundingClientRect = () => ({ top: 1200, bottom: 1400 });
  act(() => jest.advanceTimersByTime(40));
  window.scrollTo.mockClear();
  fireEvent.pointerDown(window);
  act(() => jest.advanceTimersByTime(400));
  expect(window.scrollTo).not.toHaveBeenCalled();
});
