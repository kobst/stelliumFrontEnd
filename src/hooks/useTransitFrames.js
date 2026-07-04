import { useEffect, useRef, useState, useCallback } from 'react';
import { getTransitFrames } from '../Utilities/api';
import { toTransitFrames } from '../Utilities/chartSceneAdapter';

/**
 * Loads a window of real sky (transit_ephemeris snapshots mapped to
 * TransitFrames) around today and drives playback through it:
 * auto-plays on load, scrubbing pauses, loops at the end.
 * Degrades to { frames: null } if the endpoint is unavailable.
 */
export default function useTransitFrames(natalPlanets, { backDays = 1, forwardDays = 8, playSeconds = 60 } = {}) {
  const [frames, setFrames] = useState(null);
  const [range, setRange] = useState(null);
  const [playing, setPlaying] = useState(true);
  const [playMs, setPlayMs] = useState(() => Date.now());
  const rafRef = useRef(0);

  useEffect(() => {
    let cancelled = false;
    if (!natalPlanets?.length) return undefined;
    (async () => {
      try {
        const from = new Date(Date.now() - backDays * 86400000);
        const to = new Date(Date.now() + forwardDays * 86400000);
        const docs = await getTransitFrames(from.toISOString(), to.toISOString());
        if (cancelled) return;
        const mapped = toTransitFrames(docs, natalPlanets);
        if (mapped.length >= 2) {
          setFrames(mapped);
          setRange({
            start: Date.parse(mapped[0].date),
            end: Date.parse(mapped[mapped.length - 1].date),
          });
        }
      } catch (err) {
        console.warn('Transit frames unavailable:', err?.message);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [natalPlanets, backDays, forwardDays]);

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
