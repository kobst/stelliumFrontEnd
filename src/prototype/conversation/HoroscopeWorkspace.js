import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import CalendarStrip from '../../UI/horoscope/CalendarStrip';
import TransitTracker from '../../UI/horoscope/TransitTracker';
import HoroscopeReading from '../../UI/horoscope/HoroscopeReading';
import Ephemeris from '../../UI/shared/Ephemeris';
import { transitStatusAt, overlapsInterval } from '../../UI/horoscope/horoscopeSlots';
import { PERIODS, chartAspects, dateKey, dayAt, movePeriod, passageTransitKeys, readingInterval, sampleHoroscopeData, scopeInterval, skyAt } from './horoscopeData';
import './HoroscopeWorkspace.css';

export default function HoroscopeWorkspace({ enabled, ...props }) {
  return enabled ? <Workspace {...props} /> : props.children;
}

function Workspace({ value, onChange, onAddContext, children, data: supplied, onReload }) {
  const root = useRef(null);
  const discussion = useRef(null);
  const explorerTrigger = useRef(null);
  const [explorerOpen, setExplorerOpen] = useState(false);
  const [hasSkySpace, setHasSkySpace] = useState(false);
  const [conversationExpanded, setConversationExpanded] = useState(false);
  const [composerVisible, setComposerVisible] = useState(false);
  const [discussionHeight, setDiscussionHeight] = useState(0);
  const [playing, setPlaying] = useState(false);
  const closeExplorer = () => { setPlaying(false); setExplorerOpen(false); explorerTrigger.current?.focus(); };
  const expandConversation = () => {
    setDiscussionHeight(discussion.current?.getBoundingClientRect().height || 0);
    setConversationExpanded(true);
  };
  useEffect(() => {
    if (conversationExpanded) discussion.current?.querySelector('textarea')?.focus({ preventScroll: true });
  }, [conversationExpanded]);
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return undefined;
    const composer = discussion.current?.querySelector('.cp-composer, .ask-panel__input-container');
    if (!composer) return undefined;
    const observer = new IntersectionObserver(([entry]) => setComposerVisible(entry.isIntersecting), { threshold: 0.1 });
    observer.observe(composer);
    return () => observer.disconnect();
  }, [conversationExpanded]);
  useEffect(() => {
    const update = () => {
      const rect = root.current?.getBoundingClientRect();
      if (!rect) return;
      root.current.style.setProperty('--cp-column-left', `${rect.left}px`);
      root.current.style.setProperty('--cp-column-width', `${rect.width}px`);
      setHasSkySpace(window.innerWidth - rect.right >= 460);
    };
    update();
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(update);
    if (root.current) observer?.observe(root.current);
    window.addEventListener('resize', update);
    return () => { observer?.disconnect(); window.removeEventListener('resize', update); };
  }, []);
  const data = useMemo(() => supplied || sampleHoroscopeData(value), [supplied, value]);
  const interval = scopeInterval(value);
  const coverage = readingInterval(data.horoscope, value.scope);
  const referencedKeys = useMemo(() => new Set(data.referencedKeys), [data.referencedKeys]);
  const scoped = data.transits.filter((item) => overlapsInterval(item, interval));
  const bodies = [...new Set(scoped.map((item) => item.transitingPlanet))];
  const selected = data.transits.find((item) => item.key === value.selectedTransitKey);
  const activeBodies = useMemo(() => new Set(value.bodies.map((body) => body.toLowerCase())), [value.bodies]);
  const visible = scoped.filter((item) => value.bodiesMode === 'reading' ? referencedKeys.has(item.key) : value.bodiesMode !== 'custom' || value.bodies.includes(item.transitingPlanet));
  const sky = skyAt(data, value.playhead);
  const emphasized = selected ? new Set([selected.targetPlanet]) : null;
  const aspects = chartAspects(selected ? [selected] : visible, data.planets, sky, value.playhead);
  const experience = { scope: value.scope, playhead: value.playhead, chatContext: { transits: selected ? [selected] : [] } };
  const scrub = (ms) => { setPlaying(false); onChange({ playhead: Math.min(interval.end - 1, Math.max(interval.start, ms)) }); };
  const selectTransit = (transit) => { setPlaying(false); onChange({ selectedTransitKey: transit.key,
    playhead: Math.min(interval.end - 1, Math.max(interval.start, transit.exactMs)) }); };
  useEffect(() => {
    if (!playing) return undefined;
    const timer = window.setInterval(() => onChange({ playhead: value.playhead + (interval.end - interval.start) / 180 >= interval.end ? interval.start : value.playhead + (interval.end - interval.start) / 180 }), 100);
    return () => window.clearInterval(timer);
  }, [playing, value.playhead, interval.start, interval.end, onChange]);
  const changeScope = (scope) => { setPlaying(false); onChange({ scope, anchor: dateKey(value.playhead), selectedTransitKey: null }); };
  const referencedTransits = scoped.filter((item) => referencedKeys.has(item.key)).map((transit) => ({ transit, status: transitStatusAt(transit, [], value.playhead) }));
  const quiet = scoped.filter((item) => !referencedKeys.has(item.key) && item.startMs <= value.playhead && item.endMs >= value.playhead);
  const period = PERIODS.find((item) => item.id === value.scope);
  const heading = `${new Date(value.playhead).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}`;
  const paragraphs = String(data.horoscope?.interpretation || data.horoscope?.text || '').split(/\n\s*\n/).filter(Boolean);
  const passageKeys = passageTransitKeys(paragraphs, scoped.filter((transit) => referencedKeys.has(transit.key)));
  const exploreTransit = (transit) => { selectTransit(transit); setExplorerOpen(true); };
  const readingPanel = <section className="cp-horo-forecast" aria-label="Forecast workspace"><HoroscopeReading experience={experience} scopeLabel={period.label} horoscope={data.horoscope} readingInterval={coverage}
    paragraphs={paragraphs} passageTransitKeys={passageKeys} onPassageSelect={exploreTransit}
    referencedTransits={referencedTransits} quietTransits={quiet} loading={data.loading} error={data.error} dailyLocked={false} selectionOnly
    onRetry={onReload || (() => onChange({ anchor: '2026-10-23', playhead: dayAt('2026-10-23') }))}
    onReturnToReading={() => { if (coverage) onChange({ anchor: dateKey(coverage.start + 43200000), playhead: coverage.start + 43200000 }); }}
    onAddContext={exploreTransit} onTransitFocus={() => {}} />
    {!data.sample && !data.horoscope && !data.loading && <p className="cp-caption">No saved reading for this period. Generate one in the <Link to={data.dashboardPath}>current horoscope dashboard</Link>, then refresh here.</p>}
  </section>;
  return <div ref={root} className={`cp-horo${hasSkySpace ? ' has-sky-space' : ''}${explorerOpen ? ' is-exploring' : ''}${conversationExpanded ? ' is-conversation-expanded' : ''}`}>
    <header className="cp-horo-heading"><div><span className="ink-eyebrow">{data.sample ? 'Sample horoscope workspace' : 'Your saved horoscope workspace'}</span><h1>{data.name === 'Your' ? 'Your horoscopes' : `${data.name}’s horoscopes`}</h1>
      <p>{data.sample ? 'Illustrative forecasts, positions, and transit dates.' : 'Your natal chart, saved forecasts, and existing horoscope discussion.'}</p></div>
      {data.sample ? <Link to="/prototype/horoscope" className="cp-text-button">Open my live horoscope workspace ↗</Link> : <button type="button" className="cp-text-button" onClick={onReload}>Refresh saved data ↻</button>}
    </header>
    <div className="cp-horo-toolbar"><div className="cp-horo-periods" role="group" aria-label="Horoscope period">{PERIODS.map((item) => <button key={item.id} type="button" aria-pressed={value.scope === item.id} onClick={() => changeScope(item.id)}>{item.label}</button>)}</div>
      <button ref={explorerTrigger} type="button" className="cp-text-button" aria-controls="cp-transit-explorer" aria-expanded={explorerOpen} onClick={() => explorerOpen ? closeExplorer() : setExplorerOpen(true)}>{explorerOpen ? 'Return to reading mode' : 'Explore transits ↗'}</button>
    </div>
    <div className="cp-horo-moment"><span>Forecast: {period.label.toLowerCase()}{coverage ? ` · ${new Date(coverage.start).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })}–${new Date(coverage.end - 1).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })}` : ''}</span><span>Sky at {new Date(value.playhead).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZoneName: 'short' })}</span></div>
    {explorerOpen && <section id="cp-transit-explorer" className="cp-horo-explorer" aria-labelledby="cp-transit-explorer-title">
      <header className="cp-horo-explorer-heading"><div><span className="ink-eyebrow">The sky · linked to your reading</span><h2 id="cp-transit-explorer-title">Explore transits</h2></div><button type="button" className="cp-text-button" onClick={closeExplorer}>Close explorer ✕</button></header>
      <p className="cp-caption">The forecast stays available. Select a transit to highlight its reference in the reading; add it to your discussion when you’re ready.</p>
      {selected && passageKeys.some((keys) => keys.includes(selected.key)) && <blockquote className="cp-horo-linked-passage"><span className="ink-eyebrow">From your reading</span><p>{paragraphs[passageKeys.findIndex((keys) => keys.includes(selected.key))]}</p></blockquote>}
      <div className="cp-horo-date-controls"><button type="button" aria-label="Previous period" onClick={() => { setPlaying(false); onChange(movePeriod(value, -1)); }}>←</button>
        <label>Explore date <input type="date" value={value.anchor} onChange={(event) => { if (Number.isFinite(dayAt(event.target.value))) { setPlaying(false); onChange({ anchor: event.target.value, playhead: dayAt(event.target.value), selectedTransitKey: null }); } }} /></label>
        <button type="button" aria-label="Next period" onClick={() => { setPlaying(false); onChange(movePeriod(value, 1)); }}>→</button></div>
    <CalendarStrip experience={experience} interval={interval} readingInterval={coverage} transitWindows={scoped} playing={playing} canPlay={sky.length > 0}
      onTogglePlaying={() => setPlaying(!playing)} onScrub={scrub} nowLabel={data.sample ? 'Sample day' : 'Now'} onNow={() => {
        const anchor = data.sample ? '2026-10-23' : dateKey(Date.now()); setPlaying(false); onChange({ anchor, playhead: dayAt(anchor), selectedTransitKey: null });
      }} />
      <section className="cp-horo-sky" aria-label="Sky and transits workspace"><div className="ink-card cp-horo-sky-card">
        <div className="cp-meta"><span className="ink-eyebrow">Natal chart & transit sky</span><span>{heading}</span></div>
        <div className="cp-horo-filters" role="group" aria-label="Transit visibility">{['reading', 'all'].map((mode) => <button key={mode} type="button" aria-pressed={value.bodiesMode === mode} onClick={() => onChange({ bodiesMode: mode, selectedTransitKey: null })}>{mode === 'reading' ? 'In this reading' : 'All transits'}</button>)}
          {bodies.map((body) => <button key={body} type="button" aria-pressed={value.bodiesMode === 'custom' && value.bodies.includes(body)} onClick={() => onChange({ bodiesMode: 'custom', selectedTransitKey: null,
            bodies: value.bodiesMode !== 'custom' ? [body] : value.bodies.includes(body) ? value.bodies.filter((item) => item !== body) : [...value.bodies, body] })}>{body}</button>)}
        </div>
        <div className="cp-horo-wheel" aria-label={`${data.name} natal chart and ${heading} transit positions`}>{data.planets.length > 0 ? <Ephemeris planets={data.planets} houses={data.houses} aspects={aspects} transits={sky} emphasisPlanets={emphasized} theme="ink" instanceId={`prototype-horoscope-${data.sample ? 'sample' : 'live'}`} /> : <p>Natal chart positions are unavailable.</p>}</div>
        <p className="cp-caption">Natal positions inside · transiting positions outside · indigo flowing / madder charged<br />{data.sample ? 'Synthetic motion for testing — not a calculated sky.' : data.frameError || 'Transit positions use the nearest available sky frame.'}</p>
        {selected && <div className="cp-horo-selected" role="status"><span className="ink-eyebrow">Selected transit</span><h3>{selected.title}</h3><p>{new Date(selected.exactMs).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} · {referencedKeys.has(selected.key) ? 'Referenced in this reading' : 'Additional transit'}</p>
          {!(selected.exactMs >= interval.start && selected.exactMs < interval.end) && <p>Exact outside this forecast period. The sky is showing the nearest moment within the forecast.</p>}
          <button type="button" className="ink-btn ink-btn--navy" onClick={() => { onAddContext(selected); expandConversation(); }}>Ask about this transit ↗</button>
          {passageKeys.some((keys) => keys.includes(selected.key)) && <button type="button" className="cp-text-button" onClick={() => root.current?.querySelector('.is-transit-passage')?.scrollIntoView?.({ block: 'center', behavior: 'smooth' })}>Show related passage ↗</button>}
          <button type="button" className="cp-text-button" onClick={() => onChange({ selectedTransitKey: null })}>Clear selection</button></div>}
      </div>
      <div className="cp-horo-tracker"><TransitTracker experience={experience} interval={interval} transitWindows={data.transits} referencedKeys={referencedKeys}
        activeBodies={activeBodies} bodiesMode={value.bodiesMode} loading={data.loading} error={data.transitError} onAddContext={selectTransit} onScrub={scrub} selectionOnly /></div>
      <p className="cp-caption">✳ marks transits cited by the forecast. Selecting or filtering the sky never sends a message.</p></section>
    </section>}
    {readingPanel}
    <section ref={discussion} className="cp-horo-discussion" aria-label="Horoscope discussion" style={conversationExpanded ? { minHeight: discussionHeight } : undefined}>
      <div className="cp-horo-conversation-panel">
        <header className="cp-horo-conversation-heading"><span className="ink-eyebrow">Your ongoing horoscope discussion</span><button type="button" className="cp-text-button" aria-expanded={conversationExpanded} onClick={() => conversationExpanded ? setConversationExpanded(false) : expandConversation()}>{conversationExpanded ? 'Return discussion below reading' : 'Give conversation more space ↗'}</button></header>
        <div className="cp-horo-conversation-content">{children}</div>
      </div>
    </section>
    {!conversationExpanded && !composerVisible && <button type="button" className="ink-btn ink-btn--navy cp-horo-ask" onClick={expandConversation}>Ask about this reading ↗</button>}
  </div>;
}
