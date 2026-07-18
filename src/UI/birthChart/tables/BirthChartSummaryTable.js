import React, { memo, useMemo } from 'react';
import PlanetPositionTable from './PlanetPositionTable';
import HousePositionTable from './HousePositionTable';
import AspectsTable from './AspectsTable';
import Ephemeris from '../../shared/Ephemeris';
import './BirthChartSummaryTable.css';

const BirthChartSummaryTable = memo(({planets, houses, aspects, transits = [], adminTheme = false}) => {
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
    <div className={`birth-chart${adminTheme ? ' subject-birth-chart' : ''}`}>
      <div className="left-section">
        <section className={adminTheme ? 'ephemeris-container subject-data-panel' : 'ephemeris-container'}>
          <h3 className={adminTheme ? 'admin-section-title' : undefined}>Ephemeris</h3>
          <Ephemeris 
            key={ephemerisKey}
            planets={planets} 
            houses={houses} 
            aspects={aspects} 
            transits={transits}
            instanceId="summary" // Add unique identifier
            adminTheme={adminTheme}
          />
        </section>
      </div>
      <div className="right-section">
        {!adminTheme && <h3>Planetary Positions</h3>}
        <section className={adminTheme ? 'house-position-container subject-data-panel' : 'house-position-container'}>
          <h3 className={adminTheme ? 'admin-section-title' : undefined}>House Positions</h3>
          {houses && houses.length > 0 ? (
            adminTheme ? (
              <div className="admin-table-scroll subject-house-table-scroll">
                <HousePositionTable houseArray={houses} adminTheme />
              </div>
            ) : (
              <HousePositionTable houseArray={houses} />
            )
          ) : (
            <div className={adminTheme ? 'no-houses-message admin-empty' : 'no-houses-message'}>
              House data not available with unknown birth time
            </div>
          )}
        </section>
        <section className={adminTheme ? 'planet-position-container subject-data-panel' : 'planet-position-container'}>
          <h3 className={adminTheme ? 'admin-section-title' : undefined}>Planetary Positions</h3>
          <div className={adminTheme ? 'table-container admin-table-scroll' : 'table-container'}>
            <PlanetPositionTable planetsArray={planets} adminTheme={adminTheme} />
          </div>
        </section>
        <section className={adminTheme ? 'aspects-container subject-data-panel' : 'aspects-container'}>
          <h3 className={adminTheme ? 'admin-section-title' : undefined}>Aspects</h3>
          <div className={adminTheme ? 'aspects-table-wrapper admin-table-scroll' : 'aspects-table-wrapper'}>
            <AspectsTable aspectsArray={aspects} adminTheme={adminTheme} />
          </div>
        </section>
      </div>
    </div>
  );
});

export default BirthChartSummaryTable;
