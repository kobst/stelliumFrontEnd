import PlanetPositionTable from './PlanetPositionTable'
import HousePositionTable from './HousePositionTable'
import AspectsTable from './AspectsTable'
import Ephemeris from '../../shared/Ephemeris';

import './BirthChartSummaryTable.css'

const BirthChartSummaryTable = ({planets, houses, aspects, transits = []}) => {

    console.log('Rendering BirthChartSummaryTable');
    console.log('Planets:', planets);
    console.log('Houses:', houses);
    console.log('Aspects:', aspects);
    console.log('Transits:', transits);
  
    return (
        <div className="birth-chart">
          <div className="top-section">
            <div className="ephemeris-container">
              <h3>Ephemeris</h3>
              <Ephemeris 
                key = {`${planets.length}-${houses.length}-${aspects.length}-${transits.length}`}
                planets = {planets} 
                houses={houses} 
                aspects = {aspects} 
                transits={transits} 
              />
            </div>
            <div className="right-tables">
              <div className="table-container">
                <h3>Planetary Positions</h3>
                <PlanetPositionTable planetsArray={planets} />
              </div>
              <div className="table-container">
                <h3>House Positions</h3>
                <HousePositionTable houseArray={houses} />
              </div>
            </div>
          </div>
          <div className="bottom-table">
            <h3>Aspects</h3>
            <AspectsTable aspectsArray={aspects} />
          </div>
        </div>
      );
    };

export default BirthChartSummaryTable;