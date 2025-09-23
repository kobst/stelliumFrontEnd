import React from 'react';
import './PlanetPositionsTable.css';
import { zodiacIcons, planetIcons } from '../../../Utilities/constants';

const PlanetPositionsTable = ({ planetsArray }) => {

  const excludedPlanets = ["South Node", "Part of Fortune"];

  // Map planet names to indices matching Utilities/constants planetIcons ordering
  const planetNameToIndex = {
    'Sun': 0,
    'Moon': 1,
    'Mercury': 2,
    'Venus': 3,
    'Mars': 4,
    'Jupiter': 5,
    'Saturn': 6,
    'Uranus': 7,
    'Neptune': 8,
    'Pluto': 9,
    'Ascendant': 10,
  };

  const getPlanetImagePath = (planetName) => {
    const idx = planetNameToIndex[planetName];
    return idx !== undefined ? planetIcons[idx] : '';
  };

  const getSignImagePath = (signName) => {
    const formattedName = signName?.toLowerCase();
    if (!formattedName) return '';
    return zodiacIcons.find(path => path.toLowerCase().includes(formattedName)) || '';
  };
  
  // Unicode fallbacks
  const planetSymbols = {
    'Sun': '☉', 'Moon': '☽', 'Mercury': '☿', 'Venus': '♀', 'Mars': '♂',
    'Jupiter': '♃', 'Saturn': '♄', 'Uranus': '♅', 'Neptune': '♆', 'Pluto': '♇',
    'Ascendant': 'AC', 'Midheaven': 'MC', 'Chiron': '⚷', 'Node': '☊', 'North Node': '☊', 'South Node': '☋'
  };
  const zodiacSymbols = {
    'Aries': '♈','Taurus': '♉','Gemini': '♊','Cancer': '♋','Leo': '♌','Virgo': '♍','Libra': '♎','Scorpio': '♏','Sagittarius': '♐','Capricorn': '♑','Aquarius': '♒','Pisces': '♓'
  };

  return (
    <table className="planet-positions-table">
      <tbody>
          {planetsArray
            .filter(planet => !excludedPlanets.includes(planet.name))
            .map((planet, index) => (
              <tr key={index}>
                <td>
                  {getPlanetImagePath(planet.name) ? (
                    <img src={getPlanetImagePath(planet.name)} alt={planet.name} className="symbol-img" />
                  ) : (
                    <span 
                      style={{ 
                        fontSize: (planet.name === 'Ascendant' || planet.name === 'Midheaven') ? '14px' : '20px',
                        fontWeight: (planet.name === 'Ascendant' || planet.name === 'Midheaven') ? 'normal' : 'bold'
                      }}
                    >
                      {planetSymbols[planet.name] || (planet.name ? planet.name.substring(0, 2) : '??')}
                    </span>
                  )}
                </td>
                <td>{planet.name}</td>
                <td>{planet.norm_degree.toFixed(2)}°</td>
                <td>
                  {getSignImagePath(planet.sign) ? (
                    <img src={getSignImagePath(planet.sign)} alt={planet.sign} className="symbol-img" />
                  ) : (
                    <span style={{ fontSize: '20px', fontWeight: 'bold' }}>
                      {zodiacSymbols[planet.sign] || (planet.sign ? planet.sign.substring(0, 2) : '??')}
                    </span>
                  )}
                </td>
                <td>{planet.sign}</td>
                <td>{planet.is_retro == "true" ? "Retro" : ""}</td>
              </tr>
          ))}
      </tbody>
    </table>
  );
};

export default PlanetPositionsTable;

// 
