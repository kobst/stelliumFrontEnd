import React, { useEffect, useMemo, useRef, useState } from 'react';
import SkyStage from '../shared/SkyStage';
import { BODIES } from '../shared/chartScene/constants';
import useTransitFrames from '../../hooks/useTransitFrames';
import {
  fromSceneBodyName,
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

const SIGN_NAMES = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

const capitalize = (value = '') => value.charAt(0).toUpperCase() + value.slice(1);
const bodyName = (body) => ({ asc: 'Ascendant', mc: 'Midheaven' }[body] || capitalize(body));
const ordinal = (value) => {
  const number = Number(value);
  const mod100 = number % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${number}th`;
  return `${number}${{ 1: 'st', 2: 'nd', 3: 'rd' }[number % 10] || 'th'}`;
};

const formatPosition = (longitude) => {
  const normalized = ((Number(longitude) % 360) + 360) % 360;
  const signIndex = Math.floor(normalized / 30);
  const degree = normalized - signIndex * 30;
  const totalMinutes = Math.round(degree * 60);
  const whole = Math.floor(totalMinutes / 60) % 30;
  const minutes = totalMinutes % 60;
  return `${whole}°${String(minutes).padStart(2, '0')}′ ${SIGN_NAMES[signIndex]}`;
};

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
  const [selectedBody, setSelectedBody] = useState(null);
  const [selectedAspects, setSelectedAspects] = useState([]);
  const [hoveredBody, setHoveredBody] = useState(null);

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

  const aspectsForSelection = (sel) => {
    if (!sel || !frames?.length) return [];
    let best = frames[0];
    let bestD = Infinity;
    for (const frame of frames) {
      const distance = Math.abs(Date.parse(frame.date) - playMs);
      if (distance < bestD) {
        bestD = distance;
        best = frame;
      }
    }
    return (best.aspects || []).filter((aspect) =>
      sel.layer === 'transit' ? aspect.bodyA === sel.body : aspect.bodyB === sel.body
    );
  };

  const inspectBody = (sel) => {
    setSelectedBody(sel);
    if (!sel) {
      setSelectedAspects([]);
      return;
    }
    setSelectedAspects(aspectsForSelection(sel));
  };

  const detailBody = selectedBody || hoveredBody;
  const natalPlanet = detailBody?.layer === 'natal'
    ? birthChart?.planets?.find(
        (planet) => planet?.name === fromSceneBodyName(detailBody.body)
      )
    : null;
  const detailLayer = detailBody?.layer === 'transit' ? 'Transiting' : 'Natal';
  const detailInfo = detailBody ? BODIES[detailBody.body] : null;
  const detailAspects = selectedBody ? selectedAspects : aspectsForSelection(hoveredBody);
  const detailOverlay = detailBody && (
    <div className={`sky-inspector${selectedBody ? ' sky-inspector--selected' : ''}`} role="status">
      <div className="sky-inspector__identity">
        <span className="sky-inspector__glyph" style={{ color: detailInfo?.color }} aria-hidden="true">
          {(detailInfo?.glyph || detailBody.body) + '︎'}
        </span>
        <div>
          <div className="sky-inspector__name">{detailLayer} {bodyName(detailBody.body)}</div>
          <div className="sky-inspector__position">
            {formatPosition(detailBody.longitude)}
            {natalPlanet?.house ? ` · ${ordinal(natalPlanet.house)} House` : ''}
            {detailBody.retrograde ? ' · Retrograde' : ''}
          </div>
        </div>
        {selectedBody && (
          <button className="sky-inspector__close" onClick={() => inspectBody(null)} aria-label="Clear selected planet">×</button>
        )}
      </div>
      {detailAspects.length > 0 && (
        <div className="sky-inspector__aspects">
          {detailAspects.slice(0, 3).map((aspect) => (
            <span key={`${aspect.bodyA}-${aspect.type}-${aspect.bodyB}`}>
              Transiting {capitalize(aspect.bodyA)} {aspect.type} Natal {capitalize(aspect.bodyB)}
              {Number.isFinite(aspect.orb) ? ` · ${aspect.orb.toFixed(1)}° orb` : ''}
            </span>
          ))}
        </div>
      )}
      {selectedBody && onSkyPick && (
        <button className="sky-inspector__ask" onClick={() => onSkyPick(selectedBody, selectedAspects)}>
          ✦ Ask about this
        </button>
      )}
    </div>
  );

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
        aria-pressed={playing}
        title={playing ? 'Pause timeline' : 'Play timeline'}
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
  const readingOn = chipMode === 'reading';
  const bodyStrip = (
    <div className="transit-strip">
      <span className="transit-strip__label">Transits</span>
      <button
        className={`transit-strip__mode${readingOn ? ' on' : ''}`}
        onClick={() => setChipMode('reading')}
        aria-pressed={readingOn}
      >
        Reading
      </button>
      <button
        className={`transit-strip__mode${allOn ? ' on' : ''}`}
        onClick={() => setChipMode('all')}
        aria-pressed={allOn}
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
            title={`${capitalize(body)} aspect lines ${on ? 'on' : 'off'}`}
            aria-label={`${capitalize(body)} aspect lines`}
            aria-pressed={on}
          >
            <span className="transit-chip__g">{(info?.glyph || body) + '︎'}</span>
            <span className="transit-chip__n">
              {body.charAt(0).toUpperCase() + body.slice(1)}
            </span>
          </button>
        );
      })}
      <span className="transit-strip__hint">
        {chipMode === 'custom' ? 'Custom' : ''}
      </span>
      <details className="chart-legend">
        <summary aria-label="Open chart legend">?</summary>
        <div className="chart-legend__popover">
          <strong>Chart symbols</strong>
          <div className="chart-legend__grid">
            {Object.entries(BODIES).filter(([body]) => body !== 'earth').map(([body, info]) => (
              <span key={body}><b style={{ color: info.color }}>{info.glyph + '︎'}</b>{capitalize(body)}</span>
            ))}
            <span><b>AC</b>Ascendant</span>
            <span><b>MC</b>Midheaven</span>
          </div>
        </div>
      </details>
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
        selectedBody,
        onHoverBody: setHoveredBody,
        onSelectBody: inspectBody,
      }}
      topLeft={bodyStrip}
      panel={panel}
      panelHeader={panelHeader}
      footer={timebar}
      overlay={detailOverlay}
    />
  );
}

export default HoroscopeSkyStage;
