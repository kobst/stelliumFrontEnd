import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCelebrityRelationships, fetchRelationshipAnalysis, fetchUser } from '../Utilities/api';
import RelationshipDetailLayout from '../UI/dashboard/relationshipDetail/RelationshipDetailLayout';
import ScoresTab from '../UI/dashboard/relationshipTabs/ScoresTab';
import OverviewTab from '../UI/dashboard/relationshipTabs/OverviewTab';
import ChartsTab from '../UI/dashboard/relationshipTabs/ChartsTab';
import AnalysisTab from '../UI/dashboard/relationshipTabs/AnalysisTab';
import './PublicCelebrityRelationship.css';

function PublicCelebrityRelationship() {
  const { compositeId } = useParams();
  const navigate = useNavigate();
  const [relationship, setRelationship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState('scores');

  useEffect(() => {
    const loadRelationshipData = async () => {
      try {
        setLoading(true);

        // Find the composite from celebrity relationships
        const relationships = await getCelebrityRelationships();
        const found = relationships?.find(r => r._id === compositeId);

        if (!found) {
          setError('Relationship not found');
          return;
        }

        // Fetch analysis and individual birth charts in parallel
        let analysisData = null;
        let userABirthChart = null;
        let userBBirthChart = null;

        try {
          const promises = [fetchRelationshipAnalysis(compositeId)];

          if (found.userA_id && found.userB_id) {
            promises.push(
              fetchUser(found.userA_id).then(u => u?.birthChart).catch(() => null),
              fetchUser(found.userB_id).then(u => u?.birthChart).catch(() => null)
            );
          }

          const [analysis, chartA, chartB] = await Promise.all(promises);
          analysisData = analysis;
          userABirthChart = chartA || null;
          userBBirthChart = chartB || null;
        } catch (analysisErr) {
          console.warn('Could not fetch analysis data:', analysisErr);
        }

        const merged = {
          ...found,
          ...(analysisData || {}),
          ...(userABirthChart && { userA_birthChart: userABirthChart }),
          ...(userBBirthChart && { userB_birthChart: userBBirthChart })
        };

        setRelationship(merged);
      } catch (err) {
        console.error('Error loading celebrity relationship:', err);
        setError('Failed to load relationship data');
      } finally {
        setLoading(false);
      }
    };

    if (compositeId) {
      loadRelationshipData();
    }
  }, [compositeId]);

  const handleBack = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="public-celeb-relationship">
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>
          <p>Loading relationship...</p>
        </div>
      </div>
    );
  }

  if (error || !relationship) {
    return (
      <div className="public-celeb-relationship">
        <div className="dashboard-error">
          <p>{error || 'Relationship not found'}</p>
          <button className="back-btn" onClick={handleBack}>← Back to Home</button>
        </div>
      </div>
    );
  }

  const hasAnalysis = !!(relationship?.completeAnalysis && Object.keys(relationship.completeAnalysis).length > 0);

  const sections = [
    {
      id: 'scores',
      content: (
        <ScoresTab
          relationship={relationship}
          hasAnalysis={hasAnalysis}
          onNavigateToAnalysis={() => setActiveSection('analysis')}
          compositeId={compositeId}
          isCelebrity={true}
        />
      )
    },
    {
      id: 'overview',
      content: <OverviewTab relationship={relationship} compositeId={compositeId} isCelebrity={true} />
    },
    {
      id: 'charts',
      content: <ChartsTab relationship={relationship} compositeId={compositeId} isCelebrity={true} />
    },
    {
      id: 'analysis',
      content: (
        <AnalysisTab
          relationship={relationship}
          compositeId={compositeId}
          onAnalysisComplete={() => {}}
          isCelebrity={true}
        />
      )
    }
  ];

  return (
    <div className="public-celeb-relationship">
      <RelationshipDetailLayout
        relationship={relationship}
        onBackClick={handleBack}
        sections={sections}
        lockedSections={[]}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />
    </div>
  );
}

export default PublicCelebrityRelationship;
