import React from 'react';
import './RelationshipCard.css';

// Zodiac sign names
const SIGN_NAMES = {
  'Aries': 'Aries',
  'Taurus': 'Taurus',
  'Gemini': 'Gemini',
  'Cancer': 'Cancer',
  'Leo': 'Leo',
  'Virgo': 'Virgo',
  'Libra': 'Libra',
  'Scorpio': 'Scorpio',
  'Sagittarius': 'Sagittarius',
  'Capricorn': 'Capricorn',
  'Aquarius': 'Aquarius',
  'Pisces': 'Pisces'
};

// Get sign from planets array
const getSign = (planets, planetName) => {
  if (!planets || !Array.isArray(planets)) return null;
  const planet = planets.find(p => p.name === planetName);
  return planet?.sign || null;
};

// Format date to readable format
const formatDate = (dateString) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'long' });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  } catch {
    return dateString;
  }
};

// Get color based on score
const getScoreColor = (score) => {
  if (score >= 70) return '#4ade80'; // Green for high scores
  if (score >= 50) return '#facc15'; // Yellow/amber for medium
  if (score >= 30) return '#fb923c'; // Orange for lower
  return '#f87171'; // Red for low scores
};

function RelationshipCard({ relationship, onClick }) {
  const userBName = relationship?.userB_name || 'Partner';

  // Get score from available sources
  const overall = relationship?.relationshipAnalysisStatus?.overall ||
                  relationship?.clusterScoring?.overall ||
                  relationship?.clusterAnalysis?.overall;
  const score = overall?.score;

  // Get birth data for partner (userB)
  const userBPlanets = relationship?.userB_birthChart?.planets;
  const userBDateOfBirth = relationship?.userB_dateOfBirth || relationship?.userB_birthDate;
  const userBSunSign = getSign(userBPlanets, 'Sun');

  // Get photo URL for partner
  const userBPhotoUrl = relationship?.userB_profilePhotoUrl || relationship?.userB_photoUrl;

  // Format display data
  const formattedDate = formatDate(userBDateOfBirth);
  const displaySign = userBSunSign ? SIGN_NAMES[userBSunSign] : '';
  const dateSignLine = [formattedDate, displaySign].filter(Boolean).join(' - ');

  // Get description/summary if available
  const description = overall?.description || overall?.summary || relationship?.description || '';

  // Calculate percentage and color
  const percentage = score !== undefined && score !== null ? Math.round(score) : null;
  const scoreColor = percentage !== null ? getScoreColor(percentage) : '#4ade80';

  return (
    <div className="relationship-card" onClick={onClick}>
      {/* Photo */}
      <div className="relationship-card__photo">
        {userBPhotoUrl ? (
          <img src={userBPhotoUrl} alt={userBName} />
        ) : (
          <div className="relationship-card__initials">
            {userBName.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      {/* Info section */}
      <div className="relationship-card__info">
        <h4 className="relationship-card__name">{userBName}</h4>
        {dateSignLine && (
          <p className="relationship-card__date-sign">{dateSignLine}</p>
        )}
        {description && (
          <p className="relationship-card__description">{description}</p>
        )}
      </div>

      {/* Score section */}
      {percentage !== null && (
        <div className="relationship-card__score-section">
          <span className="relationship-card__score-label">Compatibility<br/>Factor</span>
          <span className="relationship-card__percentage" style={{ color: scoreColor }}>
            {percentage}%
          </span>
        </div>
      )}
    </div>
  );
}

export default RelationshipCard;
