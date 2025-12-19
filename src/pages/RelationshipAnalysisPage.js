import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUserCompositeCharts } from '../Utilities/api';
import TabMenu from '../UI/shared/TabMenu';
import './RelationshipAnalysisPage.css';

function RelationshipAnalysisPage() {
  const { userId, compositeId } = useParams();
  const navigate = useNavigate();
  const [relationship, setRelationship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadRelationship = async () => {
      try {
        setLoading(true);
        const composites = await getUserCompositeCharts(userId);
        const found = composites?.find(c => c._id === compositeId);
        if (found) {
          setRelationship(found);
        } else {
          setError('Relationship not found');
        }
      } catch (err) {
        console.error('Error loading relationship:', err);
        setError('Failed to load relationship data');
      } finally {
        setLoading(false);
      }
    };

    if (userId && compositeId) {
      loadRelationship();
    }
  }, [userId, compositeId]);

  const handleBackClick = () => {
    navigate(`/dashboard/${userId}`);
  };

  const getRelationshipTitle = () => {
    if (!relationship) return '';
    return `${relationship.userA_name || 'Person A'} & ${relationship.userB_name || 'Person B'}`;
  };

  const getOverallScore = () => {
    return relationship?.clusterScoring?.overall?.score ||
           relationship?.clusterAnalysis?.overall?.score ||
           null;
  };

  const getTier = () => {
    return relationship?.clusterScoring?.overall?.tier ||
           relationship?.clusterAnalysis?.overall?.tier ||
           null;
  };

  if (loading) {
    return (
      <div className="relationship-analysis-page">
        <div className="relationship-analysis-loading">
          <div className="loading-spinner"></div>
          <p>Loading relationship...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relationship-analysis-page">
        <div className="relationship-analysis-header">
          <button className="back-button" onClick={handleBackClick}>
            ← Back to Dashboard
          </button>
        </div>
        <div className="relationship-analysis-error">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const relationshipTabs = [
    {
      id: 'scores',
      label: 'Scores',
      content: (
        <div className="relationship-tab-content">
          <div className="placeholder-content">
            <h3>Compatibility Scores</h3>
            <p>Cluster scores and radar chart will be displayed here</p>
            <div className="placeholder-icon">📊</div>
          </div>
        </div>
      )
    },
    {
      id: 'overview',
      label: 'Overview',
      content: (
        <div className="relationship-tab-content">
          <div className="placeholder-content">
            <h3>Relationship Overview</h3>
            <p>Relationship summary and key insights will be displayed here</p>
            <div className="placeholder-icon">♡</div>
          </div>
        </div>
      )
    },
    {
      id: 'charts',
      label: 'Charts',
      content: (
        <div className="relationship-tab-content">
          <div className="placeholder-content">
            <h3>Synastry & Composite Charts</h3>
            <p>Chart visualizations will be displayed here</p>
            <div className="placeholder-icon">◎</div>
          </div>
        </div>
      )
    },
    {
      id: 'analysis',
      label: '360° Analysis',
      content: (
        <div className="relationship-tab-content">
          <div className="placeholder-content">
            <h3>360° Analysis</h3>
            <p>Deep dive analysis of the relationship will be displayed here</p>
            <div className="placeholder-icon">🔮</div>
          </div>
        </div>
      )
    },
    {
      id: 'chat',
      label: 'Ask Stellium',
      content: (
        <div className="relationship-tab-content">
          <div className="placeholder-content">
            <h3>Ask Stellium</h3>
            <p>AI chat about this relationship will be available here</p>
            <div className="placeholder-icon">✨</div>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="relationship-analysis-page">
      <div className="relationship-analysis-header">
        <button className="back-button" onClick={handleBackClick}>
          ← Back to Dashboard
        </button>
        <div className="relationship-header-info">
          <h1 className="relationship-title">{getRelationshipTitle()}</h1>
          <div className="relationship-header-meta">
            {getOverallScore() !== null && (
              <div className="header-score">
                <span className="header-score-value">{Math.round(getOverallScore())}</span>
                <span className="header-score-label">Score</span>
              </div>
            )}
            {getTier() && (
              <span className={`header-tier tier-${getTier().toLowerCase()}`}>
                {getTier()}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="relationship-analysis-content">
        <TabMenu tabs={relationshipTabs} />
      </div>
    </div>
  );
}

export default RelationshipAnalysisPage;
