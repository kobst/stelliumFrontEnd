import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchUser, getUserSubjects } from '../Utilities/api';
import TabMenu from '../UI/shared/TabMenu';
import './ChartDetailPage.css';

function ChartDetailPage() {
  const { userId, chartId } = useParams();
  const navigate = useNavigate();
  const [chart, setChart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const handleBackClick = () => {
    navigate(`/dashboard/${userId}`);
  };

  const getFullName = () => {
    if (!chart) return '';
    return `${chart.firstName || ''} ${chart.lastName || ''}`.trim();
  };

  const getSunSign = () => {
    if (!chart?.birthChart?.planets) return null;
    const sun = chart.birthChart.planets.find(p => p.name === 'Sun');
    return sun?.sign || null;
  };

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

  const chartTabs = [
    {
      id: 'overview',
      label: 'Overview',
      content: (
        <div className="chart-tab-content">
          <div className="placeholder-content">
            <h3>Overview</h3>
            <p>Birth chart overview will be displayed here</p>
            <div className="placeholder-icon">☉</div>
          </div>
        </div>
      )
    },
    {
      id: 'planets',
      label: 'Planets',
      content: (
        <div className="chart-tab-content">
          <div className="placeholder-content">
            <h3>Planets</h3>
            <p>Planetary positions and interpretations will be displayed here</p>
            <div className="placeholder-icon">☿♀♂</div>
          </div>
        </div>
      )
    },
    {
      id: 'patterns',
      label: 'Patterns',
      content: (
        <div className="chart-tab-content">
          <div className="placeholder-content">
            <h3>Patterns</h3>
            <p>Chart patterns and aspects will be displayed here</p>
            <div className="placeholder-icon">△</div>
          </div>
        </div>
      )
    },
    {
      id: 'analysis',
      label: '360° Analysis',
      content: (
        <div className="chart-tab-content">
          <div className="placeholder-content">
            <h3>360° Analysis</h3>
            <p>Complete chart analysis will be displayed here</p>
            <div className="placeholder-icon">◎</div>
          </div>
        </div>
      )
    },
    {
      id: 'chat',
      label: 'Ask Stellium',
      content: (
        <div className="chart-tab-content">
          <div className="placeholder-content">
            <h3>Ask Stellium</h3>
            <p>AI chat about this chart will be available here</p>
            <div className="placeholder-icon">✨</div>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="chart-detail-page">
      <div className="chart-detail-header">
        <button className="back-button" onClick={handleBackClick}>
          ← Back to Dashboard
        </button>
        <div className="chart-person-info">
          <h1 className="chart-person-name">{getFullName()}</h1>
          {getSunSign() && (
            <span className="chart-person-sign">{getSunSign()} Sun</span>
          )}
        </div>
      </div>

      <div className="chart-detail-content">
        <TabMenu tabs={chartTabs} />
      </div>
    </div>
  );
}

export default ChartDetailPage;
