import React, { useState, useMemo } from 'react';
import { PlanetIcon } from '../../shared/AstroIcon';
import AspectMiniChart, { aspectKindFor } from '../../shared/AspectMiniChart';
import './AspectsTable.css';

const ASPECT_SYMBOLS = {
  conjunction: '☌',
  opposition: '☍',
  trine: '△',
  square: '□',
  sextile: '⚹',
  quincunx: '⚻',
};

const ASPECT_NAMES = {
  conjunction: 'Conjunction',
  opposition: 'Opposition',
  trine: 'Trine',
  square: 'Square',
  sextile: 'Sextile',
  quincunx: 'Quincunx',
};

function getAspectSymbol(type) {
  if (!type) return '•';
  return ASPECT_SYMBOLS[type.toLowerCase()] || '•';
}

function getAspectName(type) {
  if (!type) return 'Unknown';
  return ASPECT_NAMES[type.toLowerCase()] || type;
}

function buildPlanetLookup(planets, houses) {
  const byName = new Map();
  (planets || []).forEach((p) => {
    if (!p?.name) return;
    byName.set(p.name, {
      sign: p.sign,
      degreeInSign: typeof p.norm_degree === 'number' ? p.norm_degree : undefined,
      house: typeof p.house === 'number' ? p.house : undefined,
    });
  });
  const anglePoints = [
    { name: 'Ascendant', house: 1 },
    { name: 'Descendant', house: 7 },
    { name: 'Midheaven', house: 10 },
    { name: 'MC', house: 10 },
    { name: 'IC', house: 4 },
  ];
  anglePoints.forEach(({ name, house }) => {
    if (byName.has(name)) return;
    const h = (houses || []).find((x) => x.house === house);
    if (h) {
      // Angles are house cusps themselves — omit `house` to avoid the
      // redundant "Ascendant · 1st house" label.
      byName.set(name, {
        sign: h.sign,
        degreeInSign: typeof h.degree === 'number' ? h.degree % 30 : undefined,
      });
    }
  });
  return byName;
}

const AspectsTable = ({ aspectsArray, planets = [], houses = [] }) => {
  const [openIndex, setOpenIndex] = useState(null);
  const lookup = useMemo(() => buildPlanetLookup(planets, houses), [planets, houses]);
  const ascendantDegree = useMemo(() => {
    const h1 = (houses || []).find((h) => h.house === 1);
    return typeof h1?.degree === 'number' ? h1.degree : 0;
  }, [houses]);

  if (!aspectsArray || aspectsArray.length === 0) {
    return <div className="aspects-empty">No aspects found</div>;
  }

  return (
    <div className="aspects-list">
      <table className="aspects-table">
        <tbody>
          {aspectsArray.map((aspect, index) => {
            const isOpen = openIndex === index;
            const aName = aspect.aspectedPlanet;
            const bName = aspect.aspectingPlanet;
            const aPos = lookup.get(aName);
            const bPos = lookup.get(bName);
            const canRender = Boolean(aPos?.sign && bPos?.sign);
            const kind = aspectKindFor(aspect.aspectType, aName, bName);

            return (
              <React.Fragment key={index}>
                <tr
                  className={`aspects-row${isOpen ? ' aspects-row--open' : ''}${canRender ? '' : ' aspects-row--no-mini'}`}
                  onClick={() => canRender && setOpenIndex(isOpen ? null : index)}
                  aria-expanded={canRender ? isOpen : undefined}
                  role={canRender ? 'button' : undefined}
                  tabIndex={canRender ? 0 : undefined}
                  onKeyDown={(e) => {
                    if (!canRender) return;
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setOpenIndex(isOpen ? null : index);
                    }
                  }}
                >
                  <td className="aspects-cell aspects-cell--planet">
                    <span className="aspects-symbol"><PlanetIcon name={aName} size={18} /></span>
                    <span className="aspects-planet-name">{aName}</span>
                  </td>
                  <td className="aspects-cell aspects-cell--aspect">
                    <span className="aspects-symbol">{getAspectSymbol(aspect.aspectType)}</span>
                    <span className="aspects-type-name">{getAspectName(aspect.aspectType)}</span>
                  </td>
                  <td className="aspects-cell aspects-cell--planet">
                    <span className="aspects-symbol"><PlanetIcon name={bName} size={18} /></span>
                    <span className="aspects-planet-name">{bName}</span>
                  </td>
                  <td className="aspects-cell aspects-cell--orb">
                    {aspect.orb?.toFixed(1)}°{canRender ? <span className="aspects-chev">{isOpen ? '▴' : '▾'}</span> : null}
                  </td>
                </tr>
                {isOpen && canRender ? (
                  <tr className="aspects-mini-row">
                    <td colSpan={4} className="aspects-mini-cell">
                      <AspectMiniChart
                        from={{
                          name: aName,
                          sign: aPos.sign,
                          degree: aPos.degreeInSign,
                          house: aPos.house,
                          color: aName === 'Sun' ? 'gold' : 'lilac',
                        }}
                        to={{
                          name: bName,
                          sign: bPos.sign,
                          degree: bPos.degreeInSign,
                          house: bPos.house,
                          color: bName === 'Sun' ? 'gold' : 'lilac',
                        }}
                        relation={getAspectName(aspect.aspectType)}
                        kind={kind}
                        orb={typeof aspect.orb === 'number' ? aspect.orb : undefined}
                        ascendantDegree={ascendantDegree}
                      />
                    </td>
                  </tr>
                ) : null}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default AspectsTable;
