import React, { useEffect, useRef, useState } from 'react';
import { BODIES } from '../shared/chartScene/constants';
import { toSceneBodyNames } from '../../Utilities/chartSceneAdapter';
import './PatternLenses.css';

// ── journey-native graphics for the Patterns act ──────────────────────
// Each lens is its own scroll step, in one of three layout patterns:
//   hero   — big centered visual, one-line takeaway above, narrative
//            full-width below (Elements, Modalities)
//   capped — visual beside text; the visual sets the section height and
//            longer text tucks behind a Read-more (Quadrants)
//   split  — side-by-side, top-aligned (Planetary Influence)
// The scroll is the tab bar; the reading never outruns its picture.

const ELEMENT_COLORS = {
  fire: '#ff7a59',
  earth: '#5dd6a0',
  air: '#e9c349',
  water: '#5bc8d6',
};
const MODALITY_COLORS = {
  cardinal: '#e9c349',
  fixed: '#5dd6a0',
  mutable: '#5bc8d6',
};
const QUADRANT_COLORS = {
  southeast: '#b0527a',
  southwest: '#6f5fa8',
  northeast: '#2f8f6b',
  northwest: '#41496e',
};
const ASPECT_LINE_COLORS = {
  conjunction: '#e9c349',
  square: '#e05a6d',
  opposition: '#e05a6d',
  trine: '#5bc8d6',
  sextile: '#5dd6a0',
};

const sceneInfo = (backendName) => {
  const scene = toSceneBodyNames([backendName])?.[0];
  return scene ? BODIES[scene] : null;
};
const glyphOf = (name) => (sceneInfo(name)?.glyph || '·') + '︎';
const colorOf = (name) => sceneInfo(name)?.color || 'rgba(236,232,255,0.6)';
const keyOf = (name) => String(name || '').toLowerCase().replace(/[^a-z]/g, '');
const spaceOut = (name) => String(name || '').replace(/([a-z])([A-Z])/g, '$1 $2');

function Interpretation({ text }) {
  if (!text) return null;
  return (
    <div className="lens-text">
      {text.split('\n').map((p) => p.trim()).filter(Boolean).map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </div>
  );
}

const hoverProps = (onHoverBodies, names) => ({
  onMouseEnter: () => onHoverBodies?.(names?.length ? names : null),
  onMouseLeave: () => onHoverBodies?.(null),
});

/** one-line hook above a hero visual: "Fire & Water dominant — 33% each" */
function takeawayLine(items, verb = 'dominant') {
  const sorted = [...items].sort((a, b) => (b.percentage || 0) - (a.percentage || 0));
  const [a, b] = sorted;
  if (!a) return null;
  const pa = Math.round(a.percentage || 0);
  const pb = b ? Math.round(b.percentage || 0) : -1;
  if (b && Math.abs(pa - pb) <= 2) {
    return `${spaceOut(a.name)} & ${spaceOut(b.name)} ${verb} — ${pa}% each`;
  }
  return `${spaceOut(a.name)} ${verb} — ${pa}%`;
}

/**
 * Pattern-B text column: capped to the visual's height, with a
 * Read-more that only appears when the narrative actually overflows.
 */
function CappedText({ text }) {
  const [expanded, setExpanded] = useState(false);
  const [overflowing, setOverflowing] = useState(false);
  const ref = useRef(null);
  // the cap is on by default (CSS max-height); measure against it so the
  // fade + Read-more only render when the narrative actually overflows.
  // ResizeObserver re-measures on any size change (fonts, viewport,
  // late-arriving styles) — a single mount-time check can race the CSS.
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const measure = () => setOverflowing(el.scrollHeight > el.clientHeight + 8);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [text]);
  if (!text) return null;
  return (
    <div
      ref={ref}
      className={`lens-capped__text${expanded ? ' open' : ''}${overflowing && !expanded ? ' fade' : ''}`}
    >
      <Interpretation text={text} />
      {(overflowing || expanded) && (
        <button className="lens-more" onClick={() => setExpanded((v) => !v)}>
          {expanded ? 'Show less' : 'Read more'}
        </button>
      )}
    </div>
  );
}

// ── 1 · Elements ──────────────────────────────────────────────────────
export function ElementsLens({ data = [], interpretation, onHoverBodies }) {
  const items = [...data].sort((a, b) => (b.percentage || 0) - (a.percentage || 0));
  return (
    <div className="lens-hero">
      <p className="lens-take">{takeawayLine(items, 'dominant')}</p>
      <div className="lens-hero__visual">
        <div className="lens-ebar lens-ebar--hero">
          {items.map((it, i) => (
            <span
              key={i}
              style={{ flex: it.percentage || 0.001, background: ELEMENT_COLORS[keyOf(it.name)] || '#666' }}
            />
          ))}
        </div>
        <div className="lens-etiles">
          {items.map((it, i) => (
            <div className="lens-etile" key={i} {...hoverProps(onHoverBodies, it.planets)}>
              <div className="eh">
                <span className="sw" style={{ background: ELEMENT_COLORS[keyOf(it.name)] || '#666' }} />
                <span className="en">{spaceOut(it.name)}</span>
              </div>
              <div className="pc">{(it.percentage || 0).toFixed(0)}%</div>
              <div className="eps">
                {(it.planets || []).map((p, j) => (
                  <span key={j} style={{ color: colorOf(p) }} title={p}>
                    {glyphOf(p)}
                  </span>
                ))}
                {!(it.planets || []).length && '—'}
              </div>
            </div>
          ))}
        </div>
      </div>
      <Interpretation text={interpretation} />
    </div>
  );
}

// ── 2 · Modalities ────────────────────────────────────────────────────
export function ModalitiesLens({ data = [], interpretation, onHoverBodies }) {
  return (
    <div className="lens-hero">
      <p className="lens-take">{takeawayLine(data, 'leads')}</p>
      <div className="lens-gauges lens-gauges--hero">
        {data.map((it, i) => {
          const pct = (it.percentage || 0) / 100;
          const color = MODALITY_COLORS[keyOf(it.name)] || '#cabeff';
          return (
            <div className="lens-gauge" key={i} {...hoverProps(onHoverBodies, it.planets)}>
              <svg viewBox="0 0 64 40">
                <path
                  d="M 6 34 A 26 26 0 0 1 58 34"
                  fill="none"
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
                <path
                  d="M 6 34 A 26 26 0 0 1 58 34"
                  fill="none"
                  stroke={color}
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeDasharray={`${(pct * 81.7).toFixed(1)} 999`}
                />
              </svg>
              <div className="gv">{(it.percentage || 0).toFixed(0)}%</div>
              <div className="gn" style={{ color }}>
                {spaceOut(it.name)}
              </div>
              <div className="gp">
                {(it.planets || []).map((p, j) => (
                  <span key={j} style={{ color: colorOf(p) }} title={p}>
                    {glyphOf(p)}
                  </span>
                ))}
                {!(it.planets || []).length && '—'}
              </div>
            </div>
          );
        })}
      </div>
      <Interpretation text={interpretation} />
    </div>
  );
}

// ── 3 · Quadrants ─────────────────────────────────────────────────────
const QUADRANT_ORDER = ['southeast', 'southwest', 'northeast', 'northwest'];
export function QuadrantsLens({ data = [], interpretation, onHoverBodies }) {
  const byKey = {};
  data.forEach((it) => {
    byKey[keyOf(it.name)] = it;
  });
  return (
    <div className="lens-capped">
      <div className="lens-quadgrid lens-capped__viz">
        <span className="ax s">S</span>
        <span className="ax n">N</span>
        <span className="ax e">E</span>
        <span className="ax w">W</span>
        {QUADRANT_ORDER.map((k) => {
          const it = byKey[k] || { name: k, percentage: 0, planets: [] };
          return (
            <div
              className="qd"
              key={k}
              style={{ '--qc': QUADRANT_COLORS[k] }}
              {...hoverProps(onHoverBodies, it.planets)}
            >
              <div className="qn">{spaceOut(it.name)}</div>
              <div className="qv">{(it.percentage || 0).toFixed(0)}%</div>
              <div className="qp">
                {(it.planets || []).map((p, j) => (
                  <span key={j}>
                    <em style={{ color: colorOf(p) }}>{glyphOf(p)}</em> {p}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <CappedText text={interpretation} />
    </div>
  );
}

// ── 4 · Planetary Influence ───────────────────────────────────────────
export function InfluenceLens({ data = [], interpretation, onHoverBodies }) {
  const items = [...data].sort((a, b) => (b.percentage || 0) - (a.percentage || 0));
  const max = Math.max(...items.map((d) => d.percentage || 0), 1);
  return (
    <div className="lens-split lens-split--top">
      <div className="lens-split__viz">
        {items.map((it, i) => (
          <div className="lens-irow" key={i} {...hoverProps(onHoverBodies, [it.name])}>
            <span className="in">
              <em style={{ color: colorOf(it.name) }}>{glyphOf(it.name)}</em> {it.name}
            </span>
            <span className="ib">
              <span
                style={{ width: `${((it.percentage || 0) / max) * 100}%`, background: colorOf(it.name) }}
              />
            </span>
            <span className="iv">{(it.percentage || 0).toFixed(1)}%</span>
          </div>
        ))}
      </div>
      <Interpretation text={interpretation} />
    </div>
  );
}

// ── 5 · Chart Shapes ──────────────────────────────────────────────────
// Cards with a miniature of the real wheel: every planet a faint dot,
// the pattern's members lit, the members' actual aspects drawn.

const collectPlanetNames = (node, known, out) => {
  if (!node || typeof node !== 'object') return;
  if (typeof node.name === 'string' && known.has(node.name)) out.add(node.name);
  Object.values(node).forEach((v) => {
    if (Array.isArray(v)) v.forEach((x) => collectPlanetNames(x, known, out));
    else if (v && typeof v === 'object') collectPlanetNames(v, known, out);
  });
};

function WheelMini({ planets, members, aspects }) {
  const C = 50;
  const R = 38;
  const xy = (lon) => [
    C + R * Math.cos((-lon * Math.PI) / 180),
    C + R * Math.sin((-lon * Math.PI) / 180),
  ];
  const lonOf = {};
  planets.forEach((p) => {
    const lon = Number(p.full_degree);
    if (Number.isFinite(lon)) lonOf[p.name] = lon;
  });
  const memberSet = new Set(members);
  const lines = (aspects || [])
    .filter(
      (a) =>
        memberSet.has(a.aspectingPlanet) &&
        memberSet.has(a.aspectedPlanet) &&
        ASPECT_LINE_COLORS[String(a.aspectType || '').toLowerCase()] &&
        Number.isFinite(lonOf[a.aspectingPlanet]) &&
        Number.isFinite(lonOf[a.aspectedPlanet])
    )
    .map((a, i) => {
      const [x1, y1] = xy(lonOf[a.aspectingPlanet]);
      const [x2, y2] = xy(lonOf[a.aspectedPlanet]);
      return (
        <line
          key={i}
          x1={x1.toFixed(1)}
          y1={y1.toFixed(1)}
          x2={x2.toFixed(1)}
          y2={y2.toFixed(1)}
          stroke={ASPECT_LINE_COLORS[String(a.aspectType).toLowerCase()]}
          strokeWidth="1.3"
          opacity="0.9"
        />
      );
    });
  return (
    <svg viewBox="0 0 100 100" className="lens-wheelmini" aria-hidden="true">
      <circle cx={C} cy={C} r={R} fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="1" />
      <circle cx={C} cy={C} r={R - 7} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
      {lines}
      {planets.map((p, i) => {
        const lon = lonOf[p.name];
        if (!Number.isFinite(lon)) return null;
        const [x, y] = xy(lon);
        const on = memberSet.has(p.name);
        return (
          <circle
            key={i}
            cx={x.toFixed(1)}
            cy={y.toFixed(1)}
            r={on ? 3 : 1.6}
            fill={on ? colorOf(p.name) : 'rgba(255,255,255,0.25)'}
          />
        );
      })}
    </svg>
  );
}

/** raw backend patterns → [{ key, label, members, description }] */
export function extractShapeCards(patterns = [], planets = []) {
  const known = new Set(planets.map((p) => p.name));
  return (Array.isArray(patterns) ? patterns : [])
    .map((pat, i) => {
      const members = new Set();
      collectPlanetNames(pat, known, members);
      if (!members.size) return null;
      const label = spaceOut(
        String(pat.type || pat.name || 'Pattern')
          .replace(/_/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase())
      );
      return {
        key: pat.id || `${pat.type}-${i}`,
        label,
        members: [...members],
        description: pat.description || '',
      };
    })
    .filter(Boolean)
    .slice(0, 6);
}

export function ShapesLens({
  cards = [],
  planets = [],
  aspects = [],
  interpretation,
  onHoverBodies,
}) {
  if (!cards.length && !interpretation) {
    return <p className="lens-empty">No major chart patterns detected — the sky spreads its weight evenly.</p>;
  }

  // hero pattern, like the other lenses: the cards ARE the visual —
  // each mini-wheel draws its figure at display scale, narrative below
  return (
    <div className="lens-hero">
      <div className="lens-shapes lens-shapes--hero">
        {cards.map((c) => (
          <div className="lens-shcard" key={c.key} {...hoverProps(onHoverBodies, c.members)}>
            <WheelMini planets={planets} members={c.members} aspects={aspects} />
            <div className="nm">{c.label}</div>
            <p>
              <span className="mem">
                {c.members.map((m, j) => (
                  <span key={j}>
                    <em style={{ color: colorOf(m) }}>{glyphOf(m)}</em> {m}
                    {j < c.members.length - 1 ? ' · ' : ''}
                  </span>
                ))}
              </span>
              {c.description ? ` — ${c.description}` : ''}
            </p>
          </div>
        ))}
      </div>
      <Interpretation text={interpretation} />
    </div>
  );
}
