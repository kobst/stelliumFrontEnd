import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { fetchUser, getLatestHoroscope, getTransitWindows, getTransitFrames } from '../../Utilities/api';
import GravityChatPanel from '../../UI/gravityChat/GravityChatPanel';
import { makeTransitContextElement, normalizeAspect, normalizeTransitWindow } from '../../UI/horoscope/horoscopeSlots';
import { PERIODS, dateKey, initialHoroscope, passageTransitKeys, readingInterval, scopeInterval } from './horoscopeData';
import HoroscopeWorkspace from './HoroscopeWorkspace';
import '../../styles/ink.css';
import './ConversationPrototype.css';

export async function loadSavedHoroscope(userId, value) {
  const interval = scopeInterval(value);
  const period = PERIODS.find((item) => item.id === value.scope).type;
  const from = new Date(interval.start).toISOString();
  const to = new Date(interval.end).toISOString();
  const [chartResult, readingResult, transitResult, framesResult] = await Promise.allSettled([
    fetchUser(userId), getLatestHoroscope(userId, period), getTransitWindows(userId, from, to), getTransitFrames(from, to),
  ]);
  const user = chartResult.status === 'fulfilled' ? chartResult.value : null;
  const response = readingResult.status === 'fulfilled' ? readingResult.value : null;
  const horoscope = response?.horoscope || (response?.interpretation || response?.text ? response : null);
  const rawTransits = transitResult.status === 'fulfilled' ? transitResult.value : null;
  const transits = (Array.isArray(rawTransits) ? rawTransits : [
    ...(rawTransits?.transitEvents || []), ...(rawTransits?.transitToTransitEvents || []),
  ]).map(normalizeTransitWindow).filter(Boolean);
  const text = String(horoscope?.interpretation || horoscope?.text || '').toLowerCase();
  const proseKeys = new Set(passageTransitKeys([text], transits).flat());
  const references = [...(Array.isArray(horoscope?.keyTransits) ? horoscope.keyTransits : []), ...(Array.isArray(horoscope?.analysis?.keyTransits) ? horoscope.analysis.keyTransits : []), ...(Array.isArray(horoscope?.analysis?.keyThemes) ? horoscope.analysis.keyThemes : [])];
  const referencedKeys = transits.filter((transit) => references.some((ref) =>
    ref && typeof ref === 'object'
      && String(ref.transitingPlanet || ref.transitingBody || ref.transit?.transitingPlanet || '').toLowerCase() === String(transit.transitingPlanet).toLowerCase()
      && String(ref.targetPlanet || ref.target || ref.natalPlanet || '').toLowerCase() === String(transit.targetPlanet).toLowerCase()
      && normalizeAspect(ref.aspect || ref.transit?.aspect) === transit.aspectName)
    || proseKeys.has(transit.key))
    .map((item) => item.key);
  return { name: user?.firstName || 'Your', sample: false, planets: user?.birthChart?.planets || [], houses: user?.birthChart?.houses || [],
    horoscope, transits, referencedKeys, frames: framesResult.status === 'fulfilled' && Array.isArray(framesResult.value) ? framesResult.value : [],
    loading: false, error: readingResult.status === 'rejected' && !/404/.test(readingResult.reason?.message || '') ? 'The saved reading could not be loaded. Retry or open the current dashboard.' : '',
    transitError: transitResult.status === 'rejected' ? 'Transit windows could not be loaded. Please refresh.' : '',
    frameError: framesResult.status === 'rejected' || !framesResult.value?.length ? 'Transit positions unavailable — showing the natal chart only.' : '',
    dashboardPath: `/dashboard/${userId}` };
}

export default function LiveHoroscopeWorkspace({ embedded = false }) {
  const { stelliumUser } = useAuth();
  // Key the child by account: cached selections and chat context never cross users.
  return <AccountWorkspace key={stelliumUser._id} user={stelliumUser} embedded={embedded} />;
}

function AccountWorkspace({ user, embedded }) {
  const storageKey = `ag_horoscope_workspace_${user._id}`;
  const [value, setValue] = useState(() => {
    try { return { ...initialHoroscope(dateKey(Date.now())), ...JSON.parse(localStorage.getItem(storageKey) || '{}') }; }
    catch { return initialHoroscope(dateKey(Date.now())); }
  });
  const [data, setData] = useState({ name: user.firstName || 'Your', sample: false, planets: [], houses: [], transits: [], frames: [], referencedKeys: [], horoscope: null, loading: true });
  const [reload, setReload] = useState(0);
  const [context, setContext] = useState([]);
  const change = useCallback((patch) => setValue((previous) => ({ ...previous, ...patch })), []);
  useEffect(() => { try { localStorage.setItem(storageKey, JSON.stringify(value)); } catch { /* Navigation still works without storage. */ } }, [storageKey, value]);
  useEffect(() => {
    let cancelled = false;
    setContext([]);
    setData((previous) => ({ ...previous, loading: true, horoscope: null, transits: [], frames: [], referencedKeys: [], error: '' }));
    loadSavedHoroscope(user._id, { scope: value.scope, anchor: value.anchor }).then((result) => {
      if (!cancelled) setData({ ...result, name: user.firstName || result.name });
    }).catch(() => { if (!cancelled) setData((previous) => ({ ...previous, loading: false, error: 'Saved horoscope data is unavailable.' })); });
    return () => { cancelled = true; };
  }, [user._id, user.firstName, value.scope, value.anchor, reload]);
  const elements = useMemo(() => context.map(makeTransitContextElement), [context]);
  const handleSelection = useCallback((selected) => setContext((previous) => {
    const next = data.transits.filter((transit) => selected.some((item) => item.key === transit.key));
    return previous.length === next.length && previous.every((item, index) => item.key === next[index].key) ? previous : next;
  }), [data.transits]);
  const coverage = readingInterval(data.horoscope, value.scope);
  return <div className="ink-page cp-page cp-live-page">{!embedded && <header className="cp-topbar">
    <Link className="cp-wordmark" to="/">Astral Gravity <span>✳</span></Link><span className="cp-prototype-tag">Workspace prototype · signed-in account data</span>
    <Link to="/prototype/conversation" className="cp-text-button">Back to sample prototype</Link>
  </header>}<section className="cp-live-workspace"><HoroscopeWorkspace enabled value={value} data={data} onChange={change} onReload={() => setReload((previous) => previous + 1)}
    onAddContext={(transit) => { setContext([transit]); change({ panel: 'discussion', discussionOpen: true }); }}>
    <div className="cp-live-discussion"><span className="ink-eyebrow">Your existing horoscope discussion</span>
      <p className="cp-caption">Browsing uses saved data. Sending a question uses the existing Gravity Chat service and your normal allowance.</p>
      <GravityChatPanel variant="dock" isOpen onClose={() => change({ panel: 'forecast' })} contentType="horoscope" contentId={user._id}
        birthChart={{ planets: data.planets, houses: data.houses }} transitWindows={data.transits} horoscopePeriod={value.scope}
        includeHoroscopeReading={Boolean(coverage && value.playhead >= coverage.start && value.playhead < coverage.end)}
        getActiveDate={() => new Date(value.playhead)} externalElements={elements} syncExternalElements preserveSelectionOnSend containMessageScroll
        onSelectionChange={handleSelection}
        contextLabel={`About ${user.firstName || 'your'} horoscope`} placeholderText="Ask about this reading or selected transit…" />
    </div>
  </HoroscopeWorkspace></section></div>;
}
