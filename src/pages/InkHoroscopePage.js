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
import InkNav from '../UI/ink/InkNav';
import AskStelliumPanel, { formatTransitEvent } from '../UI/askStellium/AskStelliumPanel';
import { ChartScene } from '../UI/shared/chartScene';
import { BODIES } from '../UI/shared/chartScene/constants';
import {
  fromSceneBodyName,
  toChartSceneAspects,
  toChartScenePlacements,
  toSceneBodyNames,
} from '../Utilities/chartSceneAdapter';
import { formatLocalDateParam } from '../Utilities/horoscopeDates';
import { formatTransitTitle, groupTransitInfluences } from '../Utilities/horoscopeTransits';
import '../styles/ink.css';
import './InkHoroscopePage.css';

const HORIZONS = [
  { id: 'today', roman: 'i.', label: 'Today', period: 'daily' },
  { id: 'week', roman: 'ii.', label: 'This Week', period: 'weekly' },
  { id: 'month', roman: 'iii.', label: 'This Month', period: 'monthly' },
  { id: 'ask', mark: '✳', label: 'Gravity Chat', ask: true },
];

const PERIOD_OPTIONS = {
  daily: {
    label: 'Today',
    windowDays: 1,
    playSeconds: 20,
    fetcher: generateDailyHoroscope,
    supportsDate: true,
  },
  weekly: {
    label: 'This Week',
    windowDays: 7,
    playSeconds: 60,
    fetcher: generateWeeklyHoroscope,
    supportsDate: false,
  },
  monthly: {
    label: 'This Month',
    windowDays: 30,
    playSeconds: 120,
    fetcher: generateMonthlyHoroscope,
    supportsDate: false,
  },
};

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

const DAY_MS = 86400000;

const capitalize = (value = '') => value.charAt(0).toUpperCase() + value.slice(1);

function periodBounds(period) {
  const now = new Date();
  const start = new Date(now);
  const end = new Date(now);
  if (period === 'daily') end.setUTCDate(end.getUTCDate() + 1);
  else if (period === 'weekly') end.setUTCDate(end.getUTCDate() + 7);
  else end.setUTCMonth(end.getUTCMonth() + 1);
  return { start, end };
}

function filterTransitsForPeriod(transits, period) {
  if (!Array.isArray(transits)) return [];
  const { start, end } = periodBounds(period);
  return transits
    .map((transit) => {
      const value =
        transit?.exact ||
        transit?.exactDate ||
        transit?.peakDate ||
        transit?.date ||
        transit?.startDate;
      if (!value) return null;
      const date = new Date(value);
      if (Number.isNaN(date.getTime()) || date < start || date > end) return null;
      return { ...transit, _sortDate: date };
    })
    .filter(Boolean)
    .sort((a, b) => a._sortDate - b._sortDate)
    .slice(0, 12);
}

function formatShortDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

function formatTimelineDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Date unavailable';
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function horoscopeRange(horoscope, period) {
  const now = new Date();
  const start = horoscope?.startDate ? new Date(horoscope.startDate) : now;
  const safeStart = Number.isNaN(start.getTime()) ? now : start;
  if (period === 'daily') return formatShortDate(safeStart);

  const suppliedEnd = horoscope?.endDate ? new Date(horoscope.endDate) : null;
  const end = suppliedEnd && !Number.isNaN(suppliedEnd.getTime())
    ? suppliedEnd
    : new Date(safeStart.getTime() + (period === 'weekly' ? 7 : 30) * DAY_MS);
  return `${formatShortDate(safeStart)} — ${formatShortDate(end)}`;
}

function splitParagraphs(horoscope) {
  return String(horoscope?.interpretation || horoscope?.text || '')
    .split(/\n\s*\n|\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

function getFrameAspects(frames, playMs, selection) {
  if (!selection || !frames?.length) return [];
  let closest = frames[0];
  let closestDistance = Infinity;
  frames.forEach((frame) => {
    const distance = Math.abs(Date.parse(frame.date) - playMs);
    if (distance < closestDistance) {
      closest = frame;
      closestDistance = distance;
    }
  });
  return (closest?.aspects || []).filter((aspect) =>
    selection.layer === 'transit'
      ? aspect.bodyA === selection.body
      : aspect.bodyB === selection.body
  );
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
  const [activeHorizon, setActiveHorizon] = useState('today');
  const [period, setPeriod] = useState('daily');
  const [horoscopes, setHoroscopes] = useState({ daily: null, weekly: null, monthly: null });
  const [horoscopeLoading, setHoroscopeLoading] = useState({ daily: false, weekly: false, monthly: false });
  const [horoscopeErrors, setHoroscopeErrors] = useState({ daily: null, weekly: null, monthly: null });
  const [transits, setTransits] = useState([]);
  const [transitsLoading, setTransitsLoading] = useState(true);
  const [transitsError, setTransitsError] = useState('');
  const [chipMode, setChipMode] = useState('reading');
  const [customBodies, setCustomBodies] = useState(() => new Set());
  const [focusTransit, setFocusTransit] = useState(null);
  const [pinnedTransit, setPinnedTransit] = useState(null);
  const [selectedBody, setSelectedBody] = useState(null);
  const [hoveredBody, setHoveredBody] = useState(null);
  const [askElements, setAskElements] = useState([]);
  const [askSelection, setAskSelection] = useState([]);
  const [frameWaitExpired, setFrameWaitExpired] = useState(false);
  const timelineRef = useRef(null);
  const draggingRef = useRef(false);
  const playheadRef = useRef(Date.now());

  const birthChart = useMemo(() => user?.birthChart || {}, [user?.birthChart]);
  const planets = useMemo(() => birthChart?.planets || [], [birthChart?.planets]);
  const natal = useMemo(() => toChartScenePlacements(planets), [planets]);
  const natalAspects = useMemo(
    () => toChartSceneAspects(birthChart?.aspects || []),
    [birthChart?.aspects]
  );
  const currentHoroscope = horoscopes[period];
  const periodOption = PERIOD_OPTIONS[period] || PERIOD_OPTIONS.weekly;
  const dailyLocked = period === 'daily' && entitlements?.canAccessDaily === false;

  const {
    frames,
    range,
    window: playWindow,
    playMs,
    playing,
    setPlaying,
    scrubTo,
  } = useTransitFrames(planets, {
    windowDays: periodOption.windowDays,
    playSeconds: periodOption.playSeconds,
    startDate: currentHoroscope?.startDate,
  });

  useEffect(() => {
    playheadRef.current = playMs;
  }, [playMs]);

  useEffect(() => {
    if (activeHorizon === 'ask') setPlaying(false);
  }, [activeHorizon, setPlaying]);

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
        const toDate = new Date(now.getFullYear(), now.getMonth() + 2, 0).toISOString();
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

  const loadHoroscope = useCallback(async (periodId, force = false) => {
    if (!userId || (!force && horoscopes[periodId])) return;
    if (periodId === 'daily' && entitlements?.canAccessDaily === false) return;

    setHoroscopeLoading((previous) => ({ ...previous, [periodId]: true }));
    setHoroscopeErrors((previous) => ({ ...previous, [periodId]: null }));
    try {
      const option = PERIOD_OPTIONS[periodId];
      const response = option.supportsDate
        ? await option.fetcher(userId, formatLocalDateParam())
        : await option.fetcher(userId);
      if (!response?.success || !response?.horoscope) throw new Error('No horoscope returned');
      setHoroscopes((previous) => ({ ...previous, [periodId]: response.horoscope }));
      if (periodId === 'daily' && response.creditsCharged > 0) {
        entitlements?.refreshEntitlements?.();
      }
    } catch (error) {
      console.error(`Error loading ${periodId} horoscope:`, error);
      setHoroscopeErrors((previous) => ({
        ...previous,
        [periodId]: error?.status === 402
          ? 'A daily horoscope costs 1 credit. Buy credits to unlock today’s reading.'
          : 'We couldn’t load this reading right now.',
      }));
    } finally {
      setHoroscopeLoading((previous) => ({ ...previous, [periodId]: false }));
    }
  }, [entitlements, horoscopes, userId]);

  useEffect(() => {
    loadHoroscope(period);
  }, [loadHoroscope, period]);

  useEffect(() => {
    setPinnedTransit(null);
    setFocusTransit(null);
    setSelectedBody(null);
  }, [period]);

  const filteredTransits = useMemo(
    () => filterTransitsForPeriod(transits, period),
    [period, transits]
  );
  const groupedInfluences = useMemo(
    () => groupTransitInfluences(filteredTransits),
    [filteredTransits]
  );
  const readingTransits = useMemo(
    () => [...new Set(filteredTransits.map((transit) => transit.transitingPlanet).filter(Boolean))],
    [filteredTransits]
  );
  const readingSceneBodies = useMemo(
    () => toSceneBodyNames(readingTransits) || [],
    [readingTransits]
  );
  const paragraphs = useMemo(() => splitParagraphs(currentHoroscope), [currentHoroscope]);

  useEffect(() => {
    setChipMode('reading');
  }, [readingSceneBodies]);

  const activeBodies = useMemo(() => {
    if (chipMode === 'all') return new Set(TRANSIT_BODIES.map((body) => body.id));
    if (chipMode === 'custom') return customBodies;
    return new Set(
      readingSceneBodies.length
        ? readingSceneBodies
        : TRANSIT_BODIES.map((body) => body.id).filter((body) => body !== 'moon')
    );
  }, [chipMode, customBodies, readingSceneBodies]);

  const toggleTransitBody = useCallback((body) => {
    const next = new Set(activeBodies);
    if (next.has(body)) next.delete(body);
    else next.add(body);
    setCustomBodies(next);
    setChipMode('custom');
  }, [activeBodies]);

  const pinnedScene = useMemo(() => {
    if (!pinnedTransit) return null;
    return {
      transiting: toSceneBodyNames([pinnedTransit.transitingPlanet]),
      target: toSceneBodyNames([pinnedTransit.targetPlanet || pinnedTransit.natalPlanet]),
    };
  }, [pinnedTransit]);

  const hoverTransiting = focusTransit
    ? toSceneBodyNames([
        focusTransit.transitingPlanet ||
        focusTransit.transitingBody ||
        focusTransit.transit?.transitingPlanet,
      ])
    : undefined;
  const hoverTarget = focusTransit
    ? toSceneBodyNames([
        focusTransit.targetPlanet || focusTransit.target || focusTransit.natalPlanet,
      ])
    : undefined;
  const askFocus = useMemo(() => ({
    transiting: toSceneBodyNames(
      askSelection.map((element) => element.payload?.transitingPlanet).filter(Boolean)
    ),
    target: toSceneBodyNames(
      askSelection.map((element) => element.payload?.targetPlanet).filter(Boolean)
    ),
  }), [askSelection]);

  const transitAspectBodies =
    pinnedScene?.transiting ||
    hoverTransiting ||
    (askFocus.transiting?.length ? askFocus.transiting : [...activeBodies]);
  const highlightBodies =
    pinnedScene?.target || hoverTarget || (askFocus.target?.length ? askFocus.target : undefined);
  const focused =
    Boolean(pinnedScene) ||
    Boolean(hoverTransiting?.length) ||
    Boolean(askFocus.transiting?.length) ||
    activeBodies.size <= 4;

  useEffect(() => {
    if (!pinnedTransit || !playWindow) return;
    const value =
      pinnedTransit.exact ||
      pinnedTransit.exactDate ||
      pinnedTransit.peakDate ||
      pinnedTransit.date;
    const milliseconds = value ? Date.parse(value) : NaN;
    if (Number.isFinite(milliseconds)) scrubTo(milliseconds);
  }, [pinnedTransit, playWindow, scrubTo]);

  const selectAskHorizon = useCallback(() => {
    setActiveHorizon('ask');
  }, []);

  const handleSkyPick = useCallback((selection, activeAspects = []) => {
    if (!selection) return;
    const name = fromSceneBodyName(selection.body);
    if (!name) return;
    const at = playheadRef.current;
    const capturedAt = new Date(at).toISOString();
    const capturedDay = capturedAt.slice(0, 10);
    const capturedLabel = formatShortDate(capturedAt);
    let elements = [];

    if (activeAspects.length) {
      elements = [...activeAspects]
        .sort((a, b) => Number(a.orb) - Number(b.orb))
        .slice(0, 1)
        .map((aspect) => {
          const transitingName = fromSceneBodyName(aspect.bodyA) || aspect.bodyA;
          const natalName = fromSceneBodyName(aspect.bodyB) || aspect.bodyB;
          const windowMatch = transits.find((windowItem) =>
            windowItem.transitingPlanet === transitingName &&
            (windowItem.targetPlanet || windowItem.natalPlanet) === natalName &&
            String(windowItem.aspect || '').toLowerCase() === String(aspect.type || '').toLowerCase()
          );
          const basePayload = windowMatch
            ? formatTransitEvent(windowMatch)
            : {
                type: aspect.type,
                aspect: aspect.type,
                transitingPlanet: transitingName,
                targetPlanet: natalName,
                exact: capturedAt,
                start: capturedAt,
                end: capturedAt,
                description: `Transiting ${transitingName} ${aspect.type} natal ${natalName}`,
              };
          const payload = { ...basePayload, exact: capturedAt, capturedAt };
          return {
            group: 'horoscope',
            type: 'transit',
            key: `${transitingName}-${aspect.type}-${natalName}-${capturedDay}-sky`,
            label: `Transiting ${transitingName} ${aspect.type} Natal ${natalName} · ${capturedLabel}`,
            meta: payload.description || '',
            payload,
          };
        });
    } else {
      const candidates = transits.filter((windowItem) =>
        selection.layer === 'transit'
          ? windowItem.transitingPlanet === name
          : (windowItem.targetPlanet || windowItem.natalPlanet) === name
      );
      const activeAtPlayhead = candidates.filter((windowItem) => {
        const start = Date.parse(windowItem.start);
        const end = Date.parse(windowItem.end);
        return Number.isFinite(start) && Number.isFinite(end) && start <= at && at <= end;
      });

      if (activeAtPlayhead.length) {
        elements = activeAtPlayhead.slice(0, 1).map((transit) => {
          const payload = { ...formatTransitEvent(transit), exact: capturedAt, capturedAt };
          return {
            group: 'horoscope',
            type: 'transit',
            key: `${transit.id || `${transit.transitingPlanet}-${transit.aspect}-${transit.targetPlanet}`}-${capturedDay}-sky`,
            label: `${formatTransitTitle(transit)} · ${capturedLabel}`,
            meta: transit.description || '',
            payload,
          };
        });
      } else {
        const layerLabel = selection.layer === 'transit' ? 'Transiting' : 'Natal';
        const payload = {
          type: selection.layer === 'transit' ? 'transit-position' : 'natal-point',
          transitingPlanet: name,
          targetPlanet: selection.layer === 'natal' ? name : undefined,
          exact: capturedAt,
          start: capturedAt,
          end: capturedAt,
          capturedAt,
          description: `${layerLabel} ${name} viewed against the sky on ${capturedLabel}`,
        };
        elements = [{
          group: 'horoscope',
          type: 'transit',
          key: `${selection.layer}-${name}-${capturedDay}-sky`,
          label: `${layerLabel} ${name} · ${capturedLabel}`,
          meta: payload.description,
          payload,
        }];
      }
    }

    if (!elements.length) return;
    setAskElements(elements);
    selectAskHorizon();
  }, [selectAskHorizon, transits]);

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

  const handleInfluenceClick = useCallback((transit) => {
    setPinnedTransit(transit);
    const value = transit.exact || transit.exactDate || transit.peakDate || transit.date || transit.startDate;
    const label = formatTransitTitle(transit);
    const element = {
      group: 'horoscope',
      type: 'transit',
      key: transit.id || `${transit.transitingPlanet}-${transit.aspect}-${transit.targetPlanet}-${value || 'period'}`,
      label: `${label}${value ? ` · ${formatShortDate(value)}` : ''}`,
      meta: transit.description || '',
      payload: formatTransitEvent(transit),
    };
    setAskElements([element]);
    selectAskHorizon();
  }, [selectAskHorizon]);

  const handleHorizonChange = useCallback((horizon) => {
    setActiveHorizon(horizon.id);
    if (horizon.period) {
      setSelectedBody(null);
      setPeriod(horizon.period);
    }
  }, []);

  const getActiveSkyDate = useCallback(
    () => new Date(playheadRef.current).toISOString(),
    []
  );

  const millisecondsFromPointer = useCallback((event) => {
    const element = timelineRef.current;
    if (!element || !range) return null;
    const rect = element.getBoundingClientRect();
    const fraction = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    return range.start + fraction * (range.end - range.start);
  }, [range]);

  const timelineTicks = useMemo(() => {
    if (!range) return [];
    return [0, 0.25, 0.5, 0.75, 1].map((fraction) => ({
      fraction,
      label: formatShortDate(range.start + fraction * (range.end - range.start) - (fraction === 1 ? 1 : 0)),
    }));
  }, [range]);

  const rangeDuration = range ? range.end - range.start : 0;
  const windowLeft = range && playWindow && rangeDuration > 0
    ? ((playWindow.start - range.start) / rangeDuration) * 100
    : 0;
  const windowWidth = range && playWindow && rangeDuration > 0
    ? ((playWindow.end - playWindow.start) / rangeDuration) * 100
    : 0;
  const playheadLeft = range && rangeDuration > 0
    ? ((playMs - range.start) / rangeDuration) * 100
    : 0;
  const currentLoading = horoscopeLoading[period];
  const currentError = horoscopeErrors[period];
  const bodyDetail = selectedBody || hoveredBody;
  const bodyDetailInfo = bodyDetail ? BODIES[bodyDetail.body] : null;

  return (
    <div className="ink-page ink-horoscope">
      <InkNav variant="app" activeSegment="home" user={user} />

      <nav className="ihp-tabs" role="tablist" aria-label="Horoscope periods">
        {HORIZONS.map((horizon) => (
          <button
            type="button"
            role="tab"
            id={`ihp-tab-${horizon.id}`}
            aria-controls={`ihp-panel-${horizon.ask ? 'ask' : 'reading'}`}
            aria-selected={activeHorizon === horizon.id}
            className={`ihp-tab${activeHorizon === horizon.id ? ' on' : ''}`}
            onClick={() => handleHorizonChange(horizon)}
            key={horizon.id}
          >
            <span className={horizon.ask ? 'ihp-tab__star' : 'ihp-tab__roman'} aria-hidden="true">
              {horizon.mark || horizon.roman}
            </span>
            <span>{horizon.label}</span>
          </button>
        ))}
      </nav>

      <main>
        <section
          className="ihp-stage ink-wrap"
          id="ihp-panel-reading"
          role="tabpanel"
          aria-labelledby={`ihp-tab-${activeHorizon}`}
          hidden={activeHorizon === 'ask'}
        >
          <div className="ihp-sky-column">
            <div className="ink-card ihp-transit-card">
              <span className="ihp-transit-card__label">Transits</span>
              <button
                type="button"
                className={`ihp-transit-mode${chipMode === 'reading' ? ' on' : ''}`}
                aria-pressed={chipMode === 'reading'}
                onClick={() => setChipMode('reading')}
              >
                Reading
              </button>
              <button
                type="button"
                className={`ihp-transit-mode${chipMode === 'all' ? ' on' : ''}`}
                aria-pressed={chipMode === 'all'}
                onClick={() => setChipMode('all')}
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
                title="Toggle a planet to show or hide its aspect lines. Reading shows the planets highlighted by this period’s reading."
                aria-label="Transit filter help"
              >
                ?
              </span>
              {(transitsLoading || transitsError || transits.length === 0) && (
                <span className={`ihp-transit-status${transitsError ? ' is-error' : ''}`} role="status">
                  {transitsLoading
                    ? 'Loading influences…'
                    : transitsError || 'No transit windows are available right now.'}
                </span>
              )}
            </div>

            <div className="ihp-medallion-shell">
              <div className="ihp-medallion" aria-label="Your natal chart with the current transit sky">
                {natal.length ? (
                  <ChartScene
                    background="#f5eee5"
                    theme="ink"
                    natal={natal}
                    natalAspects={natalAspects}
                    transitFrames={frames || undefined}
                    transitDate={frames ? new Date(playMs).toISOString() : undefined}
                    transitAspectBodies={transitAspectBodies}
                    transitLineBoost={focused}
                    topDown
                    disableZoom
                    paused={activeHorizon === 'ask'}
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
              <p className="ihp-sky-hint">click a planet or aspect to ask Stellium about this moment</p>
            </div>

            <div className="ink-card ihp-timeline" aria-label="Transit timeline">
              <button
                type="button"
                className="ihp-timeline__play"
                aria-label={playing ? 'Pause transit timeline' : 'Play transit timeline'}
                aria-pressed={playing}
                disabled={!frames?.length}
                onClick={() => setPlaying(!playing)}
              >
                {playing ? '❚❚' : '▶'}
              </button>
              <div
                className={`ihp-timeline__track${range ? '' : ' is-empty'}`}
                ref={timelineRef}
                onPointerDown={(event) => {
                  if (!range) return;
                  draggingRef.current = true;
                  event.currentTarget.setPointerCapture(event.pointerId);
                  const milliseconds = millisecondsFromPointer(event);
                  if (milliseconds !== null) scrubTo(milliseconds);
                }}
                onPointerMove={(event) => {
                  if (!draggingRef.current) return;
                  const milliseconds = millisecondsFromPointer(event);
                  if (milliseconds !== null) scrubTo(milliseconds);
                }}
                onPointerUp={() => {
                  draggingRef.current = false;
                }}
                onPointerCancel={() => {
                  draggingRef.current = false;
                }}
              >
                {range && playWindow && (
                  <>
                    <span
                      className="ihp-timeline__window"
                      style={{ left: `${windowLeft}%`, width: `${windowWidth}%` }}
                    />
                    <span className="ihp-timeline__cursor" style={{ left: `${playheadLeft}%` }} />
                    <span className="ihp-timeline__dates" aria-hidden="true">
                      {timelineTicks.map((tick) => (
                        <span style={{ left: `${tick.fraction * 100}%` }} key={tick.fraction}>
                          {tick.label}
                        </span>
                      ))}
                    </span>
                  </>
                )}
              </div>
              <span className="ihp-timeline__current">
                {range ? formatTimelineDate(playMs) : 'Sky timing unavailable'}
              </span>
              <button
                type="button"
                className="ihp-timeline__now"
                disabled={!range}
                onClick={() => scrubTo(Date.now())}
              >
                Now
              </button>
            </div>
          </div>

          <article className="ink-card ihp-reading-card">
            <h1>Horoscopes <i>by Stellium</i></h1>
            <div className="ihp-reading-range">
              <b>{periodOption.label}</b>
              <span>{horoscopeRange(currentHoroscope, period)}</span>
            </div>

            <div className="ihp-reading-body" aria-live="polite">
              {dailyLocked && (
                <div className="ihp-reading-state">
                  <p>Daily horoscopes cost 1 credit on Free and are included with Plus.</p>
                </div>
              )}
              {!dailyLocked && currentLoading && (
                <div className="ihp-reading-state" role="status">
                  <span aria-hidden="true">✳</span>
                  <p>Reading the sky for {period === 'daily' ? 'today' : `this ${period.replace('ly', '')}`}…</p>
                </div>
              )}
              {!dailyLocked && !currentLoading && currentError && (
                <div className="ihp-reading-state ihp-reading-state--error" role="alert">
                  <p>{currentError}</p>
                  <button type="button" className="ink-btn ink-btn--ghost" onClick={() => loadHoroscope(period, true)}>
                    Try again
                  </button>
                </div>
              )}
              {!dailyLocked && !currentLoading && !currentError && currentHoroscope && paragraphs.length > 0 && (
                paragraphs.map((paragraph, index) => <p key={`${period}-${index}`}>{paragraph}</p>)
              )}
              {!dailyLocked && !currentLoading && !currentError && currentHoroscope && paragraphs.length === 0 && (
                <div className="ihp-reading-state">
                  <p>This reading does not have any written guidance yet.</p>
                </div>
              )}
              {!dailyLocked && !currentLoading && !currentError && !currentHoroscope && (
                <div className="ihp-reading-state">
                  <p>Your {periodOption.label.toLowerCase()} reading is not available yet.</p>
                  <button type="button" className="ink-btn ink-btn--ghost" onClick={() => loadHoroscope(period, true)}>
                    Load reading
                  </button>
                </div>
              )}
            </div>

            {!currentLoading && !currentError && groupedInfluences.length > 0 && (
              <div className="ihp-influences">
                <span className="ihp-influences__label">Key planetary influences</span>
                <div className="ihp-influences__list">
                  {groupedInfluences.map(({ key, transit, title, dateLabel }) => title && (
                    <button
                      type="button"
                      className={`ihp-influence${pinnedTransit === transit ? ' is-pinned' : ''}`}
                      onMouseEnter={() => setFocusTransit(transit)}
                      onMouseLeave={() => setFocusTransit(null)}
                      onFocus={() => setFocusTransit(transit)}
                      onBlur={() => setFocusTransit(null)}
                      onClick={() => handleInfluenceClick(transit)}
                      title="Focus this influence and add it to Gravity Chat"
                      key={key}
                    >
                      {title}{dateLabel ? <small> · {dateLabel}</small> : null}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <p className="ihp-reading-note">
              <span aria-hidden="true" />
              The chart highlights only the transits discussed in this reading
            </p>
          </article>
        </section>

        <section
          className="ihp-ask-view ink-wrap"
          id="ihp-panel-ask"
          role="tabpanel"
          aria-labelledby="ihp-tab-ask"
          hidden={activeHorizon !== 'ask'}
        >
          <div className="ihp-ask-heading">
            <h1>Gravity Chat <i>✳</i></h1>
            <p>She’s read this sky. Ask her about it.</p>
          </div>
          <div className="ink-card ihp-ask-panel">
            <AskStelliumPanel
              variant="dock"
              isOpen={activeHorizon === 'ask'}
              onClose={() => setActiveHorizon(
                HORIZONS.find((horizon) => horizon.period === period)?.id || 'today'
              )}
              contentType="horoscope"
              contentId={userId}
              birthChart={birthChart}
              transitWindows={transits}
              horoscopePeriod={HORIZONS.find((horizon) => horizon.period === period)?.id || 'today'}
              getActiveDate={getActiveSkyDate}
              externalElements={askElements}
              onSelectionChange={setAskSelection}
              contextLabel="About your horoscope"
              placeholderText="Ask about this sky…"
              suggestedQuestions={[
                'What should I focus on today?',
                'Where does this influence show up most strongly?',
                'What is the growth edge in this transit?',
                'How can I work with it in daily life?',
              ]}
            />
            <p className="ihp-ask-foot"><b>✳</b> Included with Plus · fair use applies</p>
          </div>
        </section>
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
    document.title = 'Horoscope | Stellium';
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
  if (error || !user) return stateMessage(error || 'Your dashboard is unavailable.', { error: true, user: stelliumUser });

  return <HoroscopeExperience user={user} userId={userId} entitlements={entitlements} />;
}

export default InkHoroscopePage;
