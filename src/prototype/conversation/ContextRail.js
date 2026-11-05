import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Ephemeris from '../../UI/shared/Ephemeris';
import { ReferenceEntity, useReferences } from './ReferenceLayer';
import { SAMPLE_PLANETS, SAMPLE_PEOPLE, getServiceReading, getRelationshipCharts, SUBJECTS } from './fixtures';
import { chartAspects, sampleHoroscopeData, skyAt, scopeInterval } from './horoscopeData';
import { overlapsInterval } from '../../UI/horoscope/horoscopeSlots';
import { placementReference, positionLabel, relationshipAspectReference, stepSkyDay, transitReference } from './contextData';
import './ContextRail.css';

const EMPTY = [];
export default function ContextRail({ service, mount, horoscope, onHoroscopeChange, onExplore, referenceRequest }) {
  const refs = useReferences();
  const [wide, setWide] = useState(() => window.innerWidth >= 1200);
  const [open, setOpen] = useState(false);
  const [relationshipView, setRelationshipView] = useState('synastry');
  const trigger = useRef(null), dialog = useRef(null);
  const relationship = service.kind === 'relationship', isHoroscope = service.kind === 'horoscope';
  const partner = SUBJECTS.find(subject => subject.id === service.subjectId)?.partner;
  const people = relationship ? ['Maya', partner] : ['Maya'];
  const person = 'Maya', profile = SAMPLE_PEOPLE.Maya;
  const relationshipCharts = useMemo(() => relationship ? getRelationshipCharts(service.subjectId) : null, [relationship, service.subjectId]);
  const relationshipChart = relationshipCharts?.[relationshipView];
  const planets = relationshipChart?.planets || profile.planets;
  const skyData = useMemo(() => sampleHoroscopeData(horoscope), [horoscope]);
  const sky = useMemo(() => skyAt(skyData, horoscope.playhead), [skyData, horoscope.playhead]);
  const relevant = useMemo(() => skyData.transits.filter(transit => overlapsInterval(transit, scopeInterval(horoscope))), [skyData, horoscope]);
  const cited = useMemo(() => relevant.filter(transit => skyData.referencedKeys.includes(transit.key)), [relevant, skyData]);
  const highlighted = skyData.transits.find(transit => transit.key === horoscope.selectedTransitKey);
  const aspects = useMemo(() => isHoroscope ? chartAspects(highlighted ? [highlighted] : cited, SAMPLE_PLANETS, sky, horoscope.playhead) : EMPTY, [isHoroscope, highlighted, cited, sky, horoscope.playhead]);
  const selectedPlanets = useMemo(() => refs.references.filter(ref => ref.kind === 'placement' && ref.details?.personName === person && ref.details?.ring !== 'transit').map(ref => ref.data.planet), [refs.references, person]);
  const emphasis = useMemo(() => isHoroscope ? [...new Set((highlighted ? [highlighted] : cited).map(transit => transit.targetPlanet))] : selectedPlanets, [isHoroscope, highlighted, cited, selectedPlanets]);
  const factors = useMemo(() => relationship ? getServiceReading(service.subjectId).factors.filter(factor => factor.source === relationshipView) : [], [relationship, service.subjectId, relationshipView]);
  const marked = refs.messages.filter(message => message.type === 'user' && message.references?.some(ref => ref.kind !== 'passage'));
  useEffect(() => {
    const resize = () => setWide(window.innerWidth >= 1200);
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);
  useEffect(() => { setOpen(false); setRelationshipView('synastry'); }, [service.id]);
  useEffect(() => { if (wide) setOpen(false); }, [wide]);
  useEffect(() => {
    const reference = referenceRequest?.reference;
    if (reference?.serviceId === service.id && (reference.kind === 'placement' || (relationship && reference.kind === 'aspect'))) {
      if (relationship) setRelationshipView(reference.target.relationshipView || reference.data?.source || 'synastry');
      if (!wide) setOpen(true);
    }
  }, [referenceRequest, wide, service.id, relationship]);
  useEffect(() => {
    if (!open || !dialog.current) return;
    const element = dialog.current;
    if (element.showModal) element.showModal(); else element.setAttribute('open', '');
    return () => { if (element.open && element.close) element.close(); };
  }, [open]);
  const close = () => { setOpen(false); trigger.current?.focus({ preventScroll: true }); };
  const explore = () => { setOpen(false); onExplore?.(); };
  const makePlacement = (planet, ring = 'natal') => {
    const composite = relationship && relationshipView === 'composite';
    const owner = relationship && ring === 'partner' ? partner : person;
    return placementReference(service.id, service.subjectId, planet, {
      personName: composite ? people.join(' & ') : owner, ring: composite ? 'composite' : ring === 'partner' ? 'natal' : ring,
      timeUnknown: composite ? people.some(name => !SAMPLE_PEOPLE[name].birthTime) : !SAMPLE_PEOPLE[owner].birthTime,
      ...(relationship ? { relationshipView } : {}), ...(isHoroscope ? { horoscope } : {}),
    });
  };
  const chooseBody = (name, ring = 'natal') => {
    const outer = ring === 'transit';
    const planet = (outer ? relationship ? relationshipChart.outerPlanets : sky : planets).find(item => item.name === name);
    if (planet) refs.onSelect(makePlacement(planet, relationship && outer ? 'partner' : ring), true, false);
  };
  const moment = new Date(horoscope.playhead).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZoneName: 'short' });
  const panel = expanded => <div className="cp-context-panel">
    <span className="ink-eyebrow">{expanded ? 'Your chart context' : 'Who & the sky'} · sample</span>
    <div className={`cp-context-people${relationship ? ' is-pair' : ''}`}>{people.map(name => <div key={name} className="cp-context-person"><span className="cp-context-initial" aria-hidden="true">{name[0]}</span><strong>{name}</strong><small>{SAMPLE_PEOPLE[name].birthDate}<br />{SAMPLE_PEOPLE[name].birthTime || 'Birth time unknown'}<br />{SAMPLE_PEOPLE[name].place}</small></div>)}</div>
    {relationship && <><div className="cp-context-switch" role="group" aria-label="Relationship chart">{['synastry', 'composite'].map(view => <button type="button" key={view} aria-pressed={relationshipView === view} onClick={() => setRelationshipView(view)}>{view === 'synastry' ? 'Synastry' : 'Composite'}</button>)}</div><p className="cp-context-caption">{relationshipView === 'synastry' ? `Maya inside · ${partner} outside. Aspects connect the two charts.` : 'The relationship as one midpoint chart. Aspects are within this chart.'}</p></>}
    {isHoroscope && <div className="cp-context-date"><button type="button" aria-label="Previous sky day" onClick={() => onHoroscopeChange(stepSkyDay(horoscope, -1))}>‹</button><span>Sky at {moment}</span><button type="button" aria-label="Next sky day" onClick={() => onHoroscopeChange(stepSkyDay(horoscope, 1))}>›</button></div>}
    <div className={`cp-context-wheel${isHoroscope ? ' is-explorable' : ''}`}><Ephemeris planets={planets} houses={EMPTY} aspects={relationshipChart?.aspects || aspects} transits={relationshipChart?.outerPlanets || (isHoroscope ? sky : EMPTY)} theme="ink" emphasisPlanets={relationship ? null : emphasis} ringLabels={relationship ? { natal: relationshipView === 'composite' ? 'Composite' : 'Maya', transit: partner } : undefined} instanceId={`context-${service.id}-${relationshipView}-${expanded ? 'expanded' : 'rail'}`} onPlanetSelect={chooseBody} onExplore={isHoroscope ? explore : undefined} /></div>
    {isHoroscope && <button type="button" className="cp-context-link" onClick={explore}>Explore transit timing ↗</button>}
    <p className="cp-context-caption">Illustrative sky, not calculated from sample birth details. Select a glyph or position to add context.</p>
    {relationship && <section className="cp-context-factors" aria-label="Context relationship aspects"><h3>{relationshipView === 'synastry' ? 'Synastry aspects' : 'Composite aspects'}</h3>{factors.map(factor => <ReferenceEntity key={factor.id} reference={relationshipAspectReference(service.id, service.subjectId, factor)}><span>{factor.label}<small>Orb {factor.payload.orb.toFixed(1)}°</small>{factor.stars && <small className="cp-factor-stars" aria-label={`${factor.stars} stars`}>{'★'.repeat(factor.stars)}</small>}</span></ReferenceEntity>)}{factors.some(factor => factor.stars) && <p className="cp-context-caption">Stars describe individual factors, not the relationship as a whole.</p>}</section>}
    <h3>{relationship ? relationshipView === 'synastry' ? 'Both charts’ positions' : 'Composite positions' : isHoroscope ? 'Natal & transiting positions' : `${person}’s natal positions`}</h3>
    {relationship && relationshipView === 'synastry' ? <div className="cp-context-comparison" aria-label="Synastry positions"><div className="cp-comparison-row cp-comparison-head"><span>Planet</span><span>Maya</span><span>{partner}</span></div>{planets.map((planet, index) => <div className="cp-comparison-row" key={planet.name}><span>{planet.name}</span>{[planet, relationshipChart.outerPlanets[index]].map((item, side) => {
      const value = positionLabel(item);
      return <ReferenceEntity key={side} reference={makePlacement(item, side ? 'partner' : 'natal')}><span className="cp-comparison-value"><span>{value.sign.slice(0, 3)}</span><small>{value.degree}°</small></span></ReferenceEntity>;
    })}</div>)}</div> :
    isHoroscope ? <div className="cp-context-comparison" aria-label="Natal and transiting positions"><div className="cp-comparison-row cp-comparison-head"><span>Planet</span><span>Natal</span><span>Transiting</span></div>{profile.planets.map(planet => <div className="cp-comparison-row" key={planet.name}><span>{planet.name}</span>{['natal', 'transit'].map(ring => {
      const valuePlanet = ring === 'natal' ? planet : sky.find(item => item.name === planet.name);
      const value = positionLabel(valuePlanet);
      return <ReferenceEntity key={ring} reference={makePlacement(valuePlanet, ring)}><span className="cp-comparison-value"><span>{value.sign.slice(0, 3)}</span><small>{value.degree}°</small></span></ReferenceEntity>;
    })}</div>)}</div> : <div className="cp-context-positions" aria-label="Context positions">{planets.map(planet => {
      const value = positionLabel(planet);
      const contents = <span className="cp-position-line"><span>{planet.name}</span><span>{value.sign}</span><span>{value.degree}°</span></span>;
      return <ReferenceEntity key={planet.name} reference={makePlacement(planet)}>{contents}</ReferenceEntity>;
    })}</div>}
    {isHoroscope && <section className="cp-context-factors" aria-label="Context transit choices"><h3>Cited in this forecast</h3>{cited.map(transit => <ReferenceEntity key={transit.key} reference={transitReference(transit, horoscope)} onInspect={() => onHoroscopeChange({ selectedTransitKey: transit.key })}><span>{transit.title}</span></ReferenceEntity>)}</section>}
    <p className="cp-context-caption" aria-live="polite">{refs.references.filter(ref => ref.kind !== 'passage').length} of 3 chart elements selected</p>
    {marked.length > 0 && <details className="cp-context-marks"><summary>{marked.length} {marked.length === 1 ? 'question' : 'questions'} on this chart</summary>{marked.map(message => <button type="button" key={message.id} onClick={() => { setOpen(false); requestAnimationFrame(() => refs.onOpenExchange(message.id)); }}>{message.text}</button>)}</details>}
  </div>;
  return <>
    {!wide && <button ref={trigger} type="button" className="cp-context-strip" aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen(true)}><span>{people.join(' & ')} · {partner === 'Theo' ? 'Theo’s time unknown' : SAMPLE_PEOPLE.Maya.birthDate}</span><span>Sky ▾</span></button>}
    {wide && mount && createPortal(<aside className="cp-context-rail" aria-label="Person and sky context">{panel(false)}</aside>, mount)}
    {open && createPortal(<dialog ref={dialog} className="cp-context-dialog ink-page" aria-label="Person and sky context" onCancel={event => { event.preventDefault(); close(); }}><header><button type="button" className="cp-context-link" onClick={close}>Close chart context ×</button></header>{panel(true)}<footer><button type="button" className="ink-btn ink-btn--navy" onClick={() => { setOpen(false); requestAnimationFrame(() => document.querySelector('#cp-prompt')?.focus({ preventScroll: true })); }}>Return to my question</button></footer></dialog>, document.body)}
  </>;
}
