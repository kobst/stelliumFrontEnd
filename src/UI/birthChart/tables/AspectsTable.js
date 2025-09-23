import React from 'react';
import './AspectsTable.css';

const AspectsTable = ({ aspectsArray }) => {

  // Function to get the aspect name
  const getAspectName = (aspectType) => {
    if (typeof aspectType !== 'string' || !aspectType) {
      console.warn(`Invalid aspect type: ${aspectType}`);
      return 'Unknown';
    }

    switch (aspectType.toLowerCase()) {
      case 'conjunction': return 'Conjunction';
      case 'opposition': return 'Opposition';
      case 'trine': return 'Trine';
      case 'square': return 'Square';
      case 'sextile': return 'Sextile';
      case 'quincunx': return 'Quincunx';
      default: return aspectType; // Return the original if not recognized
    }
  };
  
  // Unicode symbols for planets as fallback
  const planetSymbols = {
    'Sun': '☉',
    'Moon': '☽',
    'Mercury': '☿',
    'Venus': '♀',
    'Mars': '♂',
    'Jupiter': '♃',
    'Saturn': '♄',
    'Uranus': '♅',
    'Neptune': '♆',
    'Pluto': '♇',
    'Ascendant': 'AC',
    'Midheaven': 'MC',
    'Chiron': '⚷',
    'Node': '☊',
    'North Node': '☊',
    'South Node': '☋'
  };

  return (
    <table className="aspects-table">
      <tbody>
        {aspectsArray.map((aspect, index) => (
          <tr key={index}>
            <td>
              <span 
                style={{ 
                  fontSize: (aspect.aspectedPlanet === 'Ascendant' || aspect.aspectedPlanet === 'Midheaven') ? '14px' : '20px',
                  fontWeight: (aspect.aspectedPlanet === 'Ascendant' || aspect.aspectedPlanet === 'Midheaven') ? 'normal' : 'bold'
                }}
              >
                {planetSymbols[aspect.aspectedPlanet] || (aspect.aspectedPlanet ? aspect.aspectedPlanet.substring(0, 2) : '??')}
              </span>
            </td>
            <td>{aspect.aspectedPlanet}</td>
            <td className="aspect-name">
              {getAspectName(aspect.aspectType)}
            </td>
            <td>
              <span 
                style={{ 
                  fontSize: (aspect.aspectingPlanet === 'Ascendant' || aspect.aspectingPlanet === 'Midheaven') ? '14px' : '20px',
                  fontWeight: (aspect.aspectingPlanet === 'Ascendant' || aspect.aspectingPlanet === 'Midheaven') ? 'normal' : 'bold'
                }}
              >
                {planetSymbols[aspect.aspectingPlanet] || (aspect.aspectingPlanet ? aspect.aspectingPlanet.substring(0, 2) : '??')}
              </span>
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
