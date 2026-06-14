import React from 'react';
import './RelationshipSidebar.css';
import { getRelationshipSummary } from '../../../Utilities/relationshipSummary';

const CLUSTER_ICONS = {
  Harmony: '\u{1F495}',
  Passion: '\u{1F525}',
  Connection: '\u{1F9E0}',
  Stability: '\u{1F48E}',
  Growth: '\u{1F331}'
};

const ORDERED_CLUSTERS = ['Harmony', 'Passion', 'Connection', 'Stability', 'Growth'];

const SECTIONS = [
  { id: 'overview', label: 'Overview' },
  { id: 'scores', label: 'Scores' },
  { id: 'charts', label: 'Charts' },
  { id: 'analysis', label: '360 Analysis' }
];

function scoreColorClass(score) {
  if (typeof score !== 'number') return '';
  if (score >= 80) return 'green';
  if (score >= 50) return 'gold';
  return 'orange';
}

function countAspectsByType(aspects) {
  if (!Array.isArray(aspects)) return { harmonious: 0, challenging: 0 };
  let harmonious = 0;
  let challenging = 0;
  aspects.forEach((aspect) => {
    const type = aspect?.aspectType?.toLowerCase();
    if (type === 'trine' || type === 'sextile') harmonious += 1;
    else if (type === 'square' || type === 'opposition') challenging += 1;
  });
  return { harmonious, challenging };
}

function getInitial(name) {
  return (name?.trim()?.charAt(0) || '?').toUpperCase();
}

function silhouette(idSuffix, opacity = 0.18) {
  return (
    <svg
      className="rd-pair-avatars__silhouette"
      viewBox="0 0 64 64"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id={`rdSil-${idSuffix}`} cx="50%" cy="48%" r="55%">
          <stop offset="0%" stopColor={`rgba(255,255,255,${opacity + 0.04})`} />
          <stop offset="60%" stopColor="rgba(0,0,0,0)" />
        </radialGradient>
      </defs>
      <ellipse cx="32" cy="34" rx="22" ry="26" fill={`url(#rdSil-${idSuffix})`} />
      <ellipse cx="32" cy="22" rx="10" ry="14" fill="rgba(0,0,0,0.18)" />
      <ellipse cx="32" cy="58" rx="22" ry="10" fill="rgba(0,0,0,0.22)" />
    </svg>
  );
}

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
  const { label, blurb, dominantClusters, headline } = getRelationshipSummary(overall);
  const aspectCounts = countAspectsByType(synastryAspects);

  const userAFirst = relationship?.userA_firstName || relationship?.userA_name?.split(' ')[0] || 'Person A';
  const userBFirst = relationship?.userB_firstName || relationship?.userB_name?.split(' ')[0] || 'Person B';
  const userAName =
    relationship?.userA_firstName
      ? `${relationship.userA_firstName} ${relationship?.userA_lastName || ''}`.trim()
      : relationship?.userA_name || 'Person A';
  const userBName =
    relationship?.userB_firstName
      ? `${relationship.userB_firstName} ${relationship?.userB_lastName || ''}`.trim()
      : relationship?.userB_name || 'Person B';
  const userAPhoto = relationship?.userA_profilePhotoUrl || relationship?.userA_photoUrl;
  const userBPhoto = relationship?.userB_profilePhotoUrl || relationship?.userB_photoUrl;

  const dominantCluster = dominantClusters?.[0] || overall?.dominantCluster;
  const challengeCluster = overall?.challengeCluster;
  const dominantScore = dominantCluster && clusters?.[dominantCluster]?.score;
  const challengeScore = challengeCluster && clusters?.[challengeCluster]?.score;

  return (
    <nav className="rd-section-nav" aria-label="Relationship sections">
      <div className="rd-pair-profile">
        <div className="rd-pair-avatars">
          <div className="rd-pair-avatars__halo" />
          <div className="rd-pair-avatars__av">
            {userAPhoto ? (
              <img className="rd-pair-avatars__img" src={userAPhoto} alt={userAName} />
            ) : (
              <>
                {silhouette(`a-${relationship?._id || 'sample'}`)}
                <span className="rd-pair-avatars__initial">{getInitial(userAFirst)}</span>
              </>
            )}
          </div>
          <div className="rd-pair-avatars__av right">
            {userBPhoto ? (
              <img className="rd-pair-avatars__img" src={userBPhoto} alt={userBName} />
            ) : (
              <>
                {silhouette(`b-${relationship?._id || 'sample'}`, 0.22)}
                <span className="rd-pair-avatars__initial">{getInitial(userBFirst)}</span>
              </>
            )}
          </div>
        </div>

        <div className="rd-pair-name">{userAFirst} &amp; {userBFirst}</div>
        {headline && (
          <div className="rd-pair-strength">
            <div className="rd-pair-strength__label">Relationship Strength</div>
            <div className="rd-pair-strength__main">
              <span className="rd-pair-strength__score">{Math.round(headline.strengthScore)}</span>
              <span className="rd-pair-strength__unit">connection</span>
            </div>
            {headline.flavorPresent && headline.flavorCluster && (
              <div className="rd-pair-strength__tag">{headline.flavorCluster}-Forward</div>
            )}
          </div>
        )}
        {label && <div className="rd-pair-arche">{label}</div>}
        {blurb && <p className="rd-pair-summary">{blurb}</p>}

        {dominantCluster && (
          <div className="rd-stat-block">
            <div className="rd-stat-block__label">Strongest</div>
            <div className="rd-stat-row">
              <div className="rd-stat-row__ic">{CLUSTER_ICONS[dominantCluster]}</div>
              <div className="rd-stat-row__nm">
                {dominantCluster} <span className="dash">—</span>
              </div>
              <div className={`rd-stat-row__vv ${scoreColorClass(dominantScore)}`}>
                {dominantScore != null ? `${Math.round(dominantScore)}%` : '—'}
              </div>
            </div>
          </div>
        )}

        {challengeCluster && (
          <div className="rd-stat-block">
            <div className="rd-stat-block__label">Growth Area</div>
            <div className="rd-stat-row">
              <div className="rd-stat-row__ic">{CLUSTER_ICONS[challengeCluster]}</div>
              <div className="rd-stat-row__nm">
                {challengeCluster} <span className="dash">—</span>
              </div>
              <div className={`rd-stat-row__vv ${scoreColorClass(challengeScore)}`}>
                {challengeScore != null ? `${Math.round(challengeScore)}%` : '—'}
              </div>
            </div>
          </div>
        )}

        {synastryAspects.length > 0 && (
          <div className="rd-syn-block">
            <div className="rd-stat-block__label">Synastry Aspects</div>
            <div className="rd-syn-block__row">
              <span className="rd-syn-block__row-k">Harmonious</span>
              <span className="rd-syn-block__row-v green">{aspectCounts.harmonious}</span>
            </div>
            <div className="rd-syn-block__row">
              <span className="rd-syn-block__row-k">Challenging</span>
              <span className="rd-syn-block__row-v rose">{aspectCounts.challenging}</span>
            </div>
          </div>
        )}

        {clusters && (
          <div className="rd-stat-block">
            <div className="rd-stat-block__label">All Dimensions</div>
            {ORDERED_CLUSTERS.map((cluster) => {
              const score = clusters[cluster]?.score;
              if (score === undefined) return null;
              return (
                <div key={cluster} className="rd-stat-row">
                  <div className="rd-stat-row__ic">{CLUSTER_ICONS[cluster]}</div>
                  <div className="rd-stat-row__nm">
                    {cluster} <span className="dash">—</span>
                  </div>
                  <div className={`rd-stat-row__vv ${scoreColorClass(score)}`}>
                    {Math.round(score)}%
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="rd-tabs" role="tablist">
        {SECTIONS.map((section) => {
          const isLocked = lockedSections.includes(section.id);
          const isActive = activeSection === section.id;
          return (
            <button
              key={section.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`rd-tab${isActive ? ' active' : ''}`}
              onClick={() => onSectionChange(section.id)}
            >
              {section.label}
              {isLocked && (
                <span className="rd-tab__lock" aria-hidden="true">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z" />
                  </svg>
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export default RelationshipSidebar;
