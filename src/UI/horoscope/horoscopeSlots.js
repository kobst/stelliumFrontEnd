import { formatTransitEvent } from '../gravityChat/GravityChatPanel';
import { toSceneBodyNames } from '../../Utilities/chartSceneAdapter';

export const DAY_MS = 86400000;

const ASPECT_ALIASES = {
  conjunct: 'conjunction',
  opposite: 'opposition',
};

export function toTimestamp(value) {
  const timestamp = typeof value === 'number'
    ? value
    : value instanceof Date ? value.getTime() : Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : null;
}

export function startOfLocalDay(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

export function normalizeAspect(value) {
  const aspect = String(value || '').trim().toLowerCase();
  return ASPECT_ALIASES[aspect] || aspect;
}

export function transitTitle(transit) {
  const transiting =
    transit?.transitingPlanet || transit?.transitingBody || transit?.transit?.transitingPlanet;
  const aspect = normalizeAspect(transit?.aspect || transit?.transit?.aspect);
  const target = transit?.targetPlanet || transit?.target || transit?.natalPlanet;
  if (transiting && aspect && target) return `${transiting} ${aspect} natal ${target}`;
  return transit?.title || [transiting, aspect, target].filter(Boolean).join(' ') || 'Transit';
}

export function normalizeTransitWindow(transit, index = 0) {
  const exactMs = toTimestamp(
    transit?.exact || transit?.exactDate || transit?.peakDate || transit?.date
  );
  let startMs = toTimestamp(transit?.start || transit?.startDate) ?? exactMs;
  let endMs = toTimestamp(transit?.end || transit?.endDate) ?? exactMs;
  if (startMs === null || endMs === null) return null;
  if (endMs < startMs) [startMs, endMs] = [endMs, startMs];

  const semantic = [
    transit?.transitingPlanet || transit?.transitingBody,
    normalizeAspect(transit?.aspect),
    transit?.targetPlanet || transit?.target || transit?.natalPlanet,
    exactMs,
  ].filter((value) => value !== null && value !== undefined && value !== '').join('-');

  return {
    ...transit,
    key: String(transit?.id || transit?._id || semantic || `transit-${index}`),
    startMs,
    exactMs: exactMs ?? startMs,
    endMs,
    title: transitTitle(transit),
    aspectName: normalizeAspect(transit?.aspect),
  };
}

export function formatCalendarDate(value, options = {}) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    ...options,
  });
}

export function formatTransitRange(transit) {
  const start = formatCalendarDate(transit?.startMs ?? transit?.start);
  const end = formatCalendarDate(transit?.endMs ?? transit?.end);
  if (!start && !end) return '';
  if (!end || start === end) return start;
  return `${start}–${end}`;
}

export function isFrictional(transit) {
  return ['square', 'opposition', 'quincunx'].includes(normalizeAspect(transit?.aspect));
}

export function overlapsInterval(transit, interval) {
  return Boolean(
    interval && transit?.startMs <= interval.end && transit?.endMs >= interval.start
  );
}

export function isTransitActive(transit, playhead) {
  return transit?.startMs <= playhead && playhead <= transit?.endMs;
}

export function makeTransitContextElement(transit) {
  const transportTransit = {
    ...transit,
    start: new Date(transit.startMs).toISOString(),
    exact: new Date(transit.exactMs).toISOString(),
    end: new Date(transit.endMs).toISOString(),
  };
  return {
    group: 'horoscope',
    type: 'transit',
    key: transit.key,
    label: transit.title,
    meta: formatTransitRange(transit),
    payload: formatTransitEvent(transportTransit),
  };
}

function sceneBody(name) {
  return toSceneBodyNames([name])?.[0];
}

export function transitStatusAt(transit, frames, playhead) {
  const active = isTransitActive(transit, playhead);
  if (!active) return { active: false, orb: null, phase: 'not in orb' };

  let closestFrame = null;
  let closestDistance = Infinity;
  (frames || []).forEach((frame) => {
    const distance = Math.abs(Date.parse(frame.date) - playhead);
    if (distance < closestDistance) {
      closestDistance = distance;
      closestFrame = frame;
    }
  });

  const transiting = sceneBody(
    transit?.transitingPlanet || transit?.transitingBody || transit?.transit?.transitingPlanet
  );
  const target = sceneBody(transit?.targetPlanet || transit?.target || transit?.natalPlanet);
  const aspect = normalizeAspect(transit?.aspect || transit?.transit?.aspect);
  const frameAspect = closestFrame?.aspects?.find((candidate) => (
    candidate.bodyA === transiting &&
    candidate.bodyB === target &&
    normalizeAspect(candidate.type) === aspect
  ));
  const suppliedOrb = Number(transit?.orb);
  const orb = Number.isFinite(Number(frameAspect?.orb))
    ? Number(frameAspect.orb)
    : Number.isFinite(suppliedOrb) ? suppliedOrb : null;
  const exactThreshold = 30 * 60 * 1000;
  const exact = Math.abs(playhead - transit.exactMs) <= exactThreshold || (orb !== null && orb < 0.03);
  const phase = exact ? 'exact' : playhead < transit.exactMs ? 'applying' : 'separating';
  return { active, orb, phase };
}

export function formatOrb(orb) {
  if (!Number.isFinite(orb)) return 'in orb';
  const degrees = Math.floor(orb);
  const minutes = Math.min(59, Math.round((orb - degrees) * 60));
  return `${degrees}°${String(minutes).padStart(2, '0')}′`;
}

export function sameLocalDay(left, right) {
  const a = new Date(left);
  const b = new Date(right);
  return !Number.isNaN(a.getTime()) && !Number.isNaN(b.getTime()) &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}
