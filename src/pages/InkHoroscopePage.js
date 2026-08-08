import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import {
  fetchUser,
  generateDailyHoroscope,
  generateMonthlyHoroscope,
  generateWeeklyHoroscope,
  getTransitWindows,
} from '../Utilities/api';
import useStore from '../Utilities/store';
import { useAuth } from '../context/AuthContext';
import { useEntitlements } from '../hooks/useEntitlements';
import useTransitFrames from '../hooks/useTransitFrames';
import AskStelliumPanel from '../UI/askStellium/AskStelliumPanel';
import CalendarStrip from '../UI/horoscope/CalendarStrip';
import HoroscopeReading from '../UI/horoscope/HoroscopeReading';
import TransitTracker from '../UI/horoscope/TransitTracker';
import UpNextStrip from '../UI/horoscope/UpNextStrip';
import {
  DAY_MS,
  isTransitActive,
  makeTransitContextElement,
  normalizeAspect,
  normalizeTransitWindow,
  overlapsInterval,
  startOfLocalDay,
  toTimestamp,
  transitStatusAt,
} from '../UI/horoscope/horoscopeSlots';
import InkNav from '../UI/ink/InkNav';
import { ChartScene } from '../UI/shared/chartScene';
import { BODIES } from '../UI/shared/chartScene/constants';
import {
  fromSceneBodyName,
  toChartSceneAspects,
  toChartScenePlacements,
  toSceneBodyNames,
} from '../Utilities/chartSceneAdapter';
import { formatLocalDateParam } from '../Utilities/horoscopeDates';
import '../styles/ink.css';
import './InkHoroscopePage.css';

const SCOPE_OPTIONS = [
  {
    id: 'today',
    label: 'Today',
    contextLabel: "Today's reading",
    period: 'daily',
    readingDays: 1,
    windowDays: 1,
    playSeconds: 12,
    fetcher: generateDailyHoroscope,
    supportsDate: true,
  },
  {
    id: 'week',
    label: 'This week',
    contextLabel: "This week's reading",
    period: 'weekly',
    readingDays: 7,
    windowDays: 7,
    playSeconds: 28,
    fetcher: generateWeeklyHoroscope,
    supportsDate: false,
  },
  {
    id: 'month',
    label: 'This month',
    contextLabel: "This month's reading",
    period: 'monthly',
    readingDays: 30,
    windowDays: 30,
    playSeconds: 55,
    fetcher: generateMonthlyHoroscope,
    supportsDate: false,
  },
];

const SCOPE_BY_ID = Object.fromEntries(SCOPE_OPTIONS.map((option) => [option.id, option]));

const TRANSIT_BODIES = [
  { id: 'sun', label: 'Sun', color: '#b98f2f' },
  { id: 'moon', label: 'Moon', color: '#8f8aa8' },
  { id: 'mercury', label: 'Mercury', color: '#3f9a8e' },
  { id: 'venus', label: 'Venus', color: '#c06a80' },
  { id: 'mars', label: 'Mars', color: '#c0564a' },
  { id: 'jupiter', label: 'Jupiter', color: '#b8813a' },
  { id: 'saturn', label: 'Saturn', color: '#93805e' },
  { id: 'uranus', label: 'Uranus', color: '#4b93a8' },
  { id: 'neptune', label: 'Neptune', color: '#7a6cc0' },
  { id: 'pluto', label: 'Pluto', color: '#96588e' },
];

const EXPERIENCE_INITIAL_STATE = {
  scope: 'today',
  playhead: Date.now(),
  selectedTransits: { mode: 'reading', bodies: [] },
  chatContext: { includeReading: true, includeSky: true, transits: [] },
};

const capitalize = (value = '') => value.charAt(0).toUpperCase() + value.slice(1);

function splitParagraphs(horoscope) {
  return String(horoscope?.interpretation || horoscope?.text || '')
    .split(/\n\s*\n|\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

function transitMatchesReference(transit, reference) {
  if (!reference || typeof reference !== 'object') return false;
  const transiting = String(
    reference.transitingPlanet || reference.transitingBody || reference.transit?.transitingPlanet || ''
  ).toLowerCase();
  const target = String(
    reference.targetPlanet || reference.target || reference.natalPlanet || ''
  ).toLowerCase();
  const aspect = normalizeAspect(reference.aspect || reference.transit?.aspect);
  if (!transiting || !target || !aspect) return false;
  return String(transit.transitingPlanet || transit.transitingBody || '').toLowerCase() === transiting &&
    String(transit.targetPlanet || transit.target || transit.natalPlanet || '').toLowerCase() === target &&
    normalizeAspect(transit.aspect) === aspect;
}

function readingMentionsTransit(readingText, transit) {
  const text = readingText.toLowerCase();
  const transiting = String(transit.transitingPlanet || transit.transitingBody || '').toLowerCase();
  const target = String(transit.targetPlanet || transit.target || transit.natalPlanet || '').toLowerCase();
  const aspect = normalizeAspect(transit.aspect);
  return Boolean(transiting && target && aspect) &&
    text.includes(transiting) && text.includes(target) && text.includes(aspect);
}

function getReadingInterval(horoscope, scopeOption, playWindow) {
  const fallbackStart = startOfLocalDay(playWindow?.start ?? Date.now()) ?? Date.now();
  const suppliedStart = toTimestamp(horoscope?.startDate);
  const start = suppliedStart ?? fallbackStart;
  const suppliedEnd = toTimestamp(horoscope?.endDate);
  const dateOnlyEnd = typeof horoscope?.endDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(horoscope.endDate);
  let end = suppliedEnd === null ? start + scopeOption.readingDays * DAY_MS : suppliedEnd;
  if (dateOnlyEnd) end += DAY_MS;
  if (end <= start) end = start + scopeOption.readingDays * DAY_MS;
  return { start, end };
}

function getScopeWindowDays(scopeOption, horoscope) {
  if (scopeOption.period !== 'monthly') return scopeOption.windowDays;
  const anchor = new Date(toTimestamp(horoscope?.startDate) ?? Date.now());
  return new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0).getDate();
}

function getFrameStartDate(scopeOption, horoscope) {
  if (scopeOption.period !== 'daily') return horoscope?.startDate;
  const anchor = new Date(toTimestamp(horoscope?.startDate) ?? Date.now());
  anchor.setHours(0, 0, 0, 0);
  const daysSinceMonday = (anchor.getDay() + 6) % 7;
  anchor.setDate(anchor.getDate() - daysSinceMonday);
  return anchor.toISOString();
}

function getFrameAspects(frames, playhead, selection) {
  if (!selection || !frames?.length) return [];
  let closest = frames[0];
  let closestDistance = Infinity;
  frames.forEach((frame) => {
    const distance = Math.abs(Date.parse(frame.date) - playhead);
    if (distance < closestDistance) {
      closest = frame;
      closestDistance = distance;
    }
  });
  return (closest?.aspects || []).filter((aspect) => (
    selection.layer === 'transit'
      ? aspect.bodyA === selection.body
      : aspect.bodyB === selection.body
  ));
}

function sameElementKeys(left, right) {
  return left.length === right.length && left.every((element, index) => (
    element.key === right[index]?.key
  ));
}

function stateMessage(message, { error = false, user } = {}) {
  return (
    <div className="ink-page ink-horoscope">
      <InkNav variant="app" activeSegment="home" user={user} />
      <main className={`ihp-page-state${error ? ' ihp-page-state--error' : ''}`} role={error ? 'alert' : 'status'}>
        <span aria-hidden="true">✳</span>
        <p>{message}</p>
      </main>
    </div>
  );
}

function HoroscopeExperience({ user, userId, entitlements }) {
  const [experience, setExperience] = useState(EXPERIENCE_INITIAL_STATE);
  const [skyLens, setSkyLens] = useState('wheel');
  const [meaningLens, setMeaningLens] = useState('reading');
  const [horoscopes, setHoroscopes] = useState({ daily: null, weekly: null, monthly: null });
  const [horoscopeLoading, setHoroscopeLoading] = useState({ daily: false, weekly: false, monthly: false });
  const [horoscopeErrors, setHoroscopeErrors] = useState({ daily: null, weekly: null, monthly: null });
  const [transits, setTransits] = useState([]);
  const [transitsLoading, setTransitsLoading] = useState(true);
  const [transitsError, setTransitsError] = useState('');
  const [focusTransit, setFocusTransit] = useState(null);
  const [selectedBody, setSelectedBody] = useState(null);
  const [hoveredBody, setHoveredBody] = useState(null);
  const [frameWaitExpired, setFrameWaitExpired] = useState(false);
  const playheadRef = useRef(experience.playhead);

  const scopeOption = SCOPE_BY_ID[experience.scope] || SCOPE_OPTIONS[0];
  const currentHoroscope = horoscopes[scopeOption.period];
  const currentLoading = horoscopeLoading[scopeOption.period];
  const currentError = horoscopeErrors[scopeOption.period];
  const dailyLocked = scopeOption.period === 'daily' && entitlements?.canAccessDaily === false;
  const scopeWindowDays = getScopeWindowDays(scopeOption, currentHoroscope);
  const frameStartDate = getFrameStartDate(scopeOption, currentHoroscope);
  const birthChart = useMemo(() => user?.birthChart || {}, [user?.birthChart]);
  const planets = useMemo(() => birthChart?.planets || [], [birthChart?.planets]);
  const natal = useMemo(() => toChartScenePlacements(planets), [planets]);
  const natalAspects = useMemo(
    () => toChartSceneAspects(birthChart?.aspects || []),
    [birthChart?.aspects]
  );

  const {
    frames,
    range,
    window: playWindow,
    playMs,
    playing,
    setPlaying,
    scrubTo,
  } = useTransitFrames(planets, {
    windowDays: scopeWindowDays,
    playSeconds: scopeOption.playSeconds,
    startDate: frameStartDate,
  });

  useEffect(() => {
    playheadRef.current = playMs;
    setExperience((previous) => (
      previous.playhead === playMs ? previous : { ...previous, playhead: playMs }
    ));
  }, [playMs]);

  useEffect(() => {
    if (frames?.length) {
      setFrameWaitExpired(false);
      return undefined;
    }
    setFrameWaitExpired(false);
    const timeout = window.setTimeout(() => setFrameWaitExpired(true), 8000);
    return () => window.clearTimeout(timeout);
  }, [currentHoroscope?.startDate, frames]);

  useEffect(() => {
    let cancelled = false;
    if (!userId) return undefined;
    (async () => {
      setTransitsLoading(true);
      setTransitsError('');
      try {
        const now = new Date();
        const fromDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        const toDate = new Date(now.getFullYear(), now.getMonth() + 2, 0, 23, 59, 59, 999).toISOString();
        const response = await getTransitWindows(userId, fromDate, toDate);
        if (cancelled) return;
        const merged = Array.isArray(response)
          ? response
          : [
              ...(response?.transitEvents || []),
              ...(response?.transitToTransitEvents || []),
            ];
        setTransits(merged);
      } catch (error) {
        console.error('Error loading horoscope transits:', error);
        if (!cancelled) {
          setTransits([]);
          setTransitsError('Transit details are unavailable right now.');
        }
      } finally {
        if (!cancelled) setTransitsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const loadHoroscope = useCallback(async (period, force = false) => {
    if (!userId || (!force && horoscopes[period])) return;
    if (period === 'daily' && entitlements?.canAccessDaily === false) return;

    setHoroscopeLoading((previous) => ({ ...previous, [period]: true }));
    setHoroscopeErrors((previous) => ({ ...previous, [period]: null }));
    try {
      const option = SCOPE_OPTIONS.find((candidate) => candidate.period === period);
      const response = option.supportsDate
        ? await option.fetcher(userId, formatLocalDateParam())
        : await option.fetcher(userId);
      if (!response?.success || !response?.horoscope) throw new Error('No horoscope returned');
      setHoroscopes((previous) => ({ ...previous, [period]: response.horoscope }));
      if (period === 'daily' && response.creditsCharged > 0) {
        entitlements?.refreshEntitlements?.();
      }
    } catch (error) {
      console.error(`Error loading ${period} horoscope:`, error);
      setHoroscopeErrors((previous) => ({
        ...previous,
        [period]: error?.status === 402
          ? (entitlements?.isSimplePricing
              ? 'Daily horoscopes are included with Plus. Upgrade to unlock today’s reading.'
              : 'A daily horoscope costs 1 credit. Buy credits to unlock today’s reading.')
          : 'We couldn’t load this reading right now.',
      }));
    } finally {
      setHoroscopeLoading((previous) => ({ ...previous, [period]: false }));
    }
  }, [entitlements, horoscopes, userId]);

  useEffect(() => {
    loadHoroscope(scopeOption.period);
  }, [loadHoroscope, scopeOption.period]);

  const transitWindows = useMemo(
    () => transits.map(normalizeTransitWindow).filter(Boolean),
    [transits]
  );
  const scopeInterval = playWindow || range;
  const readingInterval = useMemo(
    () => getReadingInterval(
      currentHoroscope,
      { ...scopeOption, readingDays: scopeOption.period === 'monthly' ? scopeWindowDays : scopeOption.readingDays },
      playWindow
    ),
    [currentHoroscope, playWindow, scopeOption, scopeWindowDays]
  );
  const scopeTransits = useMemo(
    () => scopeInterval
      ? transitWindows.filter((transit) => overlapsInterval(transit, scopeInterval))
      : [],
    [scopeInterval, transitWindows]
  );
  const paragraphs = useMemo(() => splitParagraphs(currentHoroscope), [currentHoroscope]);
  const referencedTransits = useMemo(() => {
    const structuredReferences = [
      ...(Array.isArray(currentHoroscope?.keyTransits) ? currentHoroscope.keyTransits : []),
      ...(Array.isArray(currentHoroscope?.analysis?.keyTransits)
        ? currentHoroscope.analysis.keyTransits
        : []),
      ...(Array.isArray(currentHoroscope?.analysis?.keyThemes)
        ? currentHoroscope.analysis.keyThemes
        : []),
    ];
    const structuredMatches = scopeTransits.filter((transit) => (
      structuredReferences.some((reference) => transitMatchesReference(transit, reference))
    ));
    if (structuredMatches.length) return structuredMatches;

    const readingText = paragraphs.join(' ');
    const proseMatches = readingText
      ? scopeTransits.filter((transit) => readingMentionsTransit(readingText, transit))
      : [];
    if (proseMatches.length) return proseMatches;

    return scopeTransits.filter((transit) => (
      transit.exactMs >= readingInterval.start && transit.exactMs < readingInterval.end
    ));
  }, [currentHoroscope, paragraphs, readingInterval, scopeTransits]);
  const referencedKeys = useMemo(
    () => new Set(referencedTransits.map((transit) => transit.key)),
    [referencedTransits]
  );
  const readingTransitRows = useMemo(
    () => referencedTransits.map((transit) => ({
      transit,
      status: transitStatusAt(transit, frames, experience.playhead),
    })),
    [experience.playhead, frames, referencedTransits]
  );
  const quietTransits = useMemo(
    () => scopeTransits.filter((transit) => (
      !referencedKeys.has(transit.key) && isTransitActive(transit, experience.playhead)
    )),
    [experience.playhead, referencedKeys, scopeTransits]
  );
  const readingSceneBodies = useMemo(
    () => toSceneBodyNames([
      ...new Set(referencedTransits.map((transit) => transit.transitingPlanet).filter(Boolean)),
    ]) || [],
    [referencedTransits]
  );

  const activeBodies = useMemo(() => {
    if (experience.selectedTransits.mode === 'all') {
      return new Set(TRANSIT_BODIES.map((body) => body.id));
    }
    if (experience.selectedTransits.mode === 'custom') {
      return new Set(experience.selectedTransits.bodies);
    }
    return new Set(
      readingSceneBodies.length
        ? readingSceneBodies
        : TRANSIT_BODIES.map((body) => body.id).filter((body) => body !== 'moon')
    );
  }, [experience.selectedTransits, readingSceneBodies]);

  const toggleTransitBody = useCallback((body) => {
    setExperience((previous) => {
      const next = new Set(
        previous.selectedTransits.mode === 'custom'
          ? previous.selectedTransits.bodies
          : activeBodies
      );
      if (next.has(body)) next.delete(body);
      else next.add(body);
      return {
        ...previous,
        selectedTransits: { mode: 'custom', bodies: [...next] },
      };
    });
  }, [activeBodies]);

  const setTransitMode = useCallback((mode) => {
    setExperience((previous) => ({
      ...previous,
      selectedTransits: {
        mode,
        bodies: mode === 'all' ? TRANSIT_BODIES.map((body) => body.id) : [],
      },
    }));
  }, []);

  const focusTransiting = focusTransit
    ? toSceneBodyNames([
        focusTransit.transitingPlanet ||
        focusTransit.transitingBody ||
        focusTransit.transit?.transitingPlanet,
      ])
    : undefined;
  const focusTarget = focusTransit
    ? toSceneBodyNames([
        focusTransit.targetPlanet || focusTransit.target || focusTransit.natalPlanet,
      ])
    : undefined;
  const contextTransiting = useMemo(
    () => toSceneBodyNames(
      experience.chatContext.transits
        .map((element) => element.payload?.transitingPlanet)
        .filter(Boolean)
    ),
    [experience.chatContext.transits]
  );
  const contextTargets = useMemo(
    () => toSceneBodyNames(
      experience.chatContext.transits
        .map((element) => element.payload?.targetPlanet)
        .filter(Boolean)
    ),
    [experience.chatContext.transits]
  );
  const transitAspectBodies = focusTransiting ||
    (contextTransiting?.length ? contextTransiting : [...activeBodies]);
  const highlightBodies = focusTarget || (contextTargets?.length ? contextTargets : undefined);
  const focused = Boolean(focusTransiting?.length) ||
    Boolean(contextTransiting?.length) || activeBodies.size <= 4;

  const addContextElement = useCallback((element) => {
    if (!element?.key) return;
    setExperience((previous) => {
      if (previous.chatContext.transits.some((candidate) => candidate.key === element.key)) {
        return previous;
      }
      return {
        ...previous,
        chatContext: {
          ...previous.chatContext,
          transits: [...previous.chatContext.transits, element],
        },
      };
    });
  }, []);

  const addTransitContext = useCallback((transit) => {
    setFocusTransit(transit);
    addContextElement(makeTransitContextElement(transit));
  }, [addContextElement]);

  const handleChatSelectionChange = useCallback((elements) => {
    const next = (elements || []).filter((element) => element.group === 'horoscope');
    setExperience((previous) => {
      if (sameElementKeys(previous.chatContext.transits, next)) return previous;
      return {
        ...previous,
        chatContext: { ...previous.chatContext, transits: next },
      };
    });
  }, []);

  const handleSkyPick = useCallback((selection, activeAspects = []) => {
    if (!selection) return;
    const name = fromSceneBodyName(selection.body);
    if (!name) return;
    const capturedAt = new Date(playheadRef.current).toISOString();

    if (activeAspects.length) {
      const aspect = [...activeAspects].sort((left, right) => Number(left.orb) - Number(right.orb))[0];
      const transitingName = fromSceneBodyName(aspect.bodyA) || aspect.bodyA;
      const natalName = fromSceneBodyName(aspect.bodyB) || aspect.bodyB;
      const windowMatch = transitWindows.find((transit) => (
        transit.transitingPlanet === transitingName &&
        (transit.targetPlanet || transit.natalPlanet) === natalName &&
        normalizeAspect(transit.aspect) === normalizeAspect(aspect.type) &&
        transit.startMs <= playheadRef.current && playheadRef.current <= transit.endMs
      ));
      if (windowMatch) {
        addTransitContext(windowMatch);
        return;
      }
      const capturedTransit = normalizeTransitWindow({
        transitingPlanet: transitingName,
        targetPlanet: natalName,
        aspect: aspect.type,
        start: capturedAt,
        exact: capturedAt,
        end: capturedAt,
        description: `Transiting ${transitingName} ${aspect.type} natal ${natalName}`,
      });
      if (capturedTransit) addTransitContext(capturedTransit);
      return;
    }

    const activeForBody = transitWindows.find((transit) => (
      (selection.layer === 'transit'
        ? transit.transitingPlanet === name
        : (transit.targetPlanet || transit.natalPlanet) === name) &&
      transit.startMs <= playheadRef.current && playheadRef.current <= transit.endMs
    ));
    if (activeForBody) {
      addTransitContext(activeForBody);
      return;
    }

    const layerLabel = selection.layer === 'transit' ? 'Transiting' : 'Natal';
    addContextElement({
      group: 'horoscope',
      type: 'transit',
      key: `${selection.layer}-${name}-${capturedAt}`,
      label: `${layerLabel} ${name} · sky at this moment`,
      meta: capturedAt,
      payload: {
        type: selection.layer === 'transit' ? 'transit-position' : 'natal-point',
        transitingPlanet: name,
        targetPlanet: selection.layer === 'natal' ? name : undefined,
        exact: capturedAt,
        start: capturedAt,
        end: capturedAt,
        capturedAt,
        description: `${layerLabel} ${name} viewed against the sky at this moment`,
      },
    });
  }, [addContextElement, addTransitContext, transitWindows]);

  const handleBodySelect = useCallback((selection) => {
    setSelectedBody(selection);
    if (!selection) return;
    handleSkyPick(selection, getFrameAspects(frames, playheadRef.current, selection));
  }, [frames, handleSkyPick]);

  const handleAspectSelect = useCallback((aspect) => {
    if (!aspect) return;
    setSelectedBody({ body: aspect.bodyA, layer: 'transit', longitude: 0 });
    handleSkyPick({ body: aspect.bodyA, layer: 'transit', longitude: 0 }, [aspect]);
  }, [handleSkyPick]);

  const scrubShared = useCallback((milliseconds, showReading = false) => {
    scrubTo(milliseconds);
    setExperience((previous) => ({
      ...previous,
      playhead: milliseconds,
      chatContext: { ...previous.chatContext, includeSky: true },
    }));
    if (showReading) setMeaningLens('reading');
  }, [scrubTo]);

  const handleScopeChange = useCallback((scope) => {
    setExperience((previous) => ({
      ...previous,
      scope,
      chatContext: { ...previous.chatContext, includeReading: true },
    }));
    setMeaningLens('reading');
  }, []);

  const getActiveSkyDate = useCallback(
    () => experience.chatContext.includeSky
      ? new Date(experience.playhead).toISOString()
      : null,
    [experience.chatContext.includeSky, experience.playhead]
  );

  const chatTransitWindows = useMemo(
    () => transitWindows.map((transit) => ({
      ...transit,
      start: new Date(transit.startMs).toISOString(),
      exact: new Date(transit.exactMs).toISOString(),
      end: new Date(transit.endMs).toISOString(),
    })),
    [transitWindows]
  );
  const bodyDetail = selectedBody || hoveredBody;
  const bodyDetailInfo = bodyDetail ? BODIES[bodyDetail.body] : null;

  return (
    <div className="ink-page ink-horoscope">
      <InkNav variant="app" activeSegment="home" user={user} />

      <main className="ink-wrap ihp-slots-main">
        <header className="ihp-scopebar">
          <h1>Horoscopes <i>by Astral Gravity</i></h1>
          <div className="ihp-scope-control" role="group" aria-label="Time scope">
            {SCOPE_OPTIONS.map((option) => (
              <button
                type="button"
                className={experience.scope === option.id ? 'on' : ''}
                aria-pressed={experience.scope === option.id}
                onClick={() => handleScopeChange(option.id)}
                key={option.id}
              >
                {option.label}
              </button>
            ))}
          </div>
        </header>

        <div className={`ihp-stage${skyLens === 'tracker' ? ' is-tracker' : ''}`}>
          <section className="ihp-slot ihp-sky-slot" aria-label="The sky">
            <div className="ihp-lens-row">
              <span className="ihp-lens-row__label">The sky</span>
              <div className="ihp-lens-control" role="group" aria-label="Sky view">
                <button
                  type="button"
                  className={skyLens === 'wheel' ? 'on' : ''}
                  aria-pressed={skyLens === 'wheel'}
                  onClick={() => setSkyLens('wheel')}
                >
                  Wheel
                </button>
                <button
                  type="button"
                  className={skyLens === 'tracker' ? 'on' : ''}
                  aria-pressed={skyLens === 'tracker'}
                  onClick={() => setSkyLens('tracker')}
                >
                  Tracker
                </button>
              </div>
              <span className="ihp-lens-row__hint">
                {skyLens === 'wheel' ? 'one moment, the whole chart' : 'the whole interval, at once'}
              </span>
            </div>

              <div className="ink-card ihp-transit-card">
                <span className="ihp-transit-card__label">Transits</span>
                <button
                  type="button"
                  className={`ihp-transit-mode${experience.selectedTransits.mode === 'reading' ? ' on' : ''}`}
                  aria-pressed={experience.selectedTransits.mode === 'reading'}
                  onClick={() => setTransitMode('reading')}
                >
                  Reading
                </button>
                <button
                  type="button"
                  className={`ihp-transit-mode${experience.selectedTransits.mode === 'all' ? ' on' : ''}`}
                  aria-pressed={experience.selectedTransits.mode === 'all'}
                  onClick={() => setTransitMode('all')}
                >
                  All
                </button>
                {TRANSIT_BODIES.map((body) => {
                  const active = activeBodies.has(body.id);
                  return (
                    <button
                      type="button"
                      className={`ihp-transit-chip${active ? ' on' : ''}`}
                      style={{ '--ihp-planet-color': body.color }}
                      aria-pressed={active}
                      title={`${body.label} aspect lines ${active ? 'on' : 'off'}`}
                      onClick={() => toggleTransitBody(body.id)}
                      key={body.id}
                    >
                      <span aria-hidden="true">{`${BODIES[body.id]?.glyph || body.id}︎`}</span>
                      {body.label}
                    </button>
                  );
                })}
                <span
                  className="ihp-transit-help"
                  title="Reading shows planets referenced by this editorial. All shows every aspect line."
                  aria-label="Transit filter help"
                >
                  ?
                </span>
                {(transitsLoading || transitsError || transitWindows.length === 0) && (
                  <span className={`ihp-transit-status${transitsError ? ' is-error' : ''}`} role="status">
                    {transitsLoading
                      ? 'Loading influences…'
                      : transitsError || 'No transit windows are available right now.'}
                  </span>
                )}
              </div>

            <div className="ihp-lens-panel" hidden={skyLens !== 'wheel'}>
              <div className="ihp-medallion-shell">
                <div className="ihp-medallion" aria-label="Your natal chart with the sky at the playhead">
                  {natal.length ? (
                    <ChartScene
                      background="#f5eee5"
                      theme="ink"
                      natal={natal}
                      natalAspects={natalAspects}
                      transitFrames={frames || undefined}
                      transitDate={frames ? new Date(experience.playhead).toISOString() : undefined}
                      transitAspectBodies={transitAspectBodies}
                      transitLineBoost={focused}
                      topDown
                      disableZoom
                      paused={skyLens !== 'wheel'}
                      selectedBody={selectedBody}
                      highlightBodies={highlightBodies}
                      onHoverBody={setHoveredBody}
                      onSelectBody={handleBodySelect}
                      onSelectAspect={handleAspectSelect}
                    />
                  ) : (
                    <div className="ihp-medallion__empty" role="status">
                      Your chart wheel is not available yet.
                    </div>
                  )}
                  {natal.length > 0 && frames && (
                    <div className="ihp-medallion__date" aria-hidden="true">
                      <strong>
                        {new Date(experience.playhead).toLocaleDateString('en-US', {
                          weekday: 'long', month: 'short', day: 'numeric',
                        })}
                      </strong>
                      <span>
                        {scopeTransits.filter((transit) => (
                          transit.startMs <= experience.playhead && experience.playhead <= transit.endMs
                        )).length} transits in orb
                      </span>
                    </div>
                  )}
                  {natal.length > 0 && !frames && (
                    <span className="ihp-frame-status" role="status">
                      {frameWaitExpired
                        ? 'Live transit sky unavailable — showing your natal chart'
                        : 'Loading the transit sky…'}
                    </span>
                  )}
                  {bodyDetail && (
                    <span className="ihp-body-detail" aria-live="polite">
                      <b style={{ color: bodyDetailInfo?.color }}>{bodyDetailInfo?.glyph || '•'}</b>
                      {bodyDetail.layer === 'transit' ? 'Transiting ' : 'Natal '}
                      {capitalize(bodyDetail.body)}
                    </span>
                  )}
                </div>
                <p className="ihp-sky-hint">click a planet or aspect to add this moment to Gravity Chat</p>
              </div>
            </div>

            <div className="ihp-lens-panel" hidden={skyLens !== 'tracker'}>
              <TransitTracker
                experience={experience}
                interval={scopeInterval}
                transitWindows={scopeTransits}
                referencedKeys={referencedKeys}
                activeBodies={activeBodies}
                bodiesMode={experience.selectedTransits.mode}
                loading={transitsLoading}
                error={transitsError}
                onAddContext={addTransitContext}
                onScrub={(milliseconds) => scrubShared(milliseconds, true)}
              />
            </div>

            <CalendarStrip
              experience={experience}
              interval={scopeInterval}
              readingInterval={currentHoroscope ? readingInterval : null}
              transitWindows={scopeTransits}
              playing={playing}
              canPlay={Boolean(frames?.length)}
              onTogglePlaying={() => setPlaying(!playing)}
              onScrub={(milliseconds) => scrubShared(milliseconds, true)}
              onNow={() => scrubShared(Date.now(), true)}
            />
          </section>

          <section className="ihp-slot ihp-meaning-slot" aria-label="The meaning">
            <div className="ihp-lens-row">
              <span className="ihp-lens-row__label">The meaning</span>
              <div className="ihp-lens-control" role="group" aria-label="Meaning view">
                <button
                  type="button"
                  className={meaningLens === 'reading' ? 'on' : ''}
                  aria-pressed={meaningLens === 'reading'}
                  onClick={() => setMeaningLens('reading')}
                >
                  Reading
                </button>
                <button
                  type="button"
                  className={meaningLens === 'chat' ? 'on' : ''}
                  aria-pressed={meaningLens === 'chat'}
                  onClick={() => setMeaningLens('chat')}
                >
                  Chat
                </button>
              </div>
              <span className="ihp-lens-row__hint">
                {meaningLens === 'reading' ? 'Astral Gravity’s editorial' : 'your conversation'}
              </span>
            </div>

            <div className="ihp-lens-panel" hidden={meaningLens !== 'reading'}>
              <HoroscopeReading
                experience={experience}
                scopeLabel={scopeOption.label}
                horoscope={currentHoroscope}
                readingInterval={readingInterval}
                paragraphs={paragraphs}
                referencedTransits={readingTransitRows}
                quietTransits={quietTransits}
                loading={currentLoading}
                error={currentError}
                dailyLocked={dailyLocked}
                onRetry={() => loadHoroscope(scopeOption.period, true)}
                onReturnToReading={() => scrubShared(
                  Math.min(readingInterval.end - 1, readingInterval.start + DAY_MS / 2),
                  true
                )}
                onAddContext={addTransitContext}
                onTransitFocus={setFocusTransit}
              />
            </div>

            <div
              className="ink-card ihp-ask-panel ihp-chat-slot ihp-lens-panel"
              hidden={meaningLens !== 'chat'}
            >
              <AskStelliumPanel
                variant="dock"
                isOpen
                onClose={() => setMeaningLens('reading')}
                contentType="horoscope"
                contentId={userId}
                birthChart={birthChart}
                transitWindows={chatTransitWindows}
                horoscopePeriod={scopeOption.id}
                getActiveDate={getActiveSkyDate}
                includeHoroscopeReading={experience.chatContext.includeReading}
                externalElements={experience.chatContext.transits}
                syncExternalElements
                preserveSelectionOnSend
                onSelectionChange={handleChatSelectionChange}
                contextLabel="About your horoscope"
                placeholderText="Ask about your chart or these transits…"
                suggestedQuestions={[
                  'What should I focus on today?',
                  'Where does this influence show up most strongly?',
                  'What is the growth edge in this transit?',
                  'How can I work with it in daily life?',
                ]}
              />
            </div>
          </section>
        </div>

        <UpNextStrip
          experience={experience}
          transitWindows={transitWindows}
          onAddContext={addTransitContext}
        />

      </main>
    </div>
  );
}

function InkHoroscopePage() {
  const { userId } = useParams();
  const { stelliumUser } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const entitlements = useEntitlements(user);

  const setSelectedUser = useStore((state) => state.setSelectedUser);
  const setStoreUserId = useStore((state) => state.setUserId);
  const setUserPlanets = useStore((state) => state.setUserPlanets);
  const setUserHouses = useStore((state) => state.setUserHouses);
  const setUserAspects = useStore((state) => state.setUserAspects);
  const setCurrentUserContext = useStore((state) => state.setCurrentUserContext);
  const setActiveUserContext = useStore((state) => state.setActiveUserContext);

  useEffect(() => {
    const previousTitle = document.title;
    document.title = 'Horoscope | Astral Gravity';
    return () => {
      document.title = previousTitle;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    if (!userId) {
      setError('Missing dashboard profile.');
      setLoading(false);
      return undefined;
    }
    if (stelliumUser && userId !== stelliumUser._id) {
      setLoading(false);
      return undefined;
    }

    (async () => {
      setLoading(true);
      setError('');
      try {
        const loadedUser = await fetchUser(userId);
        if (cancelled) return;
        if (!loadedUser?._id) throw new Error('User data unavailable');
        setUser(loadedUser);
        setSelectedUser(loadedUser);
        setStoreUserId(loadedUser._id);
        setCurrentUserContext(loadedUser);
        setActiveUserContext(loadedUser);
        setUserPlanets(loadedUser.birthChart?.planets || []);
        setUserHouses(loadedUser.birthChart?.houses || []);
        setUserAspects(loadedUser.birthChart?.aspects || []);
      } catch (loadError) {
        console.error('Error loading ink horoscope dashboard:', loadError);
        if (!cancelled) setError('We couldn’t load your horoscope dashboard.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    setActiveUserContext,
    setCurrentUserContext,
    setSelectedUser,
    setStoreUserId,
    setUserAspects,
    setUserHouses,
    setUserPlanets,
    stelliumUser,
    userId,
  ]);

  if (stelliumUser && userId !== stelliumUser._id) {
    return <Navigate to={`/dashboard/${stelliumUser._id}`} replace />;
  }
  if (loading) return stateMessage('Reading your current sky…', { user: user || stelliumUser });
  if (error || !user) {
    return stateMessage(error || 'Your dashboard is unavailable.', { error: true, user: stelliumUser });
  }

  return <HoroscopeExperience user={user} userId={userId} entitlements={entitlements} />;
}

export default InkHoroscopePage;
