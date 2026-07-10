export function formatTransitTitle(transit) {
  if (!transit) return '';
  const transiting =
    transit.transitingPlanet || transit.transitingBody || transit.transit?.transitingPlanet;
  const aspect = transit.aspect || transit.transit?.aspect;
  const natal = transit.targetPlanet || transit.target || transit.natalPlanet;
  if (transiting && aspect && natal) {
    return `Transiting ${transiting} ${aspect} Natal ${natal}`;
  }
  return transit.title || [transiting, aspect, natal].filter(Boolean).join(' ');
}

function getTransitDateValue(transit) {
  return (
    transit?.exact ||
    transit?.exactDate ||
    transit?.peakDate ||
    transit?.date ||
    transit?.startDate
  );
}

function formatTransitDateValue(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return `${date.toLocaleString('default', { month: 'short', timeZone: 'UTC' })} ${date.getUTCDate()}`;
}

export function groupTransitInfluences(transits = []) {
  const groups = new Map();
  transits.forEach((transit) => {
    const transiting =
      transit.transitingPlanet || transit.transitingBody || transit.transit?.transitingPlanet || '';
    const aspect = transit.aspect || transit.transit?.aspect || '';
    const natal = transit.targetPlanet || transit.target || transit.natalPlanet || '';
    const semanticKey = [transiting, aspect, natal]
      .map((value) => String(value).toLowerCase())
      .join('|');
    const key = semanticKey === '||'
      ? String(transit.id || transit.title || groups.size)
      : semanticKey;
    const timestamp = Date.parse(getTransitDateValue(transit));
    const existing = groups.get(key);
    if (existing) {
      if (Number.isFinite(timestamp)) existing.timestamps.push(timestamp);
      return;
    }
    groups.set(key, {
      key,
      transit,
      title: formatTransitTitle(transit),
      timestamps: Number.isFinite(timestamp) ? [timestamp] : [],
    });
  });

  return [...groups.values()].map((group) => {
    const timestamps = group.timestamps.sort((a, b) => a - b);
    const first = timestamps[0];
    const last = timestamps[timestamps.length - 1];
    return {
      ...group,
      dateLabel: first === undefined
        ? ''
        : first === last
          ? formatTransitDateValue(first)
          : `${formatTransitDateValue(first)}–${formatTransitDateValue(last)}`,
    };
  });
}
