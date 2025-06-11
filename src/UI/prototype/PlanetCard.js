import React, { memo } from 'react';

const PlanetCard = memo(({ planet, interpretation, description }) => (
  <div className="planet-card">
    <h4>{planet}</h4>
    {description && (
      <div className="planet-positions">
        <p>{description}</p>
      </div>
    )}
    {interpretation && (
      <div className="interpretation">
        <p>{interpretation}</p>
      </div>
    )}
  </div>
));

export default PlanetCard;
