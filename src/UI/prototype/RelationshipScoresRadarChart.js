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

const RelationshipScoresRadarChart = ({ scores, scoreDebugInfo, holisticOverview, profileAnalysis }) => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [hoveredCategory, setHoveredCategory] = useState(null);

  const scoreCategories = {
    OVERALL_ATTRACTION_CHEMISTRY: "Overall Attraction & Chemistry",
    EMOTIONAL_SECURITY_CONNECTION: "Emotional Security & Connection", 
    SEX_AND_INTIMACY: "Sex & Intimacy",
    COMMUNICATION_AND_MENTAL_CONNECTION: "Communication & Mental Connection",
    COMMITMENT_LONG_TERM_POTENTIAL: "Commitment & Long-term Potential",
    KARMIC_LESSONS_GROWTH: "Karmic Lessons & Growth",
    PRACTICAL_GROWTH_SHARED_GOALS: "Practical Growth & Shared Goals"
  };

  // Category icons for visual clarity
  const categoryIcons = {
    OVERALL_ATTRACTION_CHEMISTRY: "💫",
    EMOTIONAL_SECURITY_CONNECTION: "💗",
    SEX_AND_INTIMACY: "🔥",
    COMMUNICATION_AND_MENTAL_CONNECTION: "🧠",
    COMMITMENT_LONG_TERM_POTENTIAL: "💎",
    KARMIC_LESSONS_GROWTH: "🌙",
    PRACTICAL_GROWTH_SHARED_GOALS: "🌱"
  };

  // Helper function to get score analysis for a category (reused from original component)
  const getCategoryAnalysis = (categoryKey) => {
    if (scoreDebugInfo?.categories?.[categoryKey]?.scoreAnalysis) {
      const analysis = scoreDebugInfo.categories[categoryKey].scoreAnalysis;
      
      // New structure: has analysis (and scoredItems, but we only display analysis)
      if (analysis.analysis) {
        return {
          type: 'new',
          analysis: analysis.analysis,
          scoredItems: analysis.scoredItems
        };
      }
      
      // Legacy structure: has scoreAnalysis, greenFlags, redFlags
      if (analysis.scoreAnalysis) {
        return {
          type: 'legacy',
          scoreAnalysis: analysis.scoreAnalysis,
          greenFlags: analysis.greenFlags,
          redFlags: analysis.redFlags
        };
      }
    }
    
    return null;
  };

  // Prepare data for radar chart - ordered to put Overall Attraction at 12 o'clock
  const orderedCategories = [
    'OVERALL_ATTRACTION_CHEMISTRY',
    'EMOTIONAL_SECURITY_CONNECTION',
    'SEX_AND_INTIMACY', 
    'COMMUNICATION_AND_MENTAL_CONNECTION',
    'COMMITMENT_LONG_TERM_POTENTIAL',
    'KARMIC_LESSONS_GROWTH',
    'PRACTICAL_GROWTH_SHARED_GOALS'
  ];

  // Create gradient effect based on scores
  const dataPoints = orderedCategories.map(key => Math.round(scores[key]?.overall || 0));
  
  const chartData = {
    labels: orderedCategories.map(key => `${categoryIcons[key]} ${scoreCategories[key]}`),
    datasets: [
      {
        label: 'Compatibility Score',
        data: dataPoints,
        backgroundColor: 'rgba(139, 92, 246, 0.15)',
        borderColor: 'rgba(139, 92, 246, 0.9)',
        pointBackgroundColor: orderedCategories.map(key => {
          const score = scores[key]?.overall || 0;
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
            const categoryKey = orderedCategories[index];
            if (hoveredCategory === categoryKey || selectedCategory === categoryKey) {
              return 'rgba(255, 255, 255, 1)';
            }
            return 'rgba(255, 255, 255, 0.85)';
          },
          font: function(context) {
            const index = context.index;
            const categoryKey = orderedCategories[index];
            if (hoveredCategory === categoryKey || selectedCategory === categoryKey) {
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
        const categoryKey = orderedCategories[elementIndex];
        setSelectedCategory(selectedCategory === categoryKey ? null : categoryKey);
        return;
      }
      
      // Check if clicking on a label
      const canvasPosition = event.native;
      const datasetMeta = chart.getDatasetMeta(0);
      const scale = chart.scales.r;
      
      // Check each label position
      orderedCategories.forEach((categoryKey, index) => {
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
          setSelectedCategory(selectedCategory === categoryKey ? null : categoryKey);
        }
      });
    },
    onHover: (event, elements, chart) => {
      let hovered = null;
      let cursorStyle = 'default';
      
      // Check if hovering over a point
      if (elements.length > 0) {
        const elementIndex = elements[0].index;
        hovered = orderedCategories[elementIndex];
        cursorStyle = 'pointer';
      } else {
        // Check if hovering over a label
        const canvasPosition = event.native;
        const scale = chart.scales.r;
        
        // Check each label position
        orderedCategories.forEach((categoryKey, index) => {
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
            hovered = categoryKey;
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
      
      {/* Profile Analysis Banner */}
      {profileAnalysis?.profileResult && (
        <div className="profile-analysis-banner">
          <div className="profile-tier">
            <span className="profile-label">Tier:</span>
            <span className="profile-value">{profileAnalysis.profileResult.tier}</span>
          </div>
          <div className="profile-divider">|</div>
          <div className="profile-type">
            <span className="profile-label">Profile:</span>
            <span className="profile-value">{profileAnalysis.profileResult.profile}</span>
          </div>
        </div>
      )}
      
      {/* Radar Chart Container */}
      <div className="radar-chart-container">
        <Radar data={chartData} options={chartOptions} />
      </div>

      {/* Analysis Display Area - shows immediately after radar chart */}
      {selectedCategory && (
        <div className="analysis-display">
          <div className="analysis-header">
            <h3>{scoreCategories[selectedCategory]}</h3>
            <div className="analysis-score">
              Score: <span className="score-value">{Math.round(scores[selectedCategory]?.overall)}%</span>
            </div>
          </div>
          
          {(() => {
            const categoryAnalysis = getCategoryAnalysis(selectedCategory);
            
            if (!categoryAnalysis) {
              return (
                <div className="no-analysis">
                  <p>No detailed analysis available for this category.</p>
                </div>
              );
            }

            return (
              <div className="analysis-content">
                {/* New structure: Analysis */}
                {categoryAnalysis.type === 'new' && (
                  <div className="analysis-section">
                    <h4>Analysis</h4>
                    <p>{categoryAnalysis.analysis}</p>
                  </div>
                )}

                {/* Legacy structure: Score Analysis */}
                {categoryAnalysis.type === 'legacy' && categoryAnalysis.scoreAnalysis && (
                  <div className="analysis-section">
                    <h4>Score Analysis</h4>
                    <p>{categoryAnalysis.scoreAnalysis}</p>
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

      {/* Holistic Overview - displayed beneath the radar chart and analysis */}
      {holisticOverview?.overview && (
        <div className="holistic-overview-section">
          <div className="holistic-overview-content">
            <h3>💫 Relationship Overview</h3>
            <p className="overview-text">{holisticOverview.overview}</p>
          </div>
          
          {holisticOverview.topStrengths && holisticOverview.topStrengths.length > 0 && (
            <div className="strengths-section">
              <h4>✨ Top Strengths</h4>
              <ul className="strengths-list">
                {holisticOverview.topStrengths.map((item, index) => (
                  <li key={index}>
                    <strong>{item.name}</strong> - {item.description}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {holisticOverview.keyChallenges && holisticOverview.keyChallenges.length > 0 && (
            <div className="challenges-section">
              <h4>⚠️ Key Challenges</h4>
              <ul className="challenges-list">
                {holisticOverview.keyChallenges.map((item, index) => (
                  <li key={index}>
                    <strong>{item.name}</strong> - {item.description}
                  </li>
                ))}
              </ul>
            </div>
          )}
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