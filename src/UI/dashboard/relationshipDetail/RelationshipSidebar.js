import React from 'react';
import './RelationshipSidebar.css';

// Cluster icons
const CLUSTER_ICONS = {
  Harmony: '\u{1F495}',
  Passion: '\u{1F525}',
  Connection: '\u{1F9E0}',
  Stability: '\u{1F48E}',
  Growth: '\u{1F331}'
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

const SECTIONS = [
  { id: 'overview', label: 'Overview' },
  { id: 'scores', label: 'Score' },
  { id: 'charts', label: 'Charts' },
  { id: 'analysis', label: '360 Analysis' }
];

function RelationshipSidebar({
  relationship,
  activeSection,
  onSectionChange,
  lockedSections = []
}) {
  const clusterAnalysis = relationship?.clusterScoring || relationship?.clusterAnalysis;
  const overall = clusterAnalysis?.overall;
  const clusters = clusterAnalysis?.clusters;
  const synastryAspects = relationship?.synastryAspects || [];

  const aspectCounts = countAspectsByType(synastryAspects);

  // Get partner info (Person B)
  const partnerName = relationship?.userB_name || 'Partner';
  const partnerPhoto = relationship?.userB_photoUrl || relationship?.userB_profilePhotoUrl;
  const userBPlanets = relationship?.userB_birthChart?.planets;
  const partnerSun = getSign(userBPlanets, 'Sun');

  // Get strongest and challenge clusters
  const dominantCluster = overall?.dominantCluster;
  const challengeCluster = overall?.challengeCluster;
  const dominantScore = dominantCluster && clusters?.[dominantCluster]?.score;
  const challengeScore = challengeCluster && clusters?.[challengeCluster]?.score;

  // Get compatibility description
  const compatDescription = overall?.description || 'Highly compatible with strong connection';

  return (
    <aside className="relationship-sidebar">
      {/* Info Card - Profile + Stats */}
      <div className="relationship-sidebar__card">
        {/* Profile Section */}
        <div className="relationship-sidebar__profile">
          <div className="profile-header">
            {partnerPhoto ? (
              <img
                src={partnerPhoto}
                alt={partnerName}
                className="profile-photo"
              />
            ) : (
              <div className="profile-photo profile-photo--placeholder">
                {partnerName.charAt(0)}
              </div>
            )}
            <div className="profile-score">
              <span className="score-label">Overall Score</span>
              <span className="score-value">
                {overall?.score !== undefined ? `${Math.round(overall.score)}%` : '--'}
              </span>
            </div>
          </div>

          <h2 className="profile-name">{partnerName}</h2>
          {partnerSun && <span className="profile-sign">{partnerSun}</span>}

          <p className="profile-description">{compatDescription}</p>

          {overall?.tier && (
            <span className={`profile-tier ${getTierClass(overall.tier)}`}>
              {overall.tier}
            </span>
          )}
        </div>

        {/* Stats Section */}
        <div className="relationship-sidebar__stats">
        {/* Strongest */}
        {dominantCluster && (
          <div className="stat-group">
            <span className="stat-label">Strongest</span>
            <div className="stat-row">
              <span className="stat-icon">{CLUSTER_ICONS[dominantCluster]}</span>
              <span className="stat-name">{dominantCluster}</span>
              <span className="stat-separator">-</span>
              <span className="stat-value">{dominantScore ? `${Math.round(dominantScore)}%` : '--'}</span>
            </div>
          </div>
        )}

        {/* Growth Area */}
        {challengeCluster && (
          <div className="stat-group">
            <span className="stat-label">Growth Area</span>
            <div className="stat-row">
              <span className="stat-icon">{CLUSTER_ICONS[challengeCluster]}</span>
              <span className="stat-name">{challengeCluster}</span>
              <span className="stat-separator">-</span>
              <span className="stat-value">{challengeScore ? `${Math.round(challengeScore)}%` : '--'}</span>
            </div>
          </div>
        )}

        {/* Synastry Aspects */}
        {synastryAspects.length > 0 && (
          <div className="stat-group stat-group--with-divider">
            <span className="stat-label stat-label--centered">Synastry Aspects</span>
            <div className="stat-row">
              <span className="stat-name">Harmonious</span>
              <span className="stat-separator">-</span>
              <span className="stat-value harmonious">{aspectCounts.harmonious}</span>
            </div>
            <div className="stat-row">
              <span className="stat-name">Challenging</span>
              <span className="stat-separator">-</span>
              <span className="stat-value challenging">{aspectCounts.challenging}</span>
            </div>
          </div>
        )}

        {/* All Dimensions */}
        {clusters && (
          <div className="stat-group stat-group--with-divider">
            <span className="stat-label stat-label--centered">All Dimensions</span>
            {['Harmony', 'Passion', 'Connection', 'Stability', 'Growth'].map(cluster => {
              const score = clusters[cluster]?.score;
              if (score === undefined) return null;
              return (
                <div key={cluster} className="stat-row">
                  <span className="stat-icon">{CLUSTER_ICONS[cluster]}</span>
                  <span className="stat-name">{cluster}</span>
                  <span className="stat-separator">-</span>
                  <span className="stat-value">{Math.round(score)}%</span>
                </div>
              );
            })}
          </div>
        )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="relationship-sidebar__nav">
        {SECTIONS.map(section => {
          const isLocked = lockedSections.includes(section.id);
          const isActive = activeSection === section.id;

          return (
            <button
              key={section.id}
              className={`nav-item ${isActive ? 'nav-item--active' : ''} ${isLocked ? 'nav-item--locked' : ''}`}
              onClick={() => onSectionChange(section.id)}
            >
              {section.label}
              {isLocked && (
                <svg className="lock-icon" width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"/>
                </svg>
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

export default RelationshipSidebar;
