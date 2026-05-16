import React, { memo, useId } from 'react';
import { planetIconPaths, signIconPaths } from '../../Utilities/constants';
import './AspectMiniChart.css';

const SIGN_NAMES = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

// Fallback when no SVG asset exists for a body (e.g. Descendant, IC).
const PLANET_FALLBACK_GLYPHS = {
  Sun: '☉',
  Moon: '☽',
  Mercury: '☿',
  Venus: '♀',
  Mars: '♂',
  Jupiter: '♃',
  Saturn: '♄',
  Uranus: '♅',
  Neptune: '♆',
  Pluto: '♇',
  Chiron: '⚷',
  Node: '☊',
  'North Node': '☊',
  'South Node': '☋',
  Ascendant: '↑',
  Descendant: '↓',
  Midheaven: 'MC',
  IC: 'IC',
};
const SIGN_FALLBACK_GLYPHS = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];

const KIND_COLORS = {
  flowing: '#5dd6a0',
  tension: '#ff8a8a',
  moon: '#e9c349',
  neutral: '#cabeff',
};

const KIND_DASH = {
  flowing: undefined,
  tension: '5 4',
  moon: undefined,
  neutral: '2 3',
};

const TINT_LILAC = '#cabeff';
const TINT_GOLD = '#e9c349';

export function getPlanetGlyph(name) {
  if (!name) return '?';
  if (PLANET_FALLBACK_GLYPHS[name]) return PLANET_FALLBACK_GLYPHS[name];
  return name.slice(0, 2);
}

export function absoluteLongitude(sign, degreeInSign) {
  if (!sign) return null;
  const idx = SIGN_NAMES.indexOf(sign);
  if (idx < 0) return null;
  const within = typeof degreeInSign === 'number' && Number.isFinite(degreeInSign)
    ? degreeInSign
    : 15;
  return idx * 30 + within;
}

export function aspectKindFor(relation, fromName, toName) {
  const r = (relation || '').toLowerCase();
  if (r === 'trine' || r === 'sextile') return 'flowing';
  if (r === 'square' || r === 'opposition') return 'tension';
  if (r === 'conjunction') {
    if (fromName === 'Moon' || toName === 'Moon') return 'moon';
    return 'neutral';
  }
  return 'neutral';
}

export function formatRelation(relation) {
  if (!relation) return '';
  const r = String(relation).toLowerCase();
  return r.charAt(0).toUpperCase() + r.slice(1);
}

function polar(cx, cy, r, deg, ascDeg) {
  const adjusted = (180 - deg + (ascDeg || 0) + 360) % 360;
  const rad = (adjusted * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function tintToHex(tint) {
  if (tint === 'gold') return TINT_GOLD;
  return TINT_LILAC;
}

// Convert "#rrggbb" into normalized 0..1 RGB triplet for feColorMatrix.
function hexToRgbNorm(hex) {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const r = parseInt(full.slice(0, 2), 16) / 255;
  const g = parseInt(full.slice(2, 4), 16) / 255;
  const b = parseInt(full.slice(4, 6), 16) / 255;
  return [r, g, b];
}

// feColorMatrix that stamps a uniform color onto every non-transparent pixel
// while preserving the source alpha. The asset SVGs have transparent
// backgrounds with hardcoded fills on the paths — this recolors them.
function tintMatrix(hex, alpha = 1) {
  const [r, g, b] = hexToRgbNorm(hex);
  return `0 0 0 0 ${r} 0 0 0 0 ${g} 0 0 0 0 ${b} 0 0 0 ${alpha} 0`;
}

function AspectMiniChartImpl({
  from,
  to,
  relation,
  kind,
  orb,
  ascendantDegree = 0,
  size = 260,
}) {
  const reactId = useId();
  const filterId = (suffix) => `mini-aspect-${reactId.replace(/[^a-zA-Z0-9-]/g, '')}-${suffix}`;

  if (!from || !to) return null;

  const fromAbs = typeof from.degree === 'number' && from.degree >= 0 && from.degree <= 360 && from.sign === undefined
    ? from.degree
    : absoluteLongitude(from.sign, from.degree);
  const toAbs = typeof to.degree === 'number' && to.degree >= 0 && to.degree <= 360 && to.sign === undefined
    ? to.degree
    : absoluteLongitude(to.sign, to.degree);

  if (fromAbs === null || toAbs === null) return null;

  const cx = size / 2;
  const cy = size / 2;
  const rInner = size * 0.292;
  const rOuter = size * 0.369;
  // Aspect line endpoints sit on the inner circumference so the line forms
  // a clean chord inside the ring, never running into the planet glyphs.
  const rLine = rInner;
  const rGlyph = size * 0.431;

  const resolvedKind = kind || aspectKindFor(relation, from.name, to.name);
  const lineColor = KIND_COLORS[resolvedKind] || KIND_COLORS.neutral;
  const dash = KIND_DASH[resolvedKind];

  const fromColor = tintToHex(from.color);
  const toColor = tintToHex(to.color);

  const fromTintId = filterId('from-tint');
  const toTintId = filterId('to-tint');
  const ambientId = filterId('ambient');

  const planetGlyphSize = size * 0.09;
  const signGlyphSize = size * 0.06;

  const l1 = polar(cx, cy, rLine, fromAbs, ascendantDegree);
  const l2 = polar(cx, cy, rLine, toAbs, ascendantDegree);
  const g1 = polar(cx, cy, rGlyph, fromAbs, ascendantDegree);
  const g2 = polar(cx, cy, rGlyph, toAbs, ascendantDegree);

  const spokes = [];
  const zodiac = [];
  for (let i = 0; i < 12; i += 1) {
    const cuspDeg = i * 30;
    const a = polar(cx, cy, rInner, cuspDeg, ascendantDegree);
    const b = polar(cx, cy, rOuter, cuspDeg, ascendantDegree);
    spokes.push(
      <line
        key={`spoke-${i}`}
        x1={a.x}
        y1={a.y}
        x2={b.x}
        y2={b.y}
        stroke="rgba(202,190,255,0.16)"
        strokeWidth={0.5}
      />
    );
    const mid = polar(cx, cy, (rInner + rOuter) / 2, cuspDeg + 15, ascendantDegree);
    const signName = SIGN_NAMES[i];
    const signSrc = signIconPaths[signName];
    if (signSrc) {
      zodiac.push(
        <image
          key={`sign-${i}`}
          href={signSrc}
          xlinkHref={signSrc}
          x={mid.x - signGlyphSize / 2}
          y={mid.y - signGlyphSize / 2}
          width={signGlyphSize}
          height={signGlyphSize}
          filter={`url(#${ambientId})`}
        />
      );
    } else {
      zodiac.push(
        <text
          key={`sign-${i}`}
          x={mid.x}
          y={mid.y + signGlyphSize * 0.35}
          textAnchor="middle"
          fontFamily="Manrope, sans-serif"
          fontSize={signGlyphSize}
          fill="rgba(202,190,255,0.34)"
        >
          {SIGN_FALLBACK_GLYPHS[i]}
        </text>
      );
    }
  }

  const fromSrc = planetIconPaths[from.name];
  const toSrc = planetIconPaths[to.name];

  const renderPlanet = (pos, name, src, tintFilterId, color) => {
    if (src) {
      return (
        <image
          href={src}
          xlinkHref={src}
          x={pos.x - planetGlyphSize / 2}
          y={pos.y - planetGlyphSize / 2}
          width={planetGlyphSize}
          height={planetGlyphSize}
          filter={`url(#${tintFilterId})`}
        />
      );
    }
    return (
      <text
        x={pos.x}
        y={pos.y + planetGlyphSize * 0.35}
        textAnchor="middle"
        fontFamily="Manrope, sans-serif"
        fontSize={planetGlyphSize * 0.85}
        fill={color}
      >
        {getPlanetGlyph(name)}
      </text>
    );
  };

  const fromDegLabel = typeof from.degree === 'number' && from.sign
    ? `${from.degree.toFixed(1)}° ${from.sign}`
    : from.sign || '';
  const toDegLabel = typeof to.degree === 'number' && to.sign
    ? `${to.degree.toFixed(1)}° ${to.sign}`
    : to.sign || '';

  const legendGlyphStyle = (src, color) => (
    src
      ? { '--mini-aspect-mask': `url(${src})`, color }
      : { color }
  );

  return (
    <div className="mini-aspect">
      <svg
        className="mini-aspect-svg"
        viewBox={`0 0 ${size} ${size}`}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={`${from.name} ${relation || ''} ${to.name}`.trim()}
      >
        <defs>
          <filter id={fromTintId} colorInterpolationFilters="sRGB">
            <feColorMatrix type="matrix" values={tintMatrix(fromColor)} />
          </filter>
          <filter id={toTintId} colorInterpolationFilters="sRGB">
            <feColorMatrix type="matrix" values={tintMatrix(toColor)} />
          </filter>
          <filter id={ambientId} colorInterpolationFilters="sRGB">
            <feColorMatrix type="matrix" values={tintMatrix(TINT_LILAC, 0.34)} />
          </filter>
        </defs>
        <circle cx={cx} cy={cy} r={rOuter} fill="none" stroke="rgba(202,190,255,0.30)" strokeWidth={0.6} />
        <circle cx={cx} cy={cy} r={rInner} fill="none" stroke="rgba(202,190,255,0.18)" strokeWidth={0.5} />
        {spokes}
        {zodiac}
        <line
          x1={l1.x}
          y1={l1.y}
          x2={l2.x}
          y2={l2.y}
          stroke={lineColor}
          strokeWidth={size * 0.0085}
          strokeDasharray={dash}
          strokeLinecap="round"
          opacity={0.95}
        />
        <circle cx={l1.x} cy={l1.y} r={size * 0.01} fill={lineColor} />
        <circle cx={l2.x} cy={l2.y} r={size * 0.01} fill={lineColor} />
        {renderPlanet(g1, from.name, fromSrc, fromTintId, fromColor)}
        {renderPlanet(g2, to.name, toSrc, toTintId, toColor)}
        <circle cx={cx} cy={cy} r={size * 0.0096} fill="#e9c349" opacity={0.45} />
      </svg>

      <div className="mini-aspect-legend">
        <div className="mini-aspect-leg">
          <span
            className={`mini-aspect-leg-glyph${fromSrc ? ' mini-aspect-leg-glyph--asset' : ''}`}
            style={legendGlyphStyle(fromSrc, fromColor)}
          >
            {fromSrc ? null : getPlanetGlyph(from.name)}
          </span>
          <span className="mini-aspect-leg-meta">
            <span className="mini-aspect-leg-name">
              {from.person ? <span className="mini-aspect-leg-pers">{from.person}</span> : null}
              {from.name}
            </span>
            {fromDegLabel ? <span className="mini-aspect-leg-deg">{fromDegLabel}</span> : null}
          </span>
        </div>
        <div className="mini-aspect-rel" style={{ color: lineColor }}>
          {formatRelation(relation)}
        </div>
        <div className="mini-aspect-leg">
          <span
            className={`mini-aspect-leg-glyph${toSrc ? ' mini-aspect-leg-glyph--asset' : ''}`}
            style={legendGlyphStyle(toSrc, toColor)}
          >
            {toSrc ? null : getPlanetGlyph(to.name)}
          </span>
          <span className="mini-aspect-leg-meta">
            <span className="mini-aspect-leg-name">
              {to.person ? <span className="mini-aspect-leg-pers">{to.person}</span> : null}
              {to.name}
            </span>
            {toDegLabel ? <span className="mini-aspect-leg-deg">{toDegLabel}</span> : null}
          </span>
        </div>
      </div>

      {typeof orb === 'number' && Number.isFinite(orb) ? (
        <div className="mini-aspect-foot">Orb {orb.toFixed(1)}°</div>
      ) : null}
    </div>
  );
}

const AspectMiniChart = memo(AspectMiniChartImpl);

export default AspectMiniChart;
