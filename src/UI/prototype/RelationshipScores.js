import React from 'react';
import './RelationshipScores.css'

const RelationshipScores = ({ scores, scoreDebugInfo }) => {
    const scoreCategories = {
      OVERALL_ATTRACTION_CHEMISTRY: "Overall Attraction & Chemistry",
      EMOTIONAL_SECURITY_CONNECTION: "Emotional Security & Connection",
      SEX_AND_INTIMACY: "Sex & Intimacy",
      COMMUNICATION_AND_MENTAL_CONNECTION: "Communication & Mental Connection",
      COMMITMENT_LONG_TERM_POTENTIAL: "Commitment & Long-term Potential",
      KARMIC_LESSONS_GROWTH: "Karmic Lessons & Growth",
      PRACTICAL_GROWTH_SHARED_GOALS: "Practical Growth & Shared Goals"
    };

    // Helper function to get score analysis for a category
    const getCategoryAnalysis = (categoryKey) => {
      // Check for new structure first (direct scoreAnalysis from workflow state)
      if (scoreDebugInfo?.categories?.[categoryKey]?.scoreAnalysis) {
        const analysis = scoreDebugInfo.categories[categoryKey].scoreAnalysis;
        
        // New structure: has analysis (and scoredItems, but we only display analysis)
        if (analysis.analysis) {
          return {
            type: 'new',
            analysis: analysis.analysis,
            scoredItems: analysis.scoredItems // Available but not displayed
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
  
    return (
      <div className="relationship-scores">
        <h2>Relationship Compatibility Scores</h2>
        <div className="scores-grid">
          {Object.entries(scores).map(([key, value]) => {
            const categoryAnalysis = getCategoryAnalysis(key);
            
            return (
              <div key={key} className="score-card">
                <h3>{scoreCategories[key]}</h3>
                <div className="score-details">
                  <div className="overall-score">
                    <span className="score-label">Overall:</span>
                    <span className="score-value">{value.overall}%</span>
                  </div>
                </div>
                
                {/* New structure: Analysis */}
                {categoryAnalysis?.type === 'new' && (
                  <div className="flag-analysis">
                    <h4>Analysis</h4>
                    <p>{categoryAnalysis.analysis}</p>
                  </div>
                )}

                {/* Legacy structure: Score Analysis */}
                {categoryAnalysis?.type === 'legacy' && categoryAnalysis.scoreAnalysis && (
                  <div className="flag-analysis">
                    <h4>Score Analysis</h4>
                    <p>{categoryAnalysis.scoreAnalysis}</p>
                  </div>
                )}

                {/* Commented out Green Flags and Red Flags as requested */}
                {/* 
                <div className="green-flags">
                  <h4>Green Flags</h4>
                  {categoryAnalysis?.type === 'legacy' && categoryAnalysis.greenFlags && categoryAnalysis.greenFlags.length > 0 ? (
                    <ul>
                      {categoryAnalysis.greenFlags.map((flag, index) => (
                        <li key={index}>
                          <p>{flag.description}</p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="no-flags">(No significant green flags)</p>
                  )}
                </div>

                <div className="red-flags">
                  <h4>Red Flags</h4>
                  {categoryAnalysis?.type === 'legacy' && categoryAnalysis.redFlags && categoryAnalysis.redFlags.length > 0 ? (
                    <ul>
                      {categoryAnalysis.redFlags.map((flag, index) => (
                        <li key={index}>
                          <p>{flag.description}</p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="no-flags">(No significant red flags)</p>
                  )}
                </div>
                */}
              </div>
            );
          })}
        </div>
      </div>
    );
  };
  
  export default RelationshipScores;

  //