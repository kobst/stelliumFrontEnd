import React, { useState } from 'react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  RadarController
} from 'chart.js';
import { Radar } from 'react-chartjs-2';
import './RelationshipTabs.css';

// Register Chart.js components
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  RadarController
);

function ScoresTab({ relationship }) {
  const [selectedCluster, setSelectedCluster] = useState(null);

  // Get cluster data from relationship
  const clusterAnalysis = relationship?.clusterScoring || relationship?.clusterAnalysis;
  const clusters = clusterAnalysis?.clusters;
  const overall = clusterAnalysis?.overall;

  // 5-Cluster categories
  const clusterCategories = {
    Harmony: "Harmony",
    Passion: "Passion",
    Connection: "Connection",
    Stability: "Stability",
    Growth: "Growth"
  };

  // Cluster icons
  const clusterIcons = {
    Harmony: "💕",
    Passion: "🔥",
    Connection: "🧠",
    Stability: "💎",
    Growth: "🌱"
  };

  // Cluster descriptions
  const clusterDescriptions = {
    Harmony: "Overall compatibility and ease in the relationship",
    Passion: "Sexual chemistry and physical attraction",
    Connection: "Emotional and mental bonding",
    Stability: "Long-term potential and commitment",
    Growth: "Transformative potential and personal evolution"
  };

  const orderedClusters = ['Harmony', 'Passion', 'Connection', 'Stability', 'Growth'];

  // Get cluster scores
  const getClusterScore = (clusterKey) => {
    return clusters?.[clusterKey]?.score || 0;
  };

  const dataPoints = orderedClusters.map(cluster => getClusterScore(cluster));

  const chartData = {
    labels: orderedClusters.map(cluster => `${clusterIcons[cluster]} ${clusterCategories[cluster]}`),
    datasets: [
      {
        label: 'Cluster Score',
        data: dataPoints,
        backgroundColor: 'rgba(236, 72, 153, 0.15)',
        borderColor: 'rgba(236, 72, 153, 0.9)',
        pointBackgroundColor: orderedClusters.map(cluster => {
          const score = getClusterScore(cluster);
          const opacity = 0.5 + (score / 100) * 0.5;
          return `rgba(236, 72, 153, ${opacity})`;
        }),
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(236, 72, 153, 1)',
        pointRadius: 5,
        pointHoverRadius: 7,
        borderWidth: 3,
        fill: true,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        beginAtZero: true,
        min: 0,
        max: 100,
        ticks: {
          stepSize: 25,
          color: 'rgba(255, 255, 255, 0.5)',
          font: { size: 10 },
          callback: function(value) {
            if (value === 0 || value === 100) return '';
            return value + '%';
          },
          backdropColor: 'transparent'
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.15)',
          circular: true
        },
        angleLines: {
          color: 'rgba(255, 255, 255, 0.1)',
          lineWidth: 1
        },
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
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(236, 72, 153, 0.5)',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        callbacks: {
          label: function(context) {
            return `${context.parsed.r}% compatibility`;
          }
        }
      }
    }
  };

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

  // If no cluster data available
  if (!clusters) {
    return (
      <div className="relationship-tab-content scores-tab">
        <div className="scores-empty">
          <div className="empty-icon">📊</div>
          <h3>No Score Data</h3>
          <p>Compatibility scores are not yet available for this relationship.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relationship-tab-content scores-tab">
      {/* Overall Score Banner */}
      {overall && (
        <div className="overall-score-banner">
          <div className="overall-main">
            <div className="overall-score-circle">
              <span className="overall-score-value">{Math.round(overall.score || 0)}</span>
              <span className="overall-score-label">Overall</span>
            </div>
            {overall.tier && (
              <span className={`overall-tier ${getTierClass(overall.tier)}`}>
                {overall.tier}
              </span>
            )}
          </div>
          {overall.profile && (
            <p className="overall-profile">{overall.profile}</p>
          )}
          <div className="overall-clusters">
            {overall.dominantCluster && (
              <div className="cluster-highlight dominant">
                <span className="highlight-label">Strongest:</span>
                <span className="highlight-value">
                  {clusterIcons[overall.dominantCluster]} {overall.dominantCluster}
                </span>
              </div>
            )}
            {overall.challengeCluster && (
              <div className="cluster-highlight challenge">
                <span className="highlight-label">Growth Area:</span>
                <span className="highlight-value">
                  {clusterIcons[overall.challengeCluster]} {overall.challengeCluster}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Radar Chart */}
      <div className="radar-chart-section">
        <div className="radar-chart-container">
          <Radar data={chartData} options={chartOptions} />
        </div>
      </div>

      {/* Cluster Cards */}
      <div className="cluster-cards-section">
        <h3 className="section-title">Compatibility Dimensions</h3>
        <div className="cluster-cards-grid">
          {orderedClusters.map(cluster => {
            const score = getClusterScore(cluster);
            const clusterData = clusters[cluster];
            const isSelected = selectedCluster === cluster;

            return (
              <div
                key={cluster}
                className={`cluster-card ${isSelected ? 'selected' : ''}`}
                onClick={() => setSelectedCluster(isSelected ? null : cluster)}
              >
                <div className="cluster-card-header">
                  <span className="cluster-icon">{clusterIcons[cluster]}</span>
                  <span className="cluster-name">{clusterCategories[cluster]}</span>
                </div>
                <div className="cluster-score-display">
                  <span className="cluster-score-value">{Math.round(score)}</span>
                  <span className="cluster-score-percent">%</span>
                </div>
                {clusterData?.quadrant && (
                  <div className="cluster-quadrant">{clusterData.quadrant}</div>
                )}
                {isSelected && (
                  <div className="cluster-details">
                    <p className="cluster-description">{clusterDescriptions[cluster]}</p>
                    {clusterData && (
                      <div className="cluster-metrics">
                        <div className="metric">
                          <span className="metric-label">Support</span>
                          <span className="metric-value">{clusterData.supportPct || 0}%</span>
                        </div>
                        <div className="metric">
                          <span className="metric-label">Challenge</span>
                          <span className="metric-value">{clusterData.challengePct || 0}%</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <p className="scores-hint">Click on a cluster card to see more details</p>
    </div>
  );
}

export default ScoresTab;
