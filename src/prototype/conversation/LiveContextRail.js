import React, { useEffect, useMemo, useState } from 'react';
import Ephemeris from '../../UI/shared/Ephemeris';
import { formatAspectData, formatPositionData } from '../../UI/gravityChat/GravityChatPanel';
import { nameOf, unknownTime } from './liveData';
import { formatCalendarDate } from '../../Utilities/dateFormatting';
import './ContextRail.css';

const SIGNS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
const EMPTY = [];
export const chartPlanets = chart => (chart?.planets || []).filter(planet => planet?.name && Number.isFinite(Number(planet.full_degree)) && planet.full_degree != null)
  .map(planet => { const degree = ((Number(planet.full_degree) % 360) + 360) % 360; return { ...planet, full_degree: degree, sign: planet.sign || SIGNS[Math.floor(degree / 30)], norm_degree: planet.norm_degree ?? degree % 30 }; });
export function wheelAspects(raw, first, second = first) {
  return (Array.isArray(raw) ? raw : []).map(aspect => {
    const a = aspect.transitingPlanet || aspect.aspectedPlanet || aspect.planet1;
    const b = aspect.aspectingPlanet || aspect.planet2;
    return { ...aspect, aspectedPlanet: a, aspectingPlanet: b, aspectType: String(aspect.aspectType || aspect.aspect || '').toLowerCase(),
      aspectedPlanetDegree: first.find(planet => planet.name === a)?.full_degree, aspectingPlanetDegree: second.find(planet => planet.name === b)?.full_degree };
  }).filter(aspect => Number.isFinite(aspect.aspectedPlanetDegree) && Number.isFinite(aspect.aspectingPlanetDegree));
}
export const relationshipElements = items => items.map((item, index) => ({ group: 'relationship', type: item.type || item.source || 'relationship',
  key: `${item.code || item.id || item.source || 'rel'}-${index}`, label: item.description || item.reason || item.label || 'Relationship element', meta: item.source || item.category || '', payload: item }));

export default function LiveContextRail({ service, data, selected, onSelect }) {
  const [wide, setWide] = useState(() => window.innerWidth >= 1200);
  useEffect(() => { const resize = () => setWide(window.innerWidth >= 1200); window.addEventListener('resize', resize); return () => window.removeEventListener('resize', resize); }, []);
  const [mode, setMode] = useState('synastry');
  const [focusedBody, setFocusedBody] = useState(null);
  const relationship = service.kind === 'relationship';
  const first = useMemo(() => chartPlanets(data.people[0]?.birthChart), [data.people]);
  const second = useMemo(() => chartPlanets(data.people[1]?.birthChart), [data.people]);
  const composite = useMemo(() => chartPlanets(data.source.compositeChart), [data.source]);
  const planets = relationship && mode === 'composite' ? composite : first;
  const outer = relationship && mode === 'synastry' ? second : EMPTY;
  const rawAspects = relationship ? mode === 'synastry' ? data.source.synastryAspects : data.source.compositeChart?.aspects : data.people[0]?.birthChart?.aspects;
  const aspects = useMemo(() => wheelAspects(rawAspects, planets, outer.length ? outer : planets), [rawAspects, planets, outer]);
  const elements = useMemo(() => relationship ? relationshipElements(data.scoredItems || []).filter(item => String(item.payload.source || '').toLowerCase().includes(mode))
    : aspects.map(aspect => { const payload = formatAspectData(aspect, planets.find(planet => planet.name === aspect.aspectedPlanet), planets.find(planet => planet.name === aspect.aspectingPlanet)); return { key: payload.code, label: payload.label, payload, type: 'aspect', group: 'birthchart' }; }), [relationship, data.scoredItems, mode, aspects, planets]);
  const positionElement = planet => { const payload = formatPositionData(unknownTime(data.people[0]) ? { ...planet, house: null } : planet); return { key: payload.code, label: payload.label, payload, type: 'position', group: 'birthchart' }; };
  const selectButton = (element, content) => <button type="button" key={element.key} className="cp-live-entity" aria-label={`Include ${element.label} in question`} aria-pressed={selected.some(item => item.key === element.key)} disabled={selected.length >= 3 && !selected.some(item => item.key === element.key)} onClick={() => onSelect(element)}><span aria-hidden="true">{selected.some(item => item.key === element.key) ? '✓' : '+'}</span><span>{content}</span></button>;
  const contents = <div className="cp-context-panel">
    <span className="ink-eyebrow">Who & the sky · dev data</span>
    {data.people.map((person, index) => <section key={person._id || index}><h3>{nameOf(person)}</h3><p className="cp-context-caption">{person.dateOfBirth ? formatCalendarDate(person.dateOfBirth) : 'Birth date unavailable'} · {unknownTime(person) ? 'Birth time unknown' : person.time || person.timeOfBirth || 'Birth time unavailable'}<br />{person.placeOfBirth || person.birthPlace || 'Birthplace unavailable'}</p></section>)}
    {relationship && <div className="cp-context-switch" role="group" aria-label="Relationship chart">{['synastry','composite'].map(value => <button type="button" key={value} aria-pressed={mode === value} onClick={() => { setMode(value); setFocusedBody(null); }}>{value === 'synastry' ? 'Synastry' : 'Composite'}</button>)}</div>}
    <p className="cp-context-caption">{relationship ? mode === 'synastry' ? `${nameOf(data.people[0])} inside · ${nameOf(data.people[1])} outside` : 'The relationship’s saved composite chart' : 'Saved natal chart'}</p>
    {planets.length && (!relationship || mode !== 'synastry' || second.length) ? <div className="cp-context-wheel"><Ephemeris planets={planets} houses={EMPTY} aspects={aspects} transits={outer} theme="ink" instanceId={`live-${service.id}-${mode}`} ringLabels={relationship ? { natal: mode === 'composite' ? 'Composite' : nameOf(data.people[0]), transit: nameOf(data.people[1]) } : undefined} onPlanetSelect={name => {
      if (relationship) setFocusedBody(name);
      else { const planet = planets.find(item => item.name === name); if (planet) onSelect(positionElement(planet)); }
    }} /></div> : <p role="status">{relationship && mode === 'composite' ? 'Composite chart' : 'Chart'} data is unavailable. No sample chart is substituted.</p>}
    <h3>{relationship ? mode === 'synastry' ? 'Synastry aspects' : 'Composite aspects' : 'Natal aspects'}</h3>
    {focusedBody && <p className="cp-context-caption">Aspects involving {focusedBody} <button type="button" className="cp-text-button" onClick={() => setFocusedBody(null)}>Show all</button></p>}
    <div className="cp-context-factors">{elements.filter(element => !focusedBody || `${element.label} ${JSON.stringify(element.payload)}`.includes(focusedBody)).map(element => selectButton(element, <>{element.label}{Number.isInteger(element.payload.starRating) && element.payload.starRating > 0 && element.payload.starRating <= 5 && <small className="cp-factor-stars" aria-label={`${element.payload.starRating} stars`}>{'★'.repeat(element.payload.starRating)}</small>}</>))}</div>
    {relationship && <details><summary>All chart aspects ({aspects.length})</summary>{aspects.map((aspect, index) => <p className="cp-context-caption" key={index}>{aspect.aspectedPlanet} {aspect.aspectType} {aspect.aspectingPlanet}{aspect.orb != null ? ` · ${Number(aspect.orb).toFixed(1)}°` : ''}</p>)}<p className="cp-context-caption">Selectable factors above use the saved relationship analysis accepted by Gravity Chat.</p></details>}
    {!elements.length && <p className="cp-context-caption">No selectable {relationship ? mode : 'natal'} aspects are available in the saved analysis.</p>}
    <h3>{relationship && mode === 'composite' ? 'Composite positions' : 'Positions'}</h3>
    {(relationship && mode === 'synastry' ? [first, second] : [planets]).map((list, side) => <div key={side}>{relationship && mode === 'synastry' && <h4>{nameOf(data.people[side])}</h4>}{list.map(planet => {
      const text = <span className="cp-position-line"><span>{planet.name}</span><span>{planet.sign}</span><span>{Number(planet.norm_degree).toFixed(1)}°</span></span>;
      return relationship ? <div className="cp-live-position" key={planet.name}>{text}</div> : selectButton(positionElement(planet), text);
    })}</div>)}
    <p className="cp-context-caption">{selected.length} of 3 selected. {relationship ? 'Select a factor to add it to your question; glyphs filter the factors.' : 'Select a glyph, position, or aspect to add it to your question.'}</p>
  </div>;
  return wide ? <aside className="cp-context-rail cp-live-context" aria-label="Person and sky context">{contents}</aside> : <details className="cp-live-context-mobile"><summary>Birth details & sky ▾</summary>{contents}</details>;
}
