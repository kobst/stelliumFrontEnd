import React, { memo } from 'react';

const PlanetCard = memo(({ planet, interpretation }) => (
  <div className="planet-card">
    <h4>{planet}</h4>
    {interpretation && <p>{interpretation}</p>}
  </div>
));

export default PlanetCard;
