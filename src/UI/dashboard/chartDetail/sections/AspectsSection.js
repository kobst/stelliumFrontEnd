import React from 'react';
import './AspectsSection.css';

// Aspect information with nature (harmonious/challenging/neutral)
const ASPECT_INFO = {
  'conjunction': { symbol: '\u260C', nature: 'neutral', description: 'Fusion of energies' },
  'sextile': { symbol: '\u26B9', nature: 'harmonious', description: 'Easy flow of energy' },
  'square': { symbol: '\u25A1', nature: 'challenging', description: 'Tension requiring action' },
  'trine': { symbol: '\u25B3', nature: 'harmonious', description: 'Natural talent and ease' },
  'opposition': { symbol: '\u260D', nature: 'challenging', description: 'Balancing polarities' },
  'quincunx': { symbol: 'Qx', nature: 'challenging', description: 'Adjustment needed' },
  'semisextile': { symbol: 'SS', nature: 'neutral', description: 'Subtle connection' },
  'semisquare': { symbol: 'SQ', nature: 'challenging', description: 'Minor friction' },
  'sesquiquadrate': { symbol: 'Sq', nature: 'challenging', description: 'Irritation and growth' }
};

// Planet glyphs
const PLANET_GLYPHS = {
  'Sun': '\u2609',
  'Moon': '\u263D',
  'Mercury': '\u263F',
  'Venus': '\u2640',
  'Mars': '\u2642',
  'Jupiter': '\u2643',
  'Saturn': '\u2644',
  'Uranus': '\u2645',
  'Neptune': '\u2646',
  'Pluto': '\u2647',
  'North Node': '\u260A',
  'True Node': '\u260A',
  'South Node': '\u260B',
  'Chiron': '\u26B7',
  'Lilith': '\u26B8'
};

function AspectsSection({ birthChart }) {
  const aspects = birthChart?.aspects || [];

  if (!aspects || aspects.length === 0) {
    return (
      <div className="aspects-section">
        <h2 className="aspects-section__title">Aspects</h2>
        <p className="aspects-section__empty">Aspect data not available</p>
      </div>
    );
  }

  // Group aspects by nature
  const groupedAspects = {
    harmonious: [],
    challenging: [],
    neutral: []
  };

  aspects.forEach(aspect => {
    const aspectType = aspect.aspectType?.toLowerCase();
    const info = ASPECT_INFO[aspectType] || { nature: 'neutral' };
    groupedAspects[info.nature].push(aspect);
  });

  // Sort each group by orb (tighter aspects first)
  Object.keys(groupedAspects).forEach(key => {
    groupedAspects[key].sort((a, b) => Math.abs(a.orb) - Math.abs(b.orb));
  });

  const renderAspectGroup = (title, aspects, nature) => {
    if (aspects.length === 0) return null;

    return (
      <div className={`aspects-section__group aspects-section__group--${nature}`}>
        <h3 className="aspects-section__group-title">
          {title}
          <span className="aspects-section__group-count">{aspects.length}</span>
        </h3>

        <div className="aspects-section__list">
          {aspects.map((aspect, index) => {
            const aspectType = aspect.aspectType?.toLowerCase();
            const info = ASPECT_INFO[aspectType] || { symbol: '?', description: '' };
            const planet1Glyph = PLANET_GLYPHS[aspect.aspectedPlanet] || '';
            const planet2Glyph = PLANET_GLYPHS[aspect.aspectingPlanet] || '';

            return (
              <div key={index} className="aspects-section__item">
                <div className="aspects-section__planets">
                  <span className="aspects-section__planet">
                    <span className="aspects-section__planet-glyph">{planet1Glyph}</span>
                    <span className="aspects-section__planet-name">{aspect.aspectedPlanet}</span>
                  </span>

                  <span className="aspects-section__aspect-symbol" title={aspect.aspectType}>
                    {info.symbol}
                  </span>

                  <span className="aspects-section__planet">
                    <span className="aspects-section__planet-glyph">{planet2Glyph}</span>
                    <span className="aspects-section__planet-name">{aspect.aspectingPlanet}</span>
                  </span>
                </div>

                <div className="aspects-section__details">
                  <span className="aspects-section__aspect-type">
                    {aspect.aspectType}
                  </span>
                  {aspect.orb !== undefined && (
                    <span className="aspects-section__orb">
                      Orb: {Math.abs(aspect.orb).toFixed(1)}°
                    </span>
                  )}
                </div>

                <p className="aspects-section__description">{info.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="aspects-section">
      <h2 className="aspects-section__title">Planetary Aspects</h2>
      <p className="aspects-section__intro">
        Aspects are angular relationships between planets that describe how their
        energies interact in your chart.
      </p>

      {renderAspectGroup('Harmonious Aspects', groupedAspects.harmonious, 'harmonious')}
      {renderAspectGroup('Challenging Aspects', groupedAspects.challenging, 'challenging')}
      {renderAspectGroup('Conjunctions & Other', groupedAspects.neutral, 'neutral')}
    </div>
  );
}

export default AspectsSection;
