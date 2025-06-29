import React, { useState } from 'react';
import './RelationshipScoresBarChart.css';

const RelationshipScoresBarChart = ({ scores, scoreDebugInfo }) => {
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

  const categoryAbbreviations = {
    OVERALL_ATTRACTION_CHEMISTRY: "Attraction",
    EMOTIONAL_SECURITY_CONNECTION: "Emotional",
    SEX_AND_INTIMACY: "Intimacy",
    COMMUNICATION_AND_MENTAL_CONNECTION: "Communication",
    COMMITMENT_LONG_TERM_POTENTIAL: "Commitment",
    KARMIC_LESSONS_GROWTH: "Growth",
    PRACTICAL_GROWTH_SHARED_GOALS: "Practical"
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

  // Get bar color based on score
  const getBarColor = (score) => {
    if (score >= 80) return 'linear-gradient(to top, #22c55e, #16a34a)'; // Green
    if (score >= 60) return 'linear-gradient(to top, #eab308, #ca8a04)'; // Yellow
    if (score >= 40) return 'linear-gradient(to top, #f97316, #ea580c)'; // Orange  
    return 'linear-gradient(to top, #ef4444, #dc2626)'; // Red
  };

  // Handle bar click
  const handleBarClick = (categoryKey) => {
    setSelectedCategory(selectedCategory === categoryKey ? null : categoryKey);
  };


  return (
    <div className="relationship-scores-chart">
      <h2>Relationship Compatibility Scores</h2>
      
      {/* Chart Container */}
      <div className="chart-container">
        {/* Y-axis Labels */}
        <div className="y-axis">
          <div className="y-axis-labels">
            {[100, 80, 60, 40, 20, 0].map(value => (
              <div key={value} className="y-axis-label">
                {value}%
              </div>
            ))}
          </div>
          <div className="y-axis-line"></div>
        </div>

        {/* Chart Area */}
        <div className="chart-area">
          {/* Grid Lines */}
          <div className="grid-lines">
            {[20, 40, 60, 80, 100].map(value => (
              <div 
                key={value} 
                className="grid-line" 
                style={{ bottom: `${value}%` }}
              />
            ))}
          </div>

          {/* Bars */}
          <div className="bars-container">
            {Object.entries(scores).map(([key, value]) => {
              const heightPercentage = Math.max(Math.round(value.overall), 2);
              
              return (
                <div 
                  key={key}
                  className={`bar-column ${selectedCategory === key ? 'selected' : ''} ${hoveredCategory === key ? 'hovered' : ''}`}
                  onMouseEnter={() => setHoveredCategory(key)}
                  onMouseLeave={() => setHoveredCategory(null)}
                  onClick={() => handleBarClick(key)}
                >
                  <div 
                    className="score-bar"
                    style={{
                      height: `${heightPercentage}%`,
                      background: getBarColor(Math.round(value.overall))
                    }}
                  >
                  {/* Score label on hover */}
                  {hoveredCategory === key && (
                    <div className="score-tooltip">
                      {Math.round(value.overall)}%
                    </div>
                  )}
                </div>
                
                {/* Category label */}
                <div className="category-label">
                  {categoryAbbreviations[key]}
                </div>
              </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Analysis Display Area */}
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

      {/* Instructions */}
      <div className="chart-instructions">
        <p>💡 <strong>Tip:</strong> Click on any bar to see detailed analysis for that category.</p>
      </div>
    </div>
  );
};

export default RelationshipScoresBarChart;