import React from 'react';
import './UpNextStrip.css';

function countdown(from, to) {
  const milliseconds = to - from;
  if (milliseconds <= 60 * 60 * 1000) {
    const minutes = Math.max(1, Math.round(milliseconds / 60000));
    return `In ${minutes} minute${minutes === 1 ? '' : 's'}`;
  }
  if (milliseconds < 48 * 60 * 60 * 1000) {
    const hours = Math.round(milliseconds / 3600000);
    return `In ${hours} hour${hours === 1 ? '' : 's'}`;
  }
  const days = Math.round(milliseconds / 86400000);
  return `In ${days} day${days === 1 ? '' : 's'}`;
}

function UpNextStrip({ experience, transitWindows, onAddContext }) {
  const upcoming = (transitWindows || [])
    .filter((transit) => transit.exactMs > experience.playhead)
    .sort((left, right) => left.exactMs - right.exactMs)
    .slice(0, 5);

  return (
    <section className="ihp-up-next" aria-label="Upcoming exact transits">
      <span className="ihp-up-next__label">Up next</span>
      {upcoming.length > 0 ? (
        <div className="ihp-up-next__grid">
          {upcoming.map((transit) => (
            <button type="button" onClick={() => onAddContext(transit)} key={transit.key}>
              <span>{countdown(experience.playhead, transit.exactMs)}</span>
              <b>{transit.title}</b>
            </button>
          ))}
        </div>
      ) : (
        <p>No later exacts are available in the fetched transit window.</p>
      )}
    </section>
  );
}

export default UpNextStrip;
