import React from 'react';
import './HousesSection.css';

// House meanings and life areas
const HOUSE_INFO = {
  1: { name: 'First House', area: 'Self & Identity', keywords: 'Personality, appearance, first impressions' },
  2: { name: 'Second House', area: 'Resources & Values', keywords: 'Money, possessions, self-worth' },
  3: { name: 'Third House', area: 'Communication', keywords: 'Siblings, local travel, learning' },
  4: { name: 'Fourth House', area: 'Home & Family', keywords: 'Roots, parents, emotional foundation' },
  5: { name: 'Fifth House', area: 'Creativity & Joy', keywords: 'Romance, children, self-expression' },
  6: { name: 'Sixth House', area: 'Health & Service', keywords: 'Daily work, routines, wellness' },
  7: { name: 'Seventh House', area: 'Partnerships', keywords: 'Marriage, contracts, open enemies' },
  8: { name: 'Eighth House', area: 'Transformation', keywords: 'Shared resources, death, rebirth' },
  9: { name: 'Ninth House', area: 'Philosophy', keywords: 'Higher education, travel, beliefs' },
  10: { name: 'Tenth House', area: 'Career & Legacy', keywords: 'Public image, ambition, authority' },
  11: { name: 'Eleventh House', area: 'Community', keywords: 'Friends, groups, hopes, dreams' },
  12: { name: 'Twelfth House', area: 'Spirituality', keywords: 'Subconscious, secrets, solitude' }
};

// Sign rulers for cusp interpretation
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

const ZODIAC_GLYPHS = {
  'Aries': '\u2648',
  'Taurus': '\u2649',
  'Gemini': '\u264A',
  'Cancer': '\u264B',
  'Leo': '\u264C',
  'Virgo': '\u264D',
  'Libra': '\u264E',
  'Scorpio': '\u264F',
  'Sagittarius': '\u2650',
  'Capricorn': '\u2651',
  'Aquarius': '\u2652',
  'Pisces': '\u2653'
};

function HousesSection({ birthChart }) {
  const houses = birthChart?.houses || [];

  // Get planets in each house
  const getPlanetsInHouse = (houseNum) => {
    if (!birthChart?.planets) return [];
    return birthChart.planets.filter(p => {
      // Some data has house property, some need calculation
      if (p.house === houseNum) return true;
      return false;
    }).map(p => p.name);
  };

  if (!houses || houses.length === 0) {
    return (
      <div className="houses-section">
        <h2 className="houses-section__title">Houses</h2>
        <p className="houses-section__empty">House data not available</p>
      </div>
    );
  }

  // Sort houses by house number
  const sortedHouses = [...houses].sort((a, b) => a.house - b.house);

  return (
    <div className="houses-section">
      <h2 className="houses-section__title">Your Houses</h2>
      <p className="houses-section__description">
        The twelve houses represent different life areas. The sign on each house cusp
        colors how you experience that area of life.
      </p>

      <div className="houses-section__grid">
        {sortedHouses.map(house => {
          const houseInfo = HOUSE_INFO[house.house] || {};
          const ruler = SIGN_RULERS[house.sign];
          const glyph = ZODIAC_GLYPHS[house.sign];
          const planetsInHouse = getPlanetsInHouse(house.house);

          return (
            <div key={house.house} className="houses-section__card">
              <div className="houses-section__card-header">
                <span className="houses-section__house-number">{house.house}</span>
                <div className="houses-section__house-info">
                  <h3 className="houses-section__house-name">{houseInfo.name}</h3>
                  <span className="houses-section__house-area">{houseInfo.area}</span>
                </div>
              </div>

              <div className="houses-section__card-body">
                <div className="houses-section__sign">
                  <span className="houses-section__sign-glyph">{glyph}</span>
                  <span className="houses-section__sign-name">{house.sign}</span>
                  {house.degree && (
                    <span className="houses-section__sign-degree">
                      {Math.floor(house.degree)}°
                    </span>
                  )}
                </div>

                {ruler && (
                  <div className="houses-section__ruler">
                    <span className="houses-section__ruler-label">Ruled by</span>
                    <span className="houses-section__ruler-value">{ruler}</span>
                  </div>
                )}

                {planetsInHouse.length > 0 && (
                  <div className="houses-section__planets">
                    <span className="houses-section__planets-label">Planets:</span>
                    <span className="houses-section__planets-value">
                      {planetsInHouse.join(', ')}
                    </span>
                  </div>
                )}

                <p className="houses-section__keywords">{houseInfo.keywords}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default HousesSection;
