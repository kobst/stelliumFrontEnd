import { SUBJECTS, makeReport } from './fixtures';
import { dayAt, initialHoroscope, snapshotHoroscope } from './horoscopeData';

export const STORAGE_KEY = 'ag_conversation_prototype_v1';
const id = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
export const subjectFor = (subjectId) => SUBJECTS.find((item) => item.id === subjectId) || SUBJECTS[0];
export const SERVICES = [
  { id: 'birthchart:maya', title: 'Maya’s birth chart', subjectId: 'maya', kind: 'birthchart', description: 'Your birth chart reading & ongoing discussion' },
  { id: 'relationship:maya-theo', title: 'Maya & Theo', subjectId: 'maya-theo', kind: 'relationship', description: 'Relationship reading & ongoing discussion' },
  { id: 'relationship:maya-alex', title: 'Maya & Alex', subjectId: 'maya-alex', kind: 'relationship', description: 'Relationship reading & ongoing discussion' },
  { id: 'horoscope:maya', title: 'Maya’s horoscopes', subjectId: 'maya', kind: 'horoscope', description: 'One discussion across your dated forecasts' },
];

export const serviceForReading = (reading) => reading.type === 'forecast' ? 'horoscope:maya' : `relationship:${reading.subjectId}`;
const serviceForMessage = (message) => message.type === 'forecast' || message.quote?.readingId?.includes('forecast')
  ? 'horoscope:maya' : subjectFor(message.subjectId).kind === 'relationship' ? `relationship:${message.subjectId}` : 'birthchart:maya';

export function initialState() {
  return { version: 2, threads: SERVICES.map((service) => ({ ...service, messages: [] })), activeId: null, homeMessages: [], subjectId: 'maya', mode: 'question',
    readings: [], positions: {}, pendingQuote: null, pendingTransit: null, horoscope: initialHoroscope(), discovery: false,
    settings: { access: 'included', failGeneration: false } };
}

export function loadState(storage) {
  try {
    const value = JSON.parse(storage.getItem(STORAGE_KEY));
    if (value?.version === 2 && SERVICES.every((service) => value.threads?.some((thread) => thread.id === service.id && Array.isArray(thread.messages)))
      && value.threads.length === SERVICES.length && (!value.activeId || SERVICES.some((service) => service.id === value.activeId))
      && Array.isArray(value.readings) && value.positions && value.settings
      && value.threads.every((thread) => Array.isArray(thread.messages))) return { ...value, homeMessages: [], pendingTransit: value.pendingTransit || null, horoscope: { ...initialHoroscope(), ...value.horoscope } };
    if (value?.version === 1 && Array.isArray(value.threads) && value.threads.every((thread) => Array.isArray(thread.messages))) {
      const migrated = initialState();
      // Preserve prototype discussions, regrouping old free-form threads by service.
      value.threads.forEach((thread) => thread.messages.forEach((message, index) => {
        const response = message.type === 'user' ? thread.messages[index + 1] || message : message;
        const serviceId = serviceForMessage(response);
        migrated.threads.find((item) => item.id === serviceId)?.messages.push({ ...message, serviceId });
      }));
      return { ...migrated, readings: (value.readings || []).map((reading) => ({ ...reading, threadId: serviceForReading(reading) })),
        positions: value.positions || {}, settings: value.settings || migrated.settings };
    }
  } catch { /* A denied storage permission or an older fixture starts a fresh session. */ }
  return initialState();
}

function resolvePresentation(text, subjectId, mode) {
  const query = text.toLowerCase();
  const named = SUBJECTS.filter((subject) => subject.partner && new RegExp(`\\b${subject.partner}\\b`, 'i').test(text));
  const subject = named[0] || subjectFor(subjectId);
  const kind = /\b(report|full reading|comprehensive|full compatibility)\b/.test(query) ? 'report'
    : /\b(week|forecast|horoscope|month)\b/.test(query) ? 'forecast'
      : /\b(overview|short reading|birth chart reading)\b/.test(query) ? 'reading' : 'answer';
  if (named.length > 1) return { kind: 'clarification', requestedKind: kind, reason: 'relationship', original: text, subjectId: subjectFor(subjectId).id };
  if ((kind === 'report' || (kind === 'reading' && /relationship|compatib/.test(query))) && subject.kind !== 'relationship') {
    return { kind: 'clarification', requestedKind: kind, reason: /birth|natal/.test(query) ? 'birth-report' : 'relationship', original: text, subjectId: subject.id };
  }
  if (/\b(birth|natal)\b/.test(query) && kind === 'report') {
    return { kind: 'clarification', requestedKind: 'report', reason: 'birth-report', original: text, subjectId: subject.id };
  }
  return { kind, subjectId: kind === 'forecast' || (kind === 'reading' && /birth|natal/.test(query)) ? 'maya' : subject.id,
    scopeNote: kind === 'forecast' && named.length === 1 && subject.kind === 'relationship' ? `This prototype includes Maya’s forecast only, rather than a separate forecast for ${subject.partner}.` : null,
    expanded: /\bmonth|november\b/.test(query), mode };
}

export function resolveRequest(text, subjectId, mode, activeId = null) {
  const request = resolvePresentation(text, subjectId, mode);
  const active = SERVICES.find((service) => service.id === activeId);
  request.serviceId = request.kind === 'clarification' ? activeId
    : request.kind === 'forecast' ? 'horoscope:maya'
      : subjectFor(request.subjectId).kind === 'relationship' ? `relationship:${request.subjectId}`
        : /birth|natal|venus sign/i.test(text) || request.kind === 'reading' ? 'birthchart:maya'
          : active?.subjectId === request.subjectId ? activeId
            : /transit|today/i.test(text) ? 'horoscope:maya' : 'birthchart:maya';
  return request;
}

export function reducer(state, action) {
  const updateMessages = (fn) => state.threads.map((thread) => thread.id === (action.threadId || state.activeId)
    ? { ...thread, messages: fn(thread.messages) } : thread);
  switch (action.type) {
    case 'reset': return initialState();
    case 'horoscope': return { ...state, horoscope: { ...state.horoscope, ...action.value } };
    case 'transit-context': return { ...state, pendingQuote: null, pendingTransit: snapshotHoroscope(state.horoscope, action.transit),
      horoscope: { ...state.horoscope, panel: 'discussion', discussionOpen: true } };
    case 'clear-transit': return { ...state, pendingTransit: null };
    case 'context': return { ...state, subjectId: action.subjectId || state.subjectId, mode: action.mode || state.mode, pendingQuote: null, pendingTransit: null };
    case 'discovery': return { ...state, discovery: action.value };
    case 'settings': return { ...state, settings: { ...state.settings, ...action.value } };
    case 'home': return { ...state, activeId: null, homeMessages: [], subjectId: 'maya', pendingQuote: null, pendingTransit: null, discovery: false };
    case 'switch': return { ...state, activeId: action.id, pendingQuote: null, pendingTransit: null,
      subjectId: SERVICES.find((service) => service.id === action.id)?.subjectId || 'maya' };
    case 'send': {
      const serviceId = action.response.serviceId;
      const isForecast = action.response.type === 'forecast';
      return { ...state, activeId: serviceId, subjectId: action.subjectId, pendingQuote: null, pendingTransit: null, discovery: false,
      horoscope: serviceId === 'horoscope:maya' ? { ...state.horoscope, panel: 'discussion', discussionOpen: true,
        ...(isForecast ? { scope: action.response.expanded ? 'month' : 'week', anchor: action.response.expanded ? '2026-11-01' : '2026-10-23', playhead: dayAt(action.response.expanded ? '2026-11-01' : '2026-10-23') } : {}) } : state.horoscope,
      homeMessages: serviceId ? [] : [...state.homeMessages, action.user, action.response],
      threads: state.threads.map((thread) => thread.id === serviceId ? {
        ...thread,
        messages: [...thread.messages, action.user, action.response],
      } : thread) };
    }
    case 'generation': return { ...state, settings: { ...state.settings, failGeneration: false }, threads: updateMessages((messages) => messages.map((message) => message.id === action.id
      ? { ...message, status: 'generating', startedAt: Date.now(), fail: action.fail } : message)) };
    case 'ready': {
      const thread = state.threads.find((item) => item.id === action.threadId);
      const message = thread?.messages.find((item) => item.id === action.id);
      if (!message || message.status !== 'generating') return state;
      const report = makeReport(message.subjectId);
      const readings = message.fail || !report || state.readings.some((item) => item.id === report.id) ? state.readings
        : [...state.readings, { id: report.id, subjectId: message.subjectId, type: 'report', title: report.title, threadId: thread.id }];
      return { ...state, readings, threads: updateMessages((messages) => messages.map((item) => item.id === action.id
        ? { ...item, status: message.fail ? 'failed' : 'ready' } : item)) };
    }
    case 'save': return state.readings.some((item) => item.id === action.reading.id) ? state
      : { ...state, readings: [...state.readings, action.reading] };
    case 'position': return { ...state, positions: { ...state.positions, [action.readingId]: action.position } };
    case 'quote': return { ...state, activeId: action.threadId || serviceForMessage({ subjectId: action.quote.subjectId, quote: action.quote }), subjectId: action.quote.subjectId, pendingQuote: action.quote, pendingTransit: null };
    default: return state;
  }
}

export function createMessages(text, request, state) {
  const subject = subjectFor(request.subjectId);
  const quote = state.pendingQuote?.subjectId === request.subjectId ? state.pendingQuote : null;
  const user = { id: id(), type: 'user', text, subjectId: request.subjectId, quote };
  if (request.serviceId === 'horoscope:maya') user.horoscopeContext = request.kind === 'forecast'
    ? snapshotHoroscope({ ...state.horoscope, scope: request.expanded ? 'month' : 'week', anchor: request.expanded ? '2026-11-01' : '2026-10-23', playhead: dayAt(request.expanded ? '2026-11-01' : '2026-10-23') })
    : state.pendingTransit || snapshotHoroscope(state.horoscope);
  const response = { id: id(), type: request.kind, subjectId: request.subjectId, ...request };
  if (request.kind === 'report') {
    const report = makeReport(request.subjectId);
    response.status = state.readings.some((item) => item.id === report.id) || state.settings.access === 'owned' ? 'ready' : 'access';
  }
  if (request.kind === 'answer') {
    const known = /venus|saturn|sunday|friday|week|conversation|relationship|explain|mean|tell me|how|what/i.test(text);
    response.diagram = !quote && /venus|aspect/i.test(text);
    response.text = quote
      ? `You’re asking about “${quote.text}” in ${quote.chapterTitle}. In this sample reading, the practical invitation is to name one specific thing you appreciate or need. How might you put that into words with ${subject.partner || 'someone close to you'}?`
      : known ? `Let’s explore that for ${subject.label}. A useful place to start is with a real example: when have you noticed this pattern, and what would you like to understand about it? This is a sample conversational response, rather than an interpretation of a live chart.`
        : 'This prototype has sample flows for a short reading, a weekly forecast, and a relationship report. Choose one below to explore how each format works.';
    if (!quote && user.horoscopeContext?.transit) response.text = `You’re discussing ${user.horoscopeContext.transit.title} for ${user.horoscopeContext.date}. This sample response keeps that transit and date attached to the question. A useful starting point: what real situation would you like to explore through this theme?`;
  }
  return { user, response };
}
