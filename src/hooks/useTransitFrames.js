import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { getTransitFrames } from '../Utilities/api';
import { toTransitFrames } from '../Utilities/chartSceneAdapter';

const FULL_SPAN_DAYS = 30;

/**
 * The sky's timeline is a fixed month-long track: frames are fetched
 * once for the full span, and the selected period highlights a WINDOW
 * on it — playback loops inside the window, scrubbing is clamped to it.
 * Degrades to { frames: null } if the endpoint is unavailable.
 */
export default function useTransitFrames(natalPlanets, { windowDays = 7, playSeconds = 60 } = {}) {
  const [frames, setFrames] = useState(null);
  const [range, setRange] = useState(null); // the full month-long track
  const [playing, setPlaying] = useState(true);
  const [playMs, setPlayMs] = useState(() => Date.now());
  const rafRef = useRef(0);

  useEffect(() => {
    let cancelled = false;
    if (!natalPlanets?.length) return undefined;
    (async () => {
      try {
        const from = new Date(Date.now() - 6 * 3600000); // back-buffer so "now" is in range
        const to = new Date(Date.now() + FULL_SPAN_DAYS * 86400000);
        const docs = await getTransitFrames(from.toISOString(), to.toISOString());
        if (cancelled) return;
        const mapped = toTransitFrames(docs, natalPlanets);
        if (mapped.length >= 2) {
          const start = Date.parse(mapped[0].date);
          setFrames(mapped);
          setRange({ start, end: Date.parse(mapped[mapped.length - 1].date) });
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
  }, [natalPlanets]);

  // the period's window on the month-long track
  const window_ = useMemo(() => {
    if (!range) return null;
    return {
      start: range.start,
      end: Math.min(range.end, range.start + windowDays * 86400000),
    };
  }, [range, windowDays]);

  // a new window restarts the sweep from its beginning
  useEffect(() => {
    if (!window_) return;
    setPlayMs(window_.start);
    setPlaying(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [windowDays, range]);

  useEffect(() => {
    if (!frames || !playing || !window_) return undefined;
    let last = performance.now();
    const speed = (window_.end - window_.start) / (playSeconds * 1000);
    const tick = (now) => {
      const dt = now - last;
      last = now;
      setPlayMs((prev) => {
        const next = prev + dt * speed;
        return next > window_.end ? window_.start : next;
      });
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [frames, playing, window_, playSeconds]);

  const scrubTo = useCallback(
    (ms) => {
      setPlaying(false);
      setPlayMs(window_ ? Math.min(window_.end, Math.max(window_.start, ms)) : ms);
    },
    [window_]
  );

  return { frames, range, window: window_, playMs, playing, setPlaying, scrubTo };
}
