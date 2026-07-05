import React, { useEffect, useMemo, useRef, useState } from 'react';
import SkyStage from '../shared/SkyStage';
import { BODIES } from '../shared/chartScene/constants';
import useTransitFrames from '../../hooks/useTransitFrames';
import {
  toChartScenePlacements,
  toChartSceneAspects,
  toSceneBodyNames,
} from '../../Utilities/chartSceneAdapter';
import './HoroscopeSkyStage.css';

const ALL_TRANSIT_BODIES = [
  'sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter',
  'saturn', 'uranus', 'neptune', 'pluto',
];

const FULL_SPAN_DAYS = 30;

// window size + playback pace per period; the timeline itself is
// always the full month
const PERIOD_WINDOWS = {
  daily: { days: 1, playSeconds: 20 },
  weekly: { days: 7, playSeconds: 60 },
  monthly: { days: 30, playSeconds: 120 },
};

const PERIOD_CHIPS = [
  { id: 'daily', label: 'Today' },
  { id: 'weekly', label: 'This Week' },
  { id: 'monthly', label: 'This Month' },
];

const fmtTick = (ms) =>
  new Date(ms).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
const fmtBarDate = (ms) =>
  new Date(ms).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

/**
 * The horoscope as a stage. One time instrument (bottom bar): period
 * tabs + a fixed month-long timeline where the period highlights a
 * window, playback loops inside it. Aspect lines default to the
 * reading's transits; the chip strip (with labels) can widen to All or
 * narrow to a custom set — filtered planets dim in the scene too.
 */
function HoroscopeSkyStage({
  birthChart,
  focusTransit,
  pinnedTransit,
  askSelection,
  readingTransits, // backend transiting-planet names cited by the reading
  onSkyPick,
  panel,
  panelHeader,
  period = 'weekly',
  onPeriodChange,
  onTimeSample,
}) {
  const window_ = PERIOD_WINDOWS[period] || PERIOD_WINDOWS.weekly;

  const natal = useMemo(
    () => toChartScenePlacements(birthChart?.planets),
    [birthChart?.planets]
  );
  const natalAspects = useMemo(
    () => toChartSceneAspects(birthChart?.aspects),
    [birthChart?.aspects]
  );

  const { frames, range, window: playWindow, playMs, playing, setPlaying, scrubTo } =
    useTransitFrames(birthChart?.planets, {
      windowDays: window_.days,
      playSeconds: window_.playSeconds,
    });

  useEffect(() => {
    onTimeSample?.(playMs);
  }, [playMs, onTimeSample]);

  // ── chips: 'reading' (default) | 'all' | 'custom' ─────────────────
  const readingSceneBodies = useMemo(
    () => toSceneBodyNames(readingTransits) || [],
    [readingTransits]
  );
  const [chipMode, setChipMode] = useState('reading');
  const [customBodies, setCustomBodies] = useState(() => new Set());

  // the reading changed (period switch / regeneration): return to its set
  useEffect(() => {
    setChipMode('reading');
  }, [readingSceneBodies]);

  const activeBodies = useMemo(() => {
    if (chipMode === 'all') return new Set(ALL_TRANSIT_BODIES);
    if (chipMode === 'custom') return customBodies;
    return new Set(
      readingSceneBodies.length
        ? readingSceneBodies
        : ALL_TRANSIT_BODIES.filter((b) => b !== 'moon')
    );
  }, [chipMode, customBodies, readingSceneBodies]);

  const toggleBody = (body) => {
    const next = new Set(activeBodies);
    if (next.has(body)) next.delete(body);
    else next.add(body);
    setCustomBodies(next);
    setChipMode('custom');
  };

  // ── emphasis: pinned influence > hover > ask selection > chips ────
  const pinScene = useMemo(() => {
    if (!pinnedTransit) return null;
    return {
      transiting: toSceneBodyNames([pinnedTransit.transitingPlanet]),
      target: toSceneBodyNames([pinnedTransit.targetPlanet || pinnedTransit.natalPlanet]),
    };
  }, [pinnedTransit]);

  const hoverTransiting = focusTransit
    ? toSceneBodyNames([
        focusTransit.transitingPlanet ||
          focusTransit.transitingBody ||
          focusTransit.transit?.transitingPlanet,
      ])
    : undefined;
  const hoverTarget = focusTransit
    ? toSceneBodyNames([
        focusTransit.targetPlanet || focusTransit.target || focusTransit.natalPlanet,
      ])
    : undefined;

  const askTargets = useMemo(() => {
    const names = (askSelection || [])
      .map((el) => el.payload?.targetPlanet)
      .filter(Boolean);
    return toSceneBodyNames(names);
  }, [askSelection]);

  const transitAspectBodies =
    pinScene?.transiting || hoverTransiting || [...activeBodies];
  const highlightBodies = pinScene?.target || hoverTarget || askTargets;
  const focused =
    !!pinScene || !!hoverTransiting?.length || activeBodies.size <= 4;

  // pinning an influence scrubs the timeline to its day
  useEffect(() => {
    if (!pinnedTransit || !playWindow) return;
    const value =
      pinnedTransit.exact || pinnedTransit.exactDate || pinnedTransit.peakDate || pinnedTransit.date;
    const ms = value ? Date.parse(value) : NaN;
    if (Number.isFinite(ms)) scrubTo(ms);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pinnedTransit]);

  // ⌖ recenter re-runs the camera fit
  const [fitNonce, setFitNonce] = useState(0);

  // ── the one time instrument ────────────────────────────────────────
  const timelineRef = useRef(null);
  const draggingRef = useRef(false);

  const msFromEvent = (e) => {
    const el = timelineRef.current;
    if (!el || !range) return null;
    const r = el.getBoundingClientRect();
    const frac = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
    return range.start + frac * (range.end - range.start);
  };

  const timebar = range && playWindow && (
    <div className="timebar">
      <div className="timebar__periods" role="tablist">
        {PERIOD_CHIPS.map((p) => (
          <button
            key={p.id}
            role="tab"
            aria-selected={period === p.id}
            className={`timebar__period${period === p.id ? ' active' : ''}`}
            onClick={() => onPeriodChange?.(p.id)}
          >
            {p.label}
          </button>
        ))}
      </div>
      <button
        className="timebar__play"
        onClick={() => setPlaying(!playing)}
        aria-label={playing ? 'Pause' : 'Play'}
      >
        {playing ? '❚❚' : '▶'}
      </button>
      <div
        className="timebar__track"
        ref={timelineRef}
        onPointerDown={(e) => {
          draggingRef.current = true;
          e.currentTarget.setPointerCapture(e.pointerId);
          const ms = msFromEvent(e);
          if (ms !== null) scrubTo(ms);
        }}
        onPointerMove={(e) => {
          if (!draggingRef.current) return;
          const ms = msFromEvent(e);
          if (ms !== null) scrubTo(ms);
        }}
        onPointerUp={() => {
          draggingRef.current = false;
        }}
      >
        <div
          className="timebar__window"
          style={{
            width: `${((playWindow.end - playWindow.start) / (range.end - range.start)) * 100}%`,
          }}
        />
        <div
          className="timebar__playhead"
          style={{
            left: `${((playMs - range.start) / (range.end - range.start)) * 100}%`,
          }}
        />
        <div className="timebar__ticks">
          {[0, 7, 14, 21, FULL_SPAN_DAYS].map((d) => (
            <span key={d} style={{ left: `${(d / FULL_SPAN_DAYS) * 100}%` }}>
              {fmtTick(range.start + d * 86400000)}
            </span>
          ))}
        </div>
      </div>
      <span className="timebar__date">{fmtBarDate(playMs)}</span>
      <button
        className="timebar__now"
        title="Jump the playhead back to the present moment"
        onClick={() => scrubTo(Date.now())}
      >
        Now
      </button>
      <button
        className="timebar__recenter"
        title="Recenter the sky"
        onClick={() => setFitNonce((n) => n + 1)}
      >
        ⌖
      </button>
    </div>
  );

  // ── transit chips (labeled; default = the reading's transits) ─────
  const allOn = chipMode === 'all';
  const bodyStrip = (
    <div className="transit-strip">
      <span className="transit-strip__label">Transits</span>
      <button
        className={`transit-strip__all${allOn ? ' on' : ''}`}
        onClick={() => setChipMode(allOn ? 'reading' : 'all')}
      >
        All
      </button>
      {ALL_TRANSIT_BODIES.map((body) => {
        const info = BODIES[body];
        const on = activeBodies.has(body);
        return (
          <button
            key={body}
            className={`transit-chip${on ? ' on' : ''}`}
            style={on && info?.color ? { '--pc': info.color } : undefined}
            onClick={() => toggleBody(body)}
            title={`${body} aspect lines ${on ? 'on' : 'off'}`}
          >
            <span className="transit-chip__g">{(info?.glyph || body) + '︎'}</span>
            <span className="transit-chip__n">
              {body.charAt(0).toUpperCase() + body.slice(1)}
            </span>
          </button>
        );
      })}
      <span className="transit-strip__hint">
        {chipMode === 'reading'
          ? 'Showing the reading’s transits'
          : chipMode === 'all'
            ? 'Showing every transit'
            : 'Custom selection'}
      </span>
    </div>
  );

  if (!natal.length) return null;

  return (
    <SkyStage
      sceneProps={{
        natal,
        natalAspects,
        fitRadius: 6.4,
        fitNonce,
        transitFrames: frames || undefined,
        transitDate: frames ? new Date(playMs).toISOString() : undefined,
        transitAspectBodies,
        transitLineBoost: focused,
        highlightBodies,
        onSelectBody: onSkyPick
          ? (sel) => {
              if (!sel || !frames?.length) {
                onSkyPick(sel, []);
                return;
              }
              let best = frames[0];
              let bestD = Infinity;
              for (const f of frames) {
                const d = Math.abs(Date.parse(f.date) - playMs);
                if (d < bestD) {
                  bestD = d;
                  best = f;
                }
              }
              const active = (best.aspects || []).filter((a) =>
                sel.layer === 'transit' ? a.bodyA === sel.body : a.bodyB === sel.body
              );
              onSkyPick(sel, active);
            }
          : undefined,
      }}
      topLeft={bodyStrip}
      panel={panel}
      panelHeader={panelHeader}
      footer={timebar}
    />
  );
}

export default HoroscopeSkyStage;
