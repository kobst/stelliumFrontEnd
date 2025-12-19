import React, { useState } from 'react';
import './ChartTabs.css';

// Planet and zodiac symbols
const planetSymbols = {
  'Sun': '☉', 'Moon': '☽', 'Mercury': '☿', 'Venus': '♀', 'Mars': '♂',
  'Jupiter': '♃', 'Saturn': '♄', 'Uranus': '♅', 'Neptune': '♆', 'Pluto': '♇',
  'Ascendant': 'AC', 'Midheaven': 'MC', 'Chiron': '⚷',
  'North Node': '☊', 'South Node': '☋', 'Node': '☊'
};

const zodiacSymbols = {
  'Aries': '♈', 'Taurus': '♉', 'Gemini': '♊', 'Cancer': '♋',
  'Leo': '♌', 'Virgo': '♍', 'Libra': '♎', 'Scorpio': '♏',
  'Sagittarius': '♐', 'Capricorn': '♑', 'Aquarius': '♒', 'Pisces': '♓'
};

const excludedPlanets = ['South Node', 'Part of Fortune'];

function PlanetsTab({ birthChart, basicAnalysis }) {
  const [expandedPlanet, setExpandedPlanet] = useState(null);

  const planets = birthChart?.planets?.filter(p => !excludedPlanets.includes(p.name)) || [];

  const getPlanetInterpretation = (planetName) => {
    if (!basicAnalysis?.planets) return null;
    return basicAnalysis.planets[planetName];
  };

  const handlePlanetClick = (planetName) => {
    setExpandedPlanet(expandedPlanet === planetName ? null : planetName);
  };

  if (planets.length === 0) {
    return (
      <div className="chart-tab-empty">
        <h3>Planets</h3>
        <p>No planetary data available yet.</p>
      </div>
    );
  }

  return (
    <div className="chart-tab-content planets-tab">
      <div className="planets-list">
        {planets.map((planet, index) => {
          const interpretation = getPlanetInterpretation(planet.name);
          const isExpanded = expandedPlanet === planet.name;
          const hasInterpretation = interpretation?.interpretation || interpretation?.description;

          return (
            <div
              key={index}
              className={`planet-card ${isExpanded ? 'expanded' : ''} ${hasInterpretation ? 'clickable' : ''}`}
              onClick={() => hasInterpretation && handlePlanetClick(planet.name)}
            >
              <div className="planet-card-header">
                <div className="planet-symbol">
                  {planetSymbols[planet.name] || planet.name.substring(0, 2)}
                </div>
                <div className="planet-details">
                  <span className="planet-name">{planet.name}</span>
                  <span className="planet-position">
                    <span className="sign-symbol">{zodiacSymbols[planet.sign] || ''}</span>
                    {planet.sign}
                    {planet.norm_degree !== undefined && (
                      <span className="planet-degree">{planet.norm_degree.toFixed(1)}°</span>
                    )}
                  </span>
                </div>
                <div className="planet-meta">
                  {planet.house && (
                    <span className="planet-house">House {planet.house}</span>
                  )}
                  {planet.is_retro === 'true' && (
                    <span className="planet-retro">℞</span>
                  )}
                  {hasInterpretation && (
                    <span className={`expand-icon ${isExpanded ? 'expanded' : ''}`}>
                      ▼
                    </span>
                  )}
                </div>
              </div>

              {isExpanded && hasInterpretation && (
                <div className="planet-interpretation">
                  {interpretation.description && (
                    <p className="interpretation-description">{interpretation.description}</p>
                  )}
                  {interpretation.interpretation && (
                    <p className="interpretation-text">{interpretation.interpretation}</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default PlanetsTab;
