import { act, fireEvent, screen } from '@testing-library/react';

export function selectText(element, start = 0, end = element.textContent.length) {
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  const range = document.createRange();
  let node, offset = 0, started = false;
  while ((node = walker.nextNode())) {
    const next = offset + node.textContent.length;
    if (!started && start <= next) { range.setStart(node, start - offset); started = true; }
    if (end <= next) { range.setEnd(node, end - offset); break; }
    offset = next;
  }
  const selection = window.getSelection();
  selection.removeAllRanges(); selection.addRange(range);
  fireEvent(document, new Event('selectionchange'));
}

export function askPassage(element = document.querySelector('.cp-reading-prose .cp-reference-text')) {
  selectText(element);
  fireEvent.click(screen.getByRole('button', { name: 'Ask about selection' }));
  act(() => jest.advanceTimersByTime(20));
}
