import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchUser, fetchAnalysis } from '../Utilities/api';
import ChartDetailHeader from '../UI/dashboard/chartDetail/ChartDetailHeader';
import QuickFactsSidebar from '../UI/dashboard/chartDetail/QuickFactsSidebar';
import ChartTab from '../UI/dashboard/chartTabs/ChartTab';
import OverviewTab from '../UI/dashboard/chartTabs/OverviewTab';
import PlanetsTab from '../UI/dashboard/chartTabs/PlanetsTab';
import DominancePatternsTab from '../UI/dashboard/chartTabs/DominancePatternsTab';
import AnalysisTab from '../UI/dashboard/chartTabs/AnalysisTab';
import HousesSection from '../UI/dashboard/chartDetail/sections/HousesSection';
import AspectsSection from '../UI/dashboard/chartDetail/sections/AspectsSection';

// Import layout CSS files
import '../UI/dashboard/chartDetail/ChartDetailLayout.css';
import '../UI/dashboard/chartDetail/ChartDetailHeader.css';
import '../UI/dashboard/chartDetail/QuickFactsSidebar.css';
import '../UI/dashboard/chartDetail/SectionNav.css';
import '../UI/dashboard/chartTabs/ChartTabs.css';
import '../UI/dashboard/chartTabs/ChartTab.css';
import './PublicCelebrityDashboard.css';

// Section navigation for public view - matches user dashboard structure
const PUBLIC_SECTIONS = [
  { id: 'overview', label: 'Overview' },
  { id: 'chart', label: 'Chart' },
  { id: 'dominance', label: 'Patterns' },
  { id: 'planets', label: 'Planets' },
  { id: 'houses', label: 'Houses' },
  { id: 'aspects', label: 'Aspects' },
  { id: 'analysis', label: '360°' },
  { id: 'unlock', label: 'Create Yours' }
];

function PublicSectionNav({ activeSection, onSectionChange }) {
  return (
    <nav className="section-nav">
      <div className="section-nav__list">
        {PUBLIC_SECTIONS.map(section => {
          const isActive = activeSection === section.id;
          const isPromo = section.id === 'unlock';

          return (
            <button
              key={section.id}
              className={`section-nav__btn ${isActive ? 'section-nav__btn--active' : ''} ${isPromo ? 'section-nav__btn--promo' : ''}`}
              onClick={() => onSectionChange(section.id)}
            >
              <span className="section-nav__label">{section.label}</span>
              {isPromo && (
                <svg className="section-nav__star" width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

// Promotional section for premium features
function UnlockSection({ onCreateChart }) {
  return (
    <div className="unlock-section">
      <div className="unlock-header">
        <span className="unlock-icon">✦</span>
        <h3>Unlock Full Birth Chart Analysis</h3>
      </div>

      <p className="unlock-description">
        Create your own birth chart to access premium features including:
      </p>

      <div className="unlock-features">
        <div className="unlock-feature">
          <span className="unlock-feature-icon">🔮</span>
          <div className="unlock-feature-content">
            <h4>360° Deep Analysis</h4>
            <p>86 detailed interpretations across 6 life categories</p>
          </div>
        </div>
        <div className="unlock-feature">
          <span className="unlock-feature-icon">💬</span>
          <div className="unlock-feature-content">
            <h4>Ask Stellium AI</h4>
            <p>Chat with an AI astrologer about your personal chart</p>
          </div>
        </div>
        <div className="unlock-feature">
          <span className="unlock-feature-icon">📊</span>
          <div className="unlock-feature-content">
            <h4>Dominance Patterns</h4>
            <p>Discover your elemental balance and chart patterns</p>
          </div>
        </div>
        <div className="unlock-feature">
          <span className="unlock-feature-icon">💫</span>
          <div className="unlock-feature-content">
            <h4>Daily Horoscopes</h4>
            <p>Personalized transit readings based on your chart</p>
          </div>
        </div>
      </div>

      <button className="unlock-cta-btn" onClick={onCreateChart}>
        Create Your Birth Chart →
      </button>

      <p className="unlock-free-note">Free to start • No credit card required</p>
    </div>
  );
}

function PublicCelebrityDashboard() {
  const { celebrityId } = useParams();
  const navigate = useNavigate();
  const [celebrity, setCelebrity] = useState(null);
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState('overview');

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

  const handleCreateChart = () => {
    navigate('/birthChartEntry');
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

  // Check if full analysis is available
  const hasFullAnalysis = !!(broadCategoryAnalyses && Object.keys(broadCategoryAnalyses).length > 0);

  // Render active section content
  const renderSectionContent = () => {
    switch (activeSection) {
      case 'overview':
        return <OverviewTab basicAnalysis={basicAnalysis} />;
      case 'chart':
        return <ChartTab birthChart={birthChart} />;
      case 'dominance':
        return (
          <DominancePatternsTab
            birthChart={birthChart}
            basicAnalysis={basicAnalysis}
            elements={elements}
            modalities={modalities}
            quadrants={quadrants}
            planetaryDominance={planetaryDominance}
          />
        );
      case 'planets':
        return <PlanetsTab birthChart={birthChart} basicAnalysis={basicAnalysis} />;
      case 'houses':
        return <HousesSection birthChart={birthChart} basicAnalysis={basicAnalysis} />;
      case 'aspects':
        return <AspectsSection birthChart={birthChart} basicAnalysis={basicAnalysis} />;
      case 'analysis':
        if (!hasFullAnalysis) {
          return (
            <div className="chart-tab-empty">
              <h3>360° Analysis</h3>
              <p>Full analysis not available for this celebrity yet.</p>
            </div>
          );
        }
        return (
          <AnalysisTab
            broadCategoryAnalyses={broadCategoryAnalyses}
            analysisStatus={{ status: 'complete' }}
            onStartAnalysis={() => {}}
            analysisLoading={false}
          />
        );
      case 'unlock':
        return <UnlockSection onCreateChart={handleCreateChart} />;
      default:
        return <OverviewTab basicAnalysis={basicAnalysis} />;
    }
  };

  return (
    <div className="public-celebrity-dashboard">
      <div className="chart-detail-layout">
        <ChartDetailHeader
          chart={celebrity}
          onBackClick={handleBack}
        />

        <div className="chart-detail-layout__body">
          <div className="chart-detail-layout__grid">
            {/* Left: Section Navigation */}
            <div className="chart-detail-layout__nav">
              <PublicSectionNav
                activeSection={activeSection}
                onSectionChange={setActiveSection}
              />
            </div>

            {/* Center: Main Content */}
            <main className="chart-detail-layout__content">
              {renderSectionContent()}
            </main>

            {/* Right: Quick Facts Sidebar */}
            <div className="chart-detail-layout__sidebar">
              <QuickFactsSidebar chart={celebrity} />

              {/* CTA in sidebar */}
              <div className="sidebar-cta">
                <p>Want to see your own chart?</p>
                <button className="sidebar-cta-btn" onClick={handleCreateChart}>
                  Create Yours →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PublicCelebrityDashboard;
