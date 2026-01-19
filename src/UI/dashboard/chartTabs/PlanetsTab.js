import React, { useState, useMemo, useEffect } from 'react';
import './PlanetsTab.css';

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

// Canonical order for planet tabs
const planetOrder = [
  'Moon', 'Mercury', 'Venus', 'Sun', 'Mars',
  'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto',
  'Ascendant', 'Midheaven', 'Node', 'North Node', 'Chiron'
];

// Helper function to split interpretation text into paragraphs
const splitIntoParagraphs = (text) => {
  if (!text) return null;
  return text.split('\n\n').map((para, idx) => (
    <p key={idx}>{para}</p>
  ));
};

function PlanetsTab({ birthChart, basicAnalysis }) {
  const planets = useMemo(() => {
    const rawPlanets = birthChart?.planets?.filter(p => !excludedPlanets.includes(p.name)) || [];
    // Sort planets by the canonical order
    return rawPlanets.sort((a, b) => {
      const indexA = planetOrder.indexOf(a.name);
      const indexB = planetOrder.indexOf(b.name);
      // If not in order list, put at end
      const orderA = indexA === -1 ? 999 : indexA;
      const orderB = indexB === -1 ? 999 : indexB;
      return orderA - orderB;
    });
  }, [birthChart?.planets]);

  const [selectedPlanet, setSelectedPlanet] = useState(planets[0]?.name || null);

  // Update selectedPlanet when planets load or change
  useEffect(() => {
    if (planets.length > 0 && (!selectedPlanet || !planets.find(p => p.name === selectedPlanet))) {
      setSelectedPlanet(planets[0].name);
    }
  }, [planets, selectedPlanet]);

  const getPlanetInterpretation = (planetName) => {
    if (!basicAnalysis?.planets) return null;
    return basicAnalysis.planets[planetName];
  };

  // Get the selected planet data
  const currentPlanet = planets.find(p => p.name === selectedPlanet);
  const interpretation = currentPlanet ? getPlanetInterpretation(currentPlanet.name) : null;

  if (planets.length === 0) {
    return (
      <div className="chart-tab-content planets-tab">
        <div className="planets-main-container">
          <div className="planets-header">
            <h3 className="planets-header-title">Planets</h3>
            <div className="planets-gradient-icon"></div>
          </div>
          <div className="planets-empty-section">
            <p>No planetary data available yet.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="chart-tab-content planets-tab">
      <div className="planets-main-container">
        {/* Header with title and gradient icon */}
        <div className="planets-header">
          <h3 className="planets-header-title">Planets</h3>
          <div className="planets-gradient-icon"></div>
        </div>

        {/* Horizontal Tab Bar */}
        <div className="planets-tabs">
          {planets.map(planet => (
            <button
              key={planet.name}
              className={`planets-tab-btn ${selectedPlanet === planet.name ? 'planets-tab-btn--active' : ''}`}
              onClick={() => setSelectedPlanet(planet.name)}
            >
              {planet.name}
            </button>
          ))}
        </div>

        {/* Planet Content */}
        {currentPlanet && (
          <div className="planets-content" key={currentPlanet.name}>
            {/* Info Row: Icon + Sign + House */}
            <div className="planet-info-row">
              <div className="planet-info-left">
                <span className="planet-main-symbol">
                  {planetSymbols[currentPlanet.name] || currentPlanet.name.substring(0, 2)}
                </span>
                <div className="planet-sign-display">
                  <span className="planet-sign-name">{currentPlanet.sign}</span>
                  <span className="planet-sign-symbol">
                    {zodiacSymbols[currentPlanet.sign] || ''}
                  </span>
                </div>
                {currentPlanet.norm_degree !== undefined && (
                  <span className="planet-degree-display">
                    {currentPlanet.norm_degree.toFixed(1)}°
                  </span>
                )}
                {currentPlanet.is_retro === 'true' && (
                  <span className="planet-retro-badge">℞</span>
                )}
              </div>
              {currentPlanet.house && (
                <span className="planet-house-display">
                  {currentPlanet.house}{getOrdinalSuffix(currentPlanet.house)} House
                </span>
              )}
            </div>

            {/* Summary (gold italic) */}
            {interpretation?.description && (
              <p className="planet-aspect-summary">{interpretation.description}</p>
            )}

            {/* Interpretation paragraphs */}
            {interpretation?.interpretation && (
              <div className="planet-interpretation-section">
                {splitIntoParagraphs(interpretation.interpretation)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Helper to get ordinal suffix (1st, 2nd, 3rd, etc.)
function getOrdinalSuffix(n) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}

export default PlanetsTab;
