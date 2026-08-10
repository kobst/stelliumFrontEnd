import React, { useEffect, useState } from 'react';
import useEntitlementsStore from '../../Utilities/entitlementsStore';
import { formatCalendarDate, formatOrb, formatTransitRange } from './horoscopeSlots';
import './HoroscopeReading.css';

function HoroscopeReading({
  experience,
  scopeLabel,
  horoscope,
  readingInterval,
  paragraphs,
  referencedTransits,
  quietTransits,
  loading,
  error,
  dailyLocked,
  onRetry,
  onReturnToReading,
  onAddContext,
  onTransitFocus,
}) {
  const [moreOpen, setMoreOpen] = useState(false);
  const isSimple = useEntitlementsStore((state) => state.pricingModel === 'simple');

  useEffect(() => {
    setMoreOpen(false);
  }, [experience.scope]);

  const outOfCoverage = Boolean(
    readingInterval &&
    (experience.playhead < readingInterval.start || experience.playhead >= readingInterval.end)
  );
  const rangeLabel = readingInterval
    ? `${formatCalendarDate(readingInterval.start)}–${formatCalendarDate(readingInterval.end - 1)}`
    : '';
  const shownQuiet = moreOpen ? quietTransits : quietTransits.slice(0, 3);

  return (
    <article className="ink-card ihp-reading-card" aria-label={`${scopeLabel} horoscope reading`}>
      <h2>Horoscope</h2>
      <div className="ihp-reading-range">
        <b>{scopeLabel}</b>
        <span>{rangeLabel}</span>
      </div>

      {outOfCoverage && (
        <button type="button" className="ihp-reading-coverage" onClick={onReturnToReading}>
          reading covers {rangeLabel} <span>· return</span>
        </button>
      )}

      <div className="ihp-reading-body" aria-live="polite">
        {dailyLocked && (
          <div className="ihp-reading-state">
            <p>
              {isSimple
                ? 'Daily horoscopes are included with Plus. Upgrade to unlock today’s reading.'
                : 'Daily horoscopes cost 1 credit on Free and are included with Plus.'}
            </p>
          </div>
        )}
        {!dailyLocked && loading && (
          <div className="ihp-reading-state" role="status">
            <span aria-hidden="true">✳</span>
            <p>Reading the sky for {scopeLabel.toLowerCase()}…</p>
          </div>
        )}
        {!dailyLocked && !loading && error && (
          <div className="ihp-reading-state ihp-reading-state--error" role="alert">
            <p>{error}</p>
            <button type="button" className="ink-btn ink-btn--ghost" onClick={onRetry}>
              Try again
            </button>
          </div>
        )}
        {!dailyLocked && !loading && !error && horoscope && paragraphs.length > 0 && (
          paragraphs.map((paragraph, index) => <p key={`${experience.scope}-${index}`}>{paragraph}</p>)
        )}
        {!dailyLocked && !loading && !error && horoscope && paragraphs.length === 0 && (
          <div className="ihp-reading-state">
            <p>This reading does not have any written guidance yet.</p>
          </div>
        )}
        {!dailyLocked && !loading && !error && !horoscope && (
          <div className="ihp-reading-state">
            <p>Your {scopeLabel.toLowerCase()} reading is not available yet.</p>
            <button type="button" className="ink-btn ink-btn--ghost" onClick={onRetry}>
              Load reading
            </button>
          </div>
        )}
      </div>

      {!loading && !error && (
        <>
          <div className="ihp-reading-list-label">Referenced in this reading</div>
          <div className="ihp-reading-transits">
            {referencedTransits.map(({ transit, status }) => {
              const selected = experience.chatContext.transits.some((element) => element.key === transit.key);
              return (
                <button
                  type="button"
                  className={`ihp-reading-transit${selected ? ' is-selected' : ''}${status.active ? '' : ' is-quiet'}`}
                  title={`${formatTransitRange(transit)} · add to Gravity Chat`}
                  onMouseEnter={() => onTransitFocus(transit)}
                  onMouseLeave={() => onTransitFocus(null)}
                  onFocus={() => onTransitFocus(transit)}
                  onBlur={() => onTransitFocus(null)}
                  onClick={() => onAddContext(transit)}
                  key={transit.key}
                >
                  <span className="ihp-reading-transit__check" aria-hidden="true">
                    {selected ? '✓' : '✳'}
                  </span>
                  <span>{transit.title}</span>
                  <span className={`ihp-reading-transit__orb${status.phase === 'exact' ? ' is-exact' : ''}`}>
                    {status.active ? `${formatOrb(status.orb)} ` : ''}
                    <i>{status.phase}</i>
                  </span>
                </button>
              );
            })}
            {referencedTransits.length === 0 && (
              <p className="ihp-reading-transits__empty">
                This reading did not return structured transit references.
              </p>
            )}
          </div>

          <div className="ihp-reading-list-label">
            Also active, no reading <i>({quietTransits.length})</i>
          </div>
          <div className="ihp-reading-quiet">
            {shownQuiet.map((transit) => {
              const selected = experience.chatContext.transits.some((element) => element.key === transit.key);
              return (
                <button
                  type="button"
                  className={`ihp-reading-quiet__chip${selected ? ' is-selected' : ''}`}
                  onClick={() => onAddContext(transit)}
                  key={transit.key}
                >
                  {transit.title}
                </button>
              );
            })}
            {quietTransits.length === 0 && (
              <span className="ihp-reading-quiet__none">none at this moment</span>
            )}
            {quietTransits.length > 3 && (
              <button type="button" className="ihp-reading-quiet__more" onClick={() => setMoreOpen(!moreOpen)}>
                {moreOpen ? 'show less' : `+${quietTransits.length - 3} more`}
              </button>
            )}
          </div>
        </>
      )}
    </article>
  );
}

export default HoroscopeReading;
