import React from 'react';
import './RelationshipCard.css';
import { formatCalendarDate } from '../../../Utilities/dateFormatting';
import { getRelationshipSummary } from '../../../Utilities/relationshipSummary';

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
    return formatCalendarDate(dateString, 'en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  } catch {
    return dateString;
  }
};

function RelationshipCard({ relationship, onClick, onDelete }) {
  const userBName = relationship?.userB_name || 'Partner';

  // Get score from available sources
  const overall = relationship?.relationshipAnalysisStatus?.overall ||
                  relationship?.clusterScoring?.overall ||
                  relationship?.clusterAnalysis?.overall;
  const { label, blurb } = getRelationshipSummary(overall);

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
  const description = blurb || relationship?.description || '';

  const handleDeleteClick = (event) => {
    event.stopPropagation();
    event.preventDefault();
    onDelete?.(relationship._id, userBName);
  };

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
        <div className="relationship-card__header">
          <h4 className="relationship-card__name">{userBName}</h4>
          <button
            type="button"
            className="relationship-card__delete-btn"
            aria-label={`Delete relationship with ${userBName}`}
            onMouseDown={handleDeleteClick}
            onPointerDown={handleDeleteClick}
            onClick={handleDeleteClick}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M9 3h6m-9 4h12m-9 0v11m6-11v11M8 7l1 13h6l1-13"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
        {label && (
          <p className="relationship-card__archetype">{label}</p>
        )}
        {dateSignLine && (
          <p className="relationship-card__date-sign">{dateSignLine}</p>
        )}
        {description && (
          <p className="relationship-card__description">{description}</p>
        )}
      </div>
    </div>
  );
}

export default RelationshipCard;
