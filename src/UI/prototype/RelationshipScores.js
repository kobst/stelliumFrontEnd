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
  
    return (
      <div className="relationship-scores">
        <h2>Relationship Compatibility Scores</h2>
        <div className="scores-grid">
          {Object.entries(scores).map(([key, value]) => {
            const categoryScoreAnalysis = scoreDebugInfo?.categories?.[key]?.scoreAnalysis;
            
            return (
              <div key={key} className="score-card">
                <h3>{scoreCategories[key]}</h3>
                <div className="score-details">
                  <div className="overall-score">
                    <span className="score-label">Overall:</span>
                    <span className="score-value">{value.overall}%</span>
                  </div>
                  <div className="score-breakdown">
                    <div className="score-item">
                      <span>Synastry: {value.synastry}%</span>
                    </div>
                    <div className="score-item">
                      <span>Composite: {value.composite}%</span>
                    </div>
                    <div className="score-item">
                      <span>Synastry Houses: {value.synastryHousePlacements}%</span>
                    </div>
                    <div className="score-item">
                      <span>Composite Houses: {value.compositeHousePlacements}%</span>
                    </div>
                  </div>
                </div>
                
                {categoryScoreAnalysis?.scoreAnalysis && (
                  <div className="flag-analysis">
                    <h4>Score Analysis</h4>
                    <p>{categoryScoreAnalysis.scoreAnalysis}</p>
                  </div>
                )}

                <div className="green-flags">
                  <h4>Green Flags</h4>
                  {categoryScoreAnalysis?.greenFlags && categoryScoreAnalysis.greenFlags.length > 0 ? (
                    <ul>
                      {categoryScoreAnalysis.greenFlags.map((flag, index) => (
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
                  {categoryScoreAnalysis?.redFlags && categoryScoreAnalysis.redFlags.length > 0 ? (
                    <ul>
                      {categoryScoreAnalysis.redFlags.map((flag, index) => (
                        <li key={index}>
                          <p>{flag.description}</p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="no-flags">(No significant red flags)</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };
  
  export default RelationshipScores;

  //