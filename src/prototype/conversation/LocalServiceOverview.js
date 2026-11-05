import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { peopleFor, profileSummary } from './creation';

export default function LocalServiceOverview({ service, state, mount }) {
  const [view, setView] = useState('overview');
  const [chartView, setChartView] = useState('synastry');
  const relationship = service.kind === 'relationship';
  const people = peopleFor(state).filter(person => relationship ? person.id === 'maya' || person.id === service.partnerId : person.id === service.subjectId);
  const details = <><span className="ink-eyebrow">Saved birth details · local prototype</span>{people.map(person => <section key={person.id}><h3>{person.name}</h3><p>{profileSummary(person)}</p></section>)}
    {relationship && <div role="group" className="cp-context-switch" aria-label="Relationship chart">{['synastry', 'composite'].map(mode => <button type="button" key={mode} aria-pressed={chartView === mode} onClick={() => setChartView(mode)}>{mode === 'synastry' ? 'Synastry' : 'Composite'}</button>)}</div>}
    <p className="cp-context-caption">{relationship ? chartView === 'synastry' ? 'Synastry chart and cross-chart aspects' : 'Composite chart and its aspects' : 'Natal chart and positions'} have not been calculated. No sample positions are substituted for these birth details.</p></>;
  return <>
    <header className="cp-product-heading"><span className="ink-eyebrow">{relationship ? 'Your relationship' : 'Your birth chart'} · local prototype</span><h1 tabIndex={-1}>{service.title}</h1><p>One reading, one ongoing discussion.</p></header>
    <details className="cp-local-context-inline"><summary>Birth details & chart status</summary>{details}</details>
    {mount && createPortal(<aside className="cp-context-rail cp-local-context" aria-label="Saved birth details">{details}</aside>, mount)}
    <nav className="cp-product-navigation" aria-label="Reading views"><button type="button" className="cp-text-button" aria-current={view === 'overview' ? 'page' : undefined} onClick={() => setView('overview')}>Overview</button><button type="button" className="cp-text-button" aria-current={view === 'detail' ? 'page' : undefined} onClick={() => setView('detail')}>Detailed reading</button><button type="button" className="cp-text-button" onClick={() => document.querySelector('#cp-prompt')?.focus({ preventScroll: true })}>Ask about this reading</button></nav>
    <article className="ink-card cp-product-overview"><span className="ink-eyebrow">{view === 'overview' ? 'Details saved' : 'Detailed reading'}</span><h2>{view === 'overview' ? 'Your reading will live here.' : 'No detailed reading yet.'}</h2>
      <p>{view === 'overview' ? 'This prototype lets you test adding people, forming relationships, and returning to their discussions. It does not calculate new charts or generate interpretations.' : 'The connected product will offer generation or purchase here once the chart is ready. Purchases and report generation for newly added people are not available in this prototype.'}</p>
      <p>Your questions stay with {service.title}. You can return from Your services or Your sky.</p>
    </article><h2 className="cp-local-discussion">Continue the conversation</h2><p className="cp-caption">Messages are saved locally. Replies are placeholders, not chart interpretations.</p>
  </>;
}
