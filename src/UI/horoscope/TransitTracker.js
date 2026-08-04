import React, { useMemo } from 'react';
import {
  formatCalendarDate,
  formatTransitRange,
  isFrictional,
  overlapsInterval,
} from './horoscopeSlots';
import './TransitTracker.css';

const clampPercent = (value) => Math.min(100, Math.max(0, value));

function TransitTracker({
  experience,
  interval,
  transitWindows,
  referencedKeys,
  loading,
  error,
  onAddContext,
  onScrub,
}) {
  const rows = useMemo(() => {
    if (!interval) return [];
    return (transitWindows || [])
      .filter((transit) => overlapsInterval(transit, interval))
      .sort((left, right) => (
        Number(referencedKeys.has(right.key)) - Number(referencedKeys.has(left.key)) ||
        left.exactMs - right.exactMs
      ));
  }, [interval, referencedKeys, transitWindows]);

  if (!interval) {
    return <div className="ihp-tracker ihp-tracker--empty" role="status">Sky timing is unavailable.</div>;
  }

  const duration = Math.max(1, interval.end - interval.start);
  const position = (value) => clampPercent(((value - interval.start) / duration) * 100);
  const playheadLeft = position(experience.playhead);
  const todayLeft = position(Date.now());
  const todayInScope = Date.now() >= interval.start && Date.now() <= interval.end;
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

  return (
    <div className="ihp-tracker" aria-label="Transit tracker">
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
      {!loading && !error && rows.length === 0 && (
        <p className="ihp-tracker__status" role="status">No transit windows overlap this scope.</p>
      )}

      {rows.map((transit, index) => {
        const referenced = referencedKeys.has(transit.key);
        const selected = experience.chatContext.transits.some((element) => element.key === transit.key);
        const frictional = isFrictional(transit);
        const clippedStart = Math.max(interval.start, transit.startMs);
        const clippedEnd = Math.min(interval.end, transit.endMs);
        const barLeft = position(clippedStart);
        const barWidth = Math.max(.65, position(clippedEnd) - barLeft);
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
            <div
              className="ihp-tracker__lane"
              role="presentation"
              onClick={scrubLane}
            >
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
              {todayInScope && (
                <span
                  className={`ihp-tracker__line ihp-tracker__line--today${index === 0 ? ' has-label' : ''}`}
                  style={{ left: `${todayLeft}%` }}
                />
              )}
              <span
                className="ihp-tracker__line ihp-tracker__line--playhead"
                style={{ left: `${playheadLeft}%` }}
              />
            </div>
          </div>
        );
      })}

      <div className="ihp-tracker__legend">
        <span><i className="is-flowing" />flowing</span>
        <span><i className="is-frictional" />frictional</span>
        <span>◆ exact</span>
        <span><em className="is-today" />today</span>
        <span><em className="is-playhead" />playhead — click a lane to move it</span>
        <span>✳ in this reading · click a bar for Gravity Chat context</span>
      </div>
    </div>
  );
}

export default TransitTracker;
