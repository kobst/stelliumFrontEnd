import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getUserSubjects,
  createGuestSubject,
  deleteSubject,
  getProfilePhotoPresignedUrl,
  uploadProfilePhotoToS3,
  confirmProfilePhotoUpload
} from '../../Utilities/api';
import useEntitlementsStore from '../../Utilities/entitlementsStore';
import { CREDIT_COSTS } from '../../Utilities/creditCosts';
import ChartsList from './birthCharts/ChartsList';
import AddChartModal from './AddChartModal';
import InsufficientCreditsModal from '../entitlements/InsufficientCreditsModal';
import './BirthChartsSection.css';

function BirthChartsSection({ userId, user }) {
  const navigate = useNavigate();
  const credits = useEntitlementsStore((state) => state.credits);
  const fetchEntitlements = useEntitlementsStore((state) => state.fetchEntitlements);
  const applyOptimisticCreditSpend = useEntitlementsStore((state) => state.applyOptimisticCreditSpend);
  const restoreCredits = useEntitlementsStore((state) => state.restoreCredits);

  const [guestCharts, setGuestCharts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [creatingChart, setCreatingChart] = useState(null);
  const [showPaywall, setShowPaywall] = useState(false);

  const loadGuestCharts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getUserSubjects(userId);
      // Filter out the user's own chart (kind: 'accountSelf')
      const guests = (response || []).filter(subject => subject.kind !== 'accountSelf');
      setGuestCharts(guests);
    } catch (err) {
      console.error('Error fetching guest charts:', err);
      setError('Failed to load guest charts');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      loadGuestCharts();
    }
  }, [userId, loadGuestCharts]);

  const handleChartClick = (chartId) => {
    navigate(`/dashboard/${userId}/chart/${chartId}`);
  };

  const handleAddChart = () => {
    setIsModalOpen(true);
  };

  const handleDeleteChart = async (chartId, chartName) => {
    const confirmed = window.confirm(
      `Delete ${chartName || 'this birth chart'}? This action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteSubject(chartId, userId);
      setGuestCharts((currentCharts) => currentCharts.filter((chart) => chart._id !== chartId));
      setSuccessMessage(`${chartName || 'Birth chart'} deleted.`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error deleting guest chart:', err);
      setError(`Failed to delete ${chartName || 'birth chart'}. Please try again.`);
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleChartSubmit = async (guestData) => {
    const cost = CREDIT_COSTS.GUEST_CHART;
    if (credits.total < cost) {
      setShowPaywall(true);
      return;
    }

    // Extract photoFile before sending to API (not a server field)
    const { photoFile, ...apiData } = guestData;

    setCreatingChart({ firstName: guestData.firstName, lastName: guestData.lastName });

    let creditsSnapshot = null;
    try {
      creditsSnapshot = applyOptimisticCreditSpend(cost);
      const result = await createGuestSubject(apiData);

      if (result.success || result.userId || result.guestSubject) {
        // Upload photo if provided
        const subjectId = result.userId || result.guestSubject?._id;
        if (photoFile && subjectId) {
          try {
            const { uploadUrl, photoKey } = await getProfilePhotoPresignedUrl(subjectId, photoFile.type);
            await uploadProfilePhotoToS3(uploadUrl, photoFile);
            await confirmProfilePhotoUpload(subjectId, photoKey);
          } catch (photoErr) {
            console.error('Photo upload failed (chart still created):', photoErr);
          }
        }

        await loadGuestCharts();
        fetchEntitlements(userId);
        setSuccessMessage(`${guestData.firstName}'s birth chart created!`);
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        throw new Error(result.error || 'Failed to create chart');
      }
    } catch (err) {
      console.error('Error creating guest chart:', err);
      restoreCredits(creditsSnapshot);
      if (err?.statusCode === 402) {
        setShowPaywall(true);
      } else {
        setError(`Failed to create chart for ${guestData.firstName}. Please try again.`);
        setTimeout(() => setError(null), 5000);
      }
    } finally {
      setCreatingChart(null);
    }
  };

  return (
    <div className="birth-charts-section">
      <ChartsList
        userChart={user}
        guestCharts={guestCharts}
        onChartClick={handleChartClick}
        onDeleteChart={handleDeleteChart}
        onAddChart={handleAddChart}
        loading={loading}
        error={error}
      />

      {/* Success message */}
      {successMessage && (
        <div className="success-toast">{successMessage}</div>
      )}

      {/* Creating Chart Indicator */}
      {creatingChart && (
        <div className="creating-chart-indicator">
          <div className="creating-spinner"></div>
          <span>Creating chart for {creatingChart.firstName} {creatingChart.lastName}...</span>
        </div>
      )}

      {/* Add Chart Modal */}
      <AddChartModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userId={userId}
        onSubmit={handleChartSubmit}
      />

      <InsufficientCreditsModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        creditsNeeded={CREDIT_COSTS.GUEST_CHART}
        creditsAvailable={credits.total}
        onBuyCredits={() => { setShowPaywall(false); navigate('/pricingTable'); }}
        onSubscribe={() => { setShowPaywall(false); navigate('/pricingTable'); }}
      />
    </div>
  );
}

export default BirthChartsSection;
