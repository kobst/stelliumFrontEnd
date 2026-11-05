import { SAMPLE_PEOPLE } from './fixtures';
import { BIRTH_DETAIL_FIELDS, birthDetailError } from '../../UI/gravity/birthDetailsIntake';
export { todayKey } from '../../UI/gravity/birthDetailsIntake';

// Same core inputs as AddChartModal; no geocoding, timezone lookup or paid API
// calls in this local prototype. A typed place is not a resolved chart location.
export const SAMPLE_PROFILES = [
  { id: 'maya', name: 'Maya', birthDate: '1990-10-02', birthTime: '07:42' },
  { id: 'theo', name: 'Theo', birthDate: '1988-03-14', birthTime: '' },
  { id: 'alex', name: 'Alex', birthDate: '1992-06-08', birthTime: '14:15' },
].map(person => ({ ...person, place: SAMPLE_PEOPLE[person.name].place, unknownTime: !person.birthTime, sample: true }));

export const peopleFor = state => [...SAMPLE_PROFILES, ...(state.people || [])];
export function personError(person) {
  return BIRTH_DETAIL_FIELDS.map(field => birthDetailError(field.key, person || {})).find(Boolean) || '';
}
const clean = text => String(text || '').trim().toLocaleLowerCase().replace(/\s+/g, ' ');
export function samePerson(a, b) {
  return clean(a.name) === clean(b.name) && a.birthDate === b.birthDate && clean(a.place) === clean(b.place)
    && Boolean(a.unknownTime) === Boolean(b.unknownTime) && (a.unknownTime || a.birthTime === b.birthTime);
}
export const profileSummary = person => `${person.birthDate} · ${person.unknownTime ? 'Time unknown' : person.birthTime} · ${person.place}`;

export function addLocalService(state, action) {
  let people = state.people || [], threads = [...state.threads];
  let person;
  if (action.type === 'add-person') {
    if (personError(action.person) || !action.person.id || peopleFor(state).some(item => item.id === action.person.id)) return state;
    person = peopleFor(state).find(item => samePerson(item, action.person));
    if (!person) {
      person = { id: action.person.id, name: action.person.name.trim(), birthDate: action.person.birthDate,
        birthTime: action.person.unknownTime ? '' : action.person.birthTime, unknownTime: Boolean(action.person.unknownTime), place: action.person.place.trim() };
      people = [...people, person];
    }
    if (!threads.some(thread => thread.id === `birthchart:${person.id}`)) threads.push({
      id: `birthchart:${person.id}`, subjectId: person.id, kind: 'birthchart', title: `${person.name}’s birth chart`,
      description: 'Local prototype · reading not generated', custom: true, messages: [],
    });
  } else person = peopleFor(state).find(item => item.id === action.personId);
  if (!person) return state;
  let activeId = `birthchart:${person.id}`;
  if (action.type === 'add-relationship' || action.relationship) {
    if (person.id === 'maya') return state;
    const existing = threads.find(thread => thread.kind === 'relationship' && thread.partnerId === person.id);
    activeId = existing?.id || `relationship:maya-${person.id}`;
    if (!existing) threads.push({ id: activeId, subjectId: `maya-${person.id}`, partnerId: person.id, kind: 'relationship',
      title: `Maya & ${person.name}`, description: 'Local prototype · reading not generated', custom: true, messages: [] });
  }
  return { ...state, people, threads, activeId, subjectId: threads.find(thread => thread.id === activeId).subjectId,
    pendingQuote: null, pendingTransit: null, pendingReferences: [], referenceError: '', homeMessages: [] };
}
