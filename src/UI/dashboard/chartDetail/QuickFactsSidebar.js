import React from 'react';
import './QuickFactsSidebar.css';

// Map sign to its ruling planet
const SIGN_RULERS = {
  'Aries': 'Mars',
  'Taurus': 'Venus',
  'Gemini': 'Mercury',
  'Cancer': 'Moon',
  'Leo': 'Sun',
  'Virgo': 'Mercury',
  'Libra': 'Venus',
  'Scorpio': 'Pluto',
  'Sagittarius': 'Jupiter',
  'Capricorn': 'Saturn',
  'Aquarius': 'Uranus',
  'Pisces': 'Neptune'
};

function QuickFactsSidebar({ chart }) {
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'Unknown';
    return timeString;
  };

  const getAscendantSign = () => {
    if (!chart?.birthChart?.houses) return null;
    const firstHouse = chart.birthChart.houses.find(h => h.house === 1);
    return firstHouse?.sign || null;
  };

  const getSunSign = () => {
    if (!chart?.birthChart?.planets) return null;
    const sun = chart.birthChart.planets.find(p => p.name === 'Sun');
    return sun?.sign || null;
  };

  const getAscendantRuler = () => {
    const ascSign = getAscendantSign();
    return ascSign ? SIGN_RULERS[ascSign] : null;
  };

  const getSunRuler = () => {
    const sunSign = getSunSign();
    return sunSign ? SIGN_RULERS[sunSign] : null;
  };

  const getNorthNode = () => {
    if (!chart?.birthChart?.planets) return null;
    const node = chart.birthChart.planets.find(p =>
      p.name === 'North Node' || p.name === 'True Node'
    );
    return node?.sign || null;
  };

  const getSouthNode = () => {
    if (!chart?.birthChart?.planets) return null;
    const node = chart.birthChart.planets.find(p => p.name === 'South Node');
    if (node) return node.sign;

    // If no South Node, derive from North Node (opposite sign)
    const northNode = getNorthNode();
    if (!northNode) return null;

    const opposites = {
      'Aries': 'Libra', 'Taurus': 'Scorpio', 'Gemini': 'Sagittarius',
      'Cancer': 'Capricorn', 'Leo': 'Aquarius', 'Virgo': 'Pisces',
      'Libra': 'Aries', 'Scorpio': 'Taurus', 'Sagittarius': 'Gemini',
      'Capricorn': 'Cancer', 'Aquarius': 'Leo', 'Pisces': 'Virgo'
    };
    return opposites[northNode] || null;
  };

  const getChiron = () => {
    if (!chart?.birthChart?.planets) return null;
    const chiron = chart.birthChart.planets.find(p => p.name === 'Chiron');
    if (!chiron) return null;
    return {
      sign: chiron.sign,
      degree: chiron.norm_degree ? `${Math.floor(chiron.norm_degree)}°` : null
    };
  };

  const ascendantSign = getAscendantSign();
  const sunSign = getSunSign();
  const chiron = getChiron();
  const northNode = getNorthNode();
  const southNode = getSouthNode();

  return (
    <aside className="quick-facts-sidebar">
      <h3 className="quick-facts-sidebar__title">Quick Facts</h3>

      <div className="quick-facts-sidebar__list">
        <div className="quick-facts-sidebar__item">
          <span className="quick-facts-sidebar__label">Birth Date</span>
          <span className="quick-facts-sidebar__value">
            {formatDate(chart?.dateOfBirth)}
          </span>
        </div>

        <div className="quick-facts-sidebar__item">
          <span className="quick-facts-sidebar__label">Birth Time</span>
          <span className="quick-facts-sidebar__value">
            {formatTime(chart?.timeOfBirth)}
          </span>
        </div>

        <div className="quick-facts-sidebar__item">
          <span className="quick-facts-sidebar__label">Birth Location</span>
          <span className="quick-facts-sidebar__value">
            {chart?.placeOfBirth || 'Unknown'}
          </span>
        </div>

        {ascendantSign && (
          <div className="quick-facts-sidebar__item">
            <span className="quick-facts-sidebar__label">Ascendant</span>
            <span className="quick-facts-sidebar__value">{ascendantSign}</span>
          </div>
        )}

        <div className="quick-facts-sidebar__divider" />

        <div className="quick-facts-sidebar__item">
          <span className="quick-facts-sidebar__label">Chart Rulers</span>
          <div className="quick-facts-sidebar__rulers">
            {getAscendantRuler() && (
              <span className="quick-facts-sidebar__ruler">
                Ascendant: {getAscendantRuler()}
              </span>
            )}
            {getSunRuler() && (
              <span className="quick-facts-sidebar__ruler">
                Sun: {getSunRuler()}
              </span>
            )}
          </div>
        </div>

        {(northNode || southNode) && (
          <>
            <div className="quick-facts-sidebar__divider" />
            <div className="quick-facts-sidebar__item">
              <span className="quick-facts-sidebar__label">Lunar Nodes</span>
              <div className="quick-facts-sidebar__nodes">
                {northNode && (
                  <span className="quick-facts-sidebar__node">
                    North: {northNode}
                  </span>
                )}
                {southNode && (
                  <span className="quick-facts-sidebar__node">
                    South: {southNode}
                  </span>
                )}
              </div>
            </div>
          </>
        )}

        {chiron && (
          <>
            <div className="quick-facts-sidebar__divider" />
            <div className="quick-facts-sidebar__item">
              <span className="quick-facts-sidebar__label">Chiron</span>
              <span className="quick-facts-sidebar__value">
                {chiron.sign} {chiron.degree}
              </span>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}

export default QuickFactsSidebar;
