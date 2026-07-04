import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChartScene } from '../shared/chartScene';
import { getTransitFrames } from '../../Utilities/api';
import {
  toChartScenePlacements,
  toChartSceneAspects,
  toTransitFrames,
  toSceneBodyNames,
} from '../../Utilities/chartSceneAdapter';
import './HoroscopeSkyRibbon.css';

// full sweep of the loaded window takes this long at playback speed
const PLAY_SECONDS = 150;
// lunar aspect lines churn too fast to read; the moon marker still moves
const DEFAULT_ASPECT_BODIES = [
  'sun', 'mercury', 'venus', 'mars', 'jupiter',
  'saturn', 'uranus', 'neptune', 'pluto',
];

/**
 * The living sky above the horoscope: the user's natal wheel with the
 * current period's transits playing over it. Hovering a key-influence
 * pill isolates that transit in the sky. Degrades to a static natal
 * wheel if the frames endpoint is unavailable.
 */
function HoroscopeSkyRibbon({ birthChart, focusTransit }) {
  const [frames, setFrames] = useState(null);
  const [playMs, setPlayMs] = useState(() => Date.now());
  const rangeRef = useRef(null);
  const rafRef = useRef(0);

  const natal = useMemo(
    () => toChartScenePlacements(birthChart?.planets),
    [birthChart?.planets]
  );
  const natalAspects = useMemo(
    () => toChartSceneAspects(birthChart?.aspects),
    [birthChart?.aspects]
  );

  // load ~9 days of sky around today
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const from = new Date(Date.now() - 86400000);
        const to = new Date(Date.now() + 8 * 86400000);
        const docs = await getTransitFrames(from.toISOString(), to.toISOString());
        if (cancelled) return;
        const mapped = toTransitFrames(docs, birthChart?.planets || []);
        if (mapped.length >= 2) {
          rangeRef.current = {
            start: Date.parse(mapped[0].date),
            end: Date.parse(mapped[mapped.length - 1].date),
          };
          setFrames(mapped);
        }
      } catch (err) {
        // endpoint may not be deployed yet — natal-only ribbon is fine
        console.warn('Transit frames unavailable, showing natal sky only:', err?.message);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [birthChart?.planets]);

  // slow playback across the loaded window, looping
  useEffect(() => {
    if (!frames) return undefined;
    let last = performance.now();
    const tick = (now) => {
      const { start, end } = rangeRef.current;
      const speed = (end - start) / (PLAY_SECONDS * 1000);
      const dt = now - last;
      last = now;
      setPlayMs((prev) => {
        const next = prev + dt * speed;
        return next > end ? start : next;
      });
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [frames]);

  // a hovered influence pill isolates its transit line + natal target
  const focusTransiting = focusTransit
    ? toSceneBodyNames([
        focusTransit.transitingPlanet ||
          focusTransit.transitingBody ||
          focusTransit.transit?.transitingPlanet,
      ])
    : undefined;
  const focusTarget = focusTransit
    ? toSceneBodyNames([
        focusTransit.targetPlanet || focusTransit.target || focusTransit.natalPlanet,
      ])
    : undefined;

  const dateLabel = frames
    ? new Date(playMs).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      })
    : null;

  if (!natal.length) return null;

  return (
    <div className="horo-sky-ribbon">
      <div className="horo-sky-ribbon-head">
        <span>{frames ? 'Your chart · live transits' : 'Your chart'}</span>
        {dateLabel && <span className="horo-sky-ribbon-date">{dateLabel}</span>}
      </div>
      <div className="horo-sky-ribbon-holder">
        <ChartScene
          natal={natal}
          natalAspects={natalAspects}
          transitFrames={frames || undefined}
          transitDate={frames ? new Date(playMs).toISOString() : undefined}
          transitAspectBodies={
            focusTransiting?.length ? focusTransiting : DEFAULT_ASPECT_BODIES
          }
          highlightBodies={focusTarget}
          topDown
        />
      </div>
    </div>
  );
}

export default HoroscopeSkyRibbon;
