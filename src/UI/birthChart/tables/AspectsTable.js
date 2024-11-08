import React from 'react';
import './AspectsTable.css';
import { planetIcons } from '../../../Utilities/constants';

const AspectsTable = ({ aspectsArray }) => {
  // Function to get the correct image path for planets
  const getPlanetImagePath = (planetName) => {
    if (typeof planetName !== 'string' || !planetName) {
      console.warn(`Invalid planet name: ${planetName}`);
      return '';
    }

    const formattedName = planetName.toLowerCase();
    return planetIcons.find(path => 
      typeof path === 'string' && path.toLowerCase().includes(formattedName)
    ) || '';
  };

  // Function to get the aspect symbol
  const getAspectSymbol = (aspectType) => {
    if (typeof aspectType !== 'string' || !aspectType) {
      console.warn(`Invalid aspect type: ${aspectType}`);
      return '?';
    }

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
    <table className="aspects-table">
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
