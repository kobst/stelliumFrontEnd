import React, { useState } from 'react';
import './RelationshipTabs.css';

// Cluster colors for bar chart
const CLUSTER_COLORS = {
  Harmony: '#5eead4',     // teal
  Passion: '#fda4af',     // salmon/pink
  Connection: '#f0abfc',  // magenta/pink
  Stability: '#c4b5fd',   // lavender
  Growth: '#86efac'       // green
};

// Cluster icons
const CLUSTER_ICONS = {
  Harmony: '💕',
  Passion: '🔥',
  Connection: '🧠',
  Stability: '💎',
  Growth: '🌱'
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

function ScoresTab({ relationship }) {
  const [selectedCluster, setSelectedCluster] = useState('Harmony');

  // Get cluster data from relationship
  const clusterAnalysis = relationship?.clusterScoring || relationship?.clusterAnalysis;
  const clusters = clusterAnalysis?.clusters;
  const overall = clusterAnalysis?.overall;

  const orderedClusters = ['Harmony', 'Passion', 'Connection', 'Stability', 'Growth'];

  // Get cluster scores
  const getClusterScore = (clusterKey) => {
    return clusters?.[clusterKey]?.score || 0;
  };

  // If no cluster data available
  if (!clusters) {
    return (
      <div className="scores-tab-redesign">
        <div className="scores-header">
          <h2 className="scores-header__title">Compatibility Score</h2>
          <div className="scores-header__icon">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="20" stroke="url(#scoreGradient)" strokeWidth="2" strokeDasharray="4 4" />
              <circle cx="24" cy="24" r="12" stroke="url(#scoreGradient)" strokeWidth="1.5" opacity="0.6" />
              <defs>
                <linearGradient id="scoreGradient" x1="0" y1="0" x2="48" y2="48">
                  <stop stopColor="#60a5fa" />
                  <stop offset="1" stopColor="#a78bfa" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
        <div className="scores-body">
          <div className="scores-empty-state">
            <span className="empty-icon">📊</span>
            <h3>No Score Data</h3>
            <p>Compatibility scores are not yet available for this relationship.</p>
          </div>
        </div>
      </div>
    );
  }

  const selectedClusterData = clusters[selectedCluster];
  const selectedScore = getClusterScore(selectedCluster);

  return (
    <div className="scores-tab-redesign">
      {/* Header */}
      <div className="scores-header">
        <h2 className="scores-header__title">Compatibility Score</h2>
        <div className="scores-header__icon">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="20" stroke="url(#scoreGradient)" strokeWidth="2" strokeDasharray="4 4" />
            <circle cx="24" cy="24" r="12" stroke="url(#scoreGradient)" strokeWidth="1.5" opacity="0.6" />
            <defs>
              <linearGradient id="scoreGradient" x1="0" y1="0" x2="48" y2="48">
                <stop stopColor="#60a5fa" />
                <stop offset="1" stopColor="#a78bfa" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="scores-content">
        {/* Left Column - Bar Chart */}
        <div className="scores-chart-column">
          <div className="bar-chart-container">
            <h3 className="bar-chart-title">ASPECT COMPATIBILITY SCORE</h3>

            {/* Scale Header Row */}
            <div className="bar-chart-scale-row">
              <span className="bar-chart-label-spacer"></span>
              <div className="bar-chart-scale">
                <span>0%</span>
                <span>25%</span>
                <span>50%</span>
                <span>75%</span>
                <span>100%</span>
              </div>
              <span className="bar-chart-value-spacer"></span>
            </div>

            {/* Bars */}
            <div className="bar-chart-bars">
              {orderedClusters.map(cluster => {
                const score = getClusterScore(cluster);
                const isSelected = selectedCluster === cluster;
                return (
                  <div
                    key={cluster}
                    className={`bar-chart-row ${isSelected ? 'bar-chart-row--selected' : ''}`}
                    onClick={() => setSelectedCluster(cluster)}
                  >
                    <span className="bar-chart-label">{cluster}</span>
                    <div className="bar-chart-track">
                      <div
                        className="bar-chart-fill"
                        style={{
                          width: `${score}%`,
                          backgroundColor: CLUSTER_COLORS[cluster]
                        }}
                      />
                    </div>
                    <span className="bar-chart-value">{Math.round(score)}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column - Cluster Cards */}
        <div className="scores-cards-column">
          {orderedClusters.map(cluster => {
            const score = getClusterScore(cluster);
            const clusterData = clusters[cluster];
            const isSelected = selectedCluster === cluster;
            const statusLabel = getStatusLabel(score);
            const statusClass = getStatusClass(score);

            return (
              <div
                key={cluster}
                className={`cluster-detail-card ${isSelected ? 'cluster-detail-card--selected' : ''}`}
                onClick={() => setSelectedCluster(cluster)}
              >
                <div className="cluster-detail-card__header">
                  <div className="cluster-detail-card__info">
                    <span className="cluster-detail-card__icon">{CLUSTER_ICONS[cluster]}</span>
                    <span className="cluster-detail-card__name">{cluster}</span>
                  </div>
                  <div className="cluster-detail-card__score">
                    <span className="cluster-detail-card__value">{Math.round(score)}%</span>
                    <span className={`cluster-detail-card__status ${statusClass}`}>
                      {statusLabel}
                    </span>
                  </div>
                </div>

                {isSelected && (
                  <div className="cluster-detail-card__body">
                    <p className="cluster-detail-card__description">
                      {CLUSTER_DESCRIPTIONS[cluster]}
                      {overall?.profile && `. ${overall.profile}`}
                    </p>
                    <div className="cluster-detail-card__metrics">
                      <span className="metric-item">
                        <span className="metric-label">Support</span>
                        <span className="metric-separator">-</span>
                        <span className="metric-value">{clusterData?.supportPct || 0}%</span>
                      </span>
                      <span className="metric-item">
                        <span className="metric-label">Challenge</span>
                        <span className="metric-separator">-</span>
                        <span className="metric-value">{clusterData?.challengePct || 0}%</span>
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default ScoresTab;
