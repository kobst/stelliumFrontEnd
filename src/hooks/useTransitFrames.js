import { useEffect, useRef, useState, useCallback } from 'react';
import { getTransitFrames } from '../Utilities/api';
import { toTransitFrames } from '../Utilities/chartSceneAdapter';

/**
 * Loads a window of real sky (transit_ephemeris snapshots mapped to
 * TransitFrames) around today and drives playback through it:
 * auto-plays on load, scrubbing pauses, loops at the end.
 * Degrades to { frames: null } if the endpoint is unavailable.
 */
export default function useTransitFrames(natalPlanets, { fromMs, toMs, playSeconds = 60 } = {}) {
  const [frames, setFrames] = useState(null);
  const [range, setRange] = useState(null);
  const [playing, setPlaying] = useState(true);
  const [playMs, setPlayMs] = useState(() => Date.now());
  const rafRef = useRef(0);

  useEffect(() => {
    let cancelled = false;
    if (!natalPlanets?.length || !fromMs || !toMs) return undefined;
    (async () => {
      try {
        const docs = await getTransitFrames(
          new Date(fromMs).toISOString(),
          new Date(toMs).toISOString()
        );
        if (cancelled) return;
        const mapped = toTransitFrames(docs, natalPlanets);
        if (mapped.length >= 2) {
          const start = Date.parse(mapped[0].date);
          setFrames(mapped);
          setRange({ start, end: Date.parse(mapped[mapped.length - 1].date) });
          // new window: restart the sweep from its beginning
          setPlayMs(start);
          setPlaying(true);
        }
      } catch (err) {
        console.warn('Transit frames unavailable:', err?.message);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [natalPlanets, fromMs, toMs]);

  useEffect(() => {
    if (!frames || !playing || !range) return undefined;
    let last = performance.now();
    const speed = (range.end - range.start) / (playSeconds * 1000);
    const tick = (now) => {
      const dt = now - last;
      last = now;
      setPlayMs((prev) => {
        const next = prev + dt * speed;
        return next > range.end ? range.start : next;
      });
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [frames, playing, range, playSeconds]);

  const scrubTo = useCallback((ms) => {
    setPlaying(false);
    setPlayMs(ms);
  }, []);

  return { frames, range, playMs, playing, setPlaying, scrubTo };
}
