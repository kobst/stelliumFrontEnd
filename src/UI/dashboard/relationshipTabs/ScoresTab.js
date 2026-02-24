import React, { useState } from 'react';
import AnalysisPromptCard from '../../shared/AnalysisPromptCard';
import AskStelliumPanel from '../../askStellium/AskStelliumPanel';
import './RelationshipTabs.css';

// Score-band color: green/teal for strong, amber for moderate, coral for weak
const getScoreColor = (score) => {
  if (score >= 75) return 'var(--score-high, #5eead4)';
  if (score >= 50) return 'var(--score-mid, #fbbf24)';
  return 'var(--score-low, #fb923c)';
};

// Cluster icons
const CLUSTER_ICONS = {
  Harmony: '\u{1F495}',
  Passion: '\u{1F525}',
  Connection: '\u{1F9E0}',
  Stability: '\u{1F48E}',
  Growth: '\u{1F331}'
};

// Cluster descriptions
const CLUSTER_DESCRIPTIONS = {
  Harmony: 'Overall compatibility and ease in the relationship',
  Passion: 'Sexual chemistry and physical attraction',
  Connection: 'Emotional and mental bonding',
  Stability: 'Long-term potential and commitment',
  Growth: 'Transformative potential and personal evolution'
};

// Get status label based on score
const getStatusLabel = (score) => {
  if (score >= 70) return 'Easy Going';
  if (score >= 50) return 'Efforts Needed';
  return 'Tough Road';
};

// Get status class based on score
const getStatusClass = (score) => {
  if (score >= 70) return 'status-easy';
  if (score >= 50) return 'status-moderate';
  return 'status-tough';
};

// Get tier class for overall tier pill
const getTierClass = (tier) => {
  if (!tier) return '';
  const t = tier.toLowerCase();
  if (t.includes('thriv')) return 'tier-thriving';
  if (t.includes('flourish')) return 'tier-flourishing';
  if (t.includes('emerg')) return 'tier-emerging';
  if (t.includes('build')) return 'tier-building';
  if (t.includes('develop')) return 'tier-developing';
  return '';
};

// Get initials from a name
const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
};

function ScoresTab({
  relationship,
  hasAnalysis,
  onNavigateToAnalysis,
  creditCost,
  creditsRemaining,
  compositeId,
  isCelebrity = false
}) {
  const [expandedCluster, setExpandedCluster] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);

  // Get cluster data from relationship
  const clusterAnalysis = relationship?.clusterScoring || relationship?.clusterAnalysis;
  const clusters = clusterAnalysis?.clusters;
  const overall = clusterAnalysis?.overall;
  const allScoredItems = clusterAnalysis?.scoredItems || [];

  const orderedClusters = ['Harmony', 'Passion', 'Connection', 'Stability', 'Growth'];

  const getClusterScore = (clusterKey) => {
    return clusters?.[clusterKey]?.score || 0;
  };

  const handleRowClick = (cluster) => {
    setExpandedCluster(prev => prev === cluster ? null : cluster);
  };

  const relationshipScoredItems =
    relationship?.scoredItems ||
    relationship?.clusterAnalysis?.scoredItems ||
    relationship?.clusterScoring?.scoredItems ||
    [];

  const chatPanel = !isCelebrity ? (
    <AskStelliumPanel
      isOpen={chatOpen}
      onClose={() => setChatOpen(false)}
      contentType="relationship"
      contentId={compositeId}
      relationshipScoredItems={relationshipScoredItems}
      contextLabel="About your relationship"
      placeholderText="Ask about your relationship..."
      suggestedQuestions={[
        "What are our relationship strengths?",
        "How can we improve our communication?",
        "What challenges should we be aware of?"
      ]}
    />
  ) : null;

  // If no cluster data available
  if (!clusters) {
    return (
      <div className="scores-tab-redesign">
        <div className="scores-header">
          <h2 className="scores-header__title">Compatibility Score</h2>
          {!isCelebrity && (
            <button className="ask-stellium-trigger" onClick={() => setChatOpen(true)}>
              <span className="ask-stellium-trigger__icon">&#10024;</span>
              Ask Stellium
            </button>
          )}
        </div>
        <div className="scores-body">
          <div className="scores-empty-state">
            <span className="empty-icon">{'\u{1F4CA}'}</span>
            <h3>No Score Data</h3>
            <p>Compatibility scores are not yet available for this relationship.</p>
          </div>
        </div>
        {chatPanel}
      </div>
    );
  }

  const overallScore = overall?.score;
  const overallTier = overall?.tier;

  return (
    <div className="scores-tab-redesign">
      {/* Header */}
      <div className="scores-header">
        <h2 className="scores-header__title">Compatibility Score</h2>
        {!isCelebrity && (
          <button className="ask-stellium-trigger" onClick={() => setChatOpen(true)}>
            <span className="ask-stellium-trigger__icon">&#10024;</span>
            Ask Stellium
          </button>
        )}
      </div>

      {/* Overall Score Header */}
      {overallScore != null && (
        <div className="scores-overall">
          <div className="scores-overall__avatar">
            {relationship.userA_profilePhotoUrl ? (
              <img src={relationship.userA_profilePhotoUrl} alt={relationship.userA_name} />
            ) : (
              <span className="scores-overall__initials">{getInitials(relationship.userA_name)}</span>
            )}
          </div>

          <div className="scores-overall__center">
            <span className="scores-overall__score">{Math.round(overallScore)}%</span>
            <span className="scores-overall__label">Overall Compatibility</span>
            {overallTier && (
              <span className={`scores-overall__tier ${getTierClass(overallTier)}`}>
                {overallTier}
              </span>
            )}
          </div>

          <div className="scores-overall__avatar">
            {relationship.userB_profilePhotoUrl ? (
              <img src={relationship.userB_profilePhotoUrl} alt={relationship.userB_name} />
            ) : (
              <span className="scores-overall__initials">{getInitials(relationship.userB_name)}</span>
            )}
          </div>
        </div>
      )}

      {/* Unified Dimension Rows */}
      <div className="scores-dimensions">
        {orderedClusters.map(cluster => {
          const score = getClusterScore(cluster);
          const clusterData = clusters[cluster];
          const isExpanded = expandedCluster === cluster;
          const statusLabel = getStatusLabel(score);
          const statusClass = getStatusClass(score);

          return (
            <div
              key={cluster}
              className={`scores-dimension-row ${isExpanded ? 'scores-dimension-row--expanded' : ''}`}
              onClick={() => handleRowClick(cluster)}
            >
              <div className="scores-dimension-row__main">
                <span className="scores-dimension-row__icon">{CLUSTER_ICONS[cluster]}</span>
                <span className="scores-dimension-row__name">{cluster}</span>
                <div className="scores-dimension-row__bar-track">
                  <div
                    className="scores-dimension-row__bar-fill"
                    style={{
                      width: `${score}%`,
                      backgroundColor: getScoreColor(score)
                    }}
                  />
                </div>
                <span className="scores-dimension-row__pct">{Math.round(score)}%</span>
                <span className={`scores-dimension-row__tier ${statusClass}`}>
                  {statusLabel}
                </span>
              </div>

              {isExpanded && (
                <div className="scores-dimension-row__detail">
                  <p className="scores-dimension-row__desc">
                    {CLUSTER_DESCRIPTIONS[cluster]}
                  </p>
                  {/* Top aspects */}
                  {allScoredItems.length > 0 && (() => {
                    const clusterItems = allScoredItems
                      .map(item => {
                        const contribution = item.clusterContributions?.find(c => c.cluster === cluster);
                        if (!contribution || contribution.score === 0) return null;
                        return { ...item, clusterScore: contribution.score };
                      })
                      .filter(Boolean)
                      .sort((a, b) => Math.abs(b.clusterScore) - Math.abs(a.clusterScore));
                    const topSupport = clusterItems.find(i => i.clusterScore > 0);
                    const topChallenge = clusterItems.find(i => i.clusterScore < 0);
                    if (!topSupport && !topChallenge) return null;
                    return (
                      <div className="scores-dimension-row__top-aspects">
                        {topSupport && (
                          <span className="scores-top-aspect scores-top-aspect--support">
                            <span className="scores-top-aspect__bullet">●</span>
                            {topSupport.description}
                          </span>
                        )}
                        {topChallenge && (
                          <span className="scores-top-aspect scores-top-aspect--challenge">
                            <span className="scores-top-aspect__bullet">●</span>
                            {topChallenge.description}
                          </span>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 360 Analysis CTA */}
      {!hasAnalysis && onNavigateToAnalysis && (
        <AnalysisPromptCard
          message="Unlock detailed relationship interpretations across all compatibility dimensions."
          onNavigate={onNavigateToAnalysis}
          creditCost={creditCost}
          creditsRemaining={creditsRemaining}
        />
      )}
      {chatPanel}
    </div>
  );
}

export default ScoresTab;
