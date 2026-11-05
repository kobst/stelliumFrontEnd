import { anchorMatches, askEntityContext, passageSegments, referenceExchanges, selectReference, textVersion } from './references';
import { createMessages, initialState, loadState, reducer, serializableState } from './model';

const serviceId = 'birthchart:maya';
const entity = id => ({ kind: 'placement', serviceId, sourceId: id, label: id, data: { type: 'position', planet: id, degree: 12.5 } });
const text = 'Same phrase. Same phrase.';
const passage = { kind: 'passage', serviceId, sourceId: 'chapter:1:0', label: 'Chapter 1', sourceVersion: textVersion(text), excerpt: 'Same phrase', anchor: { start: 13, end: 24 } };

it('allows three entities plus one replaceable passage, deduplicates and toggles', () => {
  let refs = [];
  for (const ref of [entity('Sun'), entity('Moon'), entity('Venus'), passage]) refs = selectReference(refs, ref, serviceId).references;
  expect(refs).toHaveLength(4);
  expect(selectReference(refs, entity('Mars'), serviceId).error).toContain('up to 3');
  expect(selectReference(refs, entity('Sun'), serviceId).references).toHaveLength(4);
  refs = selectReference(refs, entity('Sun'), serviceId, true).references;
  expect(refs).toHaveLength(3);
  refs = selectReference(refs, { ...passage, sourceId: 'another-chapter' }, serviceId).references;
  expect(refs.filter(ref => ref.kind === 'passage')).toHaveLength(1);
  expect(selectReference(refs, { ...entity('Mars'), serviceId: 'relationship:other' }, serviceId).error).toContain('another service');
});

it('anchors repeated phrases at the selected offset and rejects changed versions or invalid ranges', () => {
  expect(anchorMatches(passage, text, textVersion(text))).toBe(true);
  expect(anchorMatches(passage, text, 'new-version')).toBe(false);
  expect(anchorMatches({ ...passage, anchor: { start: 14, end: 24 } }, text, textVersion(text))).toBe(false);
  const segments = passageSegments(text, textVersion(text), passage, [{ type: 'user', references: [passage] }]);
  expect(segments.filter(part => part.marked)).toEqual([{ start: 13, end: 24, marked: true }]);
});

it('renders overlapping anchors without duplicating prose and keeps stale anchors unmarked', () => {
  const overlap = { ...passage, excerpt: text.slice(18, 25), anchor: { start: 18, end: 25 } };
  const messages = [{ id: 'q', type: 'user', references: [passage, overlap] }, { inReplyTo: 'q', text: 'Reply' }];
  const segments = passageSegments(text, textVersion(text), passage, messages);
  expect(segments.map(part => text.slice(part.start, part.end)).join('')).toBe(text);
  expect(passageSegments(text, 'changed', passage, messages).some(part => part.marked)).toBe(false);
  expect(referenceExchanges(messages, passage)).toHaveLength(1);
  expect(referenceExchanges(messages, passage)[0].reply.text).toBe('Reply');
});

it.each([['birthchart:maya', 'selectedAspects'], ['relationship:maya-theo', 'scoredItems'], ['horoscope:maya', 'selectedTransits']])('preserves existing %s payloads in %s without mixing prose or services', (service, field) => {
  const data = { planets: ['Venus', 'Mars'], orb: 1.2, exact: '2026-10-23T12:00:00Z', applying: false };
  const kind = service.startsWith('relationship:') ? 'aspect' : service.startsWith('horoscope:') ? 'transit' : 'placement';
  const context = askEntityContext(service, [{ ...entity('a'), kind, serviceId: service, data }, { ...passage, serviceId: service }, entity('other')].slice(0, service === serviceId ? 2 : 3));
  expect(context).toEqual({ [field]: [data] });
  expect(context[field][0]).toBe(data);
});

it.each(['relationship:maya-theo', 'horoscope:maya'])('keeps placement snapshots out of %s legacy API fields', service => {
  const reference = { ...entity('Sun'), serviceId: service, details: { personName: 'Theo', ring: 'natal', timeUnknown: true } };
  const context = askEntityContext(service, [reference]);
  expect(Object.values(context)[0]).toEqual([]);
  const { user } = createMessages('What about this placement?', { kind: 'answer', serviceId: service, subjectId: service.includes('relationship') ? 'maya-theo' : 'maya' }, { ...initialState(), pendingReferences: [reference] });
  expect(user.placementContext[0]).toMatchObject({ planet: 'Sun', personName: 'Theo', timeUnknown: true });
  expect(user.references[0]).toEqual(reference);
});

it('never persists unsent references, but retains sent payloads and annotation sources', () => {
  let state = reducer(initialState(), { type: 'switch', id: serviceId });
  for (const reference of [passage, entity('Venus')]) state = reducer(state, { type: 'reference', reference });
  expect(loadState({ getItem: () => JSON.stringify(state) }).pendingReferences).toEqual([]);
  expect(serializableState(state).pendingReferences).toEqual([]);
  const messages = createMessages('What can I try?', { kind: 'answer', subjectId: 'maya', serviceId }, state);
  state = reducer(state, { type: 'send', ...messages, subjectId: 'maya' });
  expect(state.pendingReferences).toEqual([]);
  const loaded = loadState({ getItem: () => JSON.stringify(serializableState(state)) });
  const saved = loaded.threads.find(thread => thread.id === serviceId).messages;
  expect(saved[0].references).toHaveLength(2);
  expect(saved[0].askContext.selectedAspects).toEqual([entity('Venus').data]);
  expect(saved[1].inReplyTo).toBe(saved[0].id);
  expect(saved[1].text).not.toContain(passage.excerpt);
});

it('makes illustrative replies acknowledge the actual attached entities rather than repeating one placeholder', () => {
  const state = { ...initialState(), pendingReferences: [entity('Venus')] };
  const request = { kind: 'answer', subjectId: 'maya', serviceId };
  const placementReply = createMessages('What does this mean?', request, state).response.text;
  const aspectReply = createMessages('What does this mean?', request, { ...state, pendingReferences: [{ ...entity('Venus square Mars'), kind: 'aspect' }] }).response.text;
  expect(placementReply).toContain('About Venus');
  expect(aspectReply).toContain('About Venus square Mars');
  expect(aspectReply).not.toBe(placementReply);
  expect(aspectReply).toContain('illustrative');
});
