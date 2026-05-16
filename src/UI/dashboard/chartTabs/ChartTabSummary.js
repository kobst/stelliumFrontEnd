import React, { useMemo, useState } from 'react';
import Ephemeris from '../../shared/Ephemeris';
import AspectMiniChart, { aspectKindFor } from '../../shared/AspectMiniChart';
import { planetIconPaths, signIconPaths } from '../../../Utilities/constants';
import './ChartTabSummary.css';

const SIGN_GLYPHS = {
  Aries: '♈', Taurus: '♉', Gemini: '♊', Cancer: '♋', Leo: '♌', Virgo: '♍',
  Libra: '♎', Scorpio: '♏', Sagittarius: '♐', Capricorn: '♑', Aquarius: '♒', Pisces: '♓',
};

const ASPECT_SYMBOLS = {
  conjunction: '☌',
  opposition: '☍',
  trine: '△',
  square: '□',
  sextile: '⚹',
  quincunx: '⚻',
};

const ASPECT_NAMES = {
  conjunction: 'Conjunct',
  opposition: 'Opposition',
  trine: 'Trine',
  square: 'Square',
  sextile: 'Sextile',
  quincunx: 'Quincunx',
};

const PLANET_ORDER = [
  'Sun', 'Moon', 'Mercury', 'Venus', 'Mars',
  'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto',
  'Chiron', 'Node', 'North Node',
];

const HIDDEN_PLANETS = new Set(['South Node', 'Part of Fortune']);

const HOUSE_BY_ANGLE = {
  Ascendant: 1,
  Descendant: 7,
  Midheaven: 10,
  MC: 10,
  IC: 4,
};

function degToMin(deg) {
  if (typeof deg !== 'number' || !Number.isFinite(deg)) return null;
  const whole = Math.floor(deg);
  const min = Math.round((deg - whole) * 60);
  if (min === 60) return { d: whole + 1, m: 0 };
  return { d: whole, m: min };
}

function formatDegMin(deg) {
  const parts = degToMin(deg);
  if (!parts) return '—';
  return `${parts.d}° ${String(parts.m).padStart(2, '0')}'`;
}

function PlanetGlyph({ name, tint, size = 18 }) {
  const src = planetIconPaths[name];
  if (!src) return <span className={`cts-glyph-fallback ${tint}`}>{name?.slice(0, 2) || '?'}</span>;
  return (
    <span
      className={`cts-glyph ${tint || ''}`}
      style={{
        '--cts-glyph-mask': `url(${src})`,
        width: size,
        height: size,
      }}
    />
  );
}

function SignGlyph({ sign, tint = 'primary', size = 14 }) {
  const src = signIconPaths[sign];
  if (!src) return <span className={`cts-glyph-fallback ${tint}`}>{SIGN_GLYPHS[sign] || '?'}</span>;
  return (
    <span
      className={`cts-glyph ${tint}`}
      style={{
        '--cts-glyph-mask': `url(${src})`,
        width: size,
        height: size,
      }}
    />
  );
}

function WheelCard({ planets, houses, aspects, counters }) {
  return (
    <section className="cts-card cts-card--wheel">
      <header className="cts-card-head">
        <h3>The Wheel</h3>
        <span className="cts-card-sub">{counters}</span>
      </header>

      <div className="cts-wheel-layout">
        <div className="cts-wheel">
          <div className="cts-wheel-halo" aria-hidden="true" />
          <div className="cts-wheel-canvas">
            <Ephemeris
              planets={planets}
              houses={houses}
              aspects={aspects}
              transits={[]}
              instanceId="chart-tab-wheel"
            />
          </div>
        </div>

        <aside className="cts-wheel-side">
          <h4>Read the lines.</h4>
          <p className="cts-wheel-desc">
            Solid green threads are flowing aspects. Dashed rose are tension. Gold is moon-tied or transformative.
          </p>
          <div className="cts-legend">
            <div className="cts-lg-row"><span className="cts-swatch flowing" />Flowing (trine, sextile)</div>
            <div className="cts-lg-row"><span className="cts-swatch tension" />Tension (square, opposition)</div>
            <div className="cts-lg-row"><span className="cts-swatch neutral" />Conjunction</div>
            <div className="cts-lg-row"><span className="cts-swatch moon" />Lunar / transformative</div>
          </div>
        </aside>
      </div>
    </section>
  );
}

function PlanetsListCard({ planets }) {
  const ordered = useMemo(() => {
    const filtered = planets.filter((p) => p?.name && !HIDDEN_PLANETS.has(p.name));
    return filtered.sort((a, b) => {
      const ai = PLANET_ORDER.indexOf(a.name);
      const bi = PLANET_ORDER.indexOf(b.name);
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    });
  }, [planets]);

  return (
    <section className="cts-card">
      <header className="cts-card-head">
        <h3>Planetary positions</h3>
        <span className="cts-card-sub">{ordered.length} bodies</span>
      </header>
      <div className="cts-planet-list">
        {ordered.map((p) => (
          <div key={p.name} className="cts-planet-row">
            <PlanetGlyph name={p.name} tint={p.name === 'Sun' ? 'gold' : 'lilac'} size={18} />
            <span className="cts-planet-name">{p.name}</span>
            <span className="cts-sign-tag">
              <span className="cts-sign-name">{p.sign}</span>
              <SignGlyph sign={p.sign} tint="gold" size={14} />
            </span>
            <span className="cts-planet-deg">{formatDegMin(p.norm_degree)}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function HousesGridCard({ houses }) {
  const HOUSE_ORDER = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  if (!houses || houses.length === 0) {
    return (
      <section className="cts-card cts-card--tonal">
        <header className="cts-card-head">
          <h3>House positions</h3>
          <span className="cts-card-sub">Placidus</span>
        </header>
        <div className="cts-empty">House data not available with unknown birth time.</div>
      </section>
    );
  }

  const byNumber = new Map();
  houses.forEach((h) => {
    if (typeof h?.house === 'number') byNumber.set(h.house, h);
  });

  return (
    <section className="cts-card cts-card--tonal">
      <header className="cts-card-head">
        <h3>House positions</h3>
        <span className="cts-card-sub">Placidus</span>
      </header>
      <div className="cts-house-grid">
        {HOUSE_ORDER.map((n) => {
          const h = byNumber.get(n);
          if (!h) return null;
          return (
            <div key={n} className="cts-house-row">
              <span className="cts-house-n">{n}</span>
              <span className="cts-house-meta">
                <SignGlyph sign={h.sign} tint="lilac" size={14} />
                <span className="cts-house-sign">{h.sign}</span>
              </span>
              <span className="cts-house-deg">
                {formatDegMin(typeof h.degree === 'number' ? h.degree % 30 : null)}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function resolvePos(name, planets, houses) {
  const houseNum = HOUSE_BY_ANGLE[name];
  if (houseNum) {
    const h = houses.find((x) => x.house === houseNum);
    if (!h) return null;
    // Angles are house cusps themselves — omit `house` to avoid the
    // redundant "Ascendant · 1st house" label.
    return {
      sign: h.sign,
      degreeInSign: typeof h.degree === 'number' ? h.degree % 30 : undefined,
    };
  }
  const p = planets.find((pl) => pl.name === name);
  if (!p) return null;
  return {
    sign: p.sign,
    degreeInSign: typeof p.norm_degree === 'number' ? p.norm_degree : undefined,
    house: typeof p.house === 'number' ? p.house : undefined,
  };
}

function KeyAspectsCard({ aspects, planets, houses }) {
  const [openIndex, setOpenIndex] = useState(null);

  const ascDeg = useMemo(() => {
    const h1 = houses.find((h) => h.house === 1);
    return typeof h1?.degree === 'number' ? h1.degree : 0;
  }, [houses]);

  const sorted = useMemo(() => {
    if (!aspects || aspects.length === 0) return [];
    return [...aspects]
      .filter((a) => a?.aspectedPlanet && a?.aspectingPlanet && a?.aspectType)
      .sort((a, b) => (a.orb ?? 999) - (b.orb ?? 999));
  }, [aspects]);

  if (sorted.length === 0) {
    return (
      <section className="cts-card cts-card--span-2">
        <header className="cts-card-head">
          <h3>Key aspects</h3>
          <span className="cts-card-sub">No aspects available</span>
        </header>
      </section>
    );
  }

  return (
    <section className="cts-card cts-card--span-2">
      <header className="cts-card-head">
        <h3>Key aspects</h3>
        <span className="cts-card-sub">Sorted by tightness · {sorted.length} total</span>
      </header>
      <div className="cts-aspect-list">
        {sorted.map((aspect, index) => {
          const aName = aspect.aspectedPlanet;
          const bName = aspect.aspectingPlanet;
          const type = aspect.aspectType?.toLowerCase();
          const kind = aspectKindFor(aspect.aspectType, aName, bName);
          const aPos = resolvePos(aName, planets, houses);
          const bPos = resolvePos(bName, planets, houses);
          const canRender = Boolean(aPos?.sign && bPos?.sign);
          const isOpen = openIndex === index;
          const symbol = ASPECT_SYMBOLS[type] || '•';
          const label = ASPECT_NAMES[type] || aspect.aspectType;
          const orbStr = typeof aspect.orb === 'number' ? `${aspect.orb.toFixed(1)}° orb` : '—';

          return (
            <React.Fragment key={`${aName}-${type}-${bName}-${index}`}>
              <div
                className={`cts-aspect-row${isOpen ? ' cts-aspect-row--open' : ''}`}
                onClick={() => canRender && setOpenIndex(isOpen ? null : index)}
                role={canRender ? 'button' : undefined}
                tabIndex={canRender ? 0 : undefined}
                aria-expanded={canRender ? isOpen : undefined}
                onKeyDown={(e) => {
                  if (!canRender) return;
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setOpenIndex(isOpen ? null : index);
                  }
                }}
                style={canRender ? { cursor: 'pointer' } : undefined}
              >
                <div className="cts-aspect-pl">
                  <PlanetGlyph name={aName} tint={aName === 'Sun' ? 'gold' : 'lilac'} size={16} />
                  <span>{aName}</span>
                </div>
                <div className={`cts-aspect-asp cts-aspect-asp--${kind}`}>
                  <span className="cts-aspect-symbol">{symbol}</span>
                  {label}
                </div>
                <div className="cts-aspect-pl cts-aspect-pl--right">
                  <span>{bName}</span>
                  <PlanetGlyph name={bName} tint={bName === 'Sun' ? 'gold' : 'lilac'} size={16} />
                </div>
                <div className="cts-aspect-orb">{orbStr}</div>
              </div>
              {isOpen && canRender ? (
                <div className="cts-aspect-mini">
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
                    relation={label}
                    kind={kind}
                    orb={typeof aspect.orb === 'number' ? aspect.orb : undefined}
                    ascendantDegree={ascDeg}
                  />
                </div>
              ) : null}
            </React.Fragment>
          );
        })}
      </div>
    </section>
  );
}

function ChartTabSummary({ planets = [], houses = [], aspects = [] }) {
  const visiblePlanets = useMemo(
    () => planets.filter((p) => p?.name && !HIDDEN_PLANETS.has(p.name)),
    [planets]
  );
  const counters = `${visiblePlanets.length} planets · ${houses.length} houses · ${aspects.length} aspects`;

  return (
    <div className="cts-root">
      <WheelCard planets={planets} houses={houses} aspects={aspects} counters={counters} />
      <div className="cts-row">
        <PlanetsListCard planets={planets} />
        <HousesGridCard houses={houses} />
      </div>
      <KeyAspectsCard aspects={aspects} planets={planets} houses={houses} />
    </div>
  );
}

export default ChartTabSummary;
