import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserCompositeCharts } from '../../Utilities/api';
import './RelationshipsSection.css';

function RelationshipsSection({ userId }) {
  const navigate = useNavigate();
  const [relationships, setRelationships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRelationships = async () => {
      try {
        setLoading(true);
        const response = await getUserCompositeCharts(userId);
        setRelationships(response || []);
      } catch (err) {
        console.error('Error fetching relationships:', err);
        setError('Failed to load relationships');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchRelationships();
    }
  }, [userId]);

  const handleRelationshipClick = (compositeId) => {
    navigate(`/dashboard/${userId}/relationship/${compositeId}`);
  };

  const handleAddRelationship = () => {
    // Placeholder for add relationship functionality
    console.log('Add relationship clicked - to be implemented');
  };

  const getOverallScore = (relationship) => {
    return relationship?.clusterScoring?.overall?.score ||
           relationship?.clusterAnalysis?.overall?.score ||
           null;
  };

  const getTier = (relationship) => {
    return relationship?.clusterScoring?.overall?.tier ||
           relationship?.clusterAnalysis?.overall?.tier ||
           null;
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

  return (
    <div className="relationships-section">
      <h3 className="relationships-title">Your Relationships</h3>

      {loading ? (
        <div className="relationships-loading">Loading relationships...</div>
      ) : error ? (
        <div className="relationships-error">{error}</div>
      ) : relationships.length === 0 ? (
        <div className="relationships-empty">
          <div className="empty-icon">♡</div>
          <p>No relationships yet</p>
          <p className="empty-hint">Create a relationship to see compatibility scores</p>
        </div>
      ) : (
        <div className="relationships-list">
          {relationships.map(relationship => {
            const score = getOverallScore(relationship);
            const tier = getTier(relationship);

            return (
              <div
                key={relationship._id}
                className="relationship-card"
                onClick={() => handleRelationshipClick(relationship._id)}
              >
                <div className="relationship-names">
                  <span className="person-name">{relationship.userA_name}</span>
                  <span className="relationship-connector">♡</span>
                  <span className="person-name">{relationship.userB_name}</span>
                </div>

                <div className="relationship-meta">
                  {score !== null && (
                    <div className="relationship-score">
                      <span className="score-value">{Math.round(score)}</span>
                      <span className="score-label">Score</span>
                    </div>
                  )}
                  {tier && (
                    <div className={`relationship-tier ${getTierClass(tier)}`}>
                      {tier}
                    </div>
                  )}
                </div>

                <div className="relationship-arrow">→</div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add relationship button */}
      <button className="add-relationship-button" onClick={handleAddRelationship}>
        + Add Relationship
      </button>
    </div>
  );
}

export default RelationshipsSection;
