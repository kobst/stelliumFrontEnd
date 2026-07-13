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

// window size + playback pace per period; the timeline itself is
// always the full month
const PERIOD_WINDOWS = {
  daily: { days: 1, playSeconds: 20 },
  weekly: { days: 7, playSeconds: 60 },
  monthly: { days: 30, playSeconds: 120 },
};

const fmtTick = (ms) =>
  new Date(ms).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
const fmtHour = (ms) =>
  new Date(ms).toLocaleTimeString('en-US', { hour: 'numeric' });
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
  subnav,
  period = 'weekly',
  scopeStart,
  askMode = false,
  onTimeSample,
}) {
  const timelinePeriod = askMode ? 'monthly' : period;
  const window_ = PERIOD_WINDOWS[timelinePeriod] || PERIOD_WINDOWS.weekly;

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
      startDate: scopeStart,
    });

  useEffect(() => {
    onTimeSample?.(playMs);
  }, [playMs, onTimeSample]);

  useEffect(() => {
    if (askMode) setPlaying(false);
  }, [askMode, setPlaying]);

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

  const askFocus = useMemo(() => {
    const selected = askSelection || [];
    return {
      transiting: toSceneBodyNames(selected.map((el) => el.payload?.transitingPlanet).filter(Boolean)),
      target: toSceneBodyNames(selected.map((el) => el.payload?.targetPlanet).filter(Boolean)),
    };
  }, [askSelection]);

  const transitAspectBodies =
    pinScene?.transiting || hoverTransiting || (askFocus.transiting?.length ? askFocus.transiting : [...activeBodies]);
  const highlightBodies = pinScene?.target || hoverTarget || askFocus.target;
  const focused =
    !!pinScene || !!hoverTransiting?.length || !!askFocus.transiting?.length || activeBodies.size <= 4;

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
    if (!el || !playWindow) return null;
    const r = el.getBoundingClientRect();
    const frac = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
    return playWindow.start + frac * (playWindow.end - playWindow.start);
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
    const aspects = aspectsForSelection(sel);
    setSelectedAspects(aspects);
    if (askMode && onSkyPick) onSkyPick(sel, aspects);
  };

  const inspectAspect = (aspect) => {
    if (!aspect || !onSkyPick) return;
    onSkyPick(
      { body: aspect.bodyA, layer: 'transit', longitude: 0 },
      [aspect]
    );
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

  const tickFractions = timelinePeriod === 'daily'
    ? [0, 0.25, 0.5, 0.75, 1]
    : timelinePeriod === 'weekly'
      ? [0, 2 / 7, 4 / 7, 6 / 7, 1]
      : [0, 7 / 30, 14 / 30, 21 / 30, 1];

  const timebar = range && playWindow && (
    <div className="timebar">
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
          className="timebar__playhead"
          style={{
            left: `${((playMs - playWindow.start) / (playWindow.end - playWindow.start)) * 100}%`,
          }}
        />
        <div className="timebar__ticks">
          {tickFractions.map((fraction) => (
            <span key={fraction} style={{ left: `${fraction * 100}%` }}>
              {timelinePeriod === 'daily'
                ? fmtHour(playWindow.start + fraction * (playWindow.end - playWindow.start) - (fraction === 1 ? 1 : 0))
                : fmtTick(playWindow.start + fraction * (playWindow.end - playWindow.start) - (fraction === 1 ? 1 : 0))}
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
      className="sky-stage--horoscope"
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
        onSelectAspect: inspectAspect,
      }}
      subnav={subnav}
      topLeft={bodyStrip}
      panel={panel}
      panelHeader={panelHeader}
      footer={timebar}
      overlay={detailOverlay}
    />
  );
}

export default HoroscopeSkyStage;
