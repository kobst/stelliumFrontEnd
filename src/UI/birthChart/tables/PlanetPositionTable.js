import React from 'react';
import './PlanetPositionsTable.css';

const PlanetPositionsTable = ({ planetsArray }) => {

  const excludedPlanets = ["South Node", "Part of Fortune"];
  
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
  
  // Unicode symbols for zodiac signs
  const zodiacSymbols = {
    'Aries': '♈',
    'Taurus': '♉',
    'Gemini': '♊',
    'Cancer': '♋',
    'Leo': '♌',
    'Virgo': '♍',
    'Libra': '♎',
    'Scorpio': '♏',
    'Sagittarius': '♐',
    'Capricorn': '♑',
    'Aquarius': '♒',
    'Pisces': '♓'
  };

  return (
    <table className="planet-positions-table">
      <tbody>
          {planetsArray
            .filter(planet => !excludedPlanets.includes(planet.name))
            .map((planet, index) => (
              <tr key={index}>
                <td>
                  <span 
                    style={{ 
                      fontSize: (planet.name === 'Ascendant' || planet.name === 'Midheaven') ? '14px' : '20px',
                      fontWeight: (planet.name === 'Ascendant' || planet.name === 'Midheaven') ? 'normal' : 'bold'
                    }}
                  >
                    {planetSymbols[planet.name] || (planet.name ? planet.name.substring(0, 2) : '??')}
                  </span>
                </td>
                <td>{planet.name}</td>
                <td>{planet.norm_degree.toFixed(2)}°</td>
                <td>
                  <span style={{ fontSize: '20px', fontWeight: 'bold' }}>
                    {zodiacSymbols[planet.sign] || (planet.sign ? planet.sign.substring(0, 2) : '??')}
                  </span>
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
