import React, { memo, useMemo } from 'react';
import PlanetPositionTable from './PlanetPositionTable';
import HousePositionTable from './HousePositionTable';
import AspectsTable from './AspectsTable';
import Ephemeris from '../../shared/Ephemeris';
import './BirthChartSummaryTable.css';

const BirthChartSummaryTable = memo(({planets, houses, aspects, transits = []}) => {
  // Create a stable key that only changes when the data actually changes
  const ephemerisKey = useMemo(() => {
    return JSON.stringify({
      planets: planets.map(p => p.name + p.full_degree),
      houses: houses.map(h => h.house + h.degree),
      aspects: aspects.map(a => a.transitingPlanet + a.aspectingPlanet),
      transits: transits.map(t => t.name + t.full_degree)
    });
  }, [planets, houses, aspects, transits]);

  return (
    <div className="chart-grid">
      {/* Top Left: Ephemeris */}
      <div className="chart-box chart-box--ephemeris">
        <div className="chart-box__header">
          <h3 className="chart-box__title">EPHEMERIS</h3>
        </div>
        <div className="chart-box__content">
          <Ephemeris
            key={ephemerisKey}
            planets={planets}
            houses={houses}
            aspects={aspects}
            transits={transits}
            instanceId="summary"
          />
        </div>
      </div>

      {/* Top Right: House Positions */}
      <div className="chart-box chart-box--houses">
        <div className="chart-box__header">
          <h3 className="chart-box__title">HOUSE POSITIONS</h3>
        </div>
        <div className="chart-box__content">
          {houses && houses.length > 0 ? (
            <HousePositionTable houseArray={houses} />
          ) : (
            <div className="chart-box__empty">
              House data not available with unknown birth time
            </div>
          )}
        </div>
      </div>

      {/* Bottom Left: Planetary Positions */}
      <div className="chart-box chart-box--planets">
        <div className="chart-box__header">
          <h3 className="chart-box__title">PLANETARY POSITIONS</h3>
        </div>
        <div className="chart-box__content">
          <PlanetPositionTable planetsArray={planets} />
        </div>
      </div>

      {/* Bottom Right: Aspects */}
      <div className="chart-box chart-box--aspects">
        <div className="chart-box__header">
          <h3 className="chart-box__title">ASPECTS</h3>
        </div>
        <div className="chart-box__content">
          <AspectsTable aspectsArray={aspects} />
        </div>
      </div>
    </div>
  );
});

export default BirthChartSummaryTable;
