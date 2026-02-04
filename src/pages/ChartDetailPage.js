import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import {
  fetchUser,
  getUserSubjects,
  fetchAnalysis,
  startFullAnalysis,
  checkFullAnalysisStatus
} from '../Utilities/api';
import { useAuth } from '../context/AuthContext';
import { useEntitlements } from '../hooks/useEntitlements';
import { useCheckout } from '../hooks/useCheckout';
import DashboardLayout from '../UI/layout/DashboardLayout';
import ChartDetailLayout from '../UI/dashboard/chartDetail/ChartDetailLayout';
import OverviewTab from '../UI/dashboard/chartTabs/OverviewTab';
import ChartTab from '../UI/dashboard/chartTabs/ChartTab';
import DominancePatternsTab from '../UI/dashboard/chartTabs/DominancePatternsTab';
import PlanetsTab from '../UI/dashboard/chartTabs/PlanetsTab';
import AnalysisTab from '../UI/dashboard/chartTabs/AnalysisTab';
import AskStelliumChartTab from '../UI/dashboard/chartTabs/AskStelliumChartTab';
import LockedContent from '../UI/shared/LockedContent';
import './ChartDetailPage.css';

function ChartDetailPage() {
  const { userId, chartId } = useParams();
  const navigate = useNavigate();
  const { stelliumUser } = useAuth();
  const entitlements = useEntitlements(stelliumUser);

  // Checkout hook for handling purchases
  const checkout = useCheckout(stelliumUser, () => {
    // Refresh entitlements after successful purchase
    entitlements.refreshEntitlements();
  });

  // Chart data state
  const [chart, setChart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Analysis data state
  const [analysisData, setAnalysisData] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisStatus, setAnalysisStatus] = useState(null);

  // Polling ref
  const pollingIntervalRef = useRef(null);

  // Load chart data
  useEffect(() => {
    const loadChart = async () => {
      try {
        setLoading(true);

        // If chartId equals userId, this is the user's own chart
        if (chartId === userId) {
          const userData = await fetchUser(userId);
          setChart(userData);
        } else {
          // Otherwise, fetch from guest subjects
          const subjects = await getUserSubjects(userId);
          const foundChart = subjects?.find(s => s._id === chartId);
          if (foundChart) {
            setChart(foundChart);
          } else {
            setError('Chart not found');
          }
        }
      } catch (err) {
        console.error('Error loading chart:', err);
        setError('Failed to load chart data');
      } finally {
        setLoading(false);
      }
    };

    if (userId && chartId) {
      loadChart();
    }
  }, [userId, chartId]);

  // Load existing analysis data
  useEffect(() => {
    const loadAnalysis = async () => {
      if (!chartId) return;

      try {
        setAnalysisLoading(true);
        const response = await fetchAnalysis(chartId);

        if (response) {
          setAnalysisData(response);
        }
      } catch (err) {
        console.error('Error loading analysis:', err);
        // Analysis not found is okay, user can start it
      } finally {
        setAnalysisLoading(false);
      }
    };

    loadAnalysis();
  }, [chartId]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  // Poll for analysis status
  const startStatusPolling = useCallback((wfId) => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    const pollStatus = async () => {
      try {
        const status = await checkFullAnalysisStatus(chartId, wfId);
        setAnalysisStatus(status);

        if (status?.completed || status?.status === 'completed' || status?.status === 'completed_with_failures') {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;

          const completeData = await fetchAnalysis(chartId);
          if (completeData) {
            setAnalysisData(completeData);
          }
          setAnalysisLoading(false);
        } else if (status?.status === 'failed') {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
          setAnalysisLoading(false);
        }
      } catch (err) {
        console.error('Error polling status:', err);
      }
    };

    pollStatus();
    pollingIntervalRef.current = setInterval(pollStatus, 3000);
  }, [chartId]);

  // Start full analysis workflow
  const handleStartAnalysis = useCallback(async () => {
    if (!chartId) return;

    try {
      setAnalysisLoading(true);
      const response = await startFullAnalysis(chartId);

      if (response?.success && response?.workflowId) {
        setAnalysisStatus(response);
        startStatusPolling(response.workflowId);
      } else {
        throw new Error(response?.error || 'Failed to start analysis');
      }
    } catch (err) {
      console.error('Error starting analysis:', err);
      setAnalysisLoading(false);
    }
  }, [chartId, startStatusPolling]);

  const handleBackClick = () => {
    navigate(`/dashboard/${userId}`);
  };

  // Extract analysis components
  const birthChart = chart?.birthChart || {};
  const basicAnalysis = analysisData?.interpretation?.basicAnalysis;
  const broadCategoryAnalyses = analysisData?.interpretation?.broadCategoryAnalyses;
  const elements = analysisData?.elements || birthChart.elements;
  const modalities = analysisData?.modalities || birthChart.modalities;
  const quadrants = analysisData?.quadrants || birthChart.quadrants;
  const planetaryDominance = analysisData?.planetaryDominance || birthChart.planetaryDominance;

  const isAnalysisComplete = !!(broadCategoryAnalyses && Object.keys(broadCategoryAnalyses).length > 0);
  const canAccessPremiumTabs = isAnalysisComplete || entitlements.isPlus;

  // Security check: Redirect if user tries to access a different user's data
  if (stelliumUser && userId !== stelliumUser._id) {
    return <Navigate to={`/dashboard/${stelliumUser._id}`} replace />;
  }

  if (loading) {
    return (
      <div className="chart-detail-page">
        <div className="chart-detail-loading">
          <div className="loading-spinner"></div>
          <p>Loading chart...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="chart-detail-page">
        <div className="chart-detail-header">
          <button className="back-button" onClick={handleBackClick}>
            ← Back to Dashboard
          </button>
        </div>
        <div className="chart-detail-error">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  // Build sections array for ChartDetailLayout
  const sections = [
    {
      id: 'overview',
      content: <OverviewTab basicAnalysis={basicAnalysis} chartId={chartId} />
    },
    {
      id: 'chart',
      content: <ChartTab birthChart={birthChart} />
    },
    {
      id: 'dominance',
      content: canAccessPremiumTabs ? (
        <DominancePatternsTab
          birthChart={birthChart}
          basicAnalysis={basicAnalysis}
          elements={elements}
          modalities={modalities}
          quadrants={quadrants}
          planetaryDominance={planetaryDominance}
        />
      ) : (
        <LockedContent
          title="Dominance & Patterns"
          description="Discover the dominant elements, modalities, and patterns that shape your personality."
          features={[
            'Element and modality balance analysis',
            'Planetary strength rankings',
            'Chart pattern identification',
            'Quadrant emphasis interpretation'
          ]}
          ctaText="Unlock with Plus"
        />
      )
    },
    {
      id: 'planets',
      content: canAccessPremiumTabs ? (
        <PlanetsTab birthChart={birthChart} basicAnalysis={basicAnalysis} />
      ) : (
        <LockedContent
          title="Planets Deep Dive"
          description="Explore detailed interpretations of each planet in your chart."
          features={[
            'Individual planet meanings in signs',
            'House placements explained',
            'Planetary aspects breakdown',
            'Retrograde planet insights'
          ]}
          ctaText="Unlock with Plus"
        />
      )
    },
    {
      id: 'analysis',
      content: canAccessPremiumTabs ? (
        <AnalysisTab
          broadCategoryAnalyses={broadCategoryAnalyses}
          analysisStatus={analysisStatus}
          onStartAnalysis={handleStartAnalysis}
          chartId={chartId}
        />
      ) : (
        <LockedContent
          title="360° Analysis"
          description="Get a comprehensive analysis covering every life area through your birth chart."
          features={[
            'Personality & identity analysis',
            'Career & life purpose insights',
            'Relationship patterns',
            '12 life area deep dives'
          ]}
          ctaText="Unlock with Plus"
          showPurchaseOption={true}
          analysisType="BIRTH_CHART"
          analysisId={chartId}
          purchasePrice={entitlements.birthChartPrice}
          showUseQuotaOption={true}
          quotaRemaining={entitlements.credits?.total || 0}
          isPlus={entitlements.isPlus}
          isLoading={checkout.isLoading}
          onUpgradeClick={checkout.startSubscription}
          onPurchase={(type, id) => checkout.purchaseAnalysis(type, id)}
          onUseQuota={async (type, id) => {
            const result = await entitlements.checkAndUseAnalysis(type, id);
            if (result.success) {
              // Refresh the page to show unlocked content
              window.location.reload();
            }
          }}
        />
      )
    },
    {
      id: 'chat',
      content: canAccessPremiumTabs ? (
        <AskStelliumChartTab chartId={chartId} isAnalysisComplete={isAnalysisComplete} />
      ) : (
        <LockedContent
          title="Ask Stellium"
          description="Chat with AI about your birth chart and get personalized insights."
          features={[
            'Ask up to 50 questions per month',
            'Personalized interpretations',
            'Aspect-by-aspect explanations',
            'Life guidance based on your placements'
          ]}
          ctaText="Unlock with Plus"
        />
      )
    }
  ];

  // Determine which sections are locked
  const lockedSections = canAccessPremiumTabs
    ? []
    : ['dominance', 'planets', 'houses', 'aspects', 'analysis', 'chat'];

  return (
    <DashboardLayout user={stelliumUser} defaultSection="birth-charts">
      {() => (
        <div className="chart-detail-page">
          {analysisLoading && !analysisStatus && (
            <div className="analysis-loading-banner">
              Loading analysis data...
            </div>
          )}
          <ChartDetailLayout
            chart={chart}
            onBackClick={handleBackClick}
            sections={sections}
            lockedSections={lockedSections}
            defaultSection="overview"
          />
        </div>
      )}
    </DashboardLayout>
  );
}

export default ChartDetailPage;
