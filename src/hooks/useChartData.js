import { useEffect, useState, useCallback, useRef } from 'react';
import {
  fetchUser,
  getUserSubjects,
  fetchAnalysis,
  startFullAnalysis,
  checkFullAnalysisStatus,
} from '../Utilities/api';
import useEntitlementsStore from '../Utilities/entitlementsStore';
import { trackChartViewed, trackAnalysisStarted, trackAnalysisCompleted } from '../Utilities/analytics';

/**
 * Chart + analysis loading for chart detail views. Mirrors the data flow
 * of ChartDetailPage so alternative layouts (the 3D reader) can reuse it;
 * ChartDetailPage itself can migrate here in a follow-up.
 */
export default function useChartData(userId, chartId) {
  const [chart, setChart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [analysisData, setAnalysisData] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisStatus, setAnalysisStatus] = useState(null);

  const pollingIntervalRef = useRef(null);

  useEffect(() => {
    const loadChart = async () => {
      try {
        setLoading(true);
        if (chartId === userId) {
          const userData = await fetchUser(userId);
          setChart(userData);
          trackChartViewed(chartId, { isGuest: false });
        } else {
          const subjects = await getUserSubjects(userId);
          const foundChart = subjects?.find((s) => s._id === chartId);
          if (foundChart) {
            setChart(foundChart);
            trackChartViewed(chartId, { isGuest: true });
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

  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  const startStatusPolling = useCallback(
    (wfId) => {
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
            trackAnalysisCompleted(chartId);

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
    },
    [chartId]
  );

  const handleStartAnalysis = useCallback(async () => {
    if (!chartId) return;
    try {
      setAnalysisLoading(true);
      const response = await startFullAnalysis(chartId);
      if (response?.billing) {
        useEntitlementsStore.getState().applyReportBilling(response.billing);
      }
      useEntitlementsStore.getState().fetchEntitlements(userId);
      trackAnalysisStarted(chartId);

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
  }, [chartId, startStatusPolling, userId]);

  const birthChart = chart?.birthChart || {};
  const basicAnalysis = analysisData?.interpretation?.basicAnalysis;
  const broadCategoryAnalyses = analysisData?.interpretation?.broadCategoryAnalyses;

  return {
    chart,
    setChart,
    loading,
    error,
    birthChart,
    analysisData,
    analysisLoading,
    analysisStatus,
    basicAnalysis,
    broadCategoryAnalyses,
    elements: analysisData?.elements || birthChart.elements,
    modalities: analysisData?.modalities || birthChart.modalities,
    quadrants: analysisData?.quadrants || birthChart.quadrants,
    planetaryDominance: analysisData?.planetaryDominance || birthChart.planetaryDominance,
    hasAnalysis: !!(basicAnalysis?.dominance || basicAnalysis?.planets),
    isAnalysisComplete: !!(broadCategoryAnalyses && Object.keys(broadCategoryAnalyses).length > 0),
    handleStartAnalysis,
  };
}
