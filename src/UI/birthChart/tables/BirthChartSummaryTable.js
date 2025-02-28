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
    <div className="birth-chart">
      <div className="left-section">
        <div className="ephemeris-container">
          <h3>Ephemeris</h3>
          <Ephemeris 
            key={ephemerisKey}
            planets={planets} 
            houses={houses} 
            aspects={aspects} 
            transits={transits}
            instanceId="summary" // Add unique identifier
          />
        </div>

      </div>
      <div className="right-section">
      <h3>Planetary Positions</h3>
        <div className="house-position-container">
          <h3>House Positions</h3>
          <HousePositionTable houseArray={houses} />
        </div>
        <h3>Planetary Positions</h3>
        <div className="table-container">
          <PlanetPositionTable planetsArray={planets} />
        </div>
        <div className="aspects-container">
          <h3>Aspects</h3>
          <div className="aspects-table-wrapper">
            <AspectsTable aspectsArray={aspects} />
          </div>
        </div>
      </div>
    </div>
  );
});

export default BirthChartSummaryTable;