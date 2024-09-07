import React from 'react';
import './AspectsTable.css'; // We'll create this CSS file for styling
import { planetIcons } from '../../../Utilities/constants';

const AspectsTable = ({ aspectsArray }) => {

  console.log(JSON.stringify(aspectsArray))
     // Function to get the correct image path for planets
  const getPlanetImagePath = (planetName) => {
    const formattedName = planetName.toLowerCase();
    return planetIcons.find(path => path.toLowerCase().includes(formattedName)) || '';
  };

  // Function to get the aspect symbol
  const getAspectSymbol = (aspectType) => {
    switch (aspectType.toLowerCase()) {
      case 'conjunction': return '☌';
      case 'opposition': return '☍';
      case 'trine': return '△';
      case 'square': return '□';
      case 'sextile': return '⚹';
      case 'quincunx': return '⚻';
      default: return '?';
    }
  };

  return (
    <table className="aspect-table">
      <tbody>
        {aspectsArray.map((aspect, index) => (
          <tr key={index}>
            <td>
              <img 
                src={getPlanetImagePath(aspect.transitingPlanet)} 
                alt={aspect.transitingPlanet} 
                className="symbol-img"
              />
            </td>
            <td>{aspect.transitingPlanet}</td>
            <td className="aspect-symbol">{getAspectSymbol(aspect.aspectType)}</td>
            <td>
              <img 
                src={getPlanetImagePath(aspect.aspectingPlanet)} 
                alt={aspect.aspectingPlanet} 
                className="symbol-img"
              />
            </td>
            <td>{aspect.aspectingPlanet}</td>
            <td>{aspect.orb.toFixed(2)}°</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
    
  export default AspectsTable;