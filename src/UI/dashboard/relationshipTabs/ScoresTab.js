import React, { useState } from 'react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  RadarController
} from 'chart.js';
import { Radar } from 'react-chartjs-2';
import AnalysisPromptCard from '../../shared/AnalysisPromptCard';
import AskStelliumPanel from '../../askStellium/AskStelliumPanel';
import AskStelliumCta from '../chartTabs/AskStelliumCta';
import './RelationshipTabs.css';
import { getRelationshipSummary } from '../../../Utilities/relationshipSummary';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, RadarController);

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

function ScoresTab({
  relationship,
  hasAnalysis,
  onNavigateToAnalysis,
  creditCost,
  creditsRemaining,
  compositeId,
  isCelebrity = false,
  canUseAskStellium = false
}) {
  const [expandedCluster, setExpandedCluster] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);

  // Get cluster data from relationship
  const clusterAnalysis = relationship?.clusterScoring || relationship?.clusterAnalysis;
  const clusters = clusterAnalysis?.clusters;
  const overall = clusterAnalysis?.overall;
  const allScoredItems = clusterAnalysis?.scoredItems || [];
  const { label, blurb } = getRelationshipSummary(overall);

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

  const chatPanel = !isCelebrity && canUseAskStellium ? (
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
          <h2 className="scores-header__title">Compatibility</h2>
          {!isCelebrity && (
            <AskStelliumCta
              hasFullAccess={canUseAskStellium}
              onActivate={() => setChatOpen(true)}
            />
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

  return (
    <div className="scores-tab-redesign">
      {/* Header */}
        <div className="scores-header">
          <h2 className="scores-header__title">{label || 'Compatibility Score'}</h2>
        {!isCelebrity && (
          <AskStelliumCta
            hasFullAccess={canUseAskStellium}
            onActivate={() => setChatOpen(true)}
          />
        )}
      </div>

      {blurb && (
        <div className="scores-summary-card">
          <span className="scores-summary-card__label">Relationship Summary</span>
          <p className="scores-summary-card__body">{blurb}</p>
        </div>
      )}

      {/* Radar Chart */}
      <div className="scores-radar-wrapper">
        <Radar
          data={{
            labels: orderedClusters.map(c => `${CLUSTER_ICONS[c]} ${c}`),
            datasets: [{
              data: orderedClusters.map(c => getClusterScore(c)),
              backgroundColor: 'rgba(139, 92, 246, 0.15)',
              borderColor: 'rgba(139, 92, 246, 0.9)',
              pointBackgroundColor: orderedClusters.map(c => {
                const s = getClusterScore(c);
                return `rgba(139, 92, 246, ${0.5 + (s / 100) * 0.5})`;
              }),
              pointBorderColor: '#fff',
              pointRadius: 4,
              pointHoverRadius: 6,
              borderWidth: 2,
              fill: true,
            }]
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              r: {
                beginAtZero: true,
                min: 0,
                max: 100,
                ticks: {
                  stepSize: 25,
                  color: 'rgba(255, 255, 255, 0.4)',
                  font: { size: 10 },
                  callback: v => v === 0 || v === 100 ? '' : v + '%',
                  backdropColor: 'transparent'
                },
                grid: {
                  color: 'rgba(255, 255, 255, 0.12)',
                  circular: true
                },
                angleLines: { color: 'rgba(255, 255, 255, 0.08)' },
                pointLabels: {
                  color: 'rgba(255, 255, 255, 0.85)',
                  font: { size: 12, weight: '500' },
                  padding: 20
                }
              }
            },
            plugins: {
              legend: { display: false },
              tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                borderColor: 'rgba(139, 92, 246, 0.5)',
                borderWidth: 1,
                cornerRadius: 8,
                padding: 10,
                callbacks: {
                  label: ctx => `${ctx.parsed.r}%`
                }
              }
            }
          }}
        />
      </div>

      {/* Dimension Rows */}
      <div className="scores-dimensions">
        {orderedClusters.map(cluster => {
          const score = getClusterScore(cluster);
          const clusterData = clusters[cluster];
          const isExpanded = expandedCluster === cluster;
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
