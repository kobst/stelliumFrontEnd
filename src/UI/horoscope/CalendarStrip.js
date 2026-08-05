import React, { useMemo } from 'react';
import {
  DAY_MS,
  formatCalendarDate,
  overlapsInterval,
  sameLocalDay,
  startOfLocalDay,
} from './horoscopeSlots';
import './CalendarStrip.css';

function buildDays(interval) {
  if (!interval) return [];
  const first = startOfLocalDay(interval.start);
  const last = startOfLocalDay(Math.max(interval.start, interval.end - 1));
  if (first === null || last === null) return [];
  const days = [];
  for (let value = first; value <= last && days.length < 31; value += DAY_MS) {
    days.push(value);
  }
  return days;
}

function dayHasReading(day, readingInterval) {
  return Boolean(
    readingInterval && day < readingInterval.end && day + DAY_MS > readingInterval.start
  );
}

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
  const days = useMemo(() => buildDays(interval), [interval]);
  const duration = interval ? interval.end - interval.start : 0;
  const playheadLeft = duration > 0
    ? Math.min(100, Math.max(0, ((experience.playhead - interval.start) / duration) * 100))
    : 0;
  const dense = days.length > 10;

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

        <div className="ihp-calendar__track">
          <div
            className={`ihp-calendar__days${dense ? ' is-dense' : ''}`}
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
              const dotCount = Math.min(active.length, dense ? 3 : 5);
              const selected = sameLocalDay(experience.playhead, day);
              const today = sameLocalDay(Date.now(), day);
              // compact "Mo 3" labels — the strip lives in the sky column now
              const label = dense
                ? new Date(day).getDate()
                : `${formatCalendarDate(day, { weekday: 'short' }).replace(',', '').slice(0, 2)} ${new Date(day).getDate()}`;
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

        <button type="button" className="ihp-calendar__now" disabled={!interval} onClick={onNow}>
          Now
        </button>
      </div>

      <div className="ihp-calendar__legend" aria-label="Calendar legend">
        <span><b>✳</b>Astral Gravity has written for this day</span>
        <span><i />one dot per transit in orb</span>
        <span><i className="is-exact" />exact that day</span>
        <span><em />playhead</span>
      </div>
      <p>The days are the scrub track — click one or press play. Every lens follows it.</p>
    </section>
  );
}

export default CalendarStrip;
