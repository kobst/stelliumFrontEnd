import React, { useMemo } from 'react';
import SkyStage from '../shared/SkyStage';
import useTransitFrames from '../../hooks/useTransitFrames';
import {
  toChartScenePlacements,
  toChartSceneAspects,
  toSceneBodyNames,
} from '../../Utilities/chartSceneAdapter';
import './HoroscopeSkyStage.css';

// lunar aspect lines churn too fast to read; the moon marker still moves
const DEFAULT_ASPECT_BODIES = [
  'sun', 'mercury', 'venus', 'mars', 'jupiter',
  'saturn', 'uranus', 'neptune', 'pluto',
];

/**
 * The horoscope as a stage: the user's natal wheel full-screen with the
 * period's real transits playing over it, the reading docked beside it,
 * and a scrubber to drag the week under your thumb. Degrades to the
 * natal sky if the frames endpoint is unavailable.
 */
function HoroscopeSkyStage({ birthChart, focusTransit, panel }) {
  const natal = useMemo(
    () => toChartScenePlacements(birthChart?.planets),
    [birthChart?.planets]
  );
  const natalAspects = useMemo(
    () => toChartSceneAspects(birthChart?.aspects),
    [birthChart?.aspects]
  );

  const { frames, range, playMs, playing, setPlaying, scrubTo } =
    useTransitFrames(birthChart?.planets);

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

  if (!natal.length) return null;

  const scrubber = frames && range && (
    <div className="horo-scrubber">
      <button
        className="horo-scrubber__play"
        onClick={() => setPlaying(!playing)}
        aria-label={playing ? 'Pause' : 'Play'}
      >
        {playing ? '❚❚' : '▶'}
      </button>
      <input
        type="range"
        min={range.start}
        max={range.end}
        value={Math.round(playMs)}
        onChange={(e) => scrubTo(Number(e.target.value))}
      />
      <span className="horo-scrubber__date">
        {new Date(playMs).toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        })}
      </span>
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
          : DEFAULT_ASPECT_BODIES,
        highlightBodies: focusTarget,
      }}
      panel={panel}
      footer={scrubber}
    />
  );
}

export default HoroscopeSkyStage;
