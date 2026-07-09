import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Shared scroll system for journey pages (birth chart reader,
 * relationship journey). One implementation of:
 *
 * - scroll-spy that measures distance to step BOUNDS (a tall step stays
 *   live the whole time the viewport center is inside it)
 * - deterministic nav jumps: the target act/step state lands at click
 *   time, the scene fades (`jumping`), the smooth scroll sweeps
 *   underneath, and the spy resumes once the target is reached — with a
 *   settle-timer fallback for smooth scrolls that never fire events
 *   (interrupted, throttled tab, already at target)
 * - wheel forwarding (wheel over the sky scrolls the story) and
 *   wheel-cancel (user input takes back control mid-jump)
 *
 * `onFrame(container)` runs on every spy tick for page-specific
 * continuous tracks (e.g. the relationship merge/composite blends).
 */
export default function useJourneyScroll({ ready, onFrame } = {}) {
  const scrollRef = useRef(null);
  const stepRefs = useRef({});
  const [liveStep, setLiveStep] = useState('hero');
  const [activeAct, setActiveAct] = useState('hero');
  const [jumping, setJumping] = useState(false);
  const jumpRef = useRef(null); // { top, until }
  const jumpTimerRef = useRef(null);
  const onFrameRef = useRef(onFrame);
  onFrameRef.current = onFrame;

  useEffect(() => () => window.clearTimeout(jumpTimerRef.current), []);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container || !ready) return undefined;
    let ticking = false;
    const spy = () => {
      ticking = false;
      onFrameRef.current?.(container);
      // mid-jump: the target act was set at click time — don't let the
      // sweeping scroll position re-derive (and fight) it
      const jump = jumpRef.current;
      if (jump) {
        const arrived = Math.abs(container.scrollTop - jump.top) < 6;
        if (!arrived && performance.now() < jump.until) return;
        jumpRef.current = null;
        setJumping(false);
      }
      const mid = container.clientHeight / 2;
      let best = null;
      let bestDist = Infinity;
      Object.entries(stepRefs.current).forEach(([id, el]) => {
        if (!el) return;
        const r = el.getBoundingClientRect();
        const d =
          mid >= r.top && mid <= r.bottom
            ? 0
            : Math.min(Math.abs(r.top - mid), Math.abs(r.bottom - mid));
        if (d < bestDist) {
          bestDist = d;
          best = { id, el };
        }
      });
      if (best) {
        setLiveStep(best.id);
        setActiveAct(best.el.dataset.act || best.id);
      }
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(spy);
      }
    };
    container.addEventListener('scroll', onScroll);
    spy();
    return () => container.removeEventListener('scroll', onScroll);
  }, [ready]);

  // the wheel always scrolls the story; wheel input also hands control
  // back to the user mid-jump
  useEffect(() => {
    const onWheel = (e) => {
      if (jumpRef.current) {
        jumpRef.current = null;
        setJumping(false);
      }
      const scroller = scrollRef.current;
      if (!scroller || scroller.contains(e.target)) return;
      scroller.scrollTop += e.deltaY;
    };
    document.addEventListener('wheel', onWheel, { passive: true });
    return () => document.removeEventListener('wheel', onWheel);
  }, []);

  const scrollToAct = useCallback((id) => {
    const container = scrollRef.current;
    const hit = Object.entries(stepRefs.current).find(
      ([k, el]) => el && (k === id || el.dataset.act === id)
    );
    if (!hit || !container) return;
    const [stepId, el] = hit;
    const top = Math.max(0, el.offsetTop - 90);
    setLiveStep(stepId);
    setActiveAct(el.dataset.act || stepId);
    if (Math.abs(container.scrollTop - top) < 6) return; // already there
    jumpRef.current = { top, until: performance.now() + 1600 };
    setJumping(true);
    container.scrollTo({ top, behavior: 'smooth' });
    window.clearTimeout(jumpTimerRef.current);
    jumpTimerRef.current = window.setTimeout(() => {
      if (jumpRef.current) {
        container.scrollTop = jumpRef.current.top;
        jumpRef.current = null;
        setJumping(false);
      }
    }, 1700);
  }, []);

  const setStepRef = useCallback(
    (id, act) => (el) => {
      stepRefs.current[id] = el;
      if (el) el.dataset.act = act || id;
    },
    []
  );

  return { scrollRef, stepRefs, liveStep, activeAct, jumping, scrollToAct, setStepRef };
}
