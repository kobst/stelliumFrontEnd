import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function CTABand() {
  const navigate = useNavigate();

  const handleGetReading = () => {
    navigate('/birthChartEntry');
  };

  return (
    <section className="cta-band">
      <div className="cta-content">
        <button className="cta-button primary" onClick={handleGetReading}>
          Get My Short Personality Overview
        </button>
      </div>
    </section>
  );
}