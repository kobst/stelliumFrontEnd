import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { getUserCompositeCharts, fetchRelationshipAnalysis } from '../Utilities/api';
import { useAuth } from '../context/AuthContext';
import TabMenu from '../UI/shared/TabMenu';
import ScoresTab from '../UI/dashboard/relationshipTabs/ScoresTab';
import OverviewTab from '../UI/dashboard/relationshipTabs/OverviewTab';
import ChartsTab from '../UI/dashboard/relationshipTabs/ChartsTab';
import AnalysisTab from '../UI/dashboard/relationshipTabs/AnalysisTab';
import AskStelliumRelationshipTab from '../UI/dashboard/relationshipTabs/AskStelliumRelationshipTab';
import './RelationshipAnalysisPage.css';

function RelationshipAnalysisPage() {
  const { userId, compositeId } = useParams();
  const navigate = useNavigate();
  const { stelliumUser } = useAuth();

  const [relationship, setRelationship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadRelationship = useCallback(async () => {
    try {
      setLoading(true);
      const composites = await getUserCompositeCharts(userId);
      const found = composites?.find(c => c._id === compositeId);
      if (found) {
        // Try to fetch full analysis data
        try {
          const analysisData = await fetchRelationshipAnalysis(compositeId);
          if (analysisData) {
            // Merge analysis data with relationship
            setRelationship({
              ...found,
              ...analysisData
            });
          } else {
            setRelationship(found);
          }
        } catch (analysisErr) {
          console.warn('Could not fetch analysis data:', analysisErr);
          setRelationship(found);
        }
      } else {
        setError('Relationship not found');
      }
    } catch (err) {
      console.error('Error loading relationship:', err);
      setError('Failed to load relationship data');
    } finally {
      setLoading(false);
    }
  }, [userId, compositeId]);

  useEffect(() => {
    if (userId && compositeId) {
      loadRelationship();
    }
  }, [userId, compositeId, loadRelationship]);

  // Callback for when analysis completes - reload the data
  const handleAnalysisComplete = useCallback(() => {
    loadRelationship();
  }, [loadRelationship]);

  // Check if full analysis is complete
  const isAnalysisComplete = relationship?.completeAnalysis &&
    Object.keys(relationship.completeAnalysis).length > 0;

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

  // Security check: Redirect if user tries to access a different user's data
  if (stelliumUser && userId !== stelliumUser._id) {
    return <Navigate to={`/dashboard/${stelliumUser._id}`} replace />;
  }

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
      content: <ScoresTab relationship={relationship} />
    },
    {
      id: 'overview',
      label: 'Overview',
      content: <OverviewTab relationship={relationship} />
    },
    {
      id: 'charts',
      label: 'Charts',
      content: <ChartsTab relationship={relationship} />
    },
    {
      id: 'analysis',
      label: '360° Analysis',
      content: (
        <AnalysisTab
          relationship={relationship}
          compositeId={compositeId}
          onAnalysisComplete={handleAnalysisComplete}
        />
      )
    },
    {
      id: 'chat',
      label: 'Ask Stellium',
      content: (
        <AskStelliumRelationshipTab
          compositeId={compositeId}
          isAnalysisComplete={isAnalysisComplete}
        />
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
