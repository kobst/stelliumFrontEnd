import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function CTABand({ showTitle = false, onGetStarted }) {
  const navigate = useNavigate();
  const { stelliumUser } = useAuth();

  const handleClick = () => {
    if (onGetStarted) {
      onGetStarted();
    } else if (stelliumUser) {
      navigate(`/dashboard/${stelliumUser._id}`);
    } else {
      navigate('/birthChartEntry');
    }
  };

  const buttonLabel = stelliumUser ? 'Go to Your Dashboard' : 'Get Started Free';

  return (
    <section className="cta-band">
      <div className="cta-content">
        {showTitle && <h2 className="section-title">Ready for your first personalized reading?</h2>}
        <button className="cta-button primary" onClick={handleClick}>
          {buttonLabel}
        </button>
      </div>
    </section>
  );
}
