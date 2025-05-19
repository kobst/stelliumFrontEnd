import React, { memo, useMemo } from 'react';
import './SynastryBirthChartComparison.css';
import Ephemeris from '../../shared/Ephemeris';
import BirthChartSummaryTable from './BirthChartSummaryTable';
import { addAspectDescriptionComputed } from '../../../Utilities/generateBirthDataDescriptions';

const SynastryBirthChartComparison_v2 = memo(({ birthChartA, birthChartB, compositeChart, userAName, userBName }) => {

    const chartAKey = useMemo(() => {
        return JSON.stringify({
            planets: birthChartA.planets.map(p => p.name + p.full_degree),
            houses: birthChartA.houses.map(h => h.house + h.degree),
            aspects: birthChartA.aspects.map(a => a.transitingPlanet + a.aspectingPlanet)
        });
    }, [birthChartA]);

    const chartBKey = useMemo(() => {
        return JSON.stringify({
            planets: birthChartB.planets.map(p => p.name + p.full_degree),
            houses: birthChartB.houses.map(h => h.house + h.degree),
            aspects: birthChartB.aspects.map(a => a.transitingPlanet + a.aspectingPlanet)
        });
    }, [birthChartB]);

    return (
    <div className="synastry-birth-chart-comparison">
      <div className="user-a-chart">
        <h3>{userAName}'s Birth Chart</h3>
        <div className="ephemeris-container">
          <Ephemeris
            key={chartAKey}
            planets={birthChartA.planets}
            houses={birthChartA.houses}
            aspects={birthChartA.aspects}
            transits={birthChartB.planets}
            instanceId="chart-a"
          />
        </div>
      </div>
      <div className="user-b-chart">
        <h3>{userBName}'s Birth Chart</h3>
        <div className="ephemeris-container">
          <Ephemeris
            key={chartBKey}
            planets={birthChartB.planets}
            houses={birthChartB.houses}
            aspects={birthChartB.aspects}
            transits={birthChartA.planets}
            instanceId="chart-b"
          />
        </div>
      </div>
      <div className="composite-chart">
        <h3>Composite Chart</h3>
        <BirthChartSummaryTable planets={compositeChart.planets} houses={compositeChart.houses} aspects={compositeChart.aspects} />
      </div>
    </div>
  );
});

export default SynastryBirthChartComparison_v2;