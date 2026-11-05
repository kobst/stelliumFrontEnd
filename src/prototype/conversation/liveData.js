import { fetchUser, getUserSubjects, getUserCompositeCharts, fetchAnalysis, fetchRelationshipAnalysis, createGuestSubject, createRelationshipDirect, fetchTimeZone } from '../../Utilities/api';
import { normalizeServiceReading } from './serviceReadingData';
import { personError } from './creation';

export function isDevBackend(url = process.env.REACT_APP_SERVER_URL) {
  try { return new URL(url).hostname === 'api.dev.stellium.ai'; } catch { return false; }
}
export function requireDevBackend() {
  if (!isDevBackend()) throw new Error('This workspace only connects to api.dev.stellium.ai. Check REACT_APP_SERVER_URL and restart the frontend.');
}
export const nameOf = person => `${person?.firstName || ''} ${person?.lastName || ''}`.trim() || person?.name || 'Unnamed person';
export const records = value => Array.isArray(value) ? value : ['subjects', 'relationships', 'compositeCharts', 'data'].map(key => value?.[key]).find(Array.isArray) || [];
export const unknownTime = person => Boolean(person?.birthTimeUnknown || person?.unknownTime || person?.birthTimeAccuracy === 'unknown' || person?.time === 'unknown');
export const relationshipNames = record => [record.userA_name || `${record.userA_firstName || ''} ${record.userA_lastName || ''}`.trim() || 'Person A', record.userB_name || `${record.userB_firstName || ''} ${record.userB_lastName || ''}`.trim() || 'Person B'];
export const sameId = (a, b) => a != null && b != null && String(a) === String(b);
export function findPair(relationships, accountId, partnerId) {
  return relationships.find(pair => (sameId(pair.userA_id, accountId) && sameId(pair.userB_id, partnerId)) || (sameId(pair.userB_id, accountId) && sameId(pair.userA_id, partnerId)));
}
export async function loadDevLibrary(accountId) {
  requireDevBackend();
  const results = await Promise.allSettled([fetchUser(accountId), getUserSubjects(accountId), getUserCompositeCharts(accountId)]);
  const [self, guests, pairs] = results;
  const people = [...(self.status === 'fulfilled' && self.value?._id ? [self.value] : []), ...(guests.status === 'fulfilled' ? records(guests.value) : [])]
    .filter((person, index, all) => person?._id && all.findIndex(other => sameId(other._id, person._id)) === index);
  const relationships = pairs.status === 'fulfilled' ? records(pairs.value).filter(pair => pair?._id) : [];
  const owner = people.find(person => sameId(person._id, accountId));
  return { people, relationships, errors: results.flatMap((result, index) => result.status === 'rejected' ? [`${['Your chart', 'Saved people', 'Relationships'][index]} could not be loaded.`] : []),
    services: [...people.map(person => ({ id: `birthchart:${person._id}`, contentId: String(person._id), kind: 'birthchart', title: `${nameOf(person)}’s birth chart`, record: person })),
      ...relationships.map(pair => ({ id: `relationship:${pair._id}`, contentId: String(pair._id), kind: 'relationship', title: relationshipNames(pair).join(' & '), record: pair })),
      { id: `horoscope:${accountId}`, contentId: String(accountId), kind: 'horoscope', title: `${owner ? nameOf(owner) + '’s' : 'Your'} forecasts` }] };
}
const savedAnalysis = async fn => {
  try { const value = await fn(); if (value?.error) return { value: null, error: /not found|no analysis/i.test(String(value.error)) ? '' : 'The saved reading could not be loaded.' }; return { value, error: '' }; }
  catch (error) { return { value: null, error: /404|not found|no analysis/i.test(error.message) ? '' : 'The saved reading could not be loaded.' }; }
};
export async function loadDevService(service, library) {
  requireDevBackend();
  if (!library.services.some(item => item.id === service.id)) throw new Error('This service is not in your account library.');
  if (service.kind === 'birthchart') {
    const analysis = await savedAnalysis(() => fetchAnalysis(service.contentId));
    const interpretation = analysis.value?.interpretation || analysis.value || {};
    const person = service.record.birthChart ? service.record : await fetchUser(service.contentId);
    const source = { ...person, ...interpretation, birthChart: person.birthChart || {}, basicAnalysis: interpretation.basicAnalysis || person.basicAnalysis };
    return { people: [person], source, error: analysis.error, reading: normalizeServiceReading({ subjectId: service.contentId, label: nameOf(person), kind: 'birthchart', source }) };
  }
  const analysis = await savedAnalysis(() => fetchRelationshipAnalysis(service.contentId));
  const source = { ...service.record, ...(analysis.value || {}) };
  const names = relationshipNames(source);
  const people = await Promise.all(['A', 'B'].map(async (side, index) => {
    const id = source[`user${side}_id`];
    const person = library.people.find(item => sameId(item._id, id));
    if (person) return person;
    // These IDs come from an account-owned relationship, not URL parameters.
    try { if (id) return await fetchUser(id); } catch { /* Keep missing chart data explicitly missing. */ }
    return { _id: id, name: names[index], birthChart: source[`user${side}_birthChart`] };
  }));
  source.initialOverview = source.initialOverview || source.holisticOverview || source.scoreAnalysis?.holisticOverview;
  const scoredItems = source.scoredItems || source.clusterScoring?.scoredItems || source.clusterAnalysis?.scoredItems || [];
  return { people, source, scoredItems, error: analysis.error, reading: normalizeServiceReading({ subjectId: service.contentId, label: names.join(' & '), kind: 'relationship', source }) };
}

// A lost response can mean a successful write. Never encourage a blind retry.
async function confirmedWrite(write, idFrom) {
  try {
    const id = idFrom(await write());
    if (!id) throw new Error('Missing saved ID');
    return String(id);
  } catch (error) {
    if (error.statusCode === 402) throw error;
    const uncertain = new Error('The save could not be confirmed. Close this dialog and refresh your library before creating anything again.');
    uncertain.needsReconciliation = true;
    throw uncertain;
  }
}
export async function createDevPerson(accountId, draft, isCurrent = () => true) {
  requireDevBackend();
  const error = personError(draft);
  if (error) throw new Error(error);
  if (!Number.isFinite(draft.lat) || !Number.isFinite(draft.lon) || !draft.resolvedPlace || draft.resolvedPlace !== draft.place) throw new Error('Choose a birthplace from the location suggestions.');
  if (!['male', 'female', 'nonbinary'].includes(draft.gender)) throw new Error('Select a gender for the existing chart API.');
  const timestamp = Date.parse(`${draft.birthDate}T${draft.unknownTime ? '12:00' : draft.birthTime}:00Z`) / 1000;
  const tzone = await fetchTimeZone(draft.lat, draft.lon, timestamp);
  if (!isCurrent()) throw new Error('Account changed; creation cancelled.');
  if (!Number.isFinite(tzone)) throw new Error('The birth timezone could not be resolved.');
  const [firstName, ...rest] = draft.name.trim().split(/\s+/);
  return confirmedWrite(() => createGuestSubject({ ownerUserId: accountId, firstName, lastName: rest.join(' '), gender: draft.gender,
    dateOfBirth: draft.birthDate, placeOfBirth: draft.place, lat: draft.lat, lon: draft.lon, tzone,
    time: draft.unknownTime ? 'unknown' : draft.birthTime, unknownTime: draft.unknownTime }), result => result?.userId || result?.guestSubject?._id);
}
export async function createDevRelationship(accountId, partnerId, library) {
  requireDevBackend();
  if (sameId(accountId, partnerId)) throw new Error('Choose someone other than yourself.');
  const existing = findPair(library.relationships, accountId, partnerId);
  if (existing) return String(existing._id);
  // Creation takes saved subject IDs, never locally generated sample IDs.
  return confirmedWrite(() => createRelationshipDirect(accountId, partnerId, accountId, false), result => result?.compositeChartId);
}
