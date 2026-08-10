import React from 'react';
import { useNavigate } from 'react-router-dom';

function WordmarkGlyph() {
  return (
    <svg width="22" height="22" viewBox="0 0 100 100" fill="#cabeff" aria-hidden="true">
      <path transform="rotate(0 50 50)" d="M50 7 L51.7 50 L50 54 L48.3 50 Z" />
      <path transform="rotate(45 50 50)" d="M50 7 L51.7 50 L50 54 L48.3 50 Z" />
      <path transform="rotate(90 50 50)" d="M50 7 L51.7 50 L50 54 L48.3 50 Z" />
      <path transform="rotate(135 50 50)" d="M50 7 L51.7 50 L50 54 L48.3 50 Z" />
      <path transform="rotate(180 50 50)" d="M50 7 L51.7 50 L50 54 L48.3 50 Z" />
      <path transform="rotate(225 50 50)" d="M50 7 L51.7 50 L50 54 L48.3 50 Z" />
      <path transform="rotate(270 50 50)" d="M50 7 L51.7 50 L50 54 L48.3 50 Z" />
      <path transform="rotate(315 50 50)" d="M50 7 L51.7 50 L50 54 L48.3 50 Z" />
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
        <button type="button" className="pcc-wordmark" onClick={() => navigate('/')} aria-label="Astral Gravity home">
          <span className="pcc-wordmark__glyph"><WordmarkGlyph /></span>
          <span>Astral Gravity</span>
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
