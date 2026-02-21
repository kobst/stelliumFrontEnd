import React from 'react';
import './CelebrityRelationshipCard.css';

const getScoreColor = (score) => {
  if (score >= 70) return '#4ade80';
  if (score >= 50) return '#facc15';
  if (score >= 30) return '#fb923c';
  return '#f87171';
};

const getDisplayName = (relationship, prefix) => {
  const first = relationship?.[`${prefix}_firstName`];
  const last = relationship?.[`${prefix}_lastName`];
  if (first && last) return `${first} ${last}`;
  return relationship?.[`${prefix}_name`] || 'Unknown';
};

const getInitial = (name) => name?.charAt(0)?.toUpperCase() || '?';

function CelebrityRelationshipCard({ relationship, onClick }) {
  const userAName = getDisplayName(relationship, 'userA');
  const userBName = getDisplayName(relationship, 'userB');

  const userAPhoto = relationship?.userA_profilePhotoUrl || relationship?.userA_photoUrl;
  const userBPhoto = relationship?.userB_profilePhotoUrl || relationship?.userB_photoUrl;

  const overall = relationship?.relationshipAnalysisStatus?.overall ||
                  relationship?.clusterScoring?.overall ||
                  relationship?.clusterAnalysis?.overall;
  const score = overall?.score;
  const percentage = score !== undefined && score !== null ? Math.round(score) : null;

  return (
    <div className="celeb-rel-card" onClick={onClick}>
      <div className="celeb-rel-card__photos">
        <div className="celeb-rel-card__photo">
          {userAPhoto ? (
            <img src={userAPhoto} alt={userAName} />
          ) : (
            <div className="celeb-rel-card__initials">{getInitial(userAName)}</div>
          )}
        </div>
        <div className="celeb-rel-card__photo">
          {userBPhoto ? (
            <img src={userBPhoto} alt={userBName} />
          ) : (
            <div className="celeb-rel-card__initials">{getInitial(userBName)}</div>
          )}
        </div>
      </div>

      <div className="celeb-rel-card__info">
        <h4 className="celeb-rel-card__names">{userAName} & {userBName}</h4>
      </div>

      {percentage !== null && (
        <div className="celeb-rel-card__score">
          <span className="celeb-rel-card__score-label">Compatibility</span>
          <span className="celeb-rel-card__score-value" style={{ color: getScoreColor(percentage) }}>
            {percentage}%
          </span>
        </div>
      )}
    </div>
  );
}

export default CelebrityRelationshipCard;
