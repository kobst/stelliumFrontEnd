import React, { useMemo, useState } from 'react';
import {
  DAY_MS,
  formatCalendarDate,
  formatTransitRange,
  isFrictional,
  overlapsInterval,
  startOfLocalDay,
} from './horoscopeSlots';
import './TransitTracker.css';

const clampPercent = (value) => Math.min(100, Math.max(0, value));

const MINOR_ASPECTS = new Set([
  'quincunx', 'inconjunct', 'semisextile', 'semisquare', 'sesquiquadrate',
  'quintile', 'biquintile',
]);

const PERSONAL_TARGETS = new Set([
  'sun', 'moon', 'mercury', 'venus', 'mars', 'ascendant', 'asc', 'mc', 'midheaven',
]);

function planetId(name) {
  const lowered = String(name || '').trim().toLowerCase();
  if (lowered.includes('node')) return 'node';
  return lowered;
}

function transitingId(transit) {
  return planetId(
    transit?.transitingPlanet || transit?.transitingBody || transit?.transit?.transitingPlanet
  );
}

function targetId(transit) {
  return planetId(transit?.targetPlanet || transit?.target || transit?.natalPlanet);
}

function isMinor(transit) {
  return MINOR_ASPECTS.has(String(transit?.aspectName || '').toLowerCase());
}

const SORTS = {
  exact: (a, b) => a.exactMs - b.exactMs,
  start: (a, b) => a.startMs - b.startMs,
};

function TransitTracker({
  experience,
  interval,
  transitWindows,
  referencedKeys,
  activeBodies,
  bodiesMode,
  loading,
  error,
  onAddContext,
  onScrub,
}) {
  const [includeMinor, setIncludeMinor] = useState(false);
  const [personalOnly, setPersonalOnly] = useState(false);
  const [sortKey, setSortKey] = useState('exact');

  const playhead = experience.playhead;

  const sorter = useMemo(() => (
    sortKey === 'tightness'
      ? (a, b) => Math.abs(a.exactMs - playhead) - Math.abs(b.exactMs - playhead)
      : SORTS[sortKey] || SORTS.exact
  ), [playhead, sortKey]);

  // structural pool: scope overlap -> shared planet chips (custom selections
  // only) -> tracker-side toggles. Reading-referenced transits survive every
  // filter — curation reads as intent, not as gaps.
  const pool = useMemo(() => {
    if (!interval) return [];
    return (transitWindows || []).filter((transit) => {
      if (!overlapsInterval(transit, interval)) return false;
      // explicit user filters always win — including over reading transits
      if (bodiesMode === 'custom' && activeBodies && !activeBodies.has(transitingId(transit))) {
        return false;
      }
      if (personalOnly && !PERSONAL_TARGETS.has(targetId(transit))) return false;
      // reading-referenced transits bypass only the implicit minor-aspect
      // default, so the reading's own transit can't hide out of the box
      if (referencedKeys.has(transit.key)) return true;
      if (!includeMinor && isMinor(transit)) return false;
      return true;
    });
  }, [activeBodies, bodiesMode, includeMinor, interval, personalOnly, referencedKeys, transitWindows]);

  const hasMinorAspects = useMemo(
    () => (transitWindows || []).some((transit) => isMinor(transit)),
    [transitWindows]
  );

  // Reading mode means what it says: only the transits this reading cites.
  // Everything else is the full pool, one row per transit.
  const view = useMemo(() => {
    if (bodiesMode === 'reading') {
      return { rows: pool.filter((transit) => referencedKeys.has(transit.key)).sort(sorter) };
    }
    return { rows: [...pool].sort(sorter) };
  }, [bodiesMode, pool, referencedKeys, sorter]);

  if (!interval) {
    return <div className="ihp-tracker ihp-tracker--empty" role="status">Sky timing is unavailable.</div>;
  }

  const duration = Math.max(1, interval.end - interval.start);
  const position = (value) => clampPercent(((value - interval.start) / duration) * 100);
  const playheadLeft = position(playhead);
  const todayStart = startOfLocalDay(Date.now());
  const todayLeft = position(Date.now());
  const todayInScope = Date.now() >= interval.start && Date.now() <= interval.end;
  const todayBand = todayInScope
    ? { left: position(todayStart), width: Math.max(1, position(todayStart + DAY_MS) - position(todayStart)) }
    : null;
  const ticks = [0, .25, .5, .75, 1].map((fraction) => ({
    fraction,
    label: formatCalendarDate(interval.start + duration * fraction - (fraction === 1 ? 1 : 0)),
  }));

  const scrubLane = (event) => {
    if (event.target.closest('[data-transit-bar]')) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const fraction = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    onScrub(interval.start + duration * fraction);
  };

  const laneChrome = (
    <>
      {todayBand && (
        <span
          className="ihp-tracker__todayband"
          style={{ left: `${todayBand.left}%`, width: `${todayBand.width}%` }}
          aria-hidden="true"
        />
      )}
      {todayInScope && (
        <span className="ihp-tracker__line ihp-tracker__line--today" style={{ left: `${todayLeft}%` }} />
      )}
      <span className="ihp-tracker__line ihp-tracker__line--playhead" style={{ left: `${playheadLeft}%` }} />
    </>
  );

  const renderBar = (transit) => {
    const frictional = isFrictional(transit);
    const clippedStart = Math.max(interval.start, transit.startMs);
    const clippedEnd = Math.min(interval.end, transit.endMs);
    const barLeft = position(clippedStart);
    const barWidth = Math.max(.65, position(clippedEnd) - barLeft);
    return (
      <React.Fragment key={transit.key}>
        <button
          type="button"
          data-transit-bar
          className={`ihp-tracker__bar ${frictional ? 'is-frictional' : 'is-flowing'}`}
          style={{ left: `${barLeft}%`, width: `${barWidth}%` }}
          aria-label={`Add ${transit.title}, ${formatTransitRange(transit)}, to Gravity Chat`}
          onClick={() => onAddContext(transit)}
        />
        {transit.exactMs >= interval.start && transit.exactMs <= interval.end && (
          <span
            className={`ihp-tracker__exact ${frictional ? 'is-frictional' : 'is-flowing'}`}
            style={{ left: `${position(transit.exactMs)}%` }}
            aria-hidden="true"
          >
            ◆
          </span>
        )}
      </React.Fragment>
    );
  };

  const renderTransitRow = (transit) => {
    const referenced = referencedKeys.has(transit.key);
    const selected = experience.chatContext.transits.some((element) => element.key === transit.key);
    return (
      <div
        className={`ihp-tracker__row${referenced ? ' is-referenced' : ' is-quiet'}${selected ? ' is-selected' : ''}`}
        key={transit.key}
      >
        <button
          type="button"
          className="ihp-tracker__name"
          title={`${transit.title} · ${formatTransitRange(transit)} · add to Gravity Chat`}
          onClick={() => onAddContext(transit)}
        >
          <span>{transit.title}</span>
          {referenced && <b aria-label="Referenced in this reading">✳</b>}
        </button>
        <div className="ihp-tracker__lane" role="presentation" onClick={scrubLane}>
          {renderBar(transit)}
          {laneChrome}
        </div>
      </div>
    );
  };

  return (
    <div className="ihp-tracker" aria-label="Transit tracker">
      <div className="ihp-tracker__controls">
        <span className="ihp-tracker__controls-label">Filter</span>
        {hasMinorAspects && (
          <button
            type="button"
            className={`ihp-tracker__toggle${includeMinor ? ' on' : ''}`}
            aria-pressed={includeMinor}
            onClick={() => setIncludeMinor((value) => !value)}
          >
            minor aspects
          </button>
        )}
        <button
          type="button"
          className={`ihp-tracker__toggle${personalOnly ? ' on' : ''}`}
          aria-pressed={personalOnly}
          onClick={() => setPersonalOnly((value) => !value)}
        >
          personal points only
        </button>
        <span className="ihp-tracker__controls-label ihp-tracker__controls-label--sort">Sort</span>
        {[
          { id: 'exact', label: 'exact date' },
          { id: 'start', label: 'start' },
          { id: 'tightness', label: 'tightness now' },
        ].map((option) => (
          <button
            type="button"
            className={`ihp-tracker__toggle ihp-tracker__toggle--sort${sortKey === option.id ? ' on' : ''}`}
            aria-pressed={sortKey === option.id}
            onClick={() => setSortKey(option.id)}
            key={option.id}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="ihp-tracker__row ihp-tracker__row--head" aria-hidden="true">
        <span />
        <div className="ihp-tracker__lane">
          {ticks.map((tick) => (
            <span className="ihp-tracker__tick" style={{ left: `${tick.fraction * 100}%` }} key={tick.fraction}>
              {tick.label}
            </span>
          ))}
        </div>
      </div>

      {loading && <p className="ihp-tracker__status" role="status">Mapping transit windows…</p>}
      {!loading && error && <p className="ihp-tracker__status is-error" role="status">{error}</p>}
      {!loading && !error && pool.length === 0 && (
        <p className="ihp-tracker__status" role="status">No transit windows overlap this scope.</p>
      )}

      {view.rows.map(renderTransitRow)}

      <div className="ihp-tracker__legend">
        <span><i className="is-flowing" />flowing</span>
        <span><i className="is-frictional" />frictional</span>
        <span>◆ exact</span>
        <span><em className="is-today" />today</span>
        <span><em className="is-playhead" />playhead — click a lane to move it</span>
        <span>✳ in this reading · click a name for Ask context</span>
      </div>
    </div>
  );
}

export default TransitTracker;
