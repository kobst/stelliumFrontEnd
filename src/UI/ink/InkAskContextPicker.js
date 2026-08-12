import React, { useMemo, useRef, useState } from 'react';
import {
  formatPositionData,
  formatAspectData,
  flattenPatterns,
  findPlanetData
} from '../gravityChat/GravityChatPanel';
import './InkAskContextPicker.css';

/*
 * Gravity Chat context picker (ink). The chart wheel IS the picker — hover a
 * planet or aspect line to inspect, click to add it as question context. The
 * Table lens is the same data as rows. Ported from the "Birth Chart (ink)"
 * design (paper-chart.js geometry + ask-context.js behavior), driven by real
 * chart data. Selection is owned by the parent; elements match the shape
 * GravityChatPanel builds so their astro codes stay valid.
 */

const SIGNS = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];
const GLYPHS = {
  Sun: '☉', Moon: '☽', Mercury: '☿', Venus: '♀', Mars: '♂', Jupiter: '♃',
  Saturn: '♄', Uranus: '♅', Neptune: '♆', Pluto: '♇',
  Ascendant: 'Ac', Midheaven: 'Mc', 'North Node': '☊', Node: '☊', Chiron: '⚷'
};
const ASPECT_COLOR = { hard: '#a8483c', soft: '#3437a8', conj: '#8a6a24', minor: 'rgba(35,40,64,0.45)' };
const SKIP_BODIES = new Set(['South Node', 'Part of Fortune']);

const num = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

function aspectKind(type) {
  const t = String(type || '').toLowerCase();
  if (t.includes('conjunc')) return 'conj';
  if (t.includes('trine') || t.includes('sextile')) return 'soft';
  if (t.includes('square') || t.includes('opposit')) return 'hard';
  return 'minor';
}

// convert wheel degree (ecliptic longitude, Aries 0° at 9 o'clock, CCW) to xy
function pol(c, r, deg) {
  const a = (180 - deg) * Math.PI / 180;
  return [c + r * Math.cos(a), c - r * Math.sin(a)];
}

// de-collide glyph angles while keeping order (mirrors paper-chart.js spread)
function spread(items, minGap) {
  const list = items.map((b) => ({ id: b.id, a: b.deg })).sort((x, y) => x.a - y.a);
  for (let pass = 0; pass < 260; pass++) {
    let moved = false;
    for (let i = 0; i < list.length; i++) {
      const A = list[i];
      const B = list[(i + 1) % list.length];
      const d = (((B.a - A.a) % 360) + 360) % 360;
      if (d < minGap) {
        const push = (minGap - d) / 2;
        A.a -= push;
        B.a += push;
        moved = true;
      }
    }
    if (!moved) break;
  }
  const out = {};
  list.forEach((i) => { out[i.id] = i.a; });
  return out;
}

const fmtDeg = (value) => {
  const n = num(value);
  return n === null ? '' : `${n.toFixed(1)}°`;
};

function InkAskContextPicker({ planets = [], aspects = [], patterns = null, selected = [], onToggle, max = 3 }) {
  const [lens, setLens] = useState('wheel');
  const [tableView, setTableView] = useState('positions');
  const [hover, setHover] = useState(null); // { kind:'body'|'aspect', id, html }
  const [cursor, setCursor] = useState({ x: 0, y: 0 });
  const [warn, setWarn] = useState(false);
  const wheelBoxRef = useRef(null);

  const selectedKeys = useMemo(() => new Set(selected.map((s) => s.key)), [selected]);
  const isSel = (key) => selectedKeys.has(key);
  const atMax = selected.length >= max;

  // ---- build elements (payloads match GravityChatPanel exactly) ----
  const bodies = useMemo(() => {
    return planets
      .filter((p) => p && !SKIP_BODIES.has(p.name) && GLYPHS[p.name] && num(p.full_degree) !== null)
      .map((p) => {
        const data = formatPositionData(p);
        return {
          id: p.name,
          glyph: GLYPHS[p.name],
          deg: num(p.full_degree),
          element: { ...data, key: data.code, payload: data }
        };
      });
  }, [planets]);

  const bodyDeg = useMemo(() => {
    const map = {};
    bodies.forEach((b) => { map[b.id] = b.deg; });
    return map;
  }, [bodies]);

  const aspectEls = useMemo(() => {
    return aspects
      .map((a) => {
        const p1 = findPlanetData(a.aspectedPlanet, planets);
        const p2 = findPlanetData(a.aspectingPlanet, planets);
        if (!p1 || !p2) return null;
        const data = formatAspectData(a, p1, p2);
        return {
          element: { ...data, key: data.code, payload: data },
          a: a.aspectedPlanet,
          b: a.aspectingPlanet,
          kind: aspectKind(a.aspectType),
          orb: a.orb
        };
      })
      .filter(Boolean);
  }, [aspects, planets]);

  const positionRows = useMemo(() => bodies.map((b) => {
    const d = b.element;
    return { el: b.element, c0: d.planet, c1: `${d.sign}${d.degree != null ? ` ${fmtDeg(d.degree)}` : ''}`, c2: d.house ? `House ${d.house}` : '—' };
  }), [bodies]);

  const aspectRows = useMemo(() => aspectEls.map((a) => {
    const d = a.element;
    const type = d.aspectType ? d.aspectType.charAt(0).toUpperCase() + d.aspectType.slice(1) : 'Aspect';
    return { el: d, c0: d.planet1, c1: `${type} ${d.planet2}`, c2: a.orb != null ? `${a.orb}° orb` : '' };
  }), [aspectEls]);

  const patternRows = useMemo(() => {
    return flattenPatterns(patterns)
      .filter((p) => p.label || p.description)
      .map((d) => ({ el: { ...d, key: d.code, payload: d.payload || d }, c0: d.label, c1: d.description, c2: 'Pattern' }));
  }, [patterns]);

  // ---- wheel geometry ----
  const SIZE = 380;
  const C = SIZE / 2;
  const Rg = C * 0.955;
  const Ro = C * 0.735;
  const Ri = Ro * 0.80;
  const glyphAngles = useMemo(
    () => spread(bodies, 360 * (SIZE * 0.052) / (2 * Math.PI * Rg) * 1.05),
    [bodies, Rg]
  );

  // ---- interaction ----
  const handleToggle = (el) => {
    if (!isSel(el.key) && atMax) {
      setWarn(true);
      window.setTimeout(() => setWarn(false), 1400);
      return;
    }
    if (onToggle) onToggle(el);
  };

  const onWheelMove = (event) => {
    const box = wheelBoxRef.current;
    if (!box) return;
    const r = box.getBoundingClientRect();
    setCursor({ x: event.clientX - r.left, y: event.clientY - r.top });
  };

  const relatedToBody = (id) => new Set(
    aspectEls.filter((a) => a.a === id || a.b === id).flatMap((a) => [a.a, a.b])
  );

  // highlight sets for hover
  let dimBodies = null;
  let litAspect = null;
  if (hover?.kind === 'body') {
    dimBodies = relatedToBody(hover.id);
    dimBodies.add(hover.id);
  } else if (hover?.kind === 'aspect') {
    const a = aspectEls[hover.id];
    dimBodies = new Set([a.a, a.b]);
    litAspect = hover.id;
  }

  const hintText = warn
    ? 'Three elements max — remove one to add another.'
    : lens === 'wheel'
      ? 'Hover the chart to inspect — click to add up to 3 elements.'
      : 'Browse the chart as data — add up to 3 elements.';

  const renderRows = (rows) => (
    <div className="iacp-rows">
      {rows.length === 0 && <div className="iacp-empty">Nothing to show here yet.</div>}
      {rows.map((row) => {
        const on = isSel(row.el.key);
        return (
          <button
            type="button"
            key={row.el.key}
            className={`iacp-row${on ? ' is-in' : ''}`}
            onClick={() => handleToggle(row.el)}
          >
            <span className="iacp-c0">{row.c0}</span>
            <span className="iacp-c1">{row.c1}</span>
            <span className="iacp-c2">{row.c2}</span>
            <span className="iacp-add">{on ? '✓ Added' : '+ Add'}</span>
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="ink-card iacp-card" aria-label="Chart context picker">
      <div className="iacp-head">
        <span className="ink-eyebrow">Context</span>
        <div className="iacp-lens" role="tablist" aria-label="Picker view">
          <button type="button" className={lens === 'wheel' ? 'on' : ''} onClick={() => setLens('wheel')}>Wheel</button>
          <button type="button" className={lens === 'table' ? 'on' : ''} onClick={() => setLens('table')}>Table</button>
        </div>
      </div>

      <p className={`iacp-hint${warn ? ' warn' : ''}`}>{hintText}</p>

      {lens === 'wheel' ? (
        <div className="iacp-wheel" ref={wheelBoxRef} onMouseMove={onWheelMove}>
          {bodies.length === 0 ? (
            <div className="iacp-empty">Chart wheel data is unavailable.</div>
          ) : (
            <svg
              viewBox={`0 0 ${SIZE} ${SIZE}`}
              className="iacp-svg"
              role="img"
              aria-label="Chart wheel — click planets or aspect lines to add them as question context"
              onMouseLeave={() => setHover(null)}
            >
              {/* zodiac band */}
              <circle cx={C} cy={C} r={Ro} fill="none" stroke="#232840" strokeWidth={SIZE * 0.0042} opacity="0.85" />
              <circle cx={C} cy={C} r={Ri} fill="none" stroke="#232840" strokeWidth={SIZE * 0.003} opacity="0.7" />
              {Array.from({ length: 12 }, (_, i) => {
                const [x1, y1] = pol(C, Ri, i * 30);
                const [x2, y2] = pol(C, Ro, i * 30);
                const [gx, gy] = pol(C, (Ro + Ri) / 2, i * 30 + 15);
                return (
                  <g key={`sign-${i}`}>
                    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(35,40,64,0.5)" strokeWidth={SIZE * 0.0026} />
                    <text x={gx} y={gy} textAnchor="middle" dominantBaseline="central" fill="#232840" fontSize={SIZE * 0.043} opacity="0.85">{`${SIGNS[i]}︎`}</text>
                  </g>
                );
              })}
              {/* faint center star */}
              {Array.from({ length: 16 }, (_, i) => {
                const [x, y] = pol(C, Ri * (i % 2 ? 0.13 : 0.2), i * 22.5);
                return <line key={`ray-${i}`} x1={C} y1={C} x2={x} y2={y} stroke="rgba(35,40,64,0.28)" strokeWidth={SIZE * 0.0016} />;
              })}

              {/* aspect lines + fat hit lines */}
              {aspectEls.map((a, i) => {
                if (bodyDeg[a.a] == null || bodyDeg[a.b] == null) return null;
                const [x1, y1] = pol(C, Ri, bodyDeg[a.a]);
                const [x2, y2] = pol(C, Ri, bodyDeg[a.b]);
                const on = isSel(a.element.key);
                const dim = litAspect != null ? litAspect !== i : (dimBodies ? !(dimBodies.has(a.a) && dimBodies.has(a.b)) : false);
                const opacity = on ? 0.95 : dim ? 0.08 : 0.55;
                return (
                  <g key={`asp-${a.element.key}`}>
                    <line
                      x1={x1} y1={y1} x2={x2} y2={y2}
                      stroke={ASPECT_COLOR[a.kind]}
                      strokeWidth={(on || litAspect === i) ? SIZE * 0.0038 : SIZE * 0.0022}
                      strokeDasharray={a.kind === 'minor' ? '3 4' : 'none'}
                      opacity={opacity}
                    />
                    <line
                      x1={x1} y1={y1} x2={x2} y2={y2}
                      stroke="rgba(0,0,0,0)" strokeWidth="9" style={{ cursor: 'pointer' }}
                      onMouseEnter={() => setHover({ kind: 'aspect', id: i })}
                      onClick={() => handleToggle(a.element)}
                    />
                  </g>
                );
              })}

              {/* bodies */}
              {bodies.map((b) => {
                const [tx1, ty1] = pol(C, Ro, b.deg);
                const [tx2, ty2] = pol(C, Ro + SIZE * 0.022, b.deg);
                const [gx, gy] = pol(C, Rg, glyphAngles[b.id]);
                const [lx, ly] = pol(C, Rg - SIZE * 0.036, glyphAngles[b.id]);
                const on = isSel(b.element.key);
                const dim = dimBodies ? !dimBodies.has(b.id) : false;
                const multi = b.glyph.length > 1;
                return (
                  <g
                    key={`body-${b.id}`}
                    style={{ cursor: 'pointer' }}
                    opacity={dim ? 0.28 : 1}
                    onMouseEnter={() => setHover({ kind: 'body', id: b.id })}
                    onClick={() => handleToggle(b.element)}
                  >
                    <line x1={tx1} y1={ty1} x2={tx2} y2={ty2} stroke="#232840" strokeWidth={SIZE * 0.004} />
                    <line x1={tx2} y1={ty2} x2={lx} y2={ly} stroke="rgba(35,40,64,0.28)" strokeWidth={SIZE * 0.0018} />
                    <circle cx={gx} cy={gy} r={SIZE * 0.031} fill="none" stroke={on ? '#b08d3e' : '#3437a8'} strokeWidth={SIZE * 0.0032} opacity={on || (hover?.kind === 'body' && hover.id === b.id) ? 1 : 0} />
                    <text x={gx} y={gy} textAnchor="middle" dominantBaseline="central" fill="#232840" fontSize={multi ? SIZE * 0.032 : SIZE * 0.045}>{multi ? b.glyph : `${b.glyph}︎`}</text>
                  </g>
                );
              })}
            </svg>
          )}

          {hover && (
            <div
              className="iacp-tip"
              style={{ left: Math.min(cursor.x + 14, SIZE - 168), top: cursor.y + 14 }}
            >
              {hover.kind === 'body' ? (() => {
                const b = bodies.find((x) => x.id === hover.id);
                if (!b) return null;
                const d = b.element;
                return (
                  <>
                    <b>{d.planet}</b> · {d.sign}{d.degree != null ? ` ${fmtDeg(d.degree)}` : ''}
                    <br />
                    <i>{d.house ? `House ${d.house} — ` : ''}{isSel(d.key) ? 'click to remove' : 'click to add as context'}</i>
                  </>
                );
              })() : (() => {
                const a = aspectEls[hover.id];
                const d = a.element;
                const type = d.aspectType ? d.aspectType.charAt(0).toUpperCase() + d.aspectType.slice(1) : 'Aspect';
                return (
                  <>
                    <b>{d.planet1} {type.toLowerCase()} {d.planet2}</b>{a.orb != null ? ` · ${a.orb}° orb` : ''}
                    <br />
                    <i>{isSel(d.key) ? 'click to remove' : 'click to add as context'}</i>
                  </>
                );
              })()}
            </div>
          )}
        </div>
      ) : (
        <div className="iacp-table">
          <div className="iacp-tabs" role="tablist" aria-label="Data view">
            <button type="button" className={`iacp-tab${tableView === 'positions' ? ' on' : ''}`} onClick={() => setTableView('positions')}>Positions</button>
            <button type="button" className={`iacp-tab${tableView === 'aspects' ? ' on' : ''}`} onClick={() => setTableView('aspects')}>Aspects</button>
            <button type="button" className={`iacp-tab${tableView === 'patterns' ? ' on' : ''}`} onClick={() => setTableView('patterns')}>Patterns</button>
          </div>
          {tableView === 'positions' && renderRows(positionRows)}
          {tableView === 'aspects' && renderRows(aspectRows)}
          {tableView === 'patterns' && renderRows(patternRows)}
        </div>
      )}
    </div>
  );
}

export default InkAskContextPicker;
