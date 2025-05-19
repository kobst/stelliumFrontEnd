import './RelationshipScores.css'

const RelationshipScores = ({ scores }) => {
    const categories = {
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
          {Object.entries(scores).map(([key, value]) => (
            <div key={key} className="score-card">
              <h3>{categories[key]}</h3>
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
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  export default RelationshipScores;

  //