import React, { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import BirthDetailsFlow from './BirthDetailsFlow';
import { birthDetailPrompt, formatBirthDate, formatBirthTime } from './birthDetailsIntake';

function Harness({ onConfirm = jest.fn(), initial = {} }) {
  const [value, setValue] = useState({ name: '', birthDate: '', place: '', birthTime: '', unknownTime: false, ...initial });
  return <BirthDetailsFlow value={value} onChange={setValue} onConfirm={() => onConfirm(value)} onCancel={jest.fn()} confirmLabel="Confirm person" />;
}
const change = (label, value) => fireEvent.change(screen.getByLabelText(label), { target: { value } });
const next = () => fireEvent.click(screen.getByRole('button', { name: 'Continue', exact: true }));

it('validates each step, accepts midnight, and requires explicit confirmation', () => {
  const onConfirm = jest.fn(); render(<Harness onConfirm={onConfirm} />);
  expect(screen.getAllByRole('textbox')).toHaveLength(1);
  next(); expect(screen.getByRole('alert').textContent).toContain('Enter a name');
  change('Name', 'Riley'); next();
  change('Birth date', '2999-01-01'); next();
  expect(screen.getByRole('alert').textContent).toContain('future');
  change('Birth date', '1996-02-29'); next();
  next(); expect(screen.getByRole('alert').textContent).toContain('birthplace');
  change('Birthplace', 'Boston, MA, USA'); next();
  next(); expect(screen.getByRole('alert').textContent).toContain('birth time');
  change('Birth time', '00:00'); next();
  expect(screen.getByText('12:00 am')).toBeTruthy();
  expect(onConfirm).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Confirm person' }));
  expect(onConfirm).toHaveBeenCalledWith(expect.objectContaining({ name: 'Riley', birthTime: '00:00', unknownTime: false }));
});

it('preserves partial drafts across chat/form switches and can edit unknown time to known', () => {
  const onConfirm = jest.fn(); render(<Harness onConfirm={onConfirm} />);
  change('Name', 'Riley'); next(); change('Birth date', '1995-05-12');
  fireEvent.click(screen.getByRole('button', { name: 'Enter all details at once' }));
  expect(screen.getByLabelText('Name').value).toBe('Riley');
  expect(screen.getByLabelText('Birth date').value).toBe('1995-05-12');
  change('Birthplace', 'Boston');
  fireEvent.click(screen.getByRole('button', { name: 'Ask me one question at a time' }));
  expect(screen.getByLabelText('Birth time')).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'I don’t know their birth time' }));
  fireEvent.click(screen.getByRole('button', { name: 'Edit birth time' }));
  change('Birth time', '13:42'); next();
  expect(screen.getByText('1:42 pm')).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Edit all details' }));
  expect(screen.getByLabelText('Birth time unknown').checked).toBe(false);
  expect(screen.getByLabelText('Birth time').value).toBe('13:42');
  fireEvent.click(screen.getByRole('button', { name: 'Review details' }));
  fireEvent.click(screen.getByRole('button', { name: 'Confirm person' }));
  expect(onConfirm).toHaveBeenCalledWith(expect.objectContaining({ birthDate: '1995-05-12', place: 'Boston', unknownTime: false, birthTime: '13:42' }));
});

it('validates the full form before review and preserves unknown time when switching back to chat', () => {
  render(<Harness />);
  fireEvent.click(screen.getByRole('button', { name: 'Enter all details at once' }));
  fireEvent.click(screen.getByRole('button', { name: 'Review details' }));
  expect(screen.getByRole('alert').textContent).toContain('name');
  change('Name', 'Riley'); change('Birth date', '1995-05-12'); change('Birthplace', 'Boston');
  fireEvent.click(screen.getByLabelText('Birth time unknown'));
  fireEvent.click(screen.getByRole('button', { name: 'Ask me one question at a time' }));
  expect(screen.getByRole('heading', { name: 'Check birth details' })).toBeTruthy();
  expect(screen.getByText('Birth time unknown')).toBeTruthy();
});

it('preserves the home trial’s prompts and formatted answers through shared helpers', () => {
  expect(birthDetailPrompt('birthDate', { name: 'Maya', self: true })).toBe('Lovely to meet you, Maya. What’s your birth date?');
  expect(birthDetailPrompt('place', { self: true })).toBe('And where were you born? City and country is perfect.');
  expect(birthDetailPrompt('birthTime', { self: true })).toBe('Last one — what time were you born? If you don’t know, that’s completely fine.');
  expect(formatBirthDate('1990-10-02')).toBe('2 October 1990');
  expect(formatBirthTime('12:00')).toBe('12:00 pm');
});
