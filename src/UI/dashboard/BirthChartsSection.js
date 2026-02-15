import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserSubjects, createGuestSubject } from '../../Utilities/api';
import useEntitlementsStore from '../../Utilities/entitlementsStore';
import { CREDIT_COSTS } from '../../Utilities/creditCosts';
import ChartsList from './birthCharts/ChartsList';
import AddChartModal from './AddChartModal';
import InsufficientCreditsModal from '../entitlements/InsufficientCreditsModal';
import './BirthChartsSection.css';

function BirthChartsSection({ userId, user }) {
  const navigate = useNavigate();
  const credits = useEntitlementsStore((state) => state.credits);

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

  const handleChartSubmit = async (guestData) => {
    const cost = CREDIT_COSTS.GUEST_CHART;
    if (credits.total < cost) {
      setShowPaywall(true);
      return;
    }

    setCreatingChart({ firstName: guestData.firstName, lastName: guestData.lastName });

    try {
      const result = await createGuestSubject(guestData);

      if (result.success || result.userId || result.guestSubject) {
        await loadGuestCharts();
        setSuccessMessage(`${guestData.firstName}'s birth chart created!`);
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        throw new Error(result.error || 'Failed to create chart');
      }
    } catch (err) {
      console.error('Error creating guest chart:', err);
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
