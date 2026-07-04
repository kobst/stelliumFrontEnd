import React, { useMemo, useState } from 'react';
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
// lunar aspect lines churn too fast to read by default; the chip on the
// timeline turns them back on
const DEFAULT_ON = ALL_TRANSIT_BODIES.filter((b) => b !== 'moon');

// the sky's window IS the reading's window: the horizon and playback
// pace follow the selected period
const PERIOD_WINDOWS = {
  daily: { days: 1, playSeconds: 20 },
  weekly: { days: 7, playSeconds: 60 },
  monthly: { days: 30, playSeconds: 120 },
};

/**
 * The horoscope as a stage: the user's natal wheel full-screen with the
 * selected period's real transits playing over it, the reading docked
 * beside it, and a scrubber to drag the horizon under your thumb.
 * Degrades to the natal sky if the frames endpoint is unavailable.
 */
const PERIOD_CHIPS = [
  { id: 'daily', label: 'Today' },
  { id: 'weekly', label: 'This Week' },
  { id: 'monthly', label: 'This Month' },
];

function HoroscopeSkyStage({ birthChart, focusTransit, askSelection, onSkyPick, panel, panelHeader, period = 'weekly', onPeriodChange }) {
  // which transiting bodies draw aspect lines (markers always render)
  const [enabledBodies, setEnabledBodies] = useState(() => new Set(DEFAULT_ON));
  const [linesOpen, setLinesOpen] = useState(false);
  const toggleBody = (body) =>
    setEnabledBodies((prev) => {
      const next = new Set(prev);
      if (next.has(body)) next.delete(body);
      else next.add(body);
      return next;
    });

  const window_ = PERIOD_WINDOWS[period] || PERIOD_WINDOWS.weekly;
  // stable per period so the hook doesn't refetch every render
  const { fromMs, toMs, playSeconds } = useMemo(() => {
    const now = Date.now();
    return {
      fromMs: now - 6 * 3600000, // small back-buffer so "now" is in range
      toMs: now + window_.days * 86400000,
      playSeconds: window_.playSeconds,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);
  const natal = useMemo(
    () => toChartScenePlacements(birthChart?.planets),
    [birthChart?.planets]
  );
  const natalAspects = useMemo(
    () => toChartSceneAspects(birthChart?.aspects),
    [birthChart?.aspects]
  );

  const { frames, range, playMs, playing, setPlaying, scrubTo } =
    useTransitFrames(birthChart?.planets, { fromMs, toMs, playSeconds });

  // emphasis priority: hovered pill > Ask context selection > default
  const askTransiting = useMemo(() => {
    const names = (askSelection || [])
      .map((el) => el.payload?.transitingPlanet)
      .filter(Boolean);
    return toSceneBodyNames(names);
  }, [askSelection]);
  const askTargets = useMemo(() => {
    const names = (askSelection || [])
      .map((el) => el.payload?.targetPlanet)
      .filter(Boolean);
    return toSceneBodyNames(names);
  }, [askSelection]);

  const focusTransiting = focusTransit
    ? toSceneBodyNames([
        focusTransit.transitingPlanet ||
          focusTransit.transitingBody ||
          focusTransit.transit?.transitingPlanet,
      ])
    : askTransiting;
  const focusTarget = focusTransit
    ? toSceneBodyNames([
        focusTransit.targetPlanet || focusTransit.target || focusTransit.natalPlanet,
      ])
    : askTargets;

  if (!natal.length) return null;

  const fmtShort = (ms) =>
    new Date(ms).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  // the timeline owns the horizon: picking a period here retunes both
  // the sky's window and which reading the panel shows
  const scrubber = (
    <div className="horo-scrubber">
      {onPeriodChange && (
        <div className="horo-scrubber__periods" role="tablist">
          {PERIOD_CHIPS.map((p) => (
            <button
              key={p.id}
              role="tab"
              aria-selected={period === p.id}
              className={`horo-scrubber__period${period === p.id ? ' active' : ''}`}
              onClick={() => onPeriodChange(p.id)}
            >
              {p.label}
            </button>
          ))}
        </div>
      )}
      {frames && range && (
        <>
          <div className="horo-scrubber__sep" />
          <button
            className="horo-scrubber__play"
            onClick={() => setPlaying(!playing)}
            aria-label={playing ? 'Pause' : 'Play'}
          >
            {playing ? '❚❚' : '▶'}
          </button>
          <span className="horo-scrubber__bound">{fmtShort(range.start)}</span>
          <input
            type="range"
            min={range.start}
            max={range.end}
            value={Math.round(playMs)}
            onChange={(e) => scrubTo(Number(e.target.value))}
          />
          <span className="horo-scrubber__bound">{fmtShort(range.end)}</span>
          <span className="horo-scrubber__date">
            {new Date(playMs).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            })}
          </span>
          <div className="horo-scrubber__sep" />
          <div className="horo-scrubber__lines">
            <button
              className={`horo-scrubber__lines-btn${linesOpen ? ' open' : ''}`}
              onClick={() => setLinesOpen((v) => !v)}
            >
              Lines ({enabledBodies.size}) ▾
            </button>
            {linesOpen && (
              <div className="horo-scrubber__lines-pop">
                {ALL_TRANSIT_BODIES.map((body) => {
                  const info = BODIES[body];
                  const on = enabledBodies.has(body);
                  return (
                    <button
                      key={body}
                      className={`horo-scrubber__body${on ? ' on' : ''}`}
                      style={on ? { color: info?.color } : undefined}
                      onClick={() => toggleBody(body)}
                      title={`${body} aspect lines ${on ? 'on' : 'off'}`}
                    >
                      {(info?.glyph || body) + '\uFE0E'}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );

  return (
    <SkyStage
      sceneProps={{
        natal,
        natalAspects,
        // fit the whole system (wheel + transit ring) beside the panel
        fitRadius: 6.4,
        transitFrames: frames || undefined,
        transitDate: frames ? new Date(playMs).toISOString() : undefined,
        transitAspectBodies: focusTransiting?.length
          ? focusTransiting
          : [...enabledBodies],
        highlightBodies: focusTarget,
        onSelectBody: onSkyPick,
      }}
      panel={panel}
      panelHeader={panelHeader}
      footer={scrubber}
    />
  );
}

export default HoroscopeSkyStage;
