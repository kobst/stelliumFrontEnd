import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchUser, fetchAnalysis } from '../Utilities/api';
import { useAuth } from '../context/AuthContext';
import AskStelliumPanel from '../UI/askStellium/AskStelliumPanel';
import ChartDetailLayout from '../UI/dashboard/chartDetail/ChartDetailLayout';
import AskStelliumCta from '../UI/dashboard/chartTabs/AskStelliumCta';
import ChartTab from '../UI/dashboard/chartTabs/ChartTab';
import OverviewTab from '../UI/dashboard/chartTabs/OverviewTab';
import PlanetsTab from '../UI/dashboard/chartTabs/PlanetsTab';
import DominancePatternsTab from '../UI/dashboard/chartTabs/DominancePatternsTab';
import AnalysisTab from '../UI/dashboard/chartTabs/AnalysisTab';
import './PublicCelebrityDashboard.css';

function PublicCelebrityDashboard() {
  const { celebrityId } = useParams();
  const navigate = useNavigate();
  const { isFullyAuthenticated } = useAuth();
  const [celebrity, setCelebrity] = useState(null);
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState('overview');
  const [askOpen, setAskOpen] = useState(false);

  useEffect(() => {
    const loadCelebrityData = async () => {
      try {
        setLoading(true);

        // Fetch celebrity profile
        const data = await fetchUser(celebrityId);
        setCelebrity(data);

        // Fetch analysis data (for overview)
        try {
          const analysis = await fetchAnalysis(celebrityId);
          if (analysis) {
            setAnalysisData(analysis);
          }
        } catch (analysisErr) {
          // Analysis may not exist, that's okay
          console.log('No analysis data available for celebrity');
        }
      } catch (err) {
        console.error('Error loading celebrity:', err);
        setError('Celebrity not found');
      } finally {
        setLoading(false);
      }
    };

    if (celebrityId) {
      loadCelebrityData();
    }
  }, [celebrityId]);

  const handleBack = () => {
    navigate('/celebrities');
  };

  const handleAskStelliumClick = () => {
    if (!isFullyAuthenticated) {
      navigate('/login', { state: { from: `/celebrities/${celebrityId}` } });
      return;
    }
    setAskOpen(true);
  };

  if (loading) {
    return (
      <div className="public-celebrity-dashboard">
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>
          <p>Loading celebrity chart...</p>
        </div>
      </div>
    );
  }

  if (error || !celebrity) {
    return (
      <div className="public-celebrity-dashboard">
        <div className="dashboard-error">
          <p>{error || 'Celebrity not found'}</p>
          <button className="back-btn" onClick={handleBack}>← Back to Celebrities</button>
        </div>
      </div>
    );
  }

  // Extract analysis components (same structure as ChartDetailPage)
  const birthChart = celebrity?.birthChart || {};
  const basicAnalysis = analysisData?.interpretation?.basicAnalysis;
  const broadCategoryAnalyses = analysisData?.interpretation?.broadCategoryAnalyses;
  const elements = analysisData?.elements || birthChart.elements;
  const modalities = analysisData?.modalities || birthChart.modalities;
  const quadrants = analysisData?.quadrants || birthChart.quadrants;
  const planetaryDominance = analysisData?.planetaryDominance || birthChart.planetaryDominance;
  const renderWithAskStellium = (content) => (
    <>
      {content}
      <div className="public-celebrity-dashboard__ask-inline">
        <AskStelliumCta
          hasFullAccess
          onActivate={handleAskStelliumClick}
        />
      </div>
    </>
  );

  // Celebrities always have full analysis
  // Build sections array — all content is accessible for celebrities (no locking)
  const sections = [
    {
      id: 'overview',
      content: renderWithAskStellium(
        <OverviewTab basicAnalysis={basicAnalysis} birthChart={birthChart} isCelebrity={true} />
      )
    },
    {
      id: 'chart',
      content: renderWithAskStellium(
        <ChartTab birthChart={birthChart} isCelebrity={true} />
      )
    },
    {
      id: 'dominance',
      content: renderWithAskStellium(
        <DominancePatternsTab
          birthChart={birthChart}
          basicAnalysis={basicAnalysis}
          elements={elements}
          modalities={modalities}
          quadrants={quadrants}
          planetaryDominance={planetaryDominance}
          hasAnalysis={true}
          isCelebrity={true}
        />
      )
    },
    {
      id: 'planets',
      content: renderWithAskStellium(
        <PlanetsTab
          birthChart={birthChart}
          basicAnalysis={basicAnalysis}
          hasAnalysis={true}
          isCelebrity={true}
        />
      )
    },
    {
      id: 'analysis',
      content: renderWithAskStellium(
        <AnalysisTab
          broadCategoryAnalyses={broadCategoryAnalyses}
          analysisStatus={{ status: 'complete' }}
          onStartAnalysis={() => {}}
          analysisLoading={false}
          isCelebrity={true}
        />
      )
    }
  ];

  return (
    <div className="public-celebrity-dashboard">
      <ChartDetailLayout
        chart={celebrity}
        onBackClick={handleBack}
        sections={sections}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        hasAnalysis={true}
      />

      <AskStelliumPanel
        isOpen={askOpen}
        onClose={() => setAskOpen(false)}
        contentType="birthchart"
        contentId={celebrityId}
        birthChart={birthChart}
        contextLabel={`${celebrity.firstName || 'Celebrity'} ${celebrity.lastName || ''}`.trim()}
        placeholderText="Ask about this celebrity birth chart..."
        suggestedQuestions={[
          'What stands out most in this chart?',
          'How does this chart describe their public image?',
          'Which placements shape their creative style?'
        ]}
      />
    </div>
  );
}

export default PublicCelebrityDashboard;
