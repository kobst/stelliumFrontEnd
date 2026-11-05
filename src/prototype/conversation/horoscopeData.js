import { SAMPLE_PLANETS, SAMPLE_WEEK, SAMPLE_MONTH } from './fixtures';
const DAY_MS = 86400000;

// Match complete transit phrases, not unrelated mentions of both planets.
// Missing prose references stay unmatched rather than implying a connection.
export function passageTransitKeys(paragraphs, transits) {
  const normalize = (text) => String(text).toLowerCase().replace(/[’']/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
  return paragraphs.map((paragraph) => transits.filter((transit) => {
    const text = ` ${normalize(paragraph)} `;
    return [transit.title, `${transit.transitingPlanet} ${transit.aspectName} ${transit.targetPlanet}`, `${transit.transitingPlanet} ${transit.aspectName} your natal ${transit.targetPlanet}`,
      `${transit.transitingPlanet} ${transit.aspectName} your ${transit.targetPlanet}`]
      .some((phrase) => text.includes(` ${normalize(phrase)} `));
  }).map((transit) => transit.key));
}

export const PERIODS = [
  { id: 'today', label: 'Today', type: 'daily' },
  { id: 'week', label: 'This week', type: 'weekly' },
  { id: 'month', label: 'This month', type: 'monthly' },
];
export const dateKey = (ms) => {
  const date = new Date(ms);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};
export const dayAt = (key) => new Date(`${key}T12:00:00`).getTime();
export const initialHoroscope = (anchor = '2026-10-23') => ({
  scope: 'week', anchor, playhead: dayAt(anchor), panel: 'forecast', bodiesMode: 'reading', bodies: [],
  selectedTransitKey: null, discussionOpen: true,
});

export function scopeInterval(value) {
  const start = new Date(dayAt(value.anchor));
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  if (value.scope === 'month') { start.setDate(1); end.setMonth(end.getMonth() + 1, 1); }
  else if (value.scope === 'week') { start.setDate(start.getDate() - (start.getDay() + 6) % 7); end.setTime(start.getTime()); end.setDate(end.getDate() + 7); }
  else end.setDate(end.getDate() + 1);
  return { start: start.getTime(), end: end.getTime() };
}

export function movePeriod(value, direction) {
  const date = new Date(dayAt(value.anchor));
  if (value.scope === 'month') date.setMonth(date.getMonth() + direction, 1);
  else date.setDate(date.getDate() + direction * (value.scope === 'week' ? 7 : 1));
  return { anchor: dateKey(date), playhead: date.getTime(), selectedTransitKey: null };
}

export function sampleHoroscopeData(value) {
  const interval = scopeInterval(value);
  const transit = (key, body, aspect, target, start, exact, end) => ({
    key, transitingPlanet: body, aspect, aspectName: aspect, targetPlanet: target,
    title: `${body} ${aspect} natal ${target}`, startMs: dayAt(start), exactMs: dayAt(exact), endMs: dayAt(end),
  });
  const transits = [
    transit('sample-venus-mars', 'Venus', 'square', 'Mars', '2026-10-20', '2026-10-23', '2026-10-26'),
    transit('sample-mercury-jupiter', 'Mercury', 'trine', 'Jupiter', '2026-10-22', '2026-10-25', '2026-10-28'),
    transit('sample-saturn-sun', 'Saturn', 'opposition', 'Sun', '2026-10-10', '2026-10-30', '2026-11-20'),
    transit('sample-moon-venus', 'Moon', 'sextile', 'Venus', '2026-10-23', '2026-10-24', '2026-10-25'),
    transit('sample-november-venus', 'Venus', 'trine', 'Moon', '2026-11-01', '2026-11-07', '2026-11-14'),
    transit('sample-november-mercury', 'Mercury', 'square', 'Sun', '2026-11-10', '2026-11-15', '2026-11-22'),
  ].filter(Boolean);
  const summary = value.scope === 'today' ? 'Give yourself a little room to listen before answering today. A small, honest conversation can be more useful than finding the perfect words.'
    : value.scope === 'month' ? new Date(interval.start).getMonth() === 10 ? SAMPLE_MONTH.summary : 'This month invites you to balance connection with independence. Notice where a thoughtful pause lets a more honest conversation take shape.'
      : SAMPLE_WEEK.summary;
  const available = interval.start >= dayAt('2026-10-01') - DAY_MS && interval.end <= dayAt('2026-12-01');
  const inRange = transits.filter((item) => item.startMs < interval.end && item.endMs >= interval.start);
  const referencedKeys = inRange.slice(0, 2).map((item) => item.key);
  const passages = inRange.slice(0, 2).map((item) => `${item.title} is one of the themes in this illustrative forecast. Make space to notice how you respond, rather than treating this influence as a prediction. Explore this transit to see its timing alongside your reading.`);
  return { name: 'Maya', sample: true, planets: SAMPLE_PLANETS, houses: [], transits, frames: [],
    horoscope: available ? { interpretation: [summary, ...passages].join('\n\n'),
      startDate: dateKey(interval.start), endDate: dateKey(interval.end - 1) } : null,
    referencedKeys, loading: false, error: '', frameError: '' };
}

export function readingInterval(horoscope, scope) {
  const start = Date.parse(horoscope?.startDate);
  if (!Number.isFinite(start)) return null;
  let end = Date.parse(horoscope?.endDate);
  if (/^\d{4}-\d{2}-\d{2}$/.test(horoscope?.endDate || '')) end += DAY_MS;
  if (!Number.isFinite(end) || end <= start) end = start + (scope === 'today' ? 1 : scope === 'week' ? 7 : 30) * DAY_MS;
  return { start, end };
}

export function skyAt(data, playhead) {
  if (data.sample) {
    // Deliberately synthetic motion for testing scrubbing, never a live ephemeris.
    const degrees = { square: 90, trine: 120, sextile: 60, opposition: 180 };
    const byBody = new Map();
    [...data.transits].sort((a, b) => Math.abs(a.exactMs - playhead) - Math.abs(b.exactMs - playhead)).forEach((item) => {
      if (byBody.has(item.transitingPlanet)) return;
      const target = data.planets.find((planet) => planet.name === item.targetPlanet);
      if (!target) return;
      const longitude = (target.full_degree - (degrees[item.aspectName] || 0) + (playhead - item.exactMs) / DAY_MS * .7 + 720) % 360;
      byBody.set(item.transitingPlanet, { name: item.transitingPlanet, full_degree: longitude });
    });
    // Keep the displayed body set stable, even when a body has no forecast event.
    // The fallback is explicitly synthetic motion, not an astronomical ephemeris.
    const rates = { Sun: 1, Moon: 13, Mercury: 1.2, Venus: 1, Mars: .5, Jupiter: .08, Saturn: .03 };
    return data.planets.map(planet => byBody.get(planet.name) || {
      name: planet.name, full_degree: ((planet.full_degree + 60 + (playhead - dayAt('2026-10-23')) / DAY_MS * rates[planet.name]) % 360 + 360) % 360,
    });
  }
  const closest = data.frames.reduce((previous, frame) => !previous || Math.abs(Date.parse(frame.date) - playhead) < Math.abs(Date.parse(previous.date) - playhead) ? frame : previous, null);
  return (closest?.planets || []).map((planet) => ({ name: planet.name, full_degree: Number(planet.lon) })).filter((planet) => Number.isFinite(planet.full_degree));
}

export function chartAspects(transits, planets, sky, playhead) {
  return transits.filter((item) => item.startMs <= playhead && item.endMs >= playhead).map((item) => {
    const from = sky.find((planet) => planet.name === item.transitingPlanet);
    const to = planets.find((planet) => planet.name === item.targetPlanet);
    return from && to ? { aspectedPlanet: from.name, aspectingPlanet: to.name,
      aspectedPlanetDegree: from.full_degree, aspectingPlanetDegree: to.full_degree, aspectType: item.aspectName } : null;
  }).filter(Boolean);
}

export function snapshotHoroscope(value, transit = null) {
  return { scope: value.scope, anchor: value.anchor, date: dateKey(value.playhead), playhead: value.playhead,
    label: PERIODS.find((period) => period.id === value.scope)?.label, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    transit: transit ? { ...transit } : null };
}
