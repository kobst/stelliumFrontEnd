import React from 'react';
import PlanetPositionTable from './PlanetPositionTable';
import HousePositionTable from './HousePositionTable';
import AspectsTable from './AspectsTable';
import Ephemeris from '../../shared/Ephemeris';
import './BirthChartSummaryTable.css';

const BirthChartSummaryTable = ({planets, houses, aspects, transits = []}) => {
  return (
    <div className="birth-chart">
      <div className="left-section">
        <div className="ephemeris-container">
          <h3>Ephemeris</h3>
          <Ephemeris 
            key={`${planets.length}-${houses.length}-${aspects.length}-${transits.length}`}
            planets={planets} 
            houses={houses} 
            aspects={aspects} 
            transits={transits} 
          />
        </div>
        <div className="house-position-container">
          <h3>House Positions</h3>
          <HousePositionTable houseArray={houses} />
        </div>
      </div>
      <div className="right-section">
        <div className="table-container">
          <h3>Planetary Positions</h3>
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
};

export default BirthChartSummaryTable;