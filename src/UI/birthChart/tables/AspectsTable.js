import React, { useMemo } from 'react';
import './AspectsTable.css';

const AspectsTable = ({ aspectsArray }) => {
  // Unicode symbols for planets
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

  // Unicode symbols for aspects
  const aspectSymbols = {
    'conjunction': '☌',
    'opposition': '☍',
    'trine': '△',
    'square': '□',
    'sextile': '⚹',
    'quincunx': '⚻'
  };

  // Get display name for aspect type
  const getAspectName = (aspectType) => {
    if (!aspectType) return 'Unknown';
    const type = aspectType.toLowerCase();
    const names = {
      'conjunction': 'Conjunction',
      'opposition': 'Opposition',
      'trine': 'Trine',
      'square': 'Square',
      'sextile': 'Sextile',
      'quincunx': 'Quincunx'
    };
    return names[type] || aspectType;
  };

  // Get aspect symbol
  const getAspectSymbol = (aspectType) => {
    if (!aspectType) return '•';
    return aspectSymbols[aspectType.toLowerCase()] || '•';
  };

  // Get planet symbol
  const getPlanetSymbol = (planet) => {
    return planetSymbols[planet] || (planet ? planet.substring(0, 2) : '??');
  };

  if (!aspectsArray || aspectsArray.length === 0) {
    return <div className="aspects-empty">No aspects found</div>;
  }

  return (
    <div className="aspects-list">
      <table className="aspects-table">
        <tbody>
          {aspectsArray.map((aspect, index) => (
            <tr key={index} className="aspects-row">
              <td className="aspects-cell aspects-cell--planet">
                <span className="aspects-symbol">{getPlanetSymbol(aspect.aspectedPlanet)}</span>
                <span className="aspects-planet-name">{aspect.aspectedPlanet}</span>
              </td>
              <td className="aspects-cell aspects-cell--aspect">
                <span className="aspects-symbol">{getAspectSymbol(aspect.aspectType)}</span>
                <span className="aspects-type-name">{getAspectName(aspect.aspectType)}</span>
              </td>
              <td className="aspects-cell aspects-cell--planet">
                <span className="aspects-symbol">{getPlanetSymbol(aspect.aspectingPlanet)}</span>
                <span className="aspects-planet-name">{aspect.aspectingPlanet}</span>
              </td>
              <td className="aspects-cell aspects-cell--orb">
                {aspect.orb?.toFixed(1)}°
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AspectsTable;
