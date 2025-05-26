import React from 'react';
import './SynastryAspectsTable.css';
import { planetIcons } from '../../../../Utilities/constants';

const SynastryAspectsTable = ({ synastryAspects }) => {
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

  // Function to get the sign based on the planet's degree
  const getSign = (degree) => {
    const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    const signIndex = Math.floor(degree / 30);
    return signs[signIndex];
  };

  // Function to get the degree within the sign
  const getDegreeInSign = (degree) => {
    return (degree % 30).toFixed(2);
  };

  return (
    <table className="synastry-aspects-table">
      <tbody>
      {Array.isArray(synastryAspects) && synastryAspects.map((aspect, index) => (
          <tr key={index}>
            <td>
              <img 
                src={getPlanetImagePath(aspect.planet1)} 
                alt={aspect.planet1} 
                className="symbol-img"
              />
            </td>
            <td>
              {aspect.planet1} (User 1)<br />
              {getSign(aspect.planet1Degree)} {getDegreeInSign(aspect.planet1Degree)}°
            </td>
            <td className="aspect-symbol">{getAspectSymbol(aspect.aspectType)}</td>
            <td>
              <img 
                src={getPlanetImagePath(aspect.planet2)} 
                alt={aspect.planet2} 
                className="symbol-img"
              />
            </td>
            <td>
              {aspect.planet2} (User 2)<br />
              {getSign(aspect.planet2Degree)} {getDegreeInSign(aspect.planet2Degree)}°
            </td>
            <td>{aspect.orb.toFixed(2)}°</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default SynastryAspectsTable;