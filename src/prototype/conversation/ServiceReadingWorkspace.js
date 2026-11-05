import React, { useEffect, useRef } from 'react';
import Ephemeris from '../../UI/shared/Ephemeris';
import { SAMPLE_PLANETS } from './fixtures';
import { formatAspectData } from '../../UI/gravityChat/GravityChatPanel';
import { placementReference, relationshipAspectReference } from './contextData';
import { ReferenceEntity, ReferenceText, useReferences } from './ReferenceLayer';
import { ENTITY_LIMIT, textVersion } from './references';
import './ServiceReadingWorkspace.css';

export default function ServiceReadingWorkspace({ enabled, data, children, onReadDetail, onQuote, focusPassage, focusVisit, highlightedPassage, readingView, onOverview, contextRail }) {
  return enabled ? <Workspace key={data.subjectId} {...{ data, children, onReadDetail, onQuote, focusPassage, focusVisit, highlightedPassage, readingView, onOverview, contextRail }} /> : children;
}

function Workspace({ data, children, onReadDetail, focusPassage, focusVisit, highlightedPassage, readingView, onOverview, contextRail }) {
  const root = useRef(null);
  const discussion = useRef(null);
  const references = useReferences();
  const selectedCount = (references?.references || []).filter(ref => ref.kind !== 'passage').length;
  const selectedPlanets = new Set((references?.references || []).filter(ref => ref.kind === 'placement').map(ref => ref.data.planet));
  const relationship = data.kind === 'relationship';
  const serviceId = `${data.kind}:${data.subjectId}`;
  const source = { serviceId, label: `${relationship ? 'Relationship' : 'Birth chart'} overview`, target: { subjectId: data.subjectId } };
  const entity = (kind, id, label, payload) => ({ kind, serviceId, sourceId: `${serviceId}:${kind}:${id}`, sourceVersion: 'sample-v1', label, data: payload, target: { subjectId: data.subjectId } });
  const discuss = () => {
    discussion.current?.querySelector('textarea')?.focus({ preventScroll: true });
  };
  useEffect(() => {
    if (!focusPassage) return;
    const element = Array.from(root.current?.querySelectorAll('[data-passage]') || []).find((item) => item.dataset.passage === focusPassage);
    element?.scrollIntoView?.({ block: 'center', behavior: 'smooth' });
    element?.focus({ preventScroll: true });
  }, [focusPassage, focusVisit]);
  return <div className="cp-product" ref={root}>
    <header className="cp-product-heading"><span className="ink-eyebrow">{relationship ? 'Your relationship' : 'Your birth chart'} · sample reading</span><h1>{relationship ? data.label : `${data.label}’s birth chart`}</h1><p>One reading, many ways to understand it. One ongoing discussion.</p></header>
    {contextRail}
    <nav className="cp-product-navigation" aria-label="Reading views"><button type="button" className="cp-text-button" aria-current={!readingView ? 'page' : undefined} onClick={onOverview}>Overview</button><button type="button" className="cp-text-button" aria-current={readingView ? 'page' : undefined} onClick={onReadDetail}>Detailed reading</button><button type="button" className="cp-text-button" onClick={discuss}>Ask about this reading</button></nav>
    {readingView || <>
    <article className="ink-card cp-product-overview" aria-label={`${data.label} ${relationship ? 'relationship' : 'birth chart'} overview`}>
      <div className="cp-meta"><span className="ink-eyebrow">The reading</span><span>{Math.max(1, Math.ceil(data.overview.join(' ').split(/\s+/).length / 200))} min read</span></div>
      <h2>{relationship ? 'Different rhythms, shared ground.' : 'Warmth, with room to be yourself.'}</h2>
      {data.overview.length ? data.overview.map((paragraph, index) => <div key={paragraph} tabIndex={-1} data-passage={`overview-${index}`} className={`cp-product-passage${highlightedPassage === `overview-${index}` || focusPassage === `overview-${index}` ? ' is-highlighted' : ''}`}>
        <ReferenceText text={paragraph} source={{ ...source, sourceId: `${serviceId}:overview:${index}`, sourceVersion: textVersion(data.overview.join('\n')) }} />
      </div>) : <p>No overview reading is available yet.</p>}
      <p className="cp-sample-note">{data.note}</p>
    </article>
    </>}
    <section ref={discussion} className="cp-product-discussion" aria-label={`${data.label} ongoing discussion`}><header className="cp-product-discussion-heading"><span className="ink-eyebrow">Continue the conversation</span></header><p className="cp-caption">Questions about the overview, chart, and detailed reading all stay in this discussion. Responses are illustrative, not live AI.</p>
      <details className="cp-chart-picker">
        <summary>Add a chart element to your question <span aria-live="polite">{selectedCount} of {ENTITY_LIMIT} selected</span></summary>
        <p className="cp-caption">Tap a placement or aspect to add it to the question box. Tap again to remove it.</p>
        <div className="cp-picker-options" aria-label="Chart elements">
          {!relationship && <>{data.placements.map(planet => <ReferenceEntity key={planet.name} reference={placementReference(serviceId, data.subjectId, planet)}><span>{planet.name} · {planet.sign}</span></ReferenceEntity>)}
            {data.aspects.map(aspect => {
              const payload = formatAspectData(aspect, SAMPLE_PLANETS.find(planet => planet.name === aspect.aspectedPlanet), SAMPLE_PLANETS.find(planet => planet.name === aspect.aspectingPlanet));
              return <ReferenceEntity key={payload.code} reference={entity('aspect', payload.code, payload.label, payload)}><span>{payload.label} <small>Orb {payload.orb}°</small></span></ReferenceEntity>;
            })}</>}
          {relationship && <><p className="cp-caption">Stars describe individual factors, not the relationship as a whole.</p>{data.factors.map(factor => <ReferenceEntity key={factor.id} reference={relationshipAspectReference(serviceId, data.subjectId, factor)}><span>{factor.label}<small>{factor.source === 'composite' ? 'Composite' : 'Synastry'}</small></span>{factor.stars && <span className="cp-factor-stars" aria-label={`${factor.stars} stars`}>{'★'.repeat(factor.stars)}</span>}</ReferenceEntity>)}</>}
        </div>
        {!relationship && !contextRail && <details className="cp-product-chart"><summary>View sample natal positions</summary><p className="cp-caption">Noninteractive sample wheel. Select rows above to add chart context.</p><Ephemeris planets={SAMPLE_PLANETS} houses={[]} aspects={[]} transits={[]} theme="ink" emphasisPlanets={selectedPlanets.size ? selectedPlanets : null} instanceId="prototype-birth-overview" /></details>}
      </details>
      {children}</section>
  </div>;
}
