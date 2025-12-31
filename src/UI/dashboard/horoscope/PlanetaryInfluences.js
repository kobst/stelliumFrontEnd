import React from 'react';
import './PlanetaryInfluences.css';

function PlanetaryInfluences({ influences = [], loading = false }) {
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="planetary-influences">
        <h3 className="planetary-influences__title">Key Planetary Influences</h3>
        <div className="planetary-influences__loading">
          <div className="planetary-influences__skeleton" />
          <div className="planetary-influences__skeleton" />
          <div className="planetary-influences__skeleton" />
        </div>
      </div>
    );
  }

  if (!influences || influences.length === 0) {
    return (
      <div className="planetary-influences">
        <h3 className="planetary-influences__title">Key Planetary Influences</h3>
        <p className="planetary-influences__empty">
          No significant planetary influences at this time.
        </p>
      </div>
    );
  }

  return (
    <div className="planetary-influences">
      <h3 className="planetary-influences__title">Key Planetary Influences</h3>
      <ul className="planetary-influences__list">
        {influences.map((influence, index) => (
          <li key={index} className="planetary-influences__item">
            <div className="planetary-influences__aspect">
              <span className="planetary-influences__planet">
                {influence.transitingPlanet}
              </span>
              <span className="planetary-influences__aspect-type">
                {influence.aspect}
              </span>
              <span className="planetary-influences__planet">
                {influence.targetPlanet}
              </span>
            </div>
            {influence.exactDate && (
              <span className="planetary-influences__date">
                {formatDate(influence.exactDate)}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default PlanetaryInfluences;
