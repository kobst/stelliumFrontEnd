import React, { useState } from 'react';
import { nameOf, sameId, relationshipNames } from './liveData';
import { formatCalendarDate } from '../../Utilities/dateFormatting';
import './ServiceLibrary.css';

export const SERVICE_GROUPS = [
  { kind: 'birthchart', title: 'People' },
  { kind: 'relationship', title: 'Relationships' },
];

// Forecasts remain a separate discussion/API service, but belong to their owner
// in navigation. Do not change content IDs or combine the saved histories.
export function navigationGroups(library, accountId) {
  return [{ kind: 'you', title: 'You', services: library.services.filter(item => sameId(item.contentId, accountId) && ['birthchart', 'horoscope'].includes(item.kind)) },
    ...SERVICE_GROUPS.map(group => ({ ...group, services: library.services.filter(item => item.kind === group.kind && !(item.kind === 'birthchart' && sameId(item.contentId, accountId))) }))];
}

// Availability is not proof of purchase. Unlocks are a separate entitlement.
export function serviceState(service, access) {
  if (service.kind === 'horoscope') return { label: 'Today · This week · This month', state: 'forecast', unlocked: false };
  const record = service.record || {};
  const status = (service.kind === 'relationship' ? record.relationshipAnalysisStatus : record.analysisStatus) || {};
  const workflow = status.workflowStatus;
  const workflowName = typeof workflow === 'string' ? workflow : workflow?.status;
  const unlocked = (access?.[service.kind === 'relationship' ? 'relationships' : 'birthCharts'] || []).some(id => sameId(id, service.contentId));
  if (workflow?.isRunning || ['running', 'in_progress', 'processing'].includes(workflowName)) return { label: 'Reading in progress', state: 'processing', unlocked };
  if (workflowName === 'failed' || workflowName === 'completed_with_failures') return { label: 'Reading needs attention', state: 'attention', unlocked };
  if (status.level === 'complete') return { label: 'Detailed reading saved', state: 'detailed', unlocked };
  if (status.level === 'overview' || status.level === 'scores' || record.basicAnalysis?.overview || record.initialOverview) return { label: 'Overview available', state: 'overview', unlocked };
  if (status.level === 'none') return { label: 'No reading saved yet', state: 'none', unlocked };
  return { label: 'Open to check readings', state: 'unknown', unlocked };
}

function RecordDate({ record }) {
  // updatedAt is record activity, not necessarily a new reading or chat message.
  const value = record?.updatedAt || record?.createdAt;
  if (!value || Number.isNaN(new Date(value).getTime())) return null;
  return <small>{record.updatedAt ? 'Updated' : 'Created'} <time dateTime={new Date(value).toISOString()}>{formatCalendarDate(value, 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</time></small>;
}

export function ServiceNavigation({ library, account, active, access, onOpen }) {
  return navigationGroups(library, account._id).map(group => <section key={group.kind} className="cp-library-nav-group" aria-label={group.title}>
    <h2>{group.title} {group.kind !== 'you' && <span>{group.services.length}</span>}</h2>
    {group.services.map(service => <button type="button" key={service.id} aria-current={active?.id === service.id ? 'page' : undefined} onClick={() => onOpen(service.id)}>
      {group.kind === 'you' ? service.kind === 'horoscope' ? 'Your forecasts' : 'Your birth chart' : service.kind === 'birthchart' ? nameOf(service.record) : service.title}
      <small>{serviceState(service, access).label}</small>
    </button>)}
  </section>);
}

function OwnerCard({ account, library, access, onOpen, onRelationships }) {
  const chart = library.services.find(item => item.kind === 'birthchart' && sameId(item.contentId, account._id));
  const forecast = library.services.find(item => item.kind === 'horoscope' && sameId(item.contentId, account._id));
  const person = chart?.record || account;
  const state = chart ? serviceState(chart, access) : null;
  const pairs = library.relationships.filter(pair => sameId(pair.userA_id, account._id) || sameId(pair.userB_id, account._id));
  return <section className="cp-library-you" aria-label="You">
    <h2>You</h2>
    <article className="ink-card cp-owner-card" aria-label={nameOf(person)}>
      <header><h3>{nameOf(person)}</h3><p className="cp-service-person-details">Your chart, readings, and personal forecasts.</p></header>
      <div className="cp-owner-products"><div className="cp-owner-reading">
        <span className="ink-eyebrow">Birth chart & readings</span>
        {state ? <><div className="cp-library-badges"><span>{state.label}</span>{state.unlocked && <span>Detailed access unlocked</span>}</div><RecordDate record={person} />
          <button type="button" className="ink-btn ink-btn--ghost" onClick={() => onOpen(chart.id)}>Open reading & discussion ↗</button></> : <p>Your birth chart could not be loaded. Refresh the library to retry.</p>}
        {pairs.length > 0 && <button type="button" className="cp-text-button cp-library-related" onClick={onRelationships}>In {pairs.length} relationship{pairs.length === 1 ? '' : 's'} →</button>}
      </div><div className="cp-owner-forecast">
        <span className="ink-eyebrow">{nameOf(person)}’s forecasts</span>
        <p>Today · This week · This month</p>
        {forecast ? <button type="button" className="ink-btn ink-btn--ghost" onClick={() => onOpen(forecast.id)}>Open forecasts & discussion ↗</button> : <p>Forecasts are unavailable.</p>}
      </div></div>
    </article>
  </section>;
}

export default function ServiceLibrary({ library, account, access, accessError, actions, onOpen }) {
  const [query, setQuery] = useState(''), [filter, setFilter] = useState('all'), [personId, setPersonId] = useState(null);
  const selectedPerson = library.people.find(person => sameId(person._id, personId));
  const pairsFor = id => library.relationships.filter(pair => sameId(pair.userA_id, id) || sameId(pair.userB_id, id));
  const browseServices = library.services.filter(item => item.kind === 'relationship' || (item.kind === 'birthchart' && !sameId(item.contentId, account._id)));
  const matches = service => {
    const state = serviceState(service, access);
    const text = service.kind === 'birthchart' ? `${service.title} ${service.record.dateOfBirth || ''} ${service.record.placeOfBirth || ''}` : service.title;
    const statusMatches = filter === 'all' || (filter === 'unlocked' ? state.unlocked : state.state === filter);
    const personMatches = !personId || (service.kind === 'relationship' && (sameId(service.record.userA_id, personId) || sameId(service.record.userB_id, personId)));
    return text.toLowerCase().includes(query.trim().toLowerCase()) && statusMatches && personMatches;
  };
  const visible = browseServices.filter(matches);
  return <section className="cp-service-library" aria-label="Your sky dashboard">
    <header><span className="ink-eyebrow">Your saved sky</span><h1>Welcome, {account.firstName || nameOf(account)}.</h1><p>Start with your sky, or explore the people and relationships in your life.</p></header>
    <OwnerCard account={account} library={library} access={access} onOpen={onOpen} onRelationships={() => { setPersonId(account._id); setQuery(''); setFilter('all'); }} />
    {actions}
    <div className="cp-library-tools"><label>Find other people or relationships<input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search by name…" /></label>
      <label>Reading status<select value={filter} onChange={event => setFilter(event.target.value)}><option value="all">All readings</option><option value="detailed">Detailed reading saved</option><option value="overview">Overview available</option><option value="unlocked">Detailed access unlocked</option></select></label>
    </div>
    {accessError && <p role="status">Detailed access could not be checked. Reading availability is shown separately.</p>}
    {selectedPerson && <p className="cp-library-person-filter">Relationships involving {nameOf(selectedPerson)} <button type="button" className="cp-text-button" onClick={() => setPersonId(null)}>Clear person filter ×</button></p>}
    <p className="cp-caption" role="status">{visible.length} of {browseServices.length} other charts and relationships shown. Your sky stays pinned above.</p>
    {SERVICE_GROUPS.map(group => {
      const services = visible.filter(item => item.kind === group.kind);
      if (!services.length && (query || filter !== 'all' || personId)) return null;
      return <section key={group.kind} className="cp-library-group" aria-label={group.title}><h2>{group.title} <span>{services.length}</span></h2>
        {!services.length && <p>No {group.title.toLowerCase()} saved yet.</p>}
        <div className="cp-library-grid">{services.map(service => {
          const state = serviceState(service, access), record = service.record || {}, pairs = group.kind === 'birthchart' ? pairsFor(service.contentId) : [];
          const name = group.kind === 'birthchart' ? nameOf(record) : service.title;
          return <article className="ink-card cp-service-card" key={service.id} aria-label={name}>
            <span className="ink-eyebrow">{group.kind === 'birthchart' ? 'Birth chart' : group.title}</span>
            <h3><button type="button" className="cp-text-button" onClick={() => onOpen(service.id)}>{name}</button></h3>
            {group.kind === 'birthchart' && <p className="cp-service-person-details">{record.dateOfBirth && formatCalendarDate(record.dateOfBirth, 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })}{record.placeOfBirth && ` · ${record.placeOfBirth}`}</p>}
            <div className="cp-library-badges"><span>{state.label}</span>{state.unlocked && <span>Detailed access unlocked</span>}</div>
            <RecordDate record={record} />
            {group.kind === 'birthchart' && pairs.length > 0 && <button type="button" className="cp-text-button cp-library-related" onClick={() => { setPersonId(service.contentId); setQuery(''); setFilter('all'); }}>In {pairs.length} relationship{pairs.length === 1 ? '' : 's'} →</button>}
            {group.kind === 'relationship' && <div className="cp-library-related" aria-label="People in this relationship">{['A', 'B'].map((side, index) => {
              const personService = library.services.find(item => item.kind === 'birthchart' && sameId(item.contentId, record[`user${side}_id`]));
              const personName = personService ? nameOf(personService.record) : relationshipNames(record)[index];
              return personService ? <button type="button" key={side} className="cp-text-button" onClick={() => onOpen(personService.id)}>{personName}’s chart ↗</button> : <span key={side}>{personName}</span>;
            })}</div>}
            <button type="button" className="ink-btn ink-btn--ghost cp-service-open" onClick={() => onOpen(service.id)}>Open reading & discussion ↗</button>
          </article>;
        })}</div>
      </section>;
    })}
    {!visible.length && <p>No services match. <button type="button" className="cp-text-button" onClick={() => { setQuery(''); setFilter('all'); setPersonId(null); }}>Clear filters</button></p>}
    <p className="cp-caption">Reading availability and unlocked access are separate. An available report does not necessarily mean it was purchased.</p>
  </section>;
}
