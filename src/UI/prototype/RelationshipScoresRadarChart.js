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
import './RelationshipScoresRadarChart.css';

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

const RelationshipScoresRadarChart = ({ 
  clusterAnalysis, 
  tensionFlowAnalysis,
  holisticOverview,
  initialOverview,
  isFullAnalysisComplete = false,
  onStartFullAnalysis = null,
  isStartingAnalysis = false
}) => {
  const [selectedCluster, setSelectedCluster] = useState(null);
  const [hoveredCluster, setHoveredCluster] = useState(null);
  
  // 5-Cluster categories from new API
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

  // Helper function to get cluster data
  const getClusterData = (clusterKey) => {
    return clusterAnalysis?.clusters?.[clusterKey] || null;
  };

  // The ordered clusters (consistent with API)
  const orderedClusters = ['Harmony', 'Passion', 'Connection', 'Stability', 'Growth'];
  
  // Get cluster scores from new API structure
  const clusterScores = {};
  orderedClusters.forEach(cluster => {
    const clusterData = getClusterData(cluster);
    clusterScores[cluster] = clusterData?.score || 0;
  });
  
  const dataPoints = orderedClusters.map(cluster => clusterScores[cluster] || 0);
  
  const chartData = {
    labels: orderedClusters.map(cluster => `${clusterIcons[cluster]} ${clusterCategories[cluster]}`),
    datasets: [
      {
        label: 'Cluster Score',
        data: dataPoints,
        backgroundColor: 'rgba(139, 92, 246, 0.15)',
        borderColor: 'rgba(139, 92, 246, 0.9)',
        pointBackgroundColor: orderedClusters.map(cluster => {
          const score = clusterScores[cluster] || 0;
          const opacity = 0.5 + (score / 100) * 0.5; // Scale opacity from 0.5 to 1.0
          return `rgba(139, 92, 246, ${opacity})`;
        }),
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(139, 92, 246, 1)',
        pointRadius: 4,
        pointHoverRadius: 6,
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
          stepSize: 25,  // Creates 3 rings at 25%, 50%, 75%
          color: 'rgba(255, 255, 255, 0.5)',
          font: {
            size: 11
          },
          callback: function(value) {
            if (value === 0) return '';  // Hide 0%
            if (value === 100) return '';  // Hide 100%
            return value + '%';
          },
          backdropColor: 'transparent'
        },
        grid: {
          color: function(context) {
            // Emphasize outermost ring
            if (context.tick.value === 75) {
              return 'rgba(255, 255, 255, 0.3)';
            }
            return 'rgba(255, 255, 255, 0.15)';
          },
          lineWidth: function(context) {
            if (context.tick.value === 75) {
              return 2;
            }
            return 1;
          },
          circular: true
        },
        angleLines: {
          color: 'rgba(255, 255, 255, 0.1)',
          lineWidth: 1
        },
        pointLabels: {
          color: function(context) {
            const index = context.index;
            const clusterKey = orderedClusters[index];
            if (hoveredCluster === clusterKey || selectedCluster === clusterKey) {
              return 'rgba(255, 255, 255, 1)';
            }
            return 'rgba(255, 255, 255, 0.85)';
          },
          font: function(context) {
            const index = context.index;
            const clusterKey = orderedClusters[index];
            if (hoveredCluster === clusterKey || selectedCluster === clusterKey) {
              return {
                size: 14,
                weight: 'bold'
              };
            }
            return {
              size: 13,
              weight: '500'
            };
          },
          padding: 25,
          centerPointLabels: false,  // This aligns labels with spokes instead of between them
          display: true,
          callback: function(value) {
            // Wrap long labels
            const maxLength = 20;
            if (value.length > maxLength) {
              const words = value.split(' ');
              let line1 = '';
              let line2 = '';
              let currentLine = 1;
              
              words.forEach(word => {
                if (currentLine === 1 && (line1 + word).length <= maxLength) {
                  line1 += (line1 ? ' ' : '') + word;
                } else {
                  currentLine = 2;
                  line2 += (line2 ? ' ' : '') + word;
                }
              });
              
              return [line1, line2];
            }
            return value;
          }
        }
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(139, 92, 246, 0.5)',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        callbacks: {
          label: function(context) {
            return `${context.parsed.r}% compatibility`;
          }
        }
      }
    },
    interaction: {
      mode: 'point',
      intersect: false
    },
    onClick: (event, elements, chart) => {
      // Check if clicking on a point
      if (elements.length > 0) {
        const elementIndex = elements[0].index;
        const clusterKey = orderedClusters[elementIndex];
        setSelectedCluster(selectedCluster === clusterKey ? null : clusterKey);
        return;
      }
      
      // Check if clicking on a label
      const canvasPosition = event.native;
      const datasetMeta = chart.getDatasetMeta(0);
      const scale = chart.scales.r;
      
      // Check each label position
      orderedClusters.forEach((clusterKey, index) => {
        const pointPosition = scale.getPointPosition(index, scale.max + scale.options.pointLabels.padding);
        const labelX = pointPosition.x;
        const labelY = pointPosition.y;
        
        // Calculate distance from click to label center (approximate)
        const distance = Math.sqrt(
          Math.pow(canvasPosition.offsetX - labelX, 2) + 
          Math.pow(canvasPosition.offsetY - labelY, 2)
        );
        
        // If click is within ~40 pixels of label position
        if (distance < 40) {
          setSelectedCluster(selectedCluster === clusterKey ? null : clusterKey);
        }
      });
    },
    onHover: (event, elements, chart) => {
      let hovered = null;
      let cursorStyle = 'default';
      
      // Check if hovering over a point
      if (elements.length > 0) {
        const elementIndex = elements[0].index;
        hovered = orderedClusters[elementIndex];
        cursorStyle = 'pointer';
      } else {
        // Check if hovering over a label
        const canvasPosition = event.native;
        const scale = chart.scales.r;
        
        // Check each label position
        orderedClusters.forEach((clusterKey, index) => {
          const pointPosition = scale.getPointPosition(index, scale.max + scale.options.pointLabels.padding);
          const labelX = pointPosition.x;
          const labelY = pointPosition.y;
          
          // Calculate distance from hover to label center (approximate)
          const distance = Math.sqrt(
            Math.pow(canvasPosition.offsetX - labelX, 2) + 
            Math.pow(canvasPosition.offsetY - labelY, 2)
          );
          
          // If hover is within ~40 pixels of label position
          if (distance < 40) {
            hovered = clusterKey;
            cursorStyle = 'pointer';
          }
        });
      }
      
      setHoveredCluster(hovered);
      event.native.target.style.cursor = cursorStyle;
    }
  };

  return (
    <div className="relationship-scores-radar-chart">
      <h2>Relationship Compatibility Analysis</h2>
      
      {/* Initial Overview Display (Phase 1) */}
      {initialOverview && (
        <div className="initial-overview-section" style={{ 
          marginBottom: '25px', 
          padding: '20px', 
          backgroundColor: '#f8f9ff', 
          borderRadius: '8px', 
          border: '2px solid #e0e7ff' 
        }}>
          <div className="overview-content">
            <h3 style={{ color: '#3730a3', marginBottom: '15px' }}>💫 Initial Overview</h3>
            <p className="overview-text" style={{ 
              lineHeight: '1.6', 
              color: '#1f2937', 
              margin: 0, 
              fontSize: '16px' 
            }}>{initialOverview}</p>
          </div>
        </div>
      )}
      
      {/* Overall Score Display (if available) */}
      {clusterAnalysis?.overall && (
        <div className="overall-analysis-banner">
          <div className="overall-score">
            <span className="score-label">Overall Compatibility:</span>
            <span className="score-value">{clusterAnalysis.overall.score}%</span>
          </div>
          {clusterAnalysis.overall.dominantCluster && (
            <div className="dominant-cluster">
              <span className="dominant-label">Strongest Area:</span>
              <span className="dominant-value">
                {clusterIcons[clusterAnalysis.overall.dominantCluster]} {clusterAnalysis.overall.dominantCluster}
              </span>
            </div>
          )}
          {clusterAnalysis.overall.challengeCluster && (
            <div className="challenge-cluster">
              <span className="challenge-label">Growth Area:</span>
              <span className="challenge-value">
                {clusterIcons[clusterAnalysis.overall.challengeCluster]} {clusterAnalysis.overall.challengeCluster}
              </span>
            </div>
          )}
        </div>
      )}
      
      {/* Radar Chart Container */}
      <div className="radar-chart-container">
        <Radar data={chartData} options={chartOptions} />
      </div>

      {/* Basic Cluster Details (Phase 1 - just scores) */}
      {!isFullAnalysisComplete && clusterAnalysis?.clusters && (
        <div className="basic-cluster-display">
          <h3>Compatibility Dimensions</h3>
          <div className="cluster-grid">
            {orderedClusters.map(cluster => {
              const score = clusterScores[cluster] || 0;
              const clusterData = getClusterData(cluster);
              return (
                <div key={cluster} className="cluster-card basic">
                  <div className="cluster-icon">{clusterIcons[cluster]}</div>
                  <div className="cluster-name">{clusterCategories[cluster]}</div>
                  <div className="cluster-score">{score}%</div>
                </div>
              );
            })}
          </div>
          <div className="analysis-progress-note">
            <p>🔄 Complete your full analysis to unlock detailed cluster insights and keystone aspects!</p>
            {onStartFullAnalysis && (
              <button
                onClick={onStartFullAnalysis}
                disabled={isStartingAnalysis}
                style={{
                  backgroundColor: isStartingAnalysis ? '#9ca3af' : '#8b5cf6',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: isStartingAnalysis ? 'not-allowed' : 'pointer',
                  marginTop: '15px',
                  transition: 'all 0.2s ease'
                }}
              >
                {isStartingAnalysis ? (
                  <>🔄 Starting Analysis...</>
                ) : (
                  <>✨ Start Complete Analysis</>
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Full Cluster Analysis (Phase 2 - after full analysis) */}
      {isFullAnalysisComplete && selectedCluster && (
        <div className="full-analysis-display">
          <div className="analysis-header">
            <h3>{clusterIcons[selectedCluster]} {clusterCategories[selectedCluster]}</h3>
            <div className="analysis-score">
              Score: <span className="score-value">{clusterScores[selectedCluster] || 0}%</span>
            </div>
          </div>
          
          {(() => {
            const clusterData = getClusterData(selectedCluster);
            
            if (!clusterData) {
              return (
                <div className="no-analysis">
                  <p>No detailed analysis available for this cluster.</p>
                </div>
              );
            }

            return (
              <div className="analysis-content">
                {/* Cluster Metrics (Progressive disclosure) */}
                <div className="cluster-metrics">
                  <div className="metric-row">
                    <div className="metric">
                      <span className="metric-label">Support:</span>
                      <span className="metric-value">{clusterData.supportPct}%</span>
                    </div>
                    <div className="metric">
                      <span className="metric-label">Challenge:</span>
                      <span className="metric-value">{clusterData.challengePct}%</span>
                    </div>
                  </div>
                  <div className="metric-row">
                    <div className="metric">
                      <span className="metric-label">Heat:</span>
                      <span className="metric-value">{clusterData.heatPct}%</span>
                    </div>
                    <div className="metric">
                      <span className="metric-label">Activity:</span>
                      <span className="metric-value">{clusterData.activityPct}%</span>
                    </div>
                  </div>
                  <div className="metric-row">
                    <div className="metric">
                      <span className="metric-label">Quadrant:</span>
                      <span className="metric-value">{clusterData.quadrant}</span>
                    </div>
                    <div className="metric">
                      <span className="metric-label">Spark Elements:</span>
                      <span className="metric-value">{clusterData.sparkElements}</span>
                    </div>
                  </div>
                </div>

                {/* Keystone Aspects for this cluster */}
                {clusterData.keystoneAspects && clusterData.keystoneAspects.length > 0 && (
                  <div className="analysis-section">
                    <h4>🌟 Key Factors ({clusterData.keystoneAspects.length})</h4>
                    <div className="keystone-aspects">
                      {clusterData.keystoneAspects.map((aspect, index) => (
                        <div key={index} className="keystone-aspect">
                          <div className="aspect-description">{aspect.description}</div>
                          <div className="aspect-details">
                            <span className="aspect-score">
                              Score: {aspect.score > 0 ? '+' : ''}{aspect.score}
                            </span>
                            {aspect.reason && (
                              <span className="aspect-reason">{aspect.reason}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
          
          <button 
            className="close-analysis"
            onClick={() => setSelectedCluster(null)}
          >
            Close Analysis
          </button>
        </div>
      )}

      {/* Enhanced Cluster Grid (Phase 2 - full analysis complete) */}
      {isFullAnalysisComplete && clusterAnalysis?.clusters && (
        <div className="enhanced-cluster-display">
          <h3>Detailed Compatibility Analysis</h3>
          <div className="cluster-grid enhanced">
            {orderedClusters.map(cluster => {
              const score = clusterScores[cluster] || 0;
              const clusterData = getClusterData(cluster);
              const isSelected = selectedCluster === cluster;
              
              return (
                <div 
                  key={cluster} 
                  className={`cluster-card enhanced ${isSelected ? 'selected' : ''}`}
                  onClick={() => setSelectedCluster(isSelected ? null : cluster)}
                >
                  <div className="cluster-icon">{clusterIcons[cluster]}</div>
                  <div className="cluster-name">{clusterCategories[cluster]}</div>
                  <div className="cluster-score">{score}%</div>
                  {clusterData && (
                    <div className="cluster-quadrant">{clusterData.quadrant}</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tension Flow Analysis (Phase 2) */}
      {isFullAnalysisComplete && tensionFlowAnalysis && (
        <div className="tension-flow-section">
          <h3>Relationship Dynamics</h3>
          <div className="tension-metrics">
            <div className="metric">
              <span className="metric-label">Support Density:</span>
              <span className="metric-value">{tensionFlowAnalysis.supportDensity.toFixed(2)}</span>
            </div>
            <div className="metric">
              <span className="metric-label">Challenge Density:</span>
              <span className="metric-value">{tensionFlowAnalysis.challengeDensity.toFixed(2)}</span>
            </div>
            <div className="metric">
              <span className="metric-label">Dynamic Type:</span>
              <span className="metric-value">{tensionFlowAnalysis.quadrant}</span>
            </div>
          </div>
          {tensionFlowAnalysis.insight && (
            <div className="tension-insight">
              <p>{tensionFlowAnalysis.insight.description}</p>
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      <div className="chart-instructions">
        <p>💡 <strong>Tip:</strong> {isFullAnalysisComplete ? 'Click on any cluster card to see detailed metrics and key factors.' : 'Complete your full analysis to unlock detailed cluster insights!'}</p>
      </div>
    </div>
  );
};

export default RelationshipScoresRadarChart;