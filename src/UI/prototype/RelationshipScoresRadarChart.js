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
import TensionFlowAnalysis from './TensionFlowAnalysis';
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
  scores, 
  scoreDebugInfo, 
  holisticOverview, 
  profileAnalysis, 
  clusterAnalysis, 
  tensionFlowAnalysis,
  v2Analysis,
  v2Metrics,
  v2KeystoneAspects,
  isV2Analysis 
}) => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  

  // V2 Cluster categories (now the default)
  const clusterCategories = {
    Harmony: "Harmony",
    Passion: "Passion", 
    Connection: "Connection",
    Growth: "Growth",
    Stability: "Stability"
  };

  // V2 Cluster icons (now the default)
  const clusterIcons = {
    Harmony: "💕",
    Passion: "🔥",
    Connection: "🧠",
    Growth: "🌱",
    Stability: "💎"
  };

  // Helper function to get cluster analysis
  const getClusterAnalysis = (clusterKey) => {
    // Get from v2Analysis clusters
    if (v2Analysis?.clusters?.[clusterKey]) {
      const clusterData = v2Analysis.clusters[clusterKey];
      return {
        type: 'v2-cluster',
        analysis: clusterData.analysis,
        scoredItems: clusterData.scoredItems || [],
        score: clusterData.score
      };
    }
    
    // Fallback to clusterAnalysis prop
    const clusterData = clusterAnalysis?.[clusterKey];
    if (clusterData) {
      return {
        type: 'cluster',
        analysis: clusterData.analysis,
        scoredItems: clusterData.scoredItems || []
      };
    }
    
    return null;
  };

  // V2 clusters are the default
  const orderedClusters = ['Harmony', 'Passion', 'Connection', 'Growth', 'Stability'];
  
  // Get cluster scores - prefer V2, fallback to legacy mapping
  let clusterScores = {};
  if (v2Analysis?.clusters) {
    // Use V2 cluster scores directly
    clusterScores = Object.keys(v2Analysis.clusters).reduce((acc, key) => {
      acc[key] = v2Analysis.clusters[key].score || 0;
      return acc;
    }, {});
  } else if (scores) {
    // Map legacy scores to V2 clusters if V2 data not available
    const legacyToV2Mapping = {
      'Harmony': ['EMOTIONAL_SECURITY_CONNECTION', 'OVERALL_ATTRACTION_CHEMISTRY'],
      'Passion': ['SEX_AND_INTIMACY'],
      'Connection': ['COMMUNICATION_AND_MENTAL_CONNECTION'],
      'Growth': ['KARMIC_LESSONS_GROWTH'],
      'Stability': ['COMMITMENT_LONG_TERM_POTENTIAL', 'PRACTICAL_GROWTH_SHARED_GOALS']
    };
    
    Object.entries(legacyToV2Mapping).forEach(([v2Cluster, legacyCategories]) => {
      const avgScore = legacyCategories.reduce((sum, category) => {
        return sum + (scores[category] || 0);
      }, 0) / legacyCategories.length;
      clusterScores[v2Cluster] = Math.round(avgScore);
    });
  }
  
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
            if (hoveredCategory === clusterKey || selectedCategory === clusterKey) {
              return 'rgba(255, 255, 255, 1)';
            }
            return 'rgba(255, 255, 255, 0.85)';
          },
          font: function(context) {
            const index = context.index;
            const clusterKey = orderedClusters[index];
            if (hoveredCategory === clusterKey || selectedCategory === clusterKey) {
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
        setSelectedCategory(selectedCategory === clusterKey ? null : clusterKey);
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
          setSelectedCategory(selectedCategory === clusterKey ? null : clusterKey);
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
      
      setHoveredCategory(hovered);
      event.native.target.style.cursor = cursorStyle;
    }
  };

  return (
    <div className="relationship-scores-radar-chart">
      <h2>Relationship Compatibility Scores</h2>
      
      {/* V2 Analysis Banner */}
      <div className="v2-analysis-banner">
        <div className="v2-badge">
          <span className="version-badge">✨ Enhanced Analysis V2</span>
        </div>
        {v2Analysis?.tier && (
          <div className="v2-tier">
            <span className="tier-label">Tier:</span>
            <span className="tier-value">{v2Analysis.tier}</span>
          </div>
        )}
        {v2Analysis?.tier && v2Analysis?.profile && <div className="profile-divider">|</div>}
        {v2Analysis?.profile && (
          <div className="v2-profile">
            <span className="profile-label">Profile:</span>
            <span className="profile-value">{v2Analysis.profile}</span>
          </div>
        )}
        {v2Analysis?.confidence && (
          <>
            <div className="profile-divider">|</div>
            <div className="v2-confidence">
              <span className="confidence-label">Confidence:</span>
              <span className="confidence-value">{Math.round(v2Analysis.confidence * 100)}%</span>
            </div>
          </>
        )}
      </div>
      
      {/* Radar Chart Container */}
      <div className="radar-chart-container">
        <Radar data={chartData} options={chartOptions} />
      </div>

      {/* Analysis Display Area - shows immediately after radar chart */}
      {selectedCategory && (
        <div className="analysis-display">
          <div className="analysis-header">
            <h3>{clusterIcons[selectedCategory]} {clusterCategories[selectedCategory]}</h3>
            <div className="analysis-score">
              Score: <span className="score-value">{clusterScores[selectedCategory] || 0}%</span>
            </div>
          </div>
          
          {(() => {
            const clusterAnalysis = getClusterAnalysis(selectedCategory);
            
            if (!clusterAnalysis) {
              return (
                <div className="no-analysis">
                  <p>No detailed analysis available for this cluster.</p>
                </div>
              );
            }

            return (
              <div className="analysis-content">
                {/* Cluster Analysis */}
                {clusterAnalysis.analysis && (
                  <div className="analysis-section">
                    <h4>Analysis</h4>
                    <p>{clusterAnalysis.analysis}</p>
                  </div>
                )}

                {/* Show some scored items if available */}
                {clusterAnalysis.scoredItems && clusterAnalysis.scoredItems.length > 0 && (
                  <div className="analysis-section">
                    <h4>Key Factors ({clusterAnalysis.scoredItems.length} items)</h4>
                    <div className="scored-items">
                      {clusterAnalysis.scoredItems.slice(0, 5).map((item, index) => (
                        <div key={index} className="scored-item">
                          <span 
                            className="item-score"
                            style={{
                              backgroundColor: item.score > 0 ? '#d4edda' : item.score < 0 ? '#f8d7da' : '#f8f9fa',
                              color: item.score > 0 ? '#155724' : item.score < 0 ? '#721c24' : '#495057'
                            }}
                          >
                            {item.score > 0 ? '+' : ''}{item.score}
                          </span>
                          <span className="item-description">{item.description}</span>
                        </div>
                      ))}
                      {clusterAnalysis.scoredItems.length > 5 && (
                        <p className="more-items">...and {clusterAnalysis.scoredItems.length - 5} more factors</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
          
          <button 
            className="close-analysis"
            onClick={() => setSelectedCategory(null)}
          >
            Close Analysis
          </button>
        </div>
      )}

      {/* V2 Overall Analysis */}
      {v2Analysis?.initialOverview && (
        <div className="v2-overview-section">
          <div className="v2-overview-content">
            <h3>💫 Relationship Overview</h3>
            <p className="overview-text">{v2Analysis.initialOverview}</p>
          </div>
        </div>
      )}

      {/* V2 Keystone Aspects */}
      {v2KeystoneAspects && v2KeystoneAspects.length > 0 && (
        <div className="v2-keystone-aspects-section">
          <h3>🌟 Keystone Aspects</h3>
          <p className="keystone-description">
            These are the most structurally important aspects in your relationship, based on overall centrality analysis.
          </p>
          <div className="keystone-aspects-list">
            {v2KeystoneAspects.map((aspect, index) => (
              <div key={index} className="keystone-aspect">
                <div className="keystone-header">
                  <div className="keystone-rank">#{index + 1}</div>
                  <div className="keystone-title">{aspect.description}</div>
                  <div className="keystone-centrality">
                    Centrality: {aspect.centrality}/10
                  </div>
                </div>
                <div className="keystone-details">
                  <div className="keystone-score">
                    Score: <span className={aspect.valence > 0 ? 'positive' : aspect.valence < 0 ? 'negative' : 'neutral'}>
                      {aspect.score > 0 ? '+' : ''}{aspect.score}
                    </span>
                  </div>
                  {aspect.aspect && aspect.orb && (
                    <div className="keystone-orb">Orb: {aspect.orb}°</div>
                  )}
                  {aspect.spark && (
                    <div className="keystone-spark">✨ Chemistry Factor</div>
                  )}
                </div>
                <div className="keystone-clusters">
                  <span className="primary-cluster">Primary: {aspect.primaryCluster}</span>
                  {aspect.contributingClusters && aspect.contributingClusters.length > 1 && (
                    <span className="contributing-clusters">
                      Also affects: {aspect.contributingClusters.filter(c => c !== aspect.primaryCluster).join(', ')}
                    </span>
                  )}
                </div>
                <div className="keystone-reason">{aspect.reason}</div>
              </div>
            ))}
          </div>
        </div>
      )}


      {/* Instructions */}
      <div className="chart-instructions">
        <p>💡 <strong>Tip:</strong> Click on any point on the radar chart to see detailed analysis for that category.</p>
      </div>
    </div>
  );
};

export default RelationshipScoresRadarChart;