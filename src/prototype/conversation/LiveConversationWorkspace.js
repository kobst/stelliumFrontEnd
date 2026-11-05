import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import GravityChatPanel from '../../UI/gravityChat/GravityChatPanel';
import useEntitlementsStore from '../../Utilities/entitlementsStore';
import { getCompositeInterpretation } from '../../Utilities/compositeInterpretation';
import { isDevBackend, loadDevLibrary, loadDevService, nameOf } from './liveData';
import { splitReading } from './serviceReadingData';
import LiveContextRail from './LiveContextRail';
import LiveCreateDialog from './LiveCreateDialog';
import LiveHoroscopeWorkspace from './LiveHoroscopeWorkspace';
import ServiceLibrary, { ServiceNavigation, navigationGroups } from './ServiceLibrary';
import '../../styles/ink.css';
import './ConversationPrototype.css';
import './ServiceReadingWorkspace.css';
import './LiveConversationWorkspace.css';

export default function LiveConversationWorkspace() {
  const { stelliumUser } = useAuth();
  if (!isDevBackend()) return <div className="ink-page cp-page"><main className="cp-library"><h1>Dev connection required</h1><p>This workspace is restricted to api.dev.stellium.ai. Set REACT_APP_SERVER_URL to the dev API and restart the frontend.</p><Link to="/prototype/conversation">Open sample mode</Link></main></div>;
  if (!stelliumUser?._id) return <div className="ink-page cp-page"><main className="cp-library"><h1>Sign in to your dev account</h1><Link to="/login">Sign in</Link></main></div>;
  return <AccountWorkspace key={stelliumUser._id} account={stelliumUser} />;
}

function AccountWorkspace({ account }) {
  const [params, setParams] = useSearchParams();
  const [library, setLibrary] = useState(null), [loading, setLoading] = useState(true), [error, setError] = useState('');
  const [creation, setCreation] = useState(null), [notice, setNotice] = useState('');
  const [access, setAccess] = useState(null), [accessError, setAccessError] = useState(false);
  const alive = useRef(true), request = useRef(0);
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
  const refresh = useCallback(async () => {
    const revision = ++request.current;
    setLoading(true); setError('');
    try { const result = await loadDevLibrary(account._id); if (alive.current && revision === request.current) setLibrary(result); return result; }
    catch { if (alive.current && revision === request.current) setError('Your dev library could not be loaded. Please retry.'); return null; }
    finally { if (alive.current && revision === request.current) setLoading(false); }
  }, [account._id]);
  useEffect(() => {
    let cancelled = false;
    refresh();
    Promise.resolve(useEntitlementsStore.getState().fetchEntitlements(account._id)).then(result => {
      if (cancelled) return;
      setAccess(result?.success ? useEntitlementsStore.getState().unlockedAnalyses || null : null);
      setAccessError(!result?.success);
    }).catch(() => { if (!cancelled) setAccessError(true); });
    return () => { cancelled = true; };
  }, [refresh, account._id]);
  const active = library?.services.find(service => service.id === params.get('service'));
  const open = id => { setParams(id ? { service: id } : {}); window.scrollTo?.(0, 0); };
  const actions = <div className="cp-create-actions"><button type="button" className="cp-text-button" disabled={!library || loading || library.errors.length > 0} onClick={() => setCreation('person')}>＋ Add person</button><button type="button" className="cp-text-button" disabled={!library || loading || library.errors.length > 0} onClick={() => setCreation('relationship')}>＋ Add relationship</button></div>;
  return <div className="ink-page cp-page cp-dev-page"><header className="cp-topbar"><Link className="cp-wordmark" to="/">Astral Gravity ✳</Link><span className="cp-prototype-tag">Dev account · {nameOf(account)}</span><button type="button" className="cp-text-button" onClick={() => open(null)}>Your sky</button><Link to="/prototype/conversation">Sample mode</Link></header>
    {active && <nav className="cp-mobile-services" aria-label="Service navigation"><label htmlFor="live-service-select">Your services</label><select id="live-service-select" value={active.id} onChange={event => open(event.target.value)}><option value="">Your sky dashboard</option>{navigationGroups(library, account._id).map(group => <optgroup key={group.kind} label={group.title}>{group.services.map(service => <option key={service.id} value={service.id}>{service.title}</option>)}</optgroup>)}</select>{actions}</nav>}
    {notice && <p role="status" className="cp-dev-notice">{notice}</p>}
    <main className={`cp-workspace cp-dev-workspace${active ? '' : ' cp-dev-workspace--library'}`}>{active && <aside className="cp-rail" aria-label="Your services"><button type="button" className="cp-text-button" onClick={() => open(null)}>← Your sky dashboard</button><ServiceNavigation library={library} account={account} active={active} access={access} onOpen={open} />{actions}<button type="button" className="cp-text-button" disabled={loading} onClick={refresh}>Refresh library</button></aside>}
      <div className="cp-dev-content">
        {(error || library?.errors.length > 0) && <div role="alert"><p>{error || library.errors.join(' ')}</p><button type="button" className="ink-btn ink-btn--ghost" disabled={loading} onClick={refresh}>Retry library</button></div>}
        {loading && <p role="status">Loading your dev library…</p>}
        {!loading && active ? active.kind === 'horoscope' ? <LiveHoroscopeWorkspace embedded /> : <SavedService key={`${account._id}:${active.id}`} account={account} service={active} library={library} />
          : !loading && library && <>{params.get('service') && <p role="status">That service is not in the loaded account library. Choose one below.</p>}<ServiceLibrary library={library} account={account} access={access} accessError={accessError} actions={actions} onOpen={open} /><button type="button" className="cp-text-button" onClick={refresh}>Refresh library</button></>}
      </div>
    </main>
    {creation && library && <LiveCreateDialog mode={creation} account={account} library={library} onClose={() => setCreation(null)} onPersonSaved={() => setNotice('Birth chart saved to your dev account.')} onComplete={async id => {
      setCreation(null); setNotice('Saved. Loading the service from your dev account…');
      const updated = await refresh();
      if (!alive.current) return;
      open(id); setNotice(updated?.services.some(service => service.id === id) ? 'Your saved service is ready.' : 'Saved, but it is not in the library response yet. Refresh the library to load it.');
    }} />}
  </div>;
}

function SavedService({ account, service, library }) {
  const [data, setData] = useState(null), [error, setError] = useState(''), [revision, setRevision] = useState(0);
  const [view, setView] = useState('overview'), [chapterId, setChapterId] = useState(null), [lens, setLens] = useState('synastry');
  const [selected, setSelected] = useState([]), [selectionError, setSelectionError] = useState('');
  const [quote, setQuote] = useState(''), [externalDraft, setExternalDraft] = useState(null);
  const reader = useRef(null), discussion = useRef(null), nonce = useRef(0);
  useEffect(() => {
    let cancelled = false;
    setError(''); setData(null); setSelected([]); setQuote('');
    loadDevService(service, library).then(result => { if (!cancelled) setData(result); }).catch(() => { if (!cancelled) setError('The saved service could not be loaded.'); });
    return () => { cancelled = true; };
  }, [service, library, revision]);
  const select = element => setSelected(current => {
    if (current.some(item => item.key === element.key)) { setSelectionError(''); return current.filter(item => item.key !== element.key); }
    if (current.length >= 3) { setSelectionError('Select up to three chart elements.'); return current; }
    setSelectionError(''); return [...current, element];
  });
  const focusChat = () => discussion.current?.querySelector('textarea')?.focus({ preventScroll: true });
  const standardPath = `/dashboard/${account._id}/${service.kind === 'relationship' ? 'relationship' : 'chart'}/${service.contentId}`;
  if (error) return <div role="alert"><p>{error}</p><button type="button" onClick={() => setRevision(value => value + 1)}>Retry service</button></div>;
  if (!data) return <p role="status">Loading saved chart and reading…</p>;
  const chapters = data.reading.report.chapters, chapter = chapters.find(item => item.id === chapterId) || chapters[0];
  const detailParagraphs = chapter?.lenses ? (chapter.lenses[lens] || []).flatMap(section => section.paragraphs) : chapter?.paragraphs || [];
  const compositeSummary = service.kind === 'relationship' ? getCompositeInterpretation(data.source) : '';
  const paragraphs = view === 'overview' ? data.reading.overview : detailParagraphs;
  return <div className="cp-live-service"><div className="cp-conversation">
    <header className="cp-product-heading"><span className="ink-eyebrow">Saved {service.kind === 'birthchart' ? 'birth chart' : 'relationship'} · dev account</span><h1>{service.title}</h1><p>One reading, one ongoing discussion.</p></header>
    {data.error && <p role="alert">{data.error} <button type="button" className="cp-text-button" onClick={() => setRevision(value => value + 1)}>Retry reading</button></p>}
    <nav className="cp-product-navigation" aria-label="Reading views"><button type="button" className="cp-text-button" aria-current={view === 'overview' ? 'page' : undefined} onClick={() => { setView('overview'); setQuote(''); }}>Overview</button><button type="button" className="cp-text-button" aria-current={view === 'detail' ? 'page' : undefined} onClick={() => { setView('detail'); setQuote(''); }}>Detailed reading</button><button type="button" className="cp-text-button" onClick={focusChat}>Ask about this reading</button></nav>
    {view === 'detail' && chapters.length > 0 && <><nav className="cp-live-chapters" aria-label="Report chapters">{chapters.map(item => <button type="button" key={item.id} className="cp-text-button" aria-current={chapter.id === item.id ? 'step' : undefined} onClick={() => { setChapterId(item.id); setQuote(''); }}>{item.title}</button>)}</nav>{chapter?.lenses && <div className="cp-context-switch" role="group" aria-label="Relationship interpretation lens">{['synastry','composite'].map(value => <button type="button" key={value} aria-pressed={lens === value} onClick={() => { setLens(value); setQuote(''); }}>{value === 'synastry' ? 'Synastry' : 'Composite'}</button>)}</div>}</>}
    <article ref={reader} className="ink-card cp-product-overview" aria-label="Saved reading" onMouseUp={() => { const selection = window.getSelection(); setQuote(selection && reader.current?.contains(selection.anchorNode) && reader.current?.contains(selection.focusNode) ? selection.toString().trim().slice(0, 2000) : ''); }}>
      <h2>{view === 'overview' ? 'Your overview' : chapter?.title || 'Detailed reading'}</h2>
      {paragraphs.length ? paragraphs.map((text, index) => <p key={index}>{text}</p>) : <p>{view === 'detail' && chapter?.lenses ? `No ${lens} interpretation is saved for this chapter.` : `No ${view === 'detail' ? 'detailed reading' : 'overview'} is saved yet.`}</p>}
      {view === 'overview' && compositeSummary && <details><summary>Composite interpretation</summary>{splitReading(compositeSummary).map((text, index) => <p key={index}>{text}</p>)}</details>}
      {!paragraphs.length && <p><Link to={standardPath}>Open the existing service to check access or generate a reading ↗</Link></p>}
      {quote && <button type="button" className="ink-btn ink-btn--ghost" onClick={() => { setExternalDraft({ nonce: ++nonce.current, text: `About this passage from ${service.title}${view === 'detail' ? ` · ${chapter?.title}` : ''}:\n“${quote}”\n\nMy question: ` }); setQuote(''); focusChat(); }}>Ask about selection</button>}
    </article>
    <section ref={discussion} className="cp-live-account-chat"><h2>Continue the conversation</h2><p className="cp-caption">This is your existing dev discussion. Sending a question uses your normal allowance. Detailed reports use the existing access flow.</p>{selectionError && <p role="status">{selectionError}</p>}
      <GravityChatPanel isOpen variant="dock" onClose={() => {}} contentType={service.kind} contentId={service.contentId} birthChart={data.people[0]?.birthChart || { planets: [], houses: [], aspects: [] }} relationshipScoredItems={data.scoredItems || []}
        externalElements={selected} syncExternalElements onSelectionChange={setSelected} selectionLimit={3} externalDraft={externalDraft} contextPlacement="external" contextLabel={service.title} placeholderText="Ask about this reading…" />
    </section>
  </div><LiveContextRail service={service} data={data} selected={selected} onSelect={select} /></div>;
}
