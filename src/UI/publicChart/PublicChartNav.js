import React from 'react';
import { useNavigate } from 'react-router-dom';

function WordmarkGlyph() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <circle cx="15" cy="6" r="2.2" fill="#cabeff" />
      <ellipse cx="15" cy="6" rx="3.4" ry="0.9" stroke="#cabeff" strokeOpacity="0.55" strokeWidth="0.6" fill="none" transform="rotate(-18 15 6)" />
      <circle cx="11" cy="12" r="3.2" fill="#cabeff" />
      <circle cx="9" cy="17" r="1.1" fill="#cabeff" opacity="0.7" />
      <path d="M3 19 Q11 22 19 19" stroke="#cabeff" strokeWidth="0.6" fill="none" opacity="0.6" />
    </svg>
  );
}

/**
 * Public top nav for the logged-out celebrity chart.
 * Mirrors the celebrity listing page: Sign in / Start free — no logged-in artifacts.
 */
function PublicChartNav({ onSignIn, onSignUp }) {
  const navigate = useNavigate();
  return (
    <nav className="pcc pcc-nav" aria-label="Primary">
      <div className="pcc-nav__inner">
        <button type="button" className="pcc-wordmark" onClick={() => navigate('/')} aria-label="Stellium home">
          <span className="pcc-wordmark__glyph"><WordmarkGlyph /></span>
          <span>Stellium</span>
        </button>
        <div className="pcc-nav__links">
          <button type="button" className="pcc-nav__link" onClick={() => navigate('/')}>Home</button>
          <button type="button" className="pcc-nav__link" onClick={() => navigate('/horoscopes/weekly')}>Horoscopes</button>
          <span className="pcc-nav__link active">Charts</span>
          <button type="button" className="pcc-nav__link" onClick={() => navigate('/#pricing')}>Pricing</button>
          <button type="button" className="pcc-btn-ghost" onClick={onSignIn}>Sign in</button>
          <button type="button" className="pcc-btn-primary" onClick={onSignUp}>
            Start free <span className="arr">→</span>
          </button>
        </div>
      </div>
    </nav>
  );
}

export default PublicChartNav;
