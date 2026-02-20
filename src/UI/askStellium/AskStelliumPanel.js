import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  enhancedChatForUserBirthChart,
  fetchEnhancedChatHistory,
  enhancedChatForRelationship,
  fetchRelationshipEnhancedChatHistory,
  fetchHoroscopeChatHistory,
  generateCustomHoroscope
} from '../../Utilities/api';
import useEntitlementsStore from '../../Utilities/entitlementsStore';
import useStore from '../../Utilities/store';
import InsufficientCreditsModal from '../entitlements/InsufficientCreditsModal';
import './AskStelliumPanel.css';

const HISTORY_CONFIG = {
  birthchart: {
    fetchHistory: (id, limit) => fetchEnhancedChatHistory(id, limit)
  },
  analysis: {
    fetchHistory: (id, limit) => fetchEnhancedChatHistory(id, limit)
  },
  relationship: {
    fetchHistory: (id, limit) => fetchRelationshipEnhancedChatHistory(id, limit)
  },
  horoscope: {
    fetchHistory: (id, limit) => fetchHoroscopeChatHistory(id, limit)
  }
};

const MAX_SELECTIONS = 3;

const signToCode = {
  Aries: 'Ar', Taurus: 'Ta', Gemini: 'Ge', Cancer: 'Ca',
  Leo: 'Le', Virgo: 'Vi', Libra: 'Li', Scorpio: 'Sc',
  Sagittarius: 'Sa', Capricorn: 'Cp', Aquarius: 'Aq', Pisces: 'Pi'
};

const planetToCode = {
  Sun: 'Su', Moon: 'Mo', Mercury: 'Me', Venus: 'Ve', Mars: 'Ma',
  Jupiter: 'Ju', Saturn: 'Sa', Uranus: 'Ur', Neptune: 'Ne', Pluto: 'Pl',
  Ascendant: 'As', Midheaven: 'Mc', Node: 'No', 'North Node': 'No', Chiron: 'Ch'
};

const aspectToCode = {
  conjunction: 'Co', opposition: 'Op', trine: 'Tr',
  square: 'Sq', sextile: 'Sx', quincunx: 'Qu'
};

const getOrdinal = (n) => {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

const findPlanetData = (planetName, planets) => {
  return planets.find(p => p.name === planetName) || null;
};

const formatAspectData = (aspect, planet1Data, planet2Data) => {
  const aspectType = (aspect.aspectType || 'aspect').toLowerCase();
  const planet1Code = planetToCode[aspect.aspectedPlanet] || aspect.aspectedPlanet.substring(0, 2);
  const planet2Code = planetToCode[aspect.aspectingPlanet] || aspect.aspectingPlanet.substring(0, 2);
  const aspectCode = aspectToCode[aspectType] || aspectType.substring(0, 2);

  const planet1Sign = signToCode[planet1Data.sign] || planet1Data.sign.substring(0, 2);
  const planet2Sign = signToCode[planet2Data.sign] || planet2Data.sign.substring(0, 2);

  const planet1House = planet1Data.house ? String(planet1Data.house).padStart(2, '0') : '00';
  const planet2House = planet2Data.house ? String(planet2Data.house).padStart(2, '0') : '00';

  return {
    group: 'birthchart',
    type: 'aspect',
    code: `A-${planet1Code}s${planet1Sign}${planet1House}Ca${aspectCode}${planet2Code}s${planet2Sign}${planet2House}`,
    planet1: aspect.aspectedPlanet,
    planet1Sign: planet1Data.sign,
    planet1House: planet1Data.house || null,
    planet2: aspect.aspectingPlanet,
    planet2Sign: planet2Data.sign,
    planet2House: planet2Data.house || null,
    aspectType: aspectType,
    orb: aspect.orb,
    label: `${aspect.aspectedPlanet} ${aspectType} ${aspect.aspectingPlanet}`,
    description: `${aspect.aspectedPlanet} in ${planet1Data.sign}${planet1Data.house ? ` in ${getOrdinal(planet1Data.house)} house` : ''} ${aspectType} ${aspect.aspectingPlanet} in ${planet2Data.sign}${planet2Data.house ? ` in ${getOrdinal(planet2Data.house)} house` : ''}`
  };
};

const formatPositionData = (planet) => {
  const planetCode = planetToCode[planet.name] || planet.name.substring(0, 2);
  const signCode = signToCode[planet.sign] || planet.sign.substring(0, 2);
  const houseNumber = planet.house ? String(planet.house).padStart(2, '0') : '00';

  return {
    group: 'birthchart',
    type: 'position',
    code: `Pp-${planetCode}${signCode}${houseNumber}`,
    planet: planet.name,
    sign: planet.sign,
    house: planet.house || null,
    isRetrograde: planet.is_retro === 'true',
    degree: planet.norm_degree,
    label: `${planet.name} in ${planet.sign}`,
    description: `${planet.name} in ${planet.sign}${planet.house ? ` in ${getOrdinal(planet.house)} house` : ''}`
  };
};

const formatTransitEvent = (transit) => ({
  type: transit.type,
  transitingPlanet: transit.transitingPlanet,
  exact: transit.exact,
  targetPlanet: transit.targetPlanet,
  aspect: transit.aspect,
  start: transit.start,
  end: transit.end,
  description: transit.description,
  transitingSign: transit.transitingSign,
  targetSign: transit.targetSign,
  transitingHouse: transit.transitingHouse,
  targetHouse: transit.targetHouse,
  moonPhaseData: transit.moonPhaseData
});

const formatDateShort = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const formatTransitDateRange = (transit) => {
  const start = formatDateShort(transit.start);
  const end = formatDateShort(transit.end);
  const exact = formatDateShort(transit.exact);

  if (!start && !end) return exact || '';
  if (start && end && start === end) return start;
  if (start && end && exact && exact !== start && exact !== end) {
    return `${start} - ${end} (exact: ${exact})`;
  }
  if (start && end) return `${start} - ${end}`;
  return start || end || '';
};

const getFilterOptions = (contentType) => {
  if (contentType === 'birthchart' || contentType === 'analysis') {
    return [
      { value: 'all', label: 'All' },
      { value: 'positions', label: 'Positions' },
      { value: 'aspects', label: 'Aspects' }
    ];
  }
  if (contentType === 'relationship') {
    return [
      { value: 'all', label: 'All' },
      { value: 'synastry', label: 'Synastry' },
      { value: 'composite', label: 'Composite' },
      { value: 'placements', label: 'Placements' }
    ];
  }
  if (contentType === 'horoscope') {
    return [
      { value: 'all', label: 'All' },
      { value: 'transit-to-natal', label: 'Natal' },
      { value: 'transit-to-transit', label: 'World' }
    ];
  }
  return [];
};

const getCategoryBadgeInfo = (contentType, element) => {
  if (contentType === 'birthchart' || contentType === 'analysis') {
    if (element.type === 'position') {
      return { label: 'Position', colorClass: 'badge--position' };
    }
    return { label: 'Aspect', colorClass: 'badge--aspect' };
  }
  if (contentType === 'relationship') {
    const source = (element.payload?.source || element.meta || '').toLowerCase();
    if (source.includes('composite')) return { label: 'Composite', colorClass: 'badge--composite' };
    if (source.includes('houseplacement')) return { label: 'Placements', colorClass: 'badge--placements' };
    return { label: 'Synastry', colorClass: 'badge--synastry' };
  }
  if (contentType === 'horoscope') {
    const transitType = element.payload?.type || '';
    if (transitType === 'transit-to-transit') return { label: 'World', colorClass: 'badge--world' };
    return { label: 'Natal', colorClass: 'badge--natal' };
  }
  return { label: '', colorClass: '' };
};

function AskStelliumPanel({
  isOpen,
  onClose,
  contentType,
  contentId,
  contextLabel,
  placeholderText,
  suggestedQuestions,
  birthChart,
  relationshipScoredItems,
  transitWindows = [],
  horoscopePeriod
}) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [error, setError] = useState(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [selectedElements, setSelectedElements] = useState([]);
  const [selectionError, setSelectionError] = useState(null);
  const [activePeriod, setActivePeriod] = useState('weekly');
  const [transitTypeFilter, setTransitTypeFilter] = useState('all');
  const [relationshipFilter, setRelationshipFilter] = useState('all');
  const [birthchartFilter, setBirthchartFilter] = useState('all');
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [overlaySearch, setOverlaySearch] = useState('');
  const messagesEndRef = useRef(null);
  const panelRef = useRef(null);
  const textareaRef = useRef(null);
  const hasLoadedRef = useRef(null);
  const overlayRef = useRef(null);

  const navigate = useNavigate();
  const hasEnoughCredits = useEntitlementsStore(state => state.hasEnoughCredits);
  const credits = useEntitlementsStore(state => state.credits);
  const storedPlanets = useStore(state => state.userPlanets);
  const storedAspects = useStore(state => state.userAspects);

  const config = HISTORY_CONFIG[contentType];
  const planets = birthChart?.planets || storedPlanets || [];
  const aspects = birthChart?.aspects || storedAspects || [];

  const resolvedPeriod = useMemo(() => {
    if (horoscopePeriod === 'today') return 'daily';
    if (horoscopePeriod === 'week') return 'weekly';
    if (horoscopePeriod === 'month') return 'monthly';
    return 'weekly';
  }, [horoscopePeriod]);

  // Load chat history when panel opens
  useEffect(() => {
    if (!isOpen || !contentId || !config) return;
    if (hasLoadedRef.current === contentId) return;

    const loadHistory = async () => {
      setLoadingHistory(true);
      try {
        const history = await config.fetchHistory(contentId, 50);
        const historyArray = Array.isArray(history)
          ? history
          : Array.isArray(history?.chatHistory)
            ? history.chatHistory
            : [];
        if (historyArray.length > 0) {
          const mapped = historyArray.map((msg, idx) => ({
            id: msg.id || msg._id || `${contentId}-history-${idx}`,
            role: msg.role,
            content: msg.content,
            timestamp: msg.timestamp,
            selectedElements: msg.metadata?.selectedElements || msg.metadata?.selectedAspects || null
          }));
          setMessages(prev => (prev.length > 0 ? prev : mapped));
        }
      } catch (err) {
        console.error('Error loading chat history:', err);
      } finally {
        setLoadingHistory(false);
        hasLoadedRef.current = contentId;
      }
    };

    loadHistory();
  }, [isOpen, contentId, config]);

  // Reset state when contentId changes
  useEffect(() => {
    hasLoadedRef.current = null;
    setMessages([]);
    setSelectedElements([]);
    setSelectionError(null);
    setOverlayOpen(false);
  }, [contentId, contentType]);

  useEffect(() => {
    setActivePeriod(resolvedPeriod);
  }, [resolvedPeriod]);

  // Clear search when overlay closes
  useEffect(() => {
    if (!overlayOpen) setOverlaySearch('');
  }, [overlayOpen]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus textarea when panel opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => textareaRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // Escape key handler
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (overlayOpen) {
          setOverlayOpen(false);
        } else {
          onClose();
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, overlayOpen]);

  // Close overlay on outside click
  useEffect(() => {
    if (!overlayOpen) return;
    const handleClickOutside = (e) => {
      if (overlayRef.current && !overlayRef.current.contains(e.target)) {
        setOverlayOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [overlayOpen]);

  // Prevent body scroll when panel is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const positionsData = useMemo(() => {
    return planets
      .filter(planet => !['South Node', 'Part of Fortune'].includes(planet.name))
      .map(planet => formatPositionData(planet));
  }, [planets]);

  const aspectsData = useMemo(() => {
    return aspects.map(aspect => {
      const planet1Data = findPlanetData(aspect.aspectedPlanet, planets);
      const planet2Data = findPlanetData(aspect.aspectingPlanet, planets);
      if (!planet1Data || !planet2Data) return null;
      return formatAspectData(aspect, planet1Data, planet2Data);
    }).filter(Boolean);
  }, [aspects, planets]);

  const filteredBirthchartElements = useMemo(() => {
    const positions = positionsData.map(p => ({ ...p, key: p.code, payload: p }));
    const aspectItems = aspectsData.map(a => ({ ...a, key: a.code, payload: a }));
    if (birthchartFilter === 'positions') return positions;
    if (birthchartFilter === 'aspects') return aspectItems;
    return [...positions, ...aspectItems];
  }, [positionsData, aspectsData, birthchartFilter]);

  const relationshipElements = useMemo(() => {
    if (!Array.isArray(relationshipScoredItems)) return [];
    return relationshipScoredItems.map((item, index) => ({
      group: 'relationship',
      type: item.type || item.source || 'relationship',
      key: `${item.code || item.id || item.source || 'rel'}-${index}`,
      label: item.description || item.reason || item.label || 'Relationship element',
      meta: item.source || item.category || '',
      payload: item
    }));
  }, [relationshipScoredItems]);

  const filteredRelationshipElements = useMemo(() => {
    let filtered;
    if (relationshipFilter === 'all') {
      filtered = [...relationshipElements];
    } else {
      filtered = relationshipElements.filter(element => {
        const source = (element.payload?.source || element.meta || '').toLowerCase();
        if (relationshipFilter === 'synastry') return source.includes('synastry');
        if (relationshipFilter === 'composite') return source.includes('composite');
        if (relationshipFilter === 'placements') return source.includes('houseplacement');
        return true;
      });
    }
    // Sort by badge type so section dividers can group cleanly
    const getOrder = (src) => {
      if (src.includes('composite')) return 1;
      if (src.includes('houseplacement')) return 2;
      return 0; // synastry aspects
    };
    filtered.sort((a, b) => {
      const aSource = (a.payload?.source || a.meta || '').toLowerCase();
      const bSource = (b.payload?.source || b.meta || '').toLowerCase();
      return getOrder(aSource) - getOrder(bSource);
    });
    return filtered;
  }, [relationshipElements, relationshipFilter]);

  const filteredTransits = useMemo(() => {
    if (!transitWindows || transitWindows.length === 0) return [];

    const now = new Date();
    let start;
    let end;

    if (activePeriod === 'daily') {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
      end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    } else if (activePeriod === 'monthly') {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    } else {
      const monday = new Date(now);
      monday.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1));
      monday.setHours(0, 0, 0, 0);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      sunday.setHours(23, 59, 59, 999);
      start = monday;
      end = sunday;
    }

    return transitWindows
      .filter(transit => {
        const transitStart = new Date(transit.start);
        const transitEnd = new Date(transit.end);
        const inRange = transitStart <= end && transitEnd >= start;
        const matchesType = transitTypeFilter === 'all' || transit.type === transitTypeFilter;
        return inRange && matchesType;
      });
  }, [transitWindows, activePeriod, transitTypeFilter]);

  const transitElements = useMemo(() => {
    return filteredTransits.map((transit, index) => {
      const labelParts = [
        transit.transitingPlanet,
        transit.aspect,
        transit.targetPlanet
      ].filter(Boolean);
      return {
        group: 'horoscope',
        type: 'transit',
        key: transit.id || `${transit.transitingPlanet}-${transit.aspect}-${transit.targetPlanet}-${index}`,
        label: labelParts.join(' '),
        meta: transit.description || '',
        payload: formatTransitEvent(transit)
      };
    });
  }, [filteredTransits]);

  const selectableElements = useMemo(() => {
    if (contentType === 'birthchart' || contentType === 'analysis') {
      return filteredBirthchartElements;
    }
    if (contentType === 'relationship') {
      return filteredRelationshipElements;
    }
    if (contentType === 'horoscope') {
      return transitElements;
    }
    return [];
  }, [contentType, filteredBirthchartElements, filteredRelationshipElements, transitElements]);

  const filteredOverlayElements = useMemo(() => {
    if (!overlaySearch.trim()) return selectableElements;
    const query = overlaySearch.toLowerCase();
    return selectableElements.filter(el =>
      (el.label || el.description || '').toLowerCase().includes(query)
    );
  }, [selectableElements, overlaySearch]);

  const hasContextData = useMemo(() => {
    if (contentType === 'birthchart' || contentType === 'analysis') {
      return positionsData.length > 0 || aspectsData.length > 0;
    }
    if (contentType === 'relationship') {
      return relationshipElements.length > 0;
    }
    if (contentType === 'horoscope') {
      return transitWindows && transitWindows.length > 0;
    }
    return false;
  }, [contentType, positionsData, aspectsData, relationshipElements, transitWindows]);

  const getActiveFilter = useCallback(() => {
    if (contentType === 'birthchart' || contentType === 'analysis') return birthchartFilter;
    if (contentType === 'relationship') return relationshipFilter;
    if (contentType === 'horoscope') return transitTypeFilter;
    return 'all';
  }, [contentType, birthchartFilter, relationshipFilter, transitTypeFilter]);

  const setActiveFilterCb = useCallback((value) => {
    if (contentType === 'birthchart' || contentType === 'analysis') setBirthchartFilter(value);
    else if (contentType === 'relationship') setRelationshipFilter(value);
    else if (contentType === 'horoscope') setTransitTypeFilter(value);
  }, [contentType]);

  const isSelected = useCallback((elementKey) => {
    return selectedElements.some(el => el.key === elementKey);
  }, [selectedElements]);

  const handleToggleElement = useCallback((element) => {
    setSelectionError(null);

    if (isSelected(element.key)) {
      setSelectedElements(prev => prev.filter(el => el.key !== element.key));
      return;
    }

    if (selectedElements.length >= MAX_SELECTIONS) {
      setSelectionError(`Select up to ${MAX_SELECTIONS} items.`);
      return;
    }

    setSelectedElements(prev => [...prev, element]);

    // Auto-close overlay when max selections reached
    if (selectedElements.length + 1 >= MAX_SELECTIONS) {
      setOverlayOpen(false);
    }
  }, [isSelected, selectedElements.length]);

  const clearSelections = useCallback(() => {
    setSelectedElements([]);
    setSelectionError(null);
  }, []);

  const removeSelection = useCallback((key) => {
    setSelectedElements(prev => prev.filter(el => el.key !== key));
    setSelectionError(null);
  }, []);

  const handleSendMessage = useCallback(async () => {
    const trimmedMessage = inputMessage.trim();
    const hasSelection = selectedElements.length > 0;
    if ((!trimmedMessage && !hasSelection) || loading || !config) return;

    if (!contentId) {
      setError('Missing chat context. Please refresh and try again.');
      return;
    }

    if (!hasEnoughCredits(1)) {
      setShowPaywall(true);
      return;
    }

    const userMessage = trimmedMessage;
    setInputMessage('');
    setError(null);
    setShowPaywall(false);

    setMessages(prev => [...prev, {
      role: 'user',
      content: userMessage || 'Selected context',
      selectedElements: hasSelection ? selectedElements : null,
      timestamp: new Date().toISOString(),
    }]);

    setLoading(true);

    try {
      let response;
      let responseText = '';

      if (contentType === 'birthchart' || contentType === 'analysis') {
        const requestBody = {};
        if (userMessage) {
          requestBody.message = userMessage;
          requestBody.query = userMessage;
        }
        if (hasSelection) {
          requestBody.selectedAspects = selectedElements.map(el => el.payload || el);
        }
        response = await enhancedChatForUserBirthChart(contentId, requestBody);
        responseText = response?.response || response?.answer || '';
      } else if (contentType === 'relationship') {
        const scoredItems = hasSelection ? selectedElements.map(el => el.payload || el) : [];
        response = await enhancedChatForRelationship(contentId, userMessage || '', scoredItems);
        responseText = response?.answer || response?.response || '';
      } else if (contentType === 'horoscope') {
        const requestBody = { period: activePeriod };
        if (userMessage) {
          requestBody.query = userMessage;
        }
        if (hasSelection) {
          requestBody.selectedTransits = selectedElements.map(el => el.payload || el);
        }
        response = await generateCustomHoroscope(contentId, requestBody);
        const payload = response?.horoscope || response;
        responseText = payload?.text || payload?.interpretation || response?.response || '';
      }

      if (responseText) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: responseText,
          timestamp: new Date().toISOString(),
        }]);
        setSelectedElements([]);
        setSelectionError(null);
      } else if (response?.error) {
        throw new Error(response.error);
      } else {
        throw new Error('No response received');
      }
    } catch (err) {
      console.error('Error sending message:', err);

      if (err.status === 403 || err.message?.includes('403')) {
        setShowPaywall(true);
      }

      setError(err.message || 'Failed to send message');
      setMessages(prev => prev.slice(0, -1));
      setInputMessage(userMessage);
    } finally {
      setLoading(false);
    }
  }, [
    inputMessage,
    loading,
    config,
    contentId,
    contentType,
    hasEnoughCredits,
    selectedElements,
    activePeriod
  ]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestedClick = (question) => {
    setInputMessage(question);
    textareaRef.current?.focus();
  };

  if (!isOpen) return null;

  const canSend = !loading && (inputMessage.trim().length > 0 || selectedElements.length > 0);
  const activeFilter = getActiveFilter();
  const filterOptions = getFilterOptions(contentType);
  const totalCount = selectableElements.length;
  const shownCount = filteredOverlayElements.length;

  return (
    <div className="ask-panel-backdrop" onClick={onClose}>
      <div
        ref={panelRef}
        className={`ask-panel ${isOpen ? 'ask-panel--open' : ''}`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="ask-panel__header">
          <div className="ask-panel__header-text">
            <div className="ask-panel__title">Ask Stellium</div>
            {contextLabel && (
              <div className="ask-panel__context">{contextLabel}</div>
            )}
          </div>
          <button className="ask-panel__close" onClick={onClose} aria-label="Close panel">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Compact Context Bar */}
        {hasContextData && (
          <div className="ask-panel__compact-context" ref={overlayRef}>
            <div className="ask-panel__compact-bar">
              <button
                className={`ask-panel__context-trigger ${overlayOpen ? 'ask-panel__context-trigger--open' : ''} ${selectedElements.length > 0 ? 'ask-panel__context-trigger--has-selection' : ''}`}
                onClick={() => setOverlayOpen(!overlayOpen)}
              >
                Context{selectedElements.length > 0 && ` (${selectedElements.length})`}
                <span className={`ask-panel__chevron ${overlayOpen ? 'ask-panel__chevron--open' : ''}`}>
                  &#9662;
                </span>
              </button>
              <div className="ask-panel__compact-right">
                <span className="ask-panel__selection-count">
                  {selectedElements.length}/{MAX_SELECTIONS}
                </span>
                {selectedElements.length > 0 && (
                  <button className="ask-panel__selection-clear-inline" onClick={clearSelections}>
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Overlay — floats over messages area */}
            {overlayOpen && (
              <div className="ask-panel__items-overlay">
                <div className="ask-panel__overlay-header">
                  <div className="ask-panel__overlay-tabs">
                    {filterOptions.map(option => (
                      <button
                        key={option.value}
                        className={`ask-panel__overlay-tab ${activeFilter === option.value ? 'ask-panel__overlay-tab--active' : ''}`}
                        onClick={() => setActiveFilterCb(option.value)}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                  <span className="ask-panel__overlay-count">
                    {overlaySearch.trim() && shownCount !== totalCount
                      ? `${shownCount} of ${totalCount}`
                      : totalCount
                    }
                  </span>
                </div>
                <div className="ask-panel__overlay-search">
                  <input
                    type="text"
                    value={overlaySearch}
                    onChange={(e) => setOverlaySearch(e.target.value)}
                    placeholder="Search..."
                    className="ask-panel__search-input"
                  />
                  {overlaySearch && (
                    <button
                      className="ask-panel__search-clear"
                      onClick={() => setOverlaySearch('')}
                      aria-label="Clear search"
                    >
                      &times;
                    </button>
                  )}
                </div>
                {selectionError && (
                  <div className="ask-panel__overlay-error">{selectionError}</div>
                )}
                <div className="ask-panel__overlay-items-wrap">
                  <div className="ask-panel__overlay-items">
                    {(() => {
                      // Check if relationship items have mixed badge types (for section dividers)
                      const showDividers = contentType === 'relationship' && filteredOverlayElements.length > 1 &&
                        new Set(filteredOverlayElements.map(el => getCategoryBadgeInfo(contentType, el).label)).size > 1;

                      return filteredOverlayElements.map((element, index) => {
                        const badge = getCategoryBadgeInfo(contentType, element);
                        const key = element.key || element.code;
                        const prevBadge = index > 0 ? getCategoryBadgeInfo(contentType, filteredOverlayElements[index - 1]) : null;
                        const sectionHeader = showDividers && (!prevBadge || prevBadge.label !== badge.label);

                        return (
                          <React.Fragment key={key}>
                            {sectionHeader && (
                              <div className="ask-panel__section-divider">{badge.label}</div>
                            )}
                            <button
                              className={`ask-panel__item-row ${isSelected(key) ? 'ask-panel__item-row--selected' : ''}`}
                              onClick={() => handleToggleElement({ ...element, key })}
                            >
                              <div className="ask-panel__item-label">
                                {element.label}
                              </div>
                              {contentType === 'horoscope' && element.payload && (
                                <div className="ask-panel__item-sublabel">
                                  {formatTransitDateRange(element.payload)}
                                </div>
                              )}
                              <span className={`ask-panel__item-badge ${badge.colorClass}`}>
                                {badge.label}
                              </span>
                            </button>
                          </React.Fragment>
                        );
                      });
                    })()}
                    {filteredOverlayElements.length === 0 && (
                      <div className="ask-panel__selection-empty">
                        {overlaySearch.trim() ? 'No items match your search.' : 'No items match this filter.'}
                      </div>
                    )}
                  </div>
                  {filteredOverlayElements.length > 6 && (
                    <div className="ask-panel__overlay-fade" />
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Messages */}
        <div className="ask-panel__messages">
          {loadingHistory ? (
            <div className="ask-panel__loading">
              <div className="loading-spinner"></div>
              <p>Loading chat history...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="ask-panel__welcome">
              <div className="ask-panel__welcome-icon">&#10024;</div>
              <h3>Ask Stellium</h3>
              <p>{placeholderText || 'Ask questions and get personalized insights.'}</p>
              {suggestedQuestions && suggestedQuestions.length > 0 && (
                <div className="ask-panel__suggestions">
                  <p className="ask-panel__suggestions-label">Try asking:</p>
                  {suggestedQuestions.map((q, i) => (
                    <span
                      key={i}
                      className="ask-panel__suggestion"
                      onClick={() => handleSuggestedClick(q)}
                    >
                      {q}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <>
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`ask-panel__message ${msg.role === 'user' ? 'ask-panel__message--user' : 'ask-panel__message--assistant'}`}
                >
                  {msg.role === 'user' && msg.selectedElements && msg.selectedElements.length > 0 && (
                    <div className="ask-panel__selected-summary">
                      {msg.selectedElements.slice(0, 3).map((element, idx) => (
                        <span key={idx} className="ask-panel__selected-chip">
                          {element.label || element.description || element.code}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="ask-panel__message-content">
                    {msg.content.split('\n').map((paragraph, pIndex) => (
                      paragraph.trim() && <p key={pIndex}>{paragraph}</p>
                    ))}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="ask-panel__message ask-panel__message--assistant">
                  <div className="ask-panel__message-content ask-panel__typing">
                    <span className="typing-dot"></span>
                    <span className="typing-dot"></span>
                    <span className="typing-dot"></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="ask-panel__error">{error}</div>
        )}

        {/* Insufficient Credits Modal */}
        <InsufficientCreditsModal
          isOpen={showPaywall}
          onClose={() => setShowPaywall(false)}
          creditsNeeded={1}
          creditsAvailable={credits.total}
          onBuyCredits={() => { setShowPaywall(false); navigate('/pricingTable'); }}
          onSubscribe={() => { setShowPaywall(false); navigate('/pricingTable'); }}
        />

        {/* Input with inline chips */}
        <div className="ask-panel__credit-cost">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
          <span>1 credit per message</span>
          <span className="ask-panel__credit-cost-remaining">({credits.total} remaining)</span>
        </div>
        <div className="ask-panel__input">
          <div className="ask-panel__input-wrapper">
            {selectedElements.length > 0 && (
              <div className="ask-panel__context-chips">
                {selectedElements.map((el, idx) => (
                  <span key={idx} className="ask-panel__context-chip">
                    {el.label || el.description || el.code}
                    <button
                      className="ask-panel__chip-dismiss"
                      onClick={() => removeSelection(el.key)}
                      aria-label="Remove"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            )}
            <textarea
              ref={textareaRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={placeholderText || 'Ask a question...'}
              rows={2}
              disabled={loading}
            />
          </div>
          <button
            className="ask-panel__send"
            onClick={handleSendMessage}
            disabled={!canSend}
          >
            {loading ? '...' : '\u2192'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AskStelliumPanel;
