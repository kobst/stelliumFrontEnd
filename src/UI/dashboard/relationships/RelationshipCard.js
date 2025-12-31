import React from 'react';
import './RelationshipCard.css';

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

// Get sign from planets array
const getSign = (planets, planetName) => {
  if (!planets || !Array.isArray(planets)) return null;
  const planet = planets.find(p => p.name === planetName);
  return planet?.sign || null;
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

function RelationshipCard({ relationship, onClick }) {
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
    <div className="relationship-card" onClick={onClick}>
      <div className="relationship-card__names">
        <span className="relationship-card__name">{userAName}</span>
        <span className="relationship-card__connector">&</span>
        <span className="relationship-card__name">{userBName}</span>
      </div>

      {hasSignData && (
        <div className="relationship-card__signs">
          <div className="relationship-card__signs-row">
            <span className="relationship-card__sign-pair">
              {userASun && (
                <span className="relationship-card__sign" title={`${userAName}: ${userASun} Sun`}>
                  <span className="sign-glyph">{SIGN_GLYPHS[userASun] || '?'}</span>
                </span>
              )}
              {userBSun && (
                <>
                  <span className="sign-separator">-</span>
                  <span className="relationship-card__sign" title={`${userBName}: ${userBSun} Sun`}>
                    <span className="sign-glyph">{SIGN_GLYPHS[userBSun] || '?'}</span>
                  </span>
                </>
              )}
            </span>
          </div>
          {(userAMoon || userBMoon) && (
            <div className="relationship-card__signs-row moon-row">
              <span className="relationship-card__sign-pair">
                {userAMoon && (
                  <span className="relationship-card__sign moon" title={`${userAName}: ${userAMoon} Moon`}>
                    <span className="sign-glyph">{SIGN_GLYPHS[userAMoon] || '?'}</span>
                  </span>
                )}
                {userBMoon && (
                  <>
                    <span className="sign-separator">-</span>
                    <span className="relationship-card__sign moon" title={`${userBName}: ${userBMoon} Moon`}>
                      <span className="sign-glyph">{SIGN_GLYPHS[userBMoon] || '?'}</span>
                    </span>
                  </>
                )}
              </span>
            </div>
          )}
        </div>
      )}

      {score !== undefined && score !== null && (
        <div className="relationship-card__score">
          <span className="relationship-card__score-value">{Math.round(score)}</span>
          <span className="relationship-card__score-percent">%</span>
        </div>
      )}

      {tier && (
        <div className={`relationship-card__tier ${getTierClass(tier)}`}>
          {tier}
        </div>
      )}

      <div className="relationship-card__action">
        View Details
      </div>
    </div>
  );
}

export default RelationshipCard;
