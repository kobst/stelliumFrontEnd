import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchUser, fetchAnalysis } from '../Utilities/api';
import ChartDetailLayout from '../UI/dashboard/chartDetail/ChartDetailLayout';
import ChartTab from '../UI/dashboard/chartTabs/ChartTab';
import OverviewTab from '../UI/dashboard/chartTabs/OverviewTab';
import PlanetsTab from '../UI/dashboard/chartTabs/PlanetsTab';
import DominancePatternsTab from '../UI/dashboard/chartTabs/DominancePatternsTab';
import AnalysisTab from '../UI/dashboard/chartTabs/AnalysisTab';
import './PublicCelebrityDashboard.css';

function PublicCelebrityDashboard() {
  const { celebrityId } = useParams();
  const navigate = useNavigate();
  const [celebrity, setCelebrity] = useState(null);
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const hasFullAnalysis = !!(broadCategoryAnalyses && Object.keys(broadCategoryAnalyses).length > 0);

  // Build sections array — all content is accessible for celebrities (no locking)
  const sections = [
    {
      id: 'overview',
      content: <OverviewTab basicAnalysis={basicAnalysis} />
    },
    {
      id: 'chart',
      content: <ChartTab birthChart={birthChart} />
    },
    {
      id: 'dominance',
      content: (
        <DominancePatternsTab
          birthChart={birthChart}
          basicAnalysis={basicAnalysis}
          elements={elements}
          modalities={modalities}
          quadrants={quadrants}
          planetaryDominance={planetaryDominance}
        />
      )
    },
    {
      id: 'planets',
      content: <PlanetsTab birthChart={birthChart} basicAnalysis={basicAnalysis} />
    },
    {
      id: 'analysis',
      content: hasFullAnalysis ? (
        <AnalysisTab
          broadCategoryAnalyses={broadCategoryAnalyses}
          analysisStatus={{ status: 'complete' }}
          onStartAnalysis={() => {}}
          analysisLoading={false}
        />
      ) : (
        <div className="chart-tab-empty">
          <h3>360° Analysis</h3>
          <p>Full analysis not available for this celebrity yet.</p>
        </div>
      )
    }
  ];

  return (
    <div className="public-celebrity-dashboard">
      <ChartDetailLayout
        chart={celebrity}
        onBackClick={handleBack}
        sections={sections}
        defaultSection="overview"
      />
    </div>
  );
}

export default PublicCelebrityDashboard;
