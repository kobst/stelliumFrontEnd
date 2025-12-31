import React from 'react';
import './RelationshipQuickFacts.css';

// Cluster icons
const CLUSTER_ICONS = {
  Harmony: '\u{1F495}',
  Passion: '\u{1F525}',
  Connection: '\u{1F9E0}',
  Stability: '\u{1F48E}',
  Growth: '\u{1F331}'
};

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

// Count aspects by type
const countAspectsByType = (aspects) => {
  if (!aspects || !Array.isArray(aspects)) return { harmonious: 0, challenging: 0 };

  let harmonious = 0;
  let challenging = 0;

  aspects.forEach(aspect => {
    const type = aspect.aspectType?.toLowerCase();
    if (type === 'trine' || type === 'sextile') {
      harmonious++;
    } else if (type === 'square' || type === 'opposition') {
      challenging++;
    }
  });

  return { harmonious, challenging };
};

// Get sign from planets array
const getSign = (planets, planetName) => {
  if (!planets || !Array.isArray(planets)) return null;
  const planet = planets.find(p => p.name === planetName);
  return planet?.sign || null;
};

function RelationshipQuickFacts({ relationship }) {
  const clusterAnalysis = relationship?.clusterScoring || relationship?.clusterAnalysis;
  const overall = clusterAnalysis?.overall;
  const clusters = clusterAnalysis?.clusters;
  const synastryAspects = relationship?.synastryAspects || [];

  const aspectCounts = countAspectsByType(synastryAspects);

  // Try to get Sun signs from birth charts if available
  const userAPlanets = relationship?.userA_birthChart?.planets;
  const userBPlanets = relationship?.userB_birthChart?.planets;
  const userASun = getSign(userAPlanets, 'Sun');
  const userBSun = getSign(userBPlanets, 'Sun');

  // Get strongest and challenge clusters
  const dominantCluster = overall?.dominantCluster;
  const challengeCluster = overall?.challengeCluster;
  const dominantScore = dominantCluster && clusters?.[dominantCluster]?.score;
  const challengeScore = challengeCluster && clusters?.[challengeCluster]?.score;

  return (
    <aside className="relationship-quick-facts">
      <h3 className="relationship-quick-facts__title">Relationship Overview</h3>

      {/* Overall Score */}
      {overall?.score !== undefined && (
        <div className="relationship-quick-facts__section">
          <span className="relationship-quick-facts__label">Overall Score</span>
          <div className="relationship-quick-facts__score">
            <span className="score-value">{Math.round(overall.score)}</span>
            <span className="score-percent">%</span>
          </div>
        </div>
      )}

      {/* Tier/Status */}
      {overall?.tier && (
        <div className="relationship-quick-facts__section">
          <span className="relationship-quick-facts__label">Status</span>
          <span className={`relationship-quick-facts__tier ${getTierClass(overall.tier)}`}>
            {overall.tier}
          </span>
        </div>
      )}

      {/* Strongest Cluster */}
      {dominantCluster && (
        <div className="relationship-quick-facts__section">
          <span className="relationship-quick-facts__label">Strongest</span>
          <div className="relationship-quick-facts__cluster">
            <span className="cluster-icon">{CLUSTER_ICONS[dominantCluster] || ''}</span>
            <span className="cluster-name">{dominantCluster}</span>
            {dominantScore && (
              <span className="cluster-score">({Math.round(dominantScore)}%)</span>
            )}
          </div>
        </div>
      )}

      {/* Growth Area */}
      {challengeCluster && (
        <div className="relationship-quick-facts__section">
          <span className="relationship-quick-facts__label">Growth Area</span>
          <div className="relationship-quick-facts__cluster challenge">
            <span className="cluster-icon">{CLUSTER_ICONS[challengeCluster] || ''}</span>
            <span className="cluster-name">{challengeCluster}</span>
            {challengeScore && (
              <span className="cluster-score">({Math.round(challengeScore)}%)</span>
            )}
          </div>
        </div>
      )}

      {/* Sun Pairing */}
      {(userASun || userBSun) && (
        <div className="relationship-quick-facts__section">
          <span className="relationship-quick-facts__label">Sun Pairing</span>
          <div className="relationship-quick-facts__pairing">
            {userASun && (
              <span className="sign-display">
                {userASun} {SIGN_GLYPHS[userASun] || ''}
              </span>
            )}
            {userASun && userBSun && <span className="pairing-separator">&</span>}
            {userBSun && (
              <span className="sign-display">
                {userBSun} {SIGN_GLYPHS[userBSun] || ''}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Synastry Aspects */}
      {synastryAspects.length > 0 && (
        <div className="relationship-quick-facts__section">
          <span className="relationship-quick-facts__label">Synastry Aspects</span>
          <div className="relationship-quick-facts__aspects">
            <div className="aspect-count harmonious">
              <span className="count-label">Harmonious:</span>
              <span className="count-value">{aspectCounts.harmonious}</span>
            </div>
            <div className="aspect-count challenging">
              <span className="count-label">Challenging:</span>
              <span className="count-value">{aspectCounts.challenging}</span>
            </div>
          </div>
        </div>
      )}

      {/* All Clusters Summary */}
      {clusters && (
        <div className="relationship-quick-facts__section clusters-summary">
          <span className="relationship-quick-facts__label">All Dimensions</span>
          <div className="relationship-quick-facts__clusters-list">
            {['Harmony', 'Passion', 'Connection', 'Stability', 'Growth'].map(cluster => {
              const score = clusters[cluster]?.score;
              if (score === undefined) return null;
              return (
                <div key={cluster} className="cluster-row">
                  <span className="cluster-icon-small">{CLUSTER_ICONS[cluster]}</span>
                  <span className="cluster-name-small">{cluster}</span>
                  <span className="cluster-score-small">{Math.round(score)}%</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </aside>
  );
}

export default RelationshipQuickFacts;
