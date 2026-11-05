import { SERVICES, STORAGE_KEY, createMessages, initialState, loadState, reducer, resolveRequest } from './model';

it('starts a clean test cohort without deleting the previous prototype store', () => {
  const old = JSON.stringify({ ...initialState(), cohort: undefined });
  const values = new Map([['ag_conversation_prototype_v1', old], [STORAGE_KEY, old]]);
  const loaded = loadState({ getItem: key => values.get(key) });
  expect(loaded.threads.every(thread => !thread.messages.length)).toBe(true);
  expect(loaded.cohort).toBe('rail-cleanup-1');
  expect(values.get('ag_conversation_prototype_v1')).toBe(old);
  expect(STORAGE_KEY).not.toBe('ag_conversation_prototype_v1');
});

it('routes different presentation types without requiring a mode selection', () => {
  expect(resolveRequest('What does my Venus sign mean?', 'maya', 'horoscope').kind).toBe('answer');
  expect(resolveRequest('Give me a short birth chart reading', 'maya-theo').subjectId).toBe('maya');
  expect(resolveRequest('What does my week look like?', 'maya').kind).toBe('forecast');
  expect(resolveRequest('Show my November forecast', 'maya').expanded).toBe(true);
  expect(resolveRequest('I want a full compatibility report for Theo', 'maya').subjectId).toBe('maya-theo');
  expect(resolveRequest('I want a full report', 'maya').kind).toBe('clarification');
  expect(resolveRequest('A full birth chart report', 'maya-theo')).toMatchObject({ kind: 'report', subjectId: 'maya', serviceId: 'birthchart:maya' });
  expect(resolveRequest('Compare Theo and Alex', 'maya').kind).toBe('clarification');
  expect(resolveRequest('What is next week like for Theo?', 'maya').scopeNote).toContain('Maya’s forecast only');
});

it('keeps generation attached to its originating thread and saves a single report', () => {
  let state = initialState();
  const threadId = 'relationship:maya-theo';
  const messages = createMessages('Full report for Theo', resolveRequest('Full report for Theo', 'maya'), state);
  state = reducer(state, { type: 'send', subjectId: 'maya-theo', ...messages });
  state = reducer(state, { type: 'generation', id: messages.response.id, fail: false });
  state = reducer(state, { type: 'home' });
  state = reducer(state, { type: 'ready', threadId, id: messages.response.id });
  state = reducer(state, { type: 'ready', threadId, id: messages.response.id });
  expect(state.readings).toHaveLength(1);
  expect(state.readings[0].threadId).toBe(threadId);
  expect(state.threads.find((thread) => thread.id === threadId).messages[1].status).toBe('ready');
  expect(state.activeId).toBeNull();
  expect(state.homeMessages).toHaveLength(0);
  expect(state.threads).toHaveLength(SERVICES.length);
});

it('does not leak a passage from one couple into a request about another', () => {
  const state = { ...initialState(), pendingQuote: { subjectId: 'maya-theo', text: 'A passage for Theo', chapterTitle: 'Attraction' } };
  const messages = createMessages('What about Alex?', { kind: 'answer', subjectId: 'maya-alex' }, state);
  expect(messages.user.quote).toBeNull();
  expect(messages.response.text).not.toContain('A passage for Theo');
});

it('keeps a birth chart passage out of the same person’s horoscope discussion', () => {
  const state = { ...initialState(), pendingQuote: { subjectId: 'maya', text: 'Birth chart only.', source: 'overview', chapterTitle: 'Overview' } };
  expect(createMessages('My week', resolveRequest('My week', 'maya'), state).user.quote).toBeNull();
  expect(createMessages('How can I use this?', resolveRequest('How can I use this?', 'maya'), state).user.quote.text).toBe('Birth chart only.');
});

it('recovers from missing or corrupt storage and restores a valid session', () => {
  const initial = initialState();
  expect(loadState({ getItem: () => JSON.stringify(initial) })).toEqual(initial);
  expect(loadState({ getItem: () => 'broken' }).threads).toHaveLength(SERVICES.length);
  expect(loadState({ getItem: () => { throw new Error('Denied'); } }).threads).toHaveLength(SERVICES.length);
});

it('opens an owned sample report without another access or generation step', () => {
  const state = initialState();
  state.settings.access = 'owned';
  const { response } = createMessages('Full report for Theo', resolveRequest('Full report for Theo', 'maya'), state);
  expect(response.status).toBe('ready');
});

it('records report availability without fabricating a user question or duplicating the access event', () => {
  let state = reducer(initialState(), { type: 'switch', id: 'birthchart:maya' });
  state = reducer(state, { type: 'request-report' });
  state = reducer(state, { type: 'request-report' });
  expect(state.threads[0].messages).toHaveLength(1);
  expect(state.threads[0].messages[0]).toMatchObject({ type: 'report', status: 'access' });
});

it('attaches a passage once without echoing it in the assistant answer', () => {
  const state = { ...initialState(), pendingQuote: { subjectId: 'maya', text: 'A long quoted paragraph.', chapterTitle: 'Identity' } };
  const result = createMessages('How can I apply this?', resolveRequest('How can I apply this?', 'maya'), state);
  expect(result.user.quote.text).toBe('A long quoted paragraph.');
  expect(result.response.text).not.toContain('A long quoted paragraph.');
});

it('routes a person’s birth chart and horoscope to separate stable discussions', () => {
  expect(resolveRequest('What does my Venus sign mean?', 'maya').serviceId).toBe('birthchart:maya');
  expect(resolveRequest('Show my weekly forecast', 'maya').serviceId).toBe('horoscope:maya');
  expect(resolveRequest('Tell me more about Sunday', 'maya', 'question', 'horoscope:maya').serviceId).toBe('horoscope:maya');
  expect(resolveRequest('What does my Venus sign mean?', 'maya', 'question', 'horoscope:maya').serviceId).toBe('birthchart:maya');
});

it('merges repeated home requests into the same service and keeps home transient', () => {
  let state = initialState();
  for (const text of ['What does my Venus sign mean?', 'Give me a short birth chart reading']) {
    const request = resolveRequest(text, 'maya');
    state = reducer(state, { type: 'send', subjectId: request.subjectId, ...createMessages(text, request, state) });
    state = reducer(state, { type: 'home' });
  }
  expect(state.threads).toHaveLength(SERVICES.length);
  expect(state.threads.find((item) => item.id === 'birthchart:maya').messages).toHaveLength(4);
  expect(state.threads.find((item) => item.id === 'horoscope:maya').messages).toHaveLength(0);
  expect(state.homeMessages).toHaveLength(0);
});

it('migrates previous prototype conversations and reading links into service discussions', () => {
  const restored = loadState({ getItem: () => JSON.stringify({
    version: 1, activeId: 'old-thread', threads: [{ id: 'old-thread', messages: [
      { id: 'u1', type: 'user', subjectId: 'maya', text: 'My week' },
      { id: 'a1', type: 'forecast', subjectId: 'maya' },
      { id: 'u2', type: 'user', subjectId: 'maya-theo', text: 'A report for Theo' },
      { id: 'a2', type: 'report', subjectId: 'maya-theo', status: 'ready' },
    ] }], readings: [{ id: 'old-report', type: 'report', subjectId: 'maya-theo', threadId: 'old-thread' }],
  }) });
  expect(restored.version).toBe(2);
  expect(restored.threads).toHaveLength(4);
  expect(restored.threads.find((item) => item.id === 'horoscope:maya').messages).toHaveLength(2);
  expect(restored.threads.find((item) => item.id === 'relationship:maya-theo').messages).toHaveLength(2);
  expect(restored.readings[0].threadId).toBe('relationship:maya-theo');
});
