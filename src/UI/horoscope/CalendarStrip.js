import React, { useMemo, useRef, useState } from 'react';
import {
  DAY_MS,
  formatCalendarDate,
  overlapsInterval,
  sameLocalDay,
  startOfLocalDay,
} from './horoscopeSlots';
import './CalendarStrip.css';

const HOUR_MS = 3600000;

function buildDays(interval) {
  if (!interval) return [];
  const first = startOfLocalDay(interval.start);
  const last = startOfLocalDay(Math.max(interval.start, interval.end - 1));
  if (first === null || last === null) return [];
  const days = [];
  for (let value = first; value <= last && days.length < 40; value += DAY_MS) {
    days.push(value);
  }
  return days;
}

function dayHasReading(day, readingInterval) {
  return Boolean(
    readingInterval && day < readingInterval.end && day + DAY_MS > readingInterval.start
  );
}

/**
 * The scrub track has three densities, matching scope: a continuous 24h
 * track with hour ticks (today), seven discrete day cells (week), and a
 * continuous track with a transit-density ridge, exact ticks, and
 * editorial stars (month). Same component, same shared state — three
 * renderings.
 */
function CalendarStrip({
  experience,
  interval,
  readingInterval,
  transitWindows,
  playing,
  canPlay,
  onTogglePlaying,
  onScrub,
  onNow,
}) {
  const trackRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [dragMs, setDragMs] = useState(null);

  const days = useMemo(() => buildDays(interval), [interval]);
  const duration = interval ? interval.end - interval.start : 0;
  const mode = duration > 0 && duration <= DAY_MS * 1.5
    ? 'day'
    : days.length <= 10 ? 'cells' : 'continuous';

  const position = (value) => (duration > 0
    ? Math.min(100, Math.max(0, ((value - interval.start) / duration) * 100))
    : 0);
  const playheadMs = dragging && dragMs !== null ? dragMs : experience.playhead;
  const playheadLeft = position(playheadMs);

  // per-day transits-in-orb — the ridge reads the month's real terrain
  const dayCounts = useMemo(() => days.map((day) => (
    (transitWindows || []).filter((transit) => (
      overlapsInterval(transit, { start: day, end: day + DAY_MS })
    )).length
  )), [days, transitWindows]);
  const maxCount = Math.max(1, ...dayCounts);

  const exactTicks = useMemo(() => (
    (transitWindows || [])
      .filter((transit) => interval &&
        transit.exactMs >= interval.start && transit.exactMs <= interval.end)
      .map((transit) => transit.exactMs)
  ), [interval, transitWindows]);

  // editorial stars only stay legible when they are actually sparse — a
  // monthly reading "covers" every day, which would star the whole track
  const starDays = useMemo(() => {
    const starred = days.filter((day) => dayHasReading(day, readingInterval));
    return starred.length <= Math.ceil(days.length / 2) ? starred : [];
  }, [days, readingInterval]);

  const ridgePath = useMemo(() => {
    if (mode !== 'continuous' || !dayCounts.length) return null;
    const step = 100 / dayCounts.length;
    const points = dayCounts.map((count, index) => {
      const x = (index + 0.5) * step;
      const y = 30 - (count / maxCount) * 26;
      return `L ${x.toFixed(2)} ${y.toFixed(2)}`;
    });
    return `M 0 30 ${points.join(' ')} L 100 30 Z`;
  }, [dayCounts, maxCount, mode]);

  const gridlines = useMemo(() => {
    if (!interval) return [];
    if (mode === 'day') {
      // the 24h window rarely starts at midnight — tick every hour it
      // actually covers, labelling the 6 o'clock marks
      const lines = [];
      const firstTick = Math.ceil(interval.start / HOUR_MS) * HOUR_MS;
      for (let value = firstTick; value <= interval.end; value += HOUR_MS) {
        const hour = new Date(value).getHours();
        lines.push({
          value,
          label: hour % 6 === 0
            ? new Date(value).toLocaleTimeString('en-US', { hour: 'numeric' })
            : null,
          minor: hour % 6 !== 0,
        });
      }
      return lines;
    }
    if (mode === 'continuous') {
      const lines = [];
      for (let index = 0; index < days.length; index += 7) {
        lines.push({ value: days[index], label: formatCalendarDate(days[index]), minor: false });
      }
      return lines;
    }
    return [];
  }, [days, interval, mode]);

  const msAtEvent = (event) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect || !interval) return null;
    const fraction = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    return interval.start + duration * fraction;
  };

  const handlePointerDown = (event) => {
    const value = msAtEvent(event);
    if (value === null) return;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    setDragging(true);
    setDragMs(value);
    onScrub(value);
  };

  const handlePointerMove = (event) => {
    if (!dragging) return;
    const value = msAtEvent(event);
    if (value === null) return;
    setDragMs(value);
    onScrub(value);
  };

  const handlePointerUp = (event) => {
    if (!dragging) return;
    setDragging(false);
    const value = msAtEvent(event);
    setDragMs(null);
    if (value === null) return;
    // snap to a day boundary (hour boundary at today scope) on release
    const snapped = mode === 'day'
      ? Math.round(value / HOUR_MS) * HOUR_MS
      : (startOfLocalDay(value) ?? value) + DAY_MS / 2;
    onScrub(Math.min(interval.end, Math.max(interval.start, snapped)));
  };

  const todayLeft = position(Date.now());
  const todayInScope = interval && Date.now() >= interval.start && Date.now() <= interval.end;

  const continuousTrack = (
    <div
      className={`ihp-calendar__continuous${dragging ? ' is-dragging' : ''}`}
      ref={trackRef}
      role="slider"
      aria-label="Scrub the sky"
      aria-valuemin={interval?.start}
      aria-valuemax={interval?.end}
      aria-valuenow={Math.round(playheadMs)}
      tabIndex={0}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={() => { setDragging(false); setDragMs(null); }}
    >
      {ridgePath && (
        <svg className="ihp-calendar__ridge" viewBox="0 0 100 30" preserveAspectRatio="none" aria-hidden="true">
          <path d={ridgePath} />
        </svg>
      )}
      {gridlines.map((line) => (
        <span
          className={`ihp-calendar__grid${line.minor ? ' is-minor' : ''}`}
          style={{ left: `${position(line.value)}%` }}
          key={line.value}
        >
          {line.label && <label>{line.label}</label>}
        </span>
      ))}
      {exactTicks.map((value, index) => (
        <span
          className="ihp-calendar__exact-tick"
          style={{ left: `${position(value)}%` }}
          aria-hidden="true"
          key={`${value}-${index}`}
        />
      ))}
      {starDays.map((day) => (
        <b
          className="ihp-calendar__star"
          style={{ left: `${position(day + DAY_MS / 2)}%` }}
          aria-label={`Reading covers ${formatCalendarDate(day)}`}
          key={day}
        >
          ✳
        </b>
      ))}
      {todayInScope && (
        <span className="ihp-calendar__todaytick" style={{ left: `${todayLeft}%` }} aria-hidden="true" />
      )}
      <span className="ihp-calendar__playhead" style={{ left: `${playheadLeft}%` }} />
      {dragging && (
        <span className="ihp-calendar__float" style={{ left: `${playheadLeft}%` }}>
          {mode === 'day'
            ? new Date(playheadMs).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
            : formatCalendarDate(playheadMs, { weekday: 'short' })}
        </span>
      )}
    </div>
  );

  const cellsTrack = (
    <div className="ihp-calendar__track">
      <div
        className="ihp-calendar__days"
        style={{ '--ihp-calendar-columns': days.length || 1 }}
      >
        {days.map((day) => {
          const dayInterval = { start: day, end: day + DAY_MS };
          const active = (transitWindows || []).filter((transit) => (
            overlapsInterval(transit, dayInterval)
          ));
          const exact = active.some((transit) => (
            transit.exactMs >= day && transit.exactMs < day + DAY_MS
          ));
          const dotCount = Math.min(active.length, 5);
          const selected = sameLocalDay(experience.playhead, day);
          const today = sameLocalDay(Date.now(), day);
          const label = `${formatCalendarDate(day, { weekday: 'short' }).replace(',', '').slice(0, 2)} ${new Date(day).getDate()}`;
          return (
            <button
              type="button"
              className={`ihp-calendar__day${selected ? ' is-selected' : ''}${today ? ' is-today' : ''}`}
              aria-label={`Scrub to ${formatCalendarDate(day, { weekday: 'long', year: 'numeric' })}`}
              aria-current={selected ? 'date' : undefined}
              onClick={() => onScrub(Math.min(interval.end, Math.max(interval.start, day + DAY_MS / 2)))}
              key={day}
            >
              <span className="ihp-calendar__day-label">
                {label}
                {dayHasReading(day, readingInterval) && <b aria-label="Reading available">✳</b>}
              </span>
              <span className="ihp-calendar__dots" aria-hidden="true">
                {Array.from({ length: dotCount }, (_, index) => (
                  <i className={exact && index === 0 ? 'is-exact' : ''} key={index} />
                ))}
              </span>
            </button>
          );
        })}
      </div>
      {interval && (
        <span className="ihp-calendar__playhead" style={{ left: `${playheadLeft}%` }} />
      )}
    </div>
  );

  return (
    <section className="ihp-calendar" aria-label="Calendar scrub track">
      <div className="ihp-calendar__scrub">
        <button
          type="button"
          className="ihp-calendar__play"
          aria-label={playing ? 'Pause the sky' : 'Play the sky'}
          aria-pressed={playing}
          disabled={!canPlay}
          onClick={onTogglePlaying}
        >
          {playing ? '❚❚' : '▶'}
        </button>

        {mode === 'cells' ? cellsTrack : continuousTrack}

        <button type="button" className="ihp-calendar__now" disabled={!interval} onClick={onNow}>
          Now
        </button>
      </div>

      {mode === 'cells' ? (
        <div className="ihp-calendar__legend" aria-label="Calendar legend">
          <span><b>✳</b>Astral Gravity has written for this day</span>
          <span><i />one dot per transit in orb</span>
          <span><i className="is-exact" />exact that day</span>
          <span><em />playhead</span>
        </div>
      ) : (
        <div className="ihp-calendar__legend" aria-label="Calendar legend">
          {mode === 'continuous' && <span><u className="is-ridge" />transits in orb, day by day</span>}
          <span><i className="is-exact" />exact</span>
          {starDays.length > 0 && <span><b>✳</b>editorial day</span>}
          <span><em />playhead — drag to scrub</span>
        </div>
      )}
      <p>
        {mode === 'cells'
          ? 'The days are the scrub track — click one or press play. Every lens follows it.'
          : 'The track is the scrubber — click or drag anywhere. Every lens follows it.'}
      </p>
    </section>
  );
}

export default CalendarStrip;
