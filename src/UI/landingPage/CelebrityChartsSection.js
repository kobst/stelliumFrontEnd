import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchCelebrities } from '../../Utilities/api';
import './CelebrityChartsSection.css';

const ZODIAC_GLYPHS = {
  'Aries': '\u2648',
  'Taurus': '\u2649',
  'Gemini': '\u264A',
  'Cancer': '\u264B',
  'Leo': '\u264C',
  'Virgo': '\u264D',
  'Libra': '\u264E',
  'Scorpio': '\u264F',
  'Sagittarius': '\u2650',
  'Capricorn': '\u2651',
  'Aquarius': '\u2652',
  'Pisces': '\u2653'
};

function CelebrityCard({ celebrity, onClick }) {
  const getInitials = () => {
    const firstName = celebrity?.firstName || '';
    const lastName = celebrity?.lastName || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getSunSign = () => {
    if (!celebrity?.birthChart?.planets) return null;
    const sun = celebrity.birthChart.planets.find(p => p.name === 'Sun');
    return sun?.sign || null;
  };

  const getMoonSign = () => {
    if (!celebrity?.birthChart?.planets) return null;
    const moon = celebrity.birthChart.planets.find(p => p.name === 'Moon');
    return moon?.sign || null;
  };

  const fullName = `${celebrity?.firstName || ''} ${celebrity?.lastName || ''}`.trim();
  const sunSign = getSunSign();
  const moonSign = getMoonSign();

  return (
    <div className="celebrity-card" onClick={onClick}>
      <div className="celebrity-card__avatar">
        {celebrity?.profilePhotoUrl ? (
          <img src={celebrity.profilePhotoUrl} alt={fullName} />
        ) : (
          <span>{getInitials()}</span>
        )}
      </div>

      <h4 className="celebrity-card__name">{fullName}</h4>

      <div className="celebrity-card__signs">
        {sunSign && (
          <span className="celebrity-card__glyph" title={`Sun in ${sunSign}`}>
            {ZODIAC_GLYPHS[sunSign]}
          </span>
        )}
        {sunSign && moonSign && (
          <span className="celebrity-card__separator">•</span>
        )}
        {moonSign && (
          <span className="celebrity-card__glyph" title={`Moon in ${moonSign}`}>
            {ZODIAC_GLYPHS[moonSign]}
          </span>
        )}
      </div>

      <button className="celebrity-card__view-btn">View</button>
    </div>
  );
}

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
        // Take first 4 celebrities
        setCelebrities(fetchedCelebrities.slice(0, 4));
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
                <CelebrityCard
                  key={celebrity._id}
                  celebrity={celebrity}
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
