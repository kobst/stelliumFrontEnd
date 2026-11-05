import React, { useEffect, useLayoutEffect, useMemo, useReducer, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Ephemeris from '../../UI/shared/Ephemeris';
import AspectMiniChart from '../../UI/shared/AspectMiniChart';
import HoroscopeWorkspace from './HoroscopeWorkspace';
import ServiceReadingWorkspace from './ServiceReadingWorkspace';
import ReportAccess from './ReportAccess';
import useComposerDock from './useComposerDock';
import useReplyReveal from './useReplyReveal';
import ContextRail from './ContextRail';
import CreateServiceDialog from './CreateServiceDialog';
import LocalServiceOverview from './LocalServiceOverview';
import { MODES, SAMPLE_MONTH, SAMPLE_PLANETS, SAMPLE_WEEK, SUBJECTS, getServiceReading, makeReport } from './fixtures';
import { STORAGE_KEY, createMessages, loadState, reducer, resolveRequest, serializableState, serviceForReading, subjectFor } from './model';
import { ReferenceProvider, ReferenceText } from './ReferenceLayer';
import { referenceKey, textVersion } from './references';
import '../../styles/ink.css';
import './ConversationPrototype.css';

const forecastFor = (monthly) => monthly ? SAMPLE_MONTH : SAMPLE_WEEK;
const forecastId = (monthly) => monthly ? 'maya-forecast-november-2026' : 'maya-forecast-2026-10-19';

function SampleWheel() {
  return <div className="cp-wheel" aria-label="Illustrative sample chart">
    <Ephemeris planets={SAMPLE_PLANETS} houses={[]} aspects={[]} transits={[]} theme="ink" instanceId="conversation-prototype" />
    <span className="cp-handwritten">a little perspective ✳</span>
  </div>;
}

function Forecast({ monthly, onAsk, expanded = false }) {
  const forecast = forecastFor(monthly);
  const [selectedDay, setSelectedDay] = useState(null);
  return <div className="cp-forecast">
    <div className="cp-meta"><span className="ink-eyebrow">{monthly ? 'Your month' : 'Your week'}</span><span>{forecast.label}</span></div>
    <h3>{forecast.title}</h3><p>{forecast.summary}</p>
    {!monthly && <div className="cp-week" aria-label="Sample forecast days">
      {forecast.days.map((day) => <button key={day.date} type="button" aria-pressed={selectedDay === day.date}
        className={day.event ? 'cp-event-day' : ''} onClick={() => setSelectedDay(day.date)}>
        <span>{day.name}</span><strong>{day.date}</strong><span aria-hidden="true">{day.event ? '✳' : '·'}</span>
      </button>)}
    </div>}
    {selectedDay && <p role="status" className="cp-day-note">{forecast.days.find((day) => day.date === selectedDay)?.event || 'A quieter sample day. Leave some breathing room.'}</p>}
    <div className="cp-forecast-events">{forecast.events.map((event) => <div key={event.day}>
      <span>{event.day}</span><div><h4>{event.title}</h4><p>{event.text}</p>
        <button type="button" className="cp-text-button" onClick={() => onAsk(`Tell me more about ${event.day.toLowerCase()}`)}>Explore this in conversation ↗</button>
      </div>
    </div>)}</div>
    {expanded && <section className="cp-forecast-themes"><h3>Carry this into your week</h3>
      <p><strong>Connection.</strong> Choose a moment when neither person is rushing. Begin with curiosity about the other person’s experience.</p>
      <p><strong>Work.</strong> Give one important task uninterrupted attention, and leave time to reflect before adding another commitment.</p>
      <p><strong>Wellbeing.</strong> Pay attention to the pace you can actually sustain. A quieter day can be useful without needing to be productive.</p>
    </section>}
    <p className="cp-caption">Maya’s sample forecast · {forecast.timezone} · Illustrative dates and content</p>
  </div>;
}

function ReadingView({ reading, position, onPosition, onBack, onAsk, embedded = false, focusPassage, focusVisit }) {
  const report = reading.type === 'report' ? getServiceReading(reading.subjectId)?.report : null;
  const chapter = report?.chapters.find((item) => item.id === position?.chapterId) || report?.chapters[0];
  const lens = position?.lens || 'synastry';
  const sections = chapter?.lenses ? chapter.lenses[lens] || [] : null;
  const passages = sections ? sections.flatMap((section) => section.paragraphs) : chapter?.paragraphs || [];
  const quoteTitle = chapter ? `${chapter.title}${chapter.lenses ? ` · ${lens === 'composite' ? 'Composite' : 'Synastry'}` : ''}` : '';
  const body = useRef(null);
  const chaptersNav = useRef(null);
  useEffect(() => {
    const nav = chaptersNav.current;
    const center = () => {
      const active = nav?.querySelector('[aria-current="step"]');
      if (active && nav.scrollWidth > nav.clientWidth) nav.scrollLeft = active.offsetLeft - nav.offsetLeft - (nav.clientWidth - active.offsetWidth) / 2;
    };
    center();
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(center);
    if (nav) observer?.observe(nav);
    return () => observer?.disconnect();
  }, [chapter?.id]);
  useLayoutEffect(() => {
    if (embedded) {
      document.documentElement.scrollTop = position?.pageScrollTop || 0;
    } else if (body.current) body.current.scrollTop = position?.scrollTop || 0;
    // Restore once on chapter entry; subsequent scroll events update the stored position.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reading.id, chapter?.id, lens, embedded]);
  const onPositionRef = useRef(onPosition);
  onPositionRef.current = onPosition;
  useEffect(() => {
    if (!embedded) return undefined;
    let frame;
    const save = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => onPositionRef.current({ chapterId: chapter?.id, lens, pageScrollTop: window.scrollY }));
    };
    window.addEventListener('scroll', save, { passive: true });
    return () => { window.removeEventListener('scroll', save); cancelAnimationFrame(frame); };
  }, [embedded, chapter?.id, lens]);
  useEffect(() => {
    if (!focusPassage) return;
    const passage = Array.from(body.current?.querySelectorAll('[data-passage]') || []).find((item) => item.dataset.passage === focusPassage);
    passage?.scrollIntoView?.({ block: 'center', behavior: 'smooth' });
    passage?.focus({ preventScroll: true });
  }, [focusPassage, focusVisit, chapter?.id, lens]);
  return <section className={`cp-reader${embedded ? ' cp-reader--embedded' : ''}`} aria-label="Dedicated reading view">
    {!embedded && <header className="cp-reader-header">
      <button type="button" className="ink-btn ink-btn--ghost" onClick={onBack}>← Back to conversation</button>
      <div><span className="ink-eyebrow">{report ? report.kind === 'birthchart' ? 'Birth chart reading' : 'Relationship reading' : 'Forecast'}</span><p>{reading.title}</p></div>
      <span className="cp-saved">✓ Saved to Your sky</span>
    </header>}
    <div className={`cp-reader-layout${report ? '' : ' cp-reader-layout--forecast'}`}>
      {report && <nav ref={chaptersNav} className="cp-chapters" aria-label="Report chapters">
        <span className="ink-eyebrow">In this reading</span>
        {report.chapters.map((item, index) => <button key={item.id} type="button" aria-current={item.id === chapter.id ? 'step' : undefined}
          onClick={() => onPosition({ chapterId: item.id, scrollTop: 0, lens })}><span>{String(index + 1).padStart(2, '0')}</span>{item.title}</button>)}
        <p className="cp-caption">A sample report for testing the reading experience.</p>
      </nav>}
      <div className="cp-reader-scroll" role="region" aria-label="Reading content" tabIndex={0} ref={body}
        onScroll={embedded ? undefined : (event) => onPosition({ chapterId: chapter?.id, scrollTop: event.currentTarget.scrollTop, lens })}>
        {report ? <article className="cp-reading-prose" key={chapter.id}>
          <div className="ink-eyebrow">Chapter {report.chapters.indexOf(chapter) + 1} of {report.chapters.length} · {chapter.eyebrow}</div>
          <h1>{chapter.title}<span className="ink-italic">{report.kind === 'birthchart' ? ', in your life.' : ', between you.'}</span></h1>
          <p className="cp-sample-note">{report.note}</p>
          {chapter.lenses && <><div className="cp-reader-lenses" role="group" aria-label="Relationship interpretation lens">{['synastry', 'composite'].map((value) => <button key={value} type="button" aria-pressed={lens === value} onClick={() => onPosition({ chapterId: chapter.id, lens: value, scrollTop: 0 })}>{value === 'synastry' ? 'Synastry' : 'Composite'}</button>)}</div><p className="cp-caption">{lens === 'synastry' ? 'Synastry compares your two charts: how each person meets the other.' : 'Composite describes the relationship as its own chart, not either individual.'}</p></>}
          {sections && !sections.length && <div className="ink-card cp-context-note" role="status">No {lens} interpretation is available for this theme. The other view remains available; missing text has not been filled in.</div>}
          {passages.map((paragraph, index) => <div className={`cp-passage${focusPassage === `detail-${chapter.id}-${lens}-${index}` ? ' is-highlighted' : ''}`} tabIndex={-1} data-passage={`detail-${chapter.id}-${lens}-${index}`} key={`${lens}-${index}`}>
            {sections?.find((section) => section.paragraphs[0] === paragraph) && <h2 className="cp-reader-section-title">{sections.find((section) => section.paragraphs[0] === paragraph).heading}</h2>}
            {!sections && chapter.sections?.find((section) => section.paragraphs[0] === paragraph) && <h2 className="cp-reader-section-title">{chapter.sections.find((section) => section.paragraphs[0] === paragraph).heading}</h2>}
            <ReferenceText text={paragraph} source={{ serviceId: reading.threadId, sourceId: `${reading.id}:${chapter.id}:${lens}:${index}`, sourceVersion: textVersion(passages.join('\n')), label: `Chapter ${report.chapters.indexOf(chapter) + 1} · ${quoteTitle}`,
              target: { subjectId: reading.subjectId, readingId: reading.id, chapterId: chapter.id, lens } }} />
          </div>)}
          <div className="cp-reader-next">{report.chapters.indexOf(chapter) < report.chapters.length - 1
            ? <button className="ink-btn ink-btn--ghost" type="button" onClick={() => onPosition({ chapterId: report.chapters[report.chapters.indexOf(chapter) + 1].id, scrollTop: 0, lens })}>Next chapter →</button>
            : <p>You’ve reached the end. What would you like to explore together?</p>}</div>
        </article> : <div className="cp-reading-prose"><Forecast monthly={reading.monthly} expanded onAsk={onAsk} /></div>}
      </div>
      {!embedded && <aside className="cp-reader-aside"><span className="ink-eyebrow">Reading & discussion</span><p>{subjectFor(reading.subjectId).label}<br />Your place is saved as you read.</p>{report && <button type="button" className="cp-text-button" onClick={() => onAsk(`Help me understand ${chapter.title.toLowerCase()}`)}>Ask about this chapter ↗</button>}{report?.kind === 'birthchart' && <details><summary>Explore the sample chart</summary><SampleWheel /></details>}</aside>}
    </div>
  </section>;
}

export default function ConversationPrototype() {
  const [state, dispatch] = useReducer(reducer, undefined, () => {
    try { return loadState(window.localStorage); } catch { return loadState({ getItem: () => null }); }
  });
  const [params, setParams] = useSearchParams();
  const [draft, setDraft] = useState('');
  const [library, setLibrary] = useState(false);
  const [creationMode, setCreationMode] = useState(null);
  const [storageError, setStorageError] = useState(false);
  const [returnRequest, setReturnRequest] = useState(null);
  const [composerExpanded, setComposerExpanded] = useState(false);
  const [replyTarget, setReplyTarget] = useState(null);
  const [contextMount, setContextMount] = useState(null);
  const [skyRequest, setSkyRequest] = useState(0);
  const composer = useRef(null);
  const page = useRef(null);
  const column = useRef(null);
  const transcript = useRef(null);
  const sourceVisits = useRef(0);
  const thread = state.threads.find((item) => item.id === state.activeId) || { messages: state.homeMessages, title: 'Home' };
  const activeService = state.threads.find((item) => item.id === state.activeId);
  const serviceReading = useMemo(() => activeService && !activeService.custom && activeService.kind !== 'horoscope' ? getServiceReading(activeService.subjectId) : null, [activeService]);
  const subject = subjectFor(state.subjectId, state);
  const reading = state.readings.find((item) => item.id === params.get('reading'));
  const inReader = params.get('view') === 'reading';
  const embeddedReader = inReader && reading?.type === 'report';
  const showingAccess = params.get('view') === 'detail';
  const reportRequest = [...thread.messages].reverse().find(message => message.type === 'report');
  useComposerDock(page, column, composer, !library && (!inReader || embeddedReader));
  useReplyReveal(replyTarget, transcript, composer, !library && !showingAccess && (!inReader || embeddedReader));

  useEffect(() => {
    if (embeddedReader && state.activeId !== reading.threadId) dispatch({ type: 'switch', id: reading.threadId });
  }, [embeddedReader, reading?.threadId, state.activeId]);

  useEffect(() => {
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(serializableState(state))); setStorageError(false); }
    catch { setStorageError(true); }
  }, [state]);
  useEffect(() => {
    const jobs = state.threads.flatMap((item) => item.messages.filter((message) => message.status === 'generating').map((message) => ({ threadId: item.id, ...message })));
    const timers = jobs.map((job) => window.setTimeout(() => dispatch({ type: 'ready', threadId: job.threadId, id: job.id }), Math.max(0, 1500 - (Date.now() - job.startedAt))));
    return () => timers.forEach(window.clearTimeout);
  }, [state.threads]);
  useEffect(() => { if ((state.pendingQuote || state.pendingTransit) && (!inReader || embeddedReader)) composer.current?.focus({ preventScroll: true }); }, [state.pendingQuote, state.pendingTransit, inReader, embeddedReader]);
  useEffect(() => {
    if (embeddedReader && !library) return; // The reader restores its own page position.
    document.documentElement.scrollTop = 0; document.body.scrollTop = 0;
  }, [inReader, embeddedReader, library, state.activeId, showingAccess]);

  const send = (text, subjectId = state.subjectId, override) => {
    if (!text.trim()) return;
    let request = override || resolveRequest(text, subjectId, state.mode, state.activeId, state);
    if (!override && state.pendingReferences.length && request.subjectId === state.subjectId) request = { kind: 'answer', subjectId: state.subjectId, serviceId: state.activeId };
    if (override) request.serviceId = request.kind === 'forecast' ? 'horoscope:maya'
      : subjectFor(request.subjectId).kind === 'relationship' ? `relationship:${request.subjectId}`
        : activeService?.subjectId === request.subjectId && request.kind === 'answer' ? activeService.id : 'birthchart:maya';
    if (state.pendingTransit && state.activeId === 'horoscope:maya' && request.kind === 'answer') request.serviceId = 'horoscope:maya';
    if (activeService?.custom) request = { kind: 'answer', subjectId: activeService.subjectId, serviceId: activeService.id };
    const messages = createMessages(text.trim(), request, state);
    composer.current?.blur();
    setComposerExpanded(false);
    setReplyTarget(request.kind === 'report' ? null : messages.response.id);
    dispatch({ type: 'send', ...messages, subjectId: request.subjectId });
    setDraft(''); setLibrary(false);
    if (request.kind === 'report') setParams({ view: 'detail' });
    else if ((!embeddedReader || request.serviceId !== reading.threadId) && (!showingAccess || request.serviceId !== state.activeId)) setParams({});
  };
  const saveForecast = (monthly, open = false) => {
    const fixture = forecastFor(monthly);
    const item = { id: forecastId(monthly), type: 'forecast', monthly, subjectId: 'maya', title: fixture.label, threadId: 'horoscope:maya' };
    dispatch({ type: 'save', reading: item });
    if (open) setParams({ view: 'reading', reading: item.id });
  };
  const openReport = (subjectId) => {
    const report = makeReport(subjectId);
    if (!report) return;
    dispatch({ type: 'save', reading: { id: report.id, title: report.title, type: 'report', subjectId, threadId: serviceForReading({ type: 'report', subjectId }) } });
    setParams({ view: 'reading', reading: report.id }); setLibrary(false);
  };
  const openSaved = (item) => {
    dispatch({ type: 'switch', id: serviceForReading(item) });
    setParams({ view: 'reading', reading: item.id }); setLibrary(false);
  };
  const quote = (value) => {
    dispatch({ type: 'quote', threadId: value.serviceId || reading?.threadId, quote: value });
    if (!embeddedReader || value.readingId !== reading.id) setParams({});
    setDraft('');
  };
  const selectReference = (reference, toggle = false, focus = true) => {
    dispatch({ type: 'reference', reference, toggle });
    if (focus) {
      setComposerExpanded(true);
      requestAnimationFrame(() => composer.current?.focus({ preventScroll: true }));
    }
  };
  const openExchange = messageId => {
    const element = Array.from(transcript.current?.querySelectorAll('[data-message]') || []).find(item => item.dataset.message === messageId);
    element?.scrollIntoView?.({ block: 'start', behavior: 'smooth' });
    element?.focus({ preventScroll: true });
  };
  const returnReference = reference => {
    composer.current?.blur();
    setComposerExpanded(false);
    const target = reference.target || {};
    if (state.activeId !== reference.serviceId) dispatch({ type: 'switch', id: reference.serviceId });
    if (target.horoscope) {
      dispatch({ type: 'horoscope', value: target.horoscope });
      setParams({});
    } else if (target.readingId) {
      dispatch({ type: 'position', readingId: target.readingId, position: { chapterId: target.chapterId, lens: target.lens, pageScrollTop: 0 } });
      setParams({ view: 'reading', reading: target.readingId });
    } else setParams({});
    setLibrary(false);
    setReturnRequest({ reference, visit: ++sourceVisits.current });
  };
  const returnToPassage = (value) => {
    if (value.readingId) {
      const position = state.positions[value.readingId] || {};
      if (value.chapterId) dispatch({ type: 'position', readingId: value.readingId, position: {
        chapterId: value.chapterId, lens: value.lens || 'synastry',
        scrollTop: position.chapterId === value.chapterId && position.lens === (value.lens || 'synastry') ? position.scrollTop : 0,
        pageScrollTop: position.chapterId === value.chapterId && position.lens === (value.lens || 'synastry') ? position.pageScrollTop : 0,
      } });
      setParams({ view: 'reading', reading: value.readingId, visit: String(++sourceVisits.current), ...(value.passageId ? { focus: value.passageId } : {}) });
    } else setParams({ focus: value.passageId, subject: value.subjectId, visit: String(++sourceVisits.current) });
  };
  const goHome = () => { dispatch({ type: 'home' }); setDraft(''); setLibrary(false); setParams({}); setReturnRequest(null); setComposerExpanded(false); };
  const openService = (serviceId) => { dispatch({ type: 'switch', id: serviceId }); setDraft(''); setLibrary(false); setParams({}); setReturnRequest(null); setComposerExpanded(false); setSkyRequest(0); };
  const completeCreation = action => {
    dispatch(action); setCreationMode(null); setDraft(''); setLibrary(false); setParams({}); setReturnRequest(null); setComposerExpanded(false); setReplyTarget(null);
    requestAnimationFrame(() => column.current?.querySelector('h1')?.focus({ preventScroll: true }));
  };
  const creationActions = <div className="cp-create-actions"><button type="button" className="cp-text-button" onClick={() => setCreationMode('person')}>＋ Add person</button><button type="button" className="cp-text-button" onClick={() => setCreationMode('relationship')}>＋ Add relationship</button></div>;
  const startGeneration = (message, retry = false) => dispatch({ type: 'generation', id: message.id, fail: retry ? false : state.settings.failGeneration });
  const requestServiceReport = () => {
    if (state.readings.some((item) => item.id === serviceReading.report.id) || state.settings.access === 'owned') { openReport(activeService.subjectId); return; }
    dispatch({ type: 'request-report' });
    setParams({ view: 'detail' });
  };

  const renderMessage = (message) => {
    const person = subjectFor(message.subjectId, state);
    if (message.type === 'report') return null;
    if (message.type === 'user') return <div className="cp-user-message">
      {!!message.references?.length && <div className="cp-message-references" aria-label="Referenced sources">{message.references.map(reference => <button type="button" className="cp-source-chip" key={referenceKey(reference)} title={`${reference.label}${reference.excerpt ? ` · ${reference.excerpt}` : ''} · Return to source`} aria-label={`Return to source: ${reference.label}`} onClick={() => returnReference(reference)}><span>{reference.excerpt ? `“${reference.excerpt}”` : reference.label}</span><span aria-hidden="true">↗</span></button>)}</div>}
      {message.horoscopeContext && <p className="cp-horoscope-message-context">{message.horoscopeContext.label} · {message.horoscopeContext.date}{message.horoscopeContext.transit ? ` · ${message.horoscopeContext.transit.title}` : ''}</p>}
      {message.quote && <><blockquote>{message.quote.chapterTitle}: “{message.quote.text}”</blockquote><button type="button" className="cp-text-button" onClick={() => returnToPassage(message.quote)}>Return to source ↗</button></>}
      <p>{message.text}</p><span>{person.label}</span>
    </div>;
    return <div className="cp-assistant-message">
      <div className="cp-message-byline"><span aria-hidden="true">✳</span> Astral Gravity <span>· {person.label}</span></div>
      {message.type === 'answer' && <><p className="cp-answer">{message.text}</p>
        {message.diagram && <div className="ink-card cp-inline-diagram"><AspectMiniChart theme="ink"
          from={{ name: 'Venus', sign: 'Aries', degree: 21 }} to={{ name: 'Mars', sign: 'Cancer', degree: 20 }}
          relation="square" kind="tension" orb={1} /><p className="cp-caption">Illustrative Venus–Mars aspect · sample positions, not a live chart</p></div>}
        {message.subjectId !== 'maya' && <p className="cp-caption">{person.detail}</p>}
        <div className="cp-actions"><button type="button" className="cp-text-button" onClick={() => activeService?.kind === 'horoscope'
          ? send('Explain the main theme of this forecast', person.id, { kind: 'answer', subjectId: person.id })
          : send(person.kind === 'relationship' ? 'Give me a short relationship overview' : 'Give me a short birth chart reading', person.id)}>{activeService?.kind === 'horoscope' ? 'Explore the forecast’s main theme ↗' : 'A short reading ↗'}</button></div></>}
      {message.type === 'reading' && <div className="ink-card cp-reading-block"><span className="ink-eyebrow">A short reading</span>
        <h3>{person.kind === 'relationship' ? 'Different rhythms, shared ground.' : 'Warmth, with room to be yourself.'}</h3>
        <p>{person.kind === 'relationship' ? `For ${person.label}, this sample overview explores how closeness and independence can coexist. What feels caring to one person might need translating for the other.`
          : 'This illustrative birth-chart reading explores the balance between connection and independence: wanting to meet others generously, while keeping room for your own interests and decisions.'}</p>
        <p className="cp-caption">Sample content · {person.detail}</p>
        <button type="button" className="cp-text-button" onClick={() => send('What might that look like in everyday life?', person.id)}>Explore this together ↗</button>
      </div>}
      {message.type === 'forecast' && <div className="ink-card cp-forecast-card">{message.scopeNote && <p className="cp-context-note">{message.scopeNote}</p>}<Forecast monthly={message.expanded} onAsk={(text) => send(text, 'maya', { kind: 'answer', subjectId: 'maya' })} />
        <div className="cp-actions"><button type="button" className="ink-btn ink-btn--ghost" onClick={() => saveForecast(message.expanded, true)}>Open forecast ↗</button>
          <button type="button" className="cp-text-button" onClick={() => saveForecast(message.expanded)}>{state.readings.some((item) => item.id === forecastId(message.expanded)) ? '✓ Saved' : 'Save to Your sky'}</button></div>
      </div>}
      {message.type === 'clarification' && <div className="ink-card cp-clarification"><h3>{message.reason === 'birth-report' ? 'Try the relationship report journey.' : 'Which relationship shall we explore?'}</h3>
        <p>{message.reason === 'birth-report' ? 'This first prototype includes a full relationship reader and a short birth-chart reading. Choose a sample couple to test the report experience.' : 'Choose a sample couple so the reading uses the right people.'}</p>
        <div className="cp-actions">{SUBJECTS.filter((item) => item.kind === 'relationship').map((item) => <button type="button" className="ink-btn ink-btn--ghost" key={item.id}
          onClick={() => send(message.reason === 'birth-report' ? `Open the full compatibility report for ${item.partner}` : message.original, item.id,
            { kind: message.reason === 'birth-report' ? 'report' : message.requestedKind, subjectId: item.id })}>{item.label}</button>)}</div>
      </div>}
    </div>;
  };

  return <ReferenceProvider serviceId={state.activeId} references={state.pendingReferences} messages={thread.messages} onSelect={selectReference} onOpenExchange={openExchange} returnRequest={returnRequest}><div ref={page} className="ink-page cp-page">
    <header className="cp-topbar"><Link className="cp-wordmark" to="/">Astral Gravity <span>✳</span></Link>
      <span className="cp-prototype-tag">Conversation prototype · sample data</span>
      <Link to="/prototype/conversation/live" className="cp-text-button">Use dev account data ↗</Link>
      <button type="button" className="cp-text-button" aria-current={!activeService && !library && !inReader ? 'page' : undefined} onClick={goHome}>Home</button>
      <button type="button" className="ink-btn ink-btn--ghost" aria-expanded={library} onClick={() => setLibrary(!library)}>Your sky <span aria-hidden="true">↗</span></button>
    </header>
    <nav className="cp-mobile-services" aria-label="Service navigation"><label htmlFor="cp-service-select">Your services</label><select id="cp-service-select" value={state.activeId || ''} onChange={event => event.target.value ? openService(event.target.value) : goHome()}><option value="">Home</option>{state.threads.map(service => <option key={service.id} value={service.id}>{service.title}</option>)}</select>{creationActions}</nav>
    {storageError && <p className="cp-storage-note" role="status">Browser storage is unavailable. This sample session will not survive a refresh.</p>}
    {library ? <main className="cp-library"><div className="cp-library-heading"><div><span className="ink-eyebrow">A place to return to</span><h1>Your sky</h1></div><button className="cp-text-button" type="button" onClick={() => setLibrary(false)}>Back to {inReader ? 'reading' : 'conversation'} →</button></div>
      {creationActions}
      <section><h2>Readings & forecasts</h2>{state.readings.length ? state.readings.map((item) => <button type="button" className="ink-card cp-library-row" key={item.id} onClick={() => openSaved(item)}>
        <span><span className="ink-eyebrow">{item.type === 'report' ? subjectFor(item.subjectId).kind === 'relationship' ? 'Relationship reading' : 'Birth chart reading' : 'Forecast'}</span><strong>{item.title}</strong><small>{subjectFor(item.subjectId).label}{state.positions[item.id]?.chapterId ? ' · In progress' : ''}</small></span><span>Open ↗</span>
      </button>) : <p>Saved forecasts and ready reports will appear here. Try requesting a relationship report.</p>}</section>
      <section><h2>Your services</h2><p>Each chart, relationship, or horoscope service has one ongoing discussion.</p>{state.threads.map((item) => <button type="button" className="cp-library-row" key={item.id} onClick={() => openService(item.id)}>
        <span>{item.title}<small>{item.description} · {item.messages.filter((message) => message.type === 'user').length} questions</small></span><span>{item.messages.length ? 'Resume discussion ↗' : 'Open service ↗'}</span></button>)}</section>
    </main> : inReader && reading && !embeddedReader ? <ReadingView reading={reading} position={state.positions[reading.id]}
      onPosition={(position) => dispatch({ type: 'position', readingId: reading.id, position })}
      onBack={() => { dispatch({ type: 'switch', id: reading.threadId }); setParams({}); }} onQuote={quote}
      onAsk={(text) => { dispatch({ type: 'quote', threadId: reading.threadId, quote: { subjectId: reading.subjectId, text, chapterTitle: reading.title, readingId: reading.id } }); setParams({}); setDraft(text); }} />
      : inReader && !reading ? <main className="cp-missing"><h1>This sample reading isn’t saved here.</h1><p>Open a saved reading from Your sky or return to the conversation.</p><button type="button" className="ink-btn ink-btn--ghost" onClick={() => setParams({})}>Back to conversation</button></main>
        : <main className={`cp-workspace${activeService ? ' cp-workspace--context' : ''}`}>
          <aside className="cp-rail" aria-label="Your services"><button type="button" className="cp-text-button" onClick={goHome}>← Explore from home</button>
            <span className="ink-eyebrow">Your services</span>{state.threads.map((item) => <button type="button" key={item.id} aria-current={item.id === state.activeId ? 'page' : undefined} onClick={() => openService(item.id)}>{item.title}<small>{item.messages.length ? 'Resume discussion' : item.kind === 'horoscope' ? 'Forecasts & discussion' : 'Reading & discussion'}</small></button>)}
            {creationActions}
            <p>One ongoing discussion for each service. Find saved readings in <button type="button" className="cp-text-button" onClick={() => setLibrary(true)}>Your sky ↗</button></p>
          </aside>
          <div ref={column} className="cp-conversation">
            <HoroscopeWorkspace singleScroll referenceRequest={returnRequest} exploreRequest={skyRequest} contextRail={activeService?.kind === 'horoscope' ? <ContextRail service={activeService} mount={contextMount} horoscope={state.horoscope} referenceRequest={returnRequest} onHoroscopeChange={value => dispatch({ type: 'horoscope', value })} onExplore={() => setSkyRequest(value => value + 1)} /> : null} enabled={activeService?.kind === 'horoscope'} value={state.horoscope}
              onChange={(value) => dispatch({ type: 'horoscope', value })} onAddContext={(transit) => dispatch({ type: 'transit-context', transit })}>
            <ServiceReadingWorkspace contextRail={serviceReading ? <ContextRail service={activeService} mount={contextMount} horoscope={state.horoscope} referenceRequest={returnRequest} onHoroscopeChange={value => dispatch({ type: 'horoscope', value })} /> : null} enabled={Boolean(serviceReading)} data={serviceReading} onReadDetail={requestServiceReport} onQuote={quote}
              onOverview={() => setParams({})}
              readingView={embeddedReader ? <ReadingView embedded reading={reading} position={state.positions[reading.id]}
                focusPassage={params.get('focus')} focusVisit={params.get('visit')} onPosition={(position) => dispatch({ type: 'position', readingId: reading.id, position })} onQuote={quote} /> : showingAccess ? <ReportAccess message={reportRequest} access={state.settings.access} onGenerate={startGeneration} onOpen={openReport} onOverview={() => setParams({})} /> : null}
              focusPassage={params.get('subject') === state.subjectId ? params.get('focus') : null} focusVisit={params.get('visit')} highlightedPassage={state.pendingQuote?.passageId}
              >
            {activeService?.custom ? <LocalServiceOverview key={activeService.id} service={activeService} state={state} mount={contextMount} /> : activeService && <div className="cp-service-heading"><span className="ink-eyebrow">{activeService.kind === 'birthchart' ? 'Birth chart' : activeService.kind === 'relationship' ? 'Relationship' : 'Horoscopes'}</span><h1>{activeService.title}</h1><p>{thread.messages.length ? 'Your ongoing discussion, restored from this browser.' : 'Your reading and discussion live together here. Ask a question to begin.'}</p></div>}
            {thread.messages.length === 0 && !activeService && <div className="cp-welcome"><div><span className="ink-eyebrow">{state.discovery ? 'Four ways to begin' : 'Your chart. Your questions.'}</span>
              <h1>{state.discovery ? <>What would you like<br />to <em>explore?</em></> : <>A little space<br />to <em>understand.</em></>}</h1>
              <p>{state.discovery ? 'Start with a reading, a forecast, or something on your mind. This prototype uses sample people.' : 'Start here, or return to a service. Your questions stay with the chart, relationship, or forecast you’re exploring.'}</p>
            </div><SampleWheel /></div>}
            {!activeService && thread.messages.length === 0 && <div className="cp-starters">{MODES.map((mode, index) => <button type="button" key={mode.id} onClick={() => {
              if (mode.id === 'birthchart') openService('birthchart:maya');
              else if (mode.id === 'horoscope') openService('horoscope:maya');
              else if (mode.id === 'relationship') setLibrary(true);
              else composer.current?.focus();
            }}>
              <span className="cp-starter-mark">{mode.mark}</span><span><small>{['i.', 'ii.', 'iii.', 'iv.'][index]}</small><strong>{mode.label}</strong><span>{mode.id === 'question' ? 'We’ll take your question to the right service' : 'Return to your reading & discussion'}</span></span><span aria-hidden="true">↗</span>
            </button>)}</div>}
            <div ref={transcript} className="cp-transcript" role="log" aria-label="Conversation" aria-live="polite">{thread.messages.filter(message => message.type !== 'report').map((message) => <article key={message.id} tabIndex={-1} data-message={message.id}>{renderMessage(message)}</article>)}</div>
            <form className={`cp-composer cp-composer--dock${composerExpanded ? '' : ' cp-composer--compact'}`} onSubmit={(event) => { event.preventDefault(); send(draft); }}>
              {state.referenceError && <p role="status" className="cp-reference-error">{state.referenceError}</p>}
              {state.pendingReferences.length > 0 && <div className="cp-reference-chips" role="group" aria-label="Question references">{state.pendingReferences.map(reference => <div className="cp-reference-chip" key={referenceKey(reference)} title={reference.label}><span><small>{reference.kind} · {reference.label}</small><span className="cp-reference-excerpt">{reference.excerpt || reference.label}</span></span><button type="button" aria-label={`Remove reference ${reference.label}`} onClick={() => dispatch({ type: 'remove-reference', key: referenceKey(reference) })}>×</button></div>)}</div>}
              {state.pendingTransit && <div className="cp-transit-context"><span className="ink-eyebrow">Discussing this transit</span><p>{state.pendingTransit.transit.title}<br />{state.pendingTransit.label} · {state.pendingTransit.date} · {state.pendingTransit.timezone}</p>
                <button type="button" className="cp-text-button" onClick={() => dispatch({ type: 'clear-transit' })}>Remove transit context</button></div>}
              {state.pendingQuote && <div className="cp-quote"><div><span className="ink-eyebrow">About {state.pendingQuote.chapterTitle}</span><p>“{state.pendingQuote.text}”</p>
                <button type="button" className="cp-text-button" onClick={() => returnToPassage(state.pendingQuote)}>Return to passage ↗</button></div>
                <button type="button" className="cp-text-button" aria-label="Remove passage context" onClick={() => dispatch({ type: 'context' })}>×</button></div>}
              <div className="cp-composer-context"><strong className="cp-composer-service">{activeService ? activeService.title : 'Home · find the right service'}</strong>
                <span>{subject.id === 'maya-theo' ? 'Birth time unknown for Theo' : activeService ? 'One ongoing discussion' : 'Questions open the relevant discussion'}</span>{composerExpanded && <button type="button" className="cp-text-button" onClick={() => { composer.current?.blur(); setComposerExpanded(false); }}>Minimize input</button>}</div>
              <div className="cp-input-row"><textarea id="cp-prompt" ref={composer} aria-label="Your question" rows={composerExpanded ? 2 : 1} onFocus={() => setComposerExpanded(true)} value={draft} onChange={(event) => setDraft(event.target.value)}
                placeholder={state.pendingQuote ? 'What would you like to understand about this passage?' : 'Ask a question, request a reading, or explore your week…'}
                onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); send(draft); } }} />
                <button className="cp-send" type="submit" disabled={!draft.trim()} aria-label="Send question">↑</button></div>
              <div className="cp-composer-footer"><span>✳ Different questions, different ways to read.</span><span>Enter to send · Shift + Enter for a new line</span></div>
            </form>
            <div className="cp-suggestions">{!activeService || activeService.kind === 'horoscope' ? <>
              <button type="button" onClick={() => send('What does my week look like?')}>My week</button><button type="button" onClick={() => send('Show my November forecast')}>November forecast</button>
              {!activeService && <button type="button" onClick={() => send('I want a full compatibility report')}>A relationship reading</button>}
            </> : activeService.kind === 'relationship' ? <>
              <button type="button" onClick={() => send('What are our relationship strengths?')}>Our strengths</button><button type="button" onClick={() => send('How can we communicate better?')}>How we communicate</button>
            </> : <><button type="button" onClick={() => send('Give me a short birth chart reading')}>A short reading</button><button type="button" onClick={() => send('What does my Venus sign mean?')}>My Venus sign</button></>}</div>
            </ServiceReadingWorkspace></HoroscopeWorkspace>
          </div>
          {activeService && <div ref={setContextMount} className="cp-context-mount" />}
        </main>}
    <details className="cp-test-controls"><summary>Prototype scenarios</summary><div><p>Sample content only. No API requests or real purchases. Saved in this browser.</p>
      <p>Reset also removes locally added people, relationships, and their discussions from this prototype.</p>
      <label>Report access <select aria-label="Report access scenario" value={state.settings.access} onChange={(event) => dispatch({ type: 'settings', value: { access: event.target.value } })}>
        <option value="included">Included report</option><option value="locked">Locked · simulated purchase</option><option value="owned">Already owned</option></select></label>
      <label><input type="checkbox" checked={state.settings.failGeneration} onChange={(event) => dispatch({ type: 'settings', value: { failGeneration: event.target.checked } })} /> Simulate next generation failure</label>
      <button type="button" className="cp-text-button" onClick={() => { goHome(); dispatch({ type: 'discovery', value: true }); }}>Try first-visit discovery</button>
      <button type="button" className="cp-text-button" onClick={() => { dispatch({ type: 'reset' }); setParams({}); setLibrary(false); setDraft(''); }}>Reset sample conversations & readings</button>
    </div></details>
    {creationMode && <CreateServiceDialog mode={creationMode} state={state} onClose={() => setCreationMode(null)} onCreate={completeCreation} />}
  </div></ReferenceProvider>;
}
