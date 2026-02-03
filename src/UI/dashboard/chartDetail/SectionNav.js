import React from 'react';
import './SectionNav.css';

const ZODIAC_GLYPHS = {
  'Aries': '♈',
  'Taurus': '♉',
  'Gemini': '♊',
  'Cancer': '♋',
  'Leo': '♌',
  'Virgo': '♍',
  'Libra': '♎',
  'Scorpio': '♏',
  'Sagittarius': '♐',
  'Capricorn': '♑',
  'Aquarius': '♒',
  'Pisces': '♓'
};

const SECTIONS = [
  { id: 'overview', label: 'Overview' },
  { id: 'chart', label: 'Chart' },
  { id: 'dominance', label: 'Patterns' },
  { id: 'planets', label: 'Planets' },
  { id: 'analysis', label: '360 Analysis' },
  { id: 'chat', label: 'Ask Stellium' }
];

function SectionNav({ chart, activeSection, onSectionChange, lockedSections = [] }) {
  // Extract sign info from birth chart
  const getSunSign = () => {
    if (!chart?.birthChart?.planets) return null;
    const sun = chart.birthChart.planets.find(p => p.name === 'Sun');
    return sun?.sign || null;
  };

  const getMoonSign = () => {
    if (!chart?.birthChart?.planets) return null;
    const moon = chart.birthChart.planets.find(p => p.name === 'Moon');
    return moon?.sign || null;
  };

  const getAscendant = () => {
    if (!chart?.birthChart?.houses) return null;
    const firstHouse = chart.birthChart.houses.find(h => h.house === 1);
    return firstHouse?.sign || null;
  };

  const formatBirthDate = () => {
    // Try both possible field names
    const dateValue = chart?.dateOfBirth || chart?.birthDate;
    if (!dateValue) return '';
    try {
      const date = new Date(dateValue);
      const day = date.getDate();
      const month = date.toLocaleString('default', { month: 'long' });
      const year = date.getFullYear();
      return `${day} ${month} ${year}`;
    } catch {
      return dateValue;
    }
  };

  const formatBirthTime = () => {
    // Try both possible field names
    const timeValue = chart?.timeOfBirth || chart?.birthTime;
    if (!timeValue) return '';
    return timeValue;
  };

  const formatBirthPlace = () => {
    // Try both possible field names
    const placeValue = chart?.placeOfBirth || chart?.birthPlace;
    if (!placeValue) return '';
    // Extract city and country from birthPlace string
    const parts = placeValue.split(',');
    if (parts.length >= 2) {
      return `${parts[0].trim()} - ${parts[parts.length - 1].trim()}`;
    }
    return placeValue;
  };

  const fullName = `${chart?.firstName || ''} ${chart?.lastName || ''}`.trim() || 'Unknown';
  const sunSign = getSunSign();
  const moonSign = getMoonSign();
  const ascendant = getAscendant();
  const birthDate = formatBirthDate();
  const birthTime = formatBirthTime();
  const birthPlace = formatBirthPlace();

  return (
    <nav className="section-nav">
      {/* Person Info Section */}
      <div className="section-nav__person">
        <div className="section-nav__name-row">
          <h3 className="section-nav__name">{fullName}</h3>
          {sunSign && (
            <span className="section-nav__zodiac-icon">{ZODIAC_GLYPHS[sunSign]}</span>
          )}
        </div>

        <div className="section-nav__signs">
          {sunSign && (
            <div className="section-nav__signs-item">
              <span className="section-nav__signs-label">Sun Sign</span>
              <span className="section-nav__signs-separator">:</span>
              <span className="section-nav__signs-value">{sunSign}</span>
            </div>
          )}
          {moonSign && (
            <div className="section-nav__signs-item">
              <span className="section-nav__signs-label">Moon Sign</span>
              <span className="section-nav__signs-separator">:</span>
              <span className="section-nav__signs-value">{moonSign}</span>
            </div>
          )}
          {ascendant && (
            <div className="section-nav__signs-item">
              <span className="section-nav__signs-label">Ascendant</span>
              <span className="section-nav__signs-separator">:</span>
              <span className="section-nav__signs-value">{ascendant}</span>
            </div>
          )}
        </div>

        <div className="section-nav__birth-info">
          {birthDate && (
            <div className="section-nav__birth-item">
              <span className="section-nav__birth-label">Date of Birth</span>
              <span className="section-nav__birth-separator">:</span>
              <span className="section-nav__birth-value">{birthDate}</span>
            </div>
          )}
          {birthTime && (
            <div className="section-nav__birth-item">
              <span className="section-nav__birth-label">Time of Birth</span>
              <span className="section-nav__birth-separator">:</span>
              <span className="section-nav__birth-value">{birthTime}</span>
            </div>
          )}
          {birthPlace && (
            <div className="section-nav__birth-item">
              <span className="section-nav__birth-label">Place of Birth</span>
              <span className="section-nav__birth-separator">:</span>
              <span className="section-nav__birth-value">{birthPlace}</span>
            </div>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="section-nav__divider" />

      {/* Navigation Links */}
      <div className="section-nav__list">
        {SECTIONS.map(section => {
          const isLocked = lockedSections.includes(section.id);
          const isActive = activeSection === section.id;

          return (
            <button
              key={section.id}
              className={`section-nav__btn ${isActive ? 'section-nav__btn--active' : ''} ${isLocked ? 'section-nav__btn--locked' : ''}`}
              onClick={() => onSectionChange(section.id)}
              disabled={false}
            >
              <span className="section-nav__label">{section.label}</span>
              {isLocked && (
                <svg className="section-nav__lock" width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"/>
                </svg>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export default SectionNav;
