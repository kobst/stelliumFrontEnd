import React, { useMemo } from 'react';
import { ChartScene } from '../UI/shared/chartScene';
import useStore from '../Utilities/store';
import {
  toChartScenePlacements,
  toChartSceneAspects,
} from '../Utilities/chartSceneAdapter';
import './Chart3DPage.css';

// Sample chart so the route renders without a logged-in user (dev scaffold).
// Same shape the backend emits.
const SAMPLE_PLANETS = [
  { name: 'Sun', full_degree: 135.4, is_retro: 'false' },
  { name: 'Moon', full_degree: 213.2, is_retro: 'false' },
  { name: 'Mercury', full_degree: 152.8, is_retro: 'false' },
  { name: 'Venus', full_degree: 118.1, is_retro: 'false' },
  { name: 'Mars', full_degree: 9.5, is_retro: 'false' },
  { name: 'Jupiter', full_degree: 261.7, is_retro: 'false' },
  { name: 'Saturn', full_degree: 287.3, is_retro: 'true' },
  { name: 'Uranus', full_degree: 304.9, is_retro: 'false' },
  { name: 'Neptune', full_degree: 296.2, is_retro: 'true' },
  { name: 'Pluto', full_degree: 239.6, is_retro: 'false' },
  { name: 'Ascendant', full_degree: 192.0, is_retro: 'false' },
  { name: 'Midheaven', full_degree: 104.0, is_retro: 'false' },
];
const SAMPLE_ASPECTS = [
  { aspectingPlanet: 'Sun', aspectedPlanet: 'Mars', aspectType: 'trine', orb: 5.9 },
  { aspectingPlanet: 'Sun', aspectedPlanet: 'Jupiter', aspectType: 'trine', orb: 6.3 },
  { aspectingPlanet: 'Moon', aspectedPlanet: 'Venus', aspectType: 'square', orb: 4.9 },
  { aspectingPlanet: 'Moon', aspectedPlanet: 'Uranus', aspectType: 'square', orb: 1.7 },
  { aspectingPlanet: 'Mercury', aspectedPlanet: 'Saturn', aspectType: 'trine', orb: 1.5 },
  { aspectingPlanet: 'Venus', aspectedPlanet: 'Pluto', aspectType: 'trine', orb: 1.5 },
  { aspectingPlanet: 'Jupiter', aspectedPlanet: 'Pluto', aspectType: 'sextile', orb: 2.1 },
  { aspectingPlanet: 'Mars', aspectedPlanet: 'Neptune', aspectType: 'square', orb: 3.3 },
];

function Chart3DPage() {
  const userPlanets = useStore((state) => state.userPlanets);
  const userAspects = useStore((state) => state.userAspects);

  const usingSample = !userPlanets || userPlanets.length === 0;

  const natal = useMemo(
    () => toChartScenePlacements(usingSample ? SAMPLE_PLANETS : userPlanets),
    [usingSample, userPlanets]
  );
  const natalAspects = useMemo(
    () => toChartSceneAspects(usingSample ? SAMPLE_ASPECTS : userAspects),
    [usingSample, userAspects]
  );

  return (
    <div className="chart3d-page">
      <div className="chart3d-badge">
        3D Chart · {usingSample ? 'sample data' : 'your chart'}
      </div>
      <ChartScene natal={natal} natalAspects={natalAspects} />
    </div>
  );
}

export default Chart3DPage;
