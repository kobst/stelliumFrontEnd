import { formatPositionData } from '../../UI/gravityChat/GravityChatPanel';
import { makeTransitContextElement, transitStatusAt } from '../../UI/horoscope/horoscopeSlots';
import { dateKey } from './horoscopeData';

export function placementReference(serviceId, subjectId, planet, options = {}) {
  const ring = options.ring || 'natal', personName = options.personName || 'Maya';
  const contextual = !serviceId.startsWith('birthchart:');
  const sign = positionLabel(planet).sign;
  const normalized = { ...planet, sign, norm_degree: planet.norm_degree ?? ((planet.full_degree % 30) + 30) % 30 };
  const suffix = contextual ? `${personName}:${ring}:${planet.name}${ring === 'transit' ? `:${options.horoscope.playhead}` : ''}` : planet.name;
  const label = `${ring === 'composite' ? 'Composite ' : contextual ? ring === 'transit' ? 'Transiting ' : `${personName}’s ` : ''}${planet.name} in ${sign}`;
  return { kind: 'placement', serviceId, sourceId: `${serviceId}:placement:${suffix}`, sourceVersion: 'sample-v2', label, data: formatPositionData(normalized),
    details: { personName, ring, sample: true, timeUnknown: Boolean(options.timeUnknown), ...(ring === 'transit' ? { observedAt: options.horoscope.playhead } : {}) },
    target: { subjectId, personName, ...(options.relationshipView ? { relationshipView: options.relationshipView } : {}), ...(options.horoscope ? { horoscope: { scope: options.horoscope.scope, anchor: options.horoscope.anchor, playhead: options.horoscope.playhead } } : {}) } };
}
export function relationshipAspectReference(serviceId, subjectId, factor) {
  return { kind: 'aspect', serviceId, sourceId: `${serviceId}:aspect:${factor.id}`, sourceVersion: 'sample-v1', label: factor.label,
    data: factor.payload, target: { subjectId, relationshipView: factor.source } };
}
export function transitReference(transit, value, frames = []) {
  const status = transitStatusAt(transit, frames, value.playhead);
  return { kind: 'transit', serviceId: 'horoscope:maya', sourceId: `horoscope:maya:transit:${transit.key}`, sourceVersion: 'sample-v1', label: transit.title,
    data: makeTransitContextElement(transit).payload, details: { orb: status.orb, phase: status.phase, observedAt: value.playhead },
    target: { subjectId: 'maya', horoscope: { scope: value.scope, anchor: dateKey(transit.exactMs), playhead: transit.exactMs, selectedTransitKey: transit.key } } };
}
export function stepSkyDay(value, direction) {
  const date = new Date(value.playhead);
  date.setDate(date.getDate() + direction);
  return { anchor: dateKey(date), playhead: date.getTime(), selectedTransitKey: null };
}
const SIGNS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
export function positionLabel(planet) {
  const longitude = ((planet.full_degree % 360) + 360) % 360;
  return { sign: planet.sign || SIGNS[Math.floor(longitude / 30)], degree: (planet.norm_degree ?? longitude % 30).toFixed(1) };
}
