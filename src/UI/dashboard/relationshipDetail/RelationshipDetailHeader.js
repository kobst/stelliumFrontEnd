import React from 'react';
import './RelationshipDetailHeader.css';

// Zodiac sign glyphs
const SIGN_GLYPHS = {
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

// Get tier class for styling
const getTierClass = (tier) => {
  if (!tier) return '';
  const tierLower = tier.toLowerCase();
  if (tierLower === 'thriving') return 'tier-thriving';
  if (tierLower === 'flourishing') return 'tier-flourishing';
  if (tierLower === 'emerging') return 'tier-emerging';
  if (tierLower === 'building') return 'tier-building';
  if (tierLower === 'developing') return 'tier-developing';
  return '';
};

// Get sign from planets array
const getSign = (planets, planetName) => {
  if (!planets || !Array.isArray(planets)) return null;
  const planet = planets.find(p => p.name === planetName);
  return planet?.sign || null;
};

function RelationshipDetailHeader({ relationship, onBackClick }) {
  const userAName = relationship?.userA_name || 'Person A';
  const userBName = relationship?.userB_name || 'Person B';

  // Get score and tier
  const overall = relationship?.clusterScoring?.overall ||
                  relationship?.clusterAnalysis?.overall;
  const score = overall?.score;
  const tier = overall?.tier;

  // Try to get Sun/Moon signs from birth charts if available
  const userAPlanets = relationship?.userA_birthChart?.planets;
  const userBPlanets = relationship?.userB_birthChart?.planets;

  const userASun = getSign(userAPlanets, 'Sun');
  const userAMoon = getSign(userAPlanets, 'Moon');
  const userBSun = getSign(userBPlanets, 'Sun');
  const userBMoon = getSign(userBPlanets, 'Moon');

  const hasSignData = userASun || userBSun;

  return (
    <header className="relationship-detail-header">
      <button className="relationship-detail-header__back" onClick={onBackClick}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        <span>Back</span>
      </button>

      <div className="relationship-detail-header__info">
        <div className="relationship-detail-header__main">
          <h1 className="relationship-detail-header__names">
            {userAName} <span className="connector">&</span> {userBName}
          </h1>

          <div className="relationship-detail-header__meta">
            {score !== undefined && score !== null && (
              <div className="relationship-detail-header__score">
                <span className="score-value">{Math.round(score)}</span>
                <span className="score-label">Score</span>
              </div>
            )}
            {tier && (
              <span className={`relationship-detail-header__tier ${getTierClass(tier)}`}>
                {tier}
              </span>
            )}
          </div>
        </div>

        {hasSignData && (
          <div className="relationship-detail-header__placements">
            <div className="placement-person">
              <span className="placement-name">{userAName}:</span>
              {userASun && (
                <span className="placement-sign">
                  {SIGN_GLYPHS[userASun]} {userASun}
                </span>
              )}
              {userAMoon && (
                <span className="placement-sign moon">
                  {SIGN_GLYPHS[userAMoon]} {userAMoon}
                </span>
              )}
            </div>
            <div className="placement-person">
              <span className="placement-name">{userBName}:</span>
              {userBSun && (
                <span className="placement-sign">
                  {SIGN_GLYPHS[userBSun]} {userBSun}
                </span>
              )}
              {userBMoon && (
                <span className="placement-sign moon">
                  {SIGN_GLYPHS[userBMoon]} {userBMoon}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

export default RelationshipDetailHeader;
