import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function CTABand({ showTitle = false }) {
  const navigate = useNavigate();

  const handleGetReading = () => {
    navigate('/birthChartEntry');
  };

  return (
    <section className="cta-band">
      <div className="cta-content">
        {showTitle && <h2 className="section-title">Ready for your first personalized reading?</h2>}
        <button className="cta-button primary" onClick={handleGetReading}>
        Get My Quick Chart Overview
        </button>
      </div>
    </section>
  );
}