import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchCelebrities } from '../../Utilities/api';
import GuestChartCard from '../dashboard/birthCharts/GuestChartCard';
import './CelebrityChartsSection.css';

function CelebrityChartsSection() {
  const navigate = useNavigate();
  const [celebrities, setCelebrities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadCelebrities() {
      try {
        setLoading(true);
        const fetchedCelebrities = await fetchCelebrities();
        // Shuffle and take random 4 celebrities
        const shuffled = [...fetchedCelebrities].sort(() => Math.random() - 0.5);
        setCelebrities(shuffled.slice(0, 4));
      } catch (err) {
        console.error('Error fetching celebrities:', err);
        setError('Unable to load celebrity charts');
      } finally {
        setLoading(false);
      }
    }
    loadCelebrities();
  }, []);

  const handleCelebrityClick = (celebrity) => {
    navigate(`/celebrities/${celebrity._id}`);
  };

  const handleViewAll = () => {
    navigate('/celebrities');
  };

  // Don't render section if no celebrities loaded and not loading
  if (!loading && celebrities.length === 0) {
    return null;
  }

  return (
    <section className="celebrity-charts-section">
      <div className="celebrity-charts-content">
        <div className="celebrity-charts-header">
          <span className="celebrity-charts-pretitle">EXPLORE CELEBRITY CHARTS</span>
          <h2 className="celebrity-charts-title">See how the stars align for your favorite celebrities</h2>
        </div>

        {loading ? (
          <div className="celebrity-charts-loading">Loading celebrity charts...</div>
        ) : error ? (
          <div className="celebrity-charts-error">{error}</div>
        ) : (
          <>
            <div className="celebrity-cards-container">
              {celebrities.map((celebrity) => (
                <GuestChartCard
                  key={celebrity._id}
                  chart={celebrity}
                  onClick={() => handleCelebrityClick(celebrity)}
                />
              ))}
            </div>

            <button className="celebrity-charts-view-all" onClick={handleViewAll}>
              View All Celebrity Charts →
            </button>
          </>
        )}
      </div>
    </section>
  );
}

export default CelebrityChartsSection;
