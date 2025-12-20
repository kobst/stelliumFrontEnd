import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserSubjects, createGuestSubject } from '../../Utilities/api';
import AddChartModal from './AddChartModal';
import './BirthChartsSection.css';

function BirthChartsSection({ userId, user }) {
  const navigate = useNavigate();
  const [guestCharts, setGuestCharts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [creatingChart, setCreatingChart] = useState(null); // { firstName, lastName }

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
    // Show creating indicator with guest name
    setCreatingChart({ firstName: guestData.firstName, lastName: guestData.lastName });

    try {
      const result = await createGuestSubject(guestData);

      if (result.success || result.userId || result.guestSubject) {
        // Success - refresh list and show message
        await loadGuestCharts();
        setSuccessMessage(`${guestData.firstName}'s birth chart created!`);
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        throw new Error(result.error || 'Failed to create chart');
      }
    } catch (err) {
      console.error('Error creating guest chart:', err);
      setError(`Failed to create chart for ${guestData.firstName}. Please try again.`);
      setTimeout(() => setError(null), 5000);
    } finally {
      setCreatingChart(null);
    }
  };

  const getSunSign = (chart) => {
    if (!chart?.birthChart?.planets) return null;
    const sun = chart.birthChart.planets.find(p => p.name === 'Sun');
    return sun?.sign || null;
  };

  const getMoonSign = (chart) => {
    if (!chart?.birthChart?.planets) return null;
    const moon = chart.birthChart.planets.find(p => p.name === 'Moon');
    return moon?.sign || null;
  };

  const getInitials = (chart) => {
    const firstName = chart.firstName || '';
    const lastName = chart.lastName || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <div className="birth-charts-section">
      {/* User's own chart - highlighted */}
      <div className="charts-group">
        <h3 className="charts-group-title">Your Chart</h3>
        <div
          className="chart-card chart-card-primary"
          onClick={() => handleChartClick(userId)}
        >
          <div className="chart-card-avatar">
            {user?.profilePhotoUrl ? (
              <img src={user.profilePhotoUrl} alt="You" />
            ) : (
              <span>{getInitials(user || {})}</span>
            )}
          </div>
          <div className="chart-card-info">
            <h4 className="chart-card-name">
              {user?.firstName} {user?.lastName}
            </h4>
            <p className="chart-card-signs">
              {getSunSign(user) && `${getSunSign(user)} Sun`}
              {getSunSign(user) && getMoonSign(user) && ' • '}
              {getMoonSign(user) && `${getMoonSign(user)} Moon`}
            </p>
          </div>
          <div className="chart-card-arrow">→</div>
        </div>
      </div>

      {/* Guest charts */}
      <div className="charts-group">
        <h3 className="charts-group-title">Guest Charts</h3>

        {loading ? (
          <div className="charts-loading">Loading guest charts...</div>
        ) : error ? (
          <div className="charts-error">{error}</div>
        ) : guestCharts.length === 0 ? (
          <div className="charts-empty">
            <p>No guest charts yet</p>
            <p className="charts-empty-hint">Add birth charts for friends and family</p>
          </div>
        ) : (
          <div className="charts-list">
            {guestCharts.map(chart => (
              <div
                key={chart._id}
                className="chart-card"
                onClick={() => handleChartClick(chart._id)}
              >
                <div className="chart-card-avatar">
                  {chart.profilePhotoUrl ? (
                    <img src={chart.profilePhotoUrl} alt={chart.firstName} />
                  ) : (
                    <span>{getInitials(chart)}</span>
                  )}
                </div>
                <div className="chart-card-info">
                  <h4 className="chart-card-name">
                    {chart.firstName} {chart.lastName}
                  </h4>
                  <p className="chart-card-signs">
                    {getSunSign(chart) && `${getSunSign(chart)} Sun`}
                    {getSunSign(chart) && getMoonSign(chart) && ' • '}
                    {getMoonSign(chart) && `${getMoonSign(chart)} Moon`}
                  </p>
                </div>
                <div className="chart-card-arrow">→</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add chart button */}
      <button className="add-chart-button" onClick={handleAddChart}>
        + Add Birth Chart
      </button>

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
    </div>
  );
}

export default BirthChartsSection;
