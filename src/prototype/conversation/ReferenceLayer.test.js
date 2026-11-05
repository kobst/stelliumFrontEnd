import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { ReferenceEntity, ReferenceProvider, ReferenceText } from './ReferenceLayer';
import { selectText } from './referenceTestUtils';
import { textVersion } from './references';

const source = { serviceId: 'birthchart:maya', sourceId: 'chapter:1:0', label: 'Chapter 1' };
const text = 'A shared sense of purpose, with room for independent judgment.';
const entity = { ...source, sourceId: 'Venus-Mars', kind: 'aspect', label: 'Venus square Mars', data: { planet1: 'Venus', planet2: 'Mars', aspectType: 'square', orb: 1 } };
const wrap = (children, props = {}) => <ReferenceProvider serviceId={source.serviceId} references={[]} messages={[]} onSelect={jest.fn()} onOpenExchange={jest.fn()} {...props}>{children}</ReferenceProvider>;
afterEach(() => { window.getSelection().removeAllRanges(); });

it('offers Ask only on selection, captures exact offsets, and promotes entity text to structured context', () => {
  const onSelect = jest.fn();
  const { container } = render(wrap(<><ReferenceText source={source} text={text} /><ReferenceEntity reference={entity} /></>, { onSelect }));
  expect(screen.queryByRole('toolbar')).toBeNull();
  selectText(container.querySelector('p'), 2, 14);
  fireEvent.click(screen.getByRole('button', { name: 'Ask about selection' }));
  expect(onSelect.mock.calls[0][0]).toMatchObject({ ...source, kind: 'passage', excerpt: text.slice(2, 14), anchor: { start: 2, end: 14 } });
  expect(window.getSelection().toString()).toBe('');
  selectText(screen.getByRole('button', { name: 'Include Venus square Mars in question' }), 2, 7);
  fireEvent.click(screen.getByRole('button', { name: 'Ask about selection' }));
  expect(onSelect.mock.calls[1][0]).toEqual(entity);
});

it('rejects selections spanning sources and allows entity clicks after selecting unrelated prose', () => {
  const onSelect = jest.fn();
  const { container } = render(wrap(<><ReferenceText source={source} text={text} /><ReferenceText source={{ ...source, sourceId: 'second' }} text="Second paragraph" /><ReferenceEntity reference={entity} /></>, { onSelect }));
  const paragraphs = container.querySelectorAll('p');
  const range = document.createRange();
  range.setStart(paragraphs[0].firstChild, 0); range.setEnd(paragraphs[1].firstChild, 3);
  window.getSelection().addRange(range);
  fireEvent(document, new Event('selectionchange'));
  expect(screen.queryByRole('toolbar')).toBeNull();
  selectText(paragraphs[0], 0, 8);
  fireEvent.click(screen.getByRole('button', { name: 'Include Venus square Mars in question' }));
  expect(onSelect).toHaveBeenCalledWith(entity, true, false);
});

it('renders notes from canonical messages and opens the same discussion for both anchor kinds', () => {
  const reference = { ...source, kind: 'passage', sourceVersion: textVersion(text), excerpt: text.slice(2, 14), anchor: { start: 2, end: 14 } };
  const messages = [{ id: 'question', type: 'user', text: 'How does this help?', references: [reference, entity] }, { inReplyTo: 'question', text: 'Try a small shared commitment.' }];
  const onOpenExchange = jest.fn();
  const { container } = render(wrap(<><ReferenceText source={source} text={text} /><ReferenceEntity reference={entity} /></>, { messages, onOpenExchange }));
  expect(container.querySelector('.cp-reference-text').textContent).toBe(text);
  fireEvent.click(screen.getByRole('button', { name: 'Open notes about Chapter 1' }));
  expect(screen.getByText('Try a small shared commitment.')).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Open in discussion ↗' }));
  expect(onOpenExchange).toHaveBeenCalledWith('question');
  expect(screen.queryByRole('button', { name: 'Close inline note' })).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: '1 questions about Venus square Mars' }));
  expect(screen.getByText('Try a small shared commitment.')).toBeTruthy();
  expect(screen.getByRole('dialog', { name: 'Discussion about Venus square Mars' })).toBeTruthy();
  fireEvent.keyDown(document, { key: 'Escape' });
  expect(screen.queryByRole('dialog')).toBeNull();
  expect(document.activeElement).toBe(screen.getByRole('button', { name: '1 questions about Venus square Mars' }));
});

it('falls back visibly when prose changes rather than marking the wrong text', () => {
  jest.useFakeTimers();
  const reference = { ...source, kind: 'passage', sourceVersion: 'old', excerpt: 'old text', anchor: { start: 0, end: 8 } };
  render(wrap(<ReferenceText source={source} text={text} />, { messages: [{ id: 'q', type: 'user', references: [reference] }], returnRequest: { reference, visit: 1 } }));
  act(() => jest.advanceTimersByTime(20));
  expect(screen.queryByRole('button', { name: 'Open notes about Chapter 1' })).toBeNull();
  expect(screen.getByRole('button', { name: 'Earlier discussion · source changed' })).toBeTruthy();
  expect(screen.getByRole('status').textContent).toContain('original source has changed');
  jest.useRealTimers();
});
