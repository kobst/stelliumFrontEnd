import { createMessages, initialState, loadState, reducer, resolveRequest, serializableState, STORAGE_KEY } from './model';
import { personError } from './creation';

const person = { id: 'local-jordan', name: 'Jordan', birthDate: '1993-02-15', birthTime: '', unknownTime: true, place: 'Portland, OR, USA' };
it('adds a person and pair with stable, distinct discussions and persists both', () => {
  let state = reducer(initialState(), { type: 'add-person', person });
  expect(state.activeId).toBe('birthchart:local-jordan');
  const request = resolveRequest('Give me a full birth chart report', state.subjectId, 'question', state.activeId, state);
  const messages = createMessages('Give me a full birth chart report', request, state);
  state = reducer(state, { type: 'send', ...messages, subjectId: state.subjectId });
  expect(messages.response.text).toContain('Jordan');
  expect(messages.response.type).toBe('answer');
  state = reducer(state, { type: 'add-relationship', personId: person.id });
  expect(state.activeId).toBe('relationship:maya-local-jordan');
  expect(state.threads.find(thread => thread.id === state.activeId).messages).toEqual([]);
  state = reducer(state, { type: 'switch', id: 'birthchart:local-jordan' });
  expect(state.subjectId).toBe(person.id);
  const restored = loadState({ getItem: key => key === STORAGE_KEY ? JSON.stringify(serializableState(state)) : null });
  expect(restored.people).toEqual([person]);
  expect(restored.threads).toHaveLength(6);
  expect(restored.threads.find(thread => thread.id === state.activeId).messages).toHaveLength(2);
});

it('creates inline person and relationship atomically; identical birth details reuse the person', () => {
  const state = reducer(initialState(), { type: 'add-person', person, relationship: true });
  expect(state.people).toHaveLength(1);
  expect(state.threads).toHaveLength(6);
  expect(state.activeId).toBe('relationship:maya-local-jordan');
  const again = reducer(state, { type: 'add-person', person: { ...person, id: 'another-id', name: ' Jordan ' }, relationship: true });
  expect(again.people).toHaveLength(1);
  expect(again.threads).toHaveLength(6);
  expect(again.activeId).toBe(state.activeId);
  const different = reducer(state, { type: 'add-person', person: { ...person, id: 'different-jordan', birthDate: '1995-01-01' } });
  expect(different.people).toHaveLength(2);
});

it('resumes an existing sample relationship and rejects invalid targets and birth details', () => {
  const original = initialState();
  const state = reducer(original, { type: 'add-relationship', personId: 'theo' });
  expect(state.activeId).toBe('relationship:maya-theo');
  expect(state.threads).toHaveLength(4);
  expect(reducer(state, { type: 'add-relationship', personId: 'maya' })).toBe(state);
  expect(reducer(state, { type: 'add-relationship', personId: 'missing' })).toBe(state);
  expect(reducer(state, { type: 'add-person', person: { ...person, name: ' ' } })).toBe(state);
  expect(personError({ ...person, birthDate: '2020-02-30' })).toContain('valid birth date');
  expect(personError({ ...person, birthDate: '2999-01-01' })).toContain('future');
  expect(personError({ ...person, unknownTime: false })).toContain('birth time');
  expect(personError({ ...person, unknownTime: false, birthTime: '00:00' })).toBe('');
});

it('migrates existing local sessions without losing messages or seed-pair identity', () => {
  const state = initialState();
  delete state.people;
  state.threads.forEach(thread => { delete thread.partnerId; });
  state.threads[0].messages = [{ id: 'old', type: 'user', text: 'Keep me' }];
  const restored = loadState({ getItem: () => JSON.stringify(state) });
  expect(restored.threads[0].messages[0].text).toBe('Keep me');
  expect(restored.people).toEqual([]);
  expect(reducer(restored, { type: 'add-relationship', personId: 'theo' }).threads).toHaveLength(4);
});
