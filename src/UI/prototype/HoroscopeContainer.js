import React, { useState, useMemo, useEffect } from 'react';
import { generateWeeklyHoroscope, generateMonthlyHoroscope, generateCustomHoroscope, generateDailyHoroscope } from '../../Utilities/api';
import './HoroscopeContainer.css';

const HoroscopeContainer = ({ transitWindows = [], loading = false, error = null, userId }) => {
  const [activeTab, setActiveTab] = useState('today');
  const [showTransits, setShowTransits] = useState(true);
  const [selectedTransits, setSelectedTransits] = useState(new Set());
  const [customHoroscope, setCustomHoroscope] = useState(null);
  const [customCached, setCustomCached] = useState(null);
  const [generatingCustom, setGeneratingCustom] = useState(false);
  const [customHoroscopeError, setCustomHoroscopeError] = useState(null);
  const [customQuery, setCustomQuery] = useState('');
  const [horoscopeCache, setHoroscopeCache] = useState({
    today: null,
    tomorrow: null,
    thisWeek: null,
    nextWeek: null,
    thisMonth: null,
    nextMonth: null
  });
  const [horoscopeLoading, setHoroscopeLoading] = useState(false);
  const [horoscopeError, setHoroscopeError] = useState(null);
  const [loadedTabs, setLoadedTabs] = useState(new Set());
  const [tabLoadingStates, setTabLoadingStates] = useState({
    today: false,
    tomorrow: false,
    thisWeek: false,
    nextWeek: false,
    thisMonth: false,
    nextMonth: false
  });
  const [tabErrors, setTabErrors] = useState({
    today: null,
    tomorrow: null,
    thisWeek: null,
    nextWeek: null,
    thisMonth: null,
    nextMonth: null
  });
  const [retryAttempts, setRetryAttempts] = useState({
    today: 0,
    tomorrow: 0,
    thisWeek: 0,
    nextWeek: 0,
    thisMonth: 0,
    nextMonth: 0
  });

  // Helper function to format dates for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Helper function to format date ranges
  const formatDateRange = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    
    if (startDate.toDateString() === endDate.toDateString()) {
      return formatDate(start);
    }
    
    return `${formatDate(start)} - ${formatDate(end)}`;
  };

  // Helper function to get current week's date range (Monday to Sunday)
  const getCurrentWeekRange = () => {
    const now = new Date();
    const monday = new Date(now);
    monday.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1));
    monday.setHours(0, 0, 0, 0);
    
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);
    
    return { start: monday, end: sunday };
  };

  // Helper function to get next week's date range
  const getNextWeekRange = () => {
    const now = new Date();
    const nextMonday = new Date(now);
    nextMonday.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1) + 7);
    nextMonday.setHours(0, 0, 0, 0);
    
    const nextSunday = new Date(nextMonday);
    nextSunday.setDate(nextMonday.getDate() + 6);
    nextSunday.setHours(23, 59, 59, 999);
    
    return { start: nextMonday, end: nextSunday };
  };

  // Helper function to get current month's date range
  const getCurrentMonthRange = () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    endOfMonth.setHours(23, 59, 59, 999);
    
    return { start: startOfMonth, end: endOfMonth };
  };

  // Helper function to get next month's date range
  const getNextMonthRange = () => {
    const now = new Date();
    const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    startOfNextMonth.setHours(0, 0, 0, 0);
    
    const endOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 2, 0);
    endOfNextMonth.setHours(23, 59, 59, 999);
    
    return { start: startOfNextMonth, end: endOfNextMonth };
  };

  // Helper function to get today's date range
  const getTodayRange = () => {
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);
    
    return { start: startOfDay, end: endOfDay };
  };

  // Helper function to get tomorrow's date range
  const getTomorrowRange = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    
    const startOfTomorrow = new Date(tomorrow);
    startOfTomorrow.setHours(0, 0, 0, 0);
    
    const endOfTomorrow = new Date(tomorrow);
    endOfTomorrow.setHours(23, 59, 59, 999);
    
    return { start: startOfTomorrow, end: endOfTomorrow };
  };

  // Helper function to add timeout to promises
  const withTimeout = (promise, timeoutMs = 15000) => {
    return Promise.race([
      promise,
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), timeoutMs)
      )
    ]);
  };

  // Helper function to calculate retry delay with exponential backoff
  const getRetryDelay = (attemptNumber) => {
    return Math.min(1000 * Math.pow(3, attemptNumber), 10000); // 1s, 3s, 9s, max 10s
  };

  // Helper function to get horoscope for a specific period
  const getHoroscopeForPeriod = async (userId, startDate, type) => {
    try {
      let response;
      switch (type) {
        case 'daily':
          response = await withTimeout(generateDailyHoroscope(userId, startDate));
          break;
        case 'weekly':
          response = await withTimeout(generateWeeklyHoroscope(userId, startDate));
          break;
        case 'monthly':
          response = await withTimeout(generateMonthlyHoroscope(userId, startDate));
          break;
        default:
          throw new Error(`Unknown horoscope type: ${type}`);
      }

      if (!response.success) {
        throw new Error('Failed to fetch horoscope');
      }

      return response.horoscope;
    } catch (error) {
      console.error(`Error getting ${type} horoscope:`, error);
      throw error;
    }
  };

  // UPDATED: Filter transit events based on active tab
  const filteredTransits = useMemo(() => {
    console.log("=== HOROSCOPE FILTERING DEBUG ===");
    console.log("activeTab:", activeTab);
    console.log("transitWindows length:", transitWindows?.length);
    
    if (!transitWindows || transitWindows.length === 0) {
      console.log("No transit events to filter");
      return [];
    }

    let dateRange;
    switch (activeTab) {
      case 'today':
        dateRange = getTodayRange();
        break;
      case 'tomorrow':
        dateRange = getTomorrowRange();
        break;
      case 'thisWeek':
        dateRange = getCurrentWeekRange();
        break;
      case 'nextWeek':
        dateRange = getNextWeekRange();
        break;
      case 'thisMonth':
        dateRange = getCurrentMonthRange();
        break;
      case 'nextMonth':
        dateRange = getNextMonthRange();
        break;
      default:
        dateRange = getCurrentWeekRange();
    }

    console.log("Date range for filtering:", {
      start: dateRange.start,
      end: dateRange.end,
      activeTab
    });

    const filtered = transitWindows.filter(transit => {
      const transitStart = new Date(transit.start);
      const transitEnd = new Date(transit.end);
      
      const overlaps = (transitStart <= dateRange.end && transitEnd >= dateRange.start);
      
      return overlaps;
    }).sort((a, b) => new Date(a.start) - new Date(b.start));

    console.log("Filtered transit events count:", filtered.length);
    
    return filtered;
  }, [transitWindows, activeTab]);

  // Helper function to capitalize aspect names
  const capitalizeAspect = (aspect) => {
    if (!aspect) return 'N/A';
    return aspect.charAt(0).toUpperCase() + aspect.slice(1);
  };

  // Helper function to get aspect color
  const getAspectColor = (aspect) => {
    const aspectColors = {
      conjunction: '#ff6b6b',
      sextile: '#4ecdc4',
      square: '#ff9f43',
      trine: '#26de81',
      opposition: '#fd79a8',
      quincunx: '#a29bfe',
      semisextile: '#74b9ff'
    };
    return aspectColors[aspect] || '#ddd';
  };

  // Helper function to get transit type display text
  const getTransitTypeDisplay = (type) => {
    switch (type) {
      case 'transit-to-natal':
        return 'T→N';
      case 'transit-to-transit':
        return 'T→T';
      case 'moon-phase':
        return 'Moon';
      default:
        return type || 'N/A';
    }
  };

  // Helper function to get transit description
  const getTransitDescription = (transit) => {
    if (transit.description) {
      return transit.description;
    }
    
    let description = `${transit.transitingPlanet}`;
    
    // Add sign information
    if (transit.transitingSigns && transit.transitingSigns.length > 1) {
      description += ` (moving from ${transit.transitingSigns[0]} to ${transit.transitingSigns[transit.transitingSigns.length - 1]})`;
    } else if (transit.transitingSign) {
      description += ` in ${transit.transitingSign}`;
    }
    
    if (transit.type === 'transit-to-natal') {
      description += ` ${transit.aspect || ''} natal ${transit.targetPlanet || ''}`;
      
      // Add natal planet's sign and house
      if (transit.targetSign) {
        description += ` in ${transit.targetSign}`;
      }
      if (transit.targetHouse) {
        description += ` in ${transit.targetHouse}th house`;
      }
    } else if (transit.type === 'transit-to-transit') {
      description += ` ${transit.aspect || ''} ${transit.targetPlanet || ''}`;
      
      // Add target planet's sign and house
      if (transit.targetSign) {
        description += ` in ${transit.targetSign}`;
      }
      if (transit.targetHouse) {
        description += ` in ${transit.targetHouse}th house`;
      }
    }
    
    return description;
  };

  // Fetch horoscope for a specific tab with retry capability
  const fetchHoroscopeForTab = async (tab, isRetry = false, attemptNumber = 0) => {
    if (!userId || (!isRetry && loadedTabs.has(tab) && horoscopeCache[tab])) return;
    
    // Set individual tab loading state
    setTabLoadingStates(prev => ({ ...prev, [tab]: true }));
    setHoroscopeLoading(true);
    
    if (isRetry) {
      setHoroscopeError(null);
      setTabErrors(prev => ({ ...prev, [tab]: null }));
    }
    
    try {
      let startDate;
      let type;
      
      switch (tab) {
        case 'today':
          startDate = getTodayRange().start.toISOString().split('T')[0];
          type = 'daily';
          break;
        case 'tomorrow':
          startDate = getTomorrowRange().start.toISOString().split('T')[0];
          type = 'daily';
          break;
        case 'thisWeek':
          startDate = getCurrentWeekRange().start;
          type = 'weekly';
          break;
        case 'nextWeek':
          startDate = getNextWeekRange().start;
          type = 'weekly';
          break;
        case 'thisMonth':
          startDate = getCurrentMonthRange().start;
          type = 'monthly';
          break;
        case 'nextMonth':
          startDate = getNextMonthRange().start;
          type = 'monthly';
          break;
      }
      
      const horoscope = await getHoroscopeForPeriod(userId, startDate, type);
      
      setHoroscopeCache(prev => ({
        ...prev,
        [tab]: horoscope
      }));
      
      setLoadedTabs(prev => new Set([...prev, tab]));
      setRetryAttempts(prev => ({ ...prev, [tab]: 0 })); // Reset retry count on success
      if (isRetry) {
        setHoroscopeError(null);
      }
    } catch (error) {
      console.error(`Error fetching ${tab} horoscope:`, error);
      
      const currentAttempts = retryAttempts[tab] || attemptNumber;
      const maxRetries = 3;
      
      if (currentAttempts < maxRetries) {
        // Retry with exponential backoff
        const delay = getRetryDelay(currentAttempts);
        console.log(`Retrying ${tab} horoscope in ${delay}ms (attempt ${currentAttempts + 1}/${maxRetries})`);
        
        setRetryAttempts(prev => ({ ...prev, [tab]: currentAttempts + 1 }));
        
        setTimeout(() => {
          fetchHoroscopeForTab(tab, true, currentAttempts + 1);
        }, delay);
      } else {
        // Max retries reached, set error state
        setTabErrors(prev => ({ ...prev, [tab]: `Failed to load ${tab} horoscope: ${error.message}` }));
        setHoroscopeError(`Failed to load ${tab} horoscope: ${error.message}`);
        setLoadedTabs(prev => new Set([...prev, tab])); // Mark as loaded even if failed
      }
    } finally {
      setTabLoadingStates(prev => ({ ...prev, [tab]: false }));
      setHoroscopeLoading(false);
    }
  };

  // Retry function for failed horoscopes
  const retryHoroscope = (tab = activeTab) => {
    setRetryAttempts(prev => ({ ...prev, [tab]: 0 })); // Reset retry count
    fetchHoroscopeForTab(tab, true);
  };

  // Helper function to get tab CSS classes based on state
  const getTabClassName = (tab) => {
    let className = `tab-button ${activeTab === tab ? 'active' : ''}`;
    
    if (tabLoadingStates[tab]) {
      className += ' loading';
    } else if (tabErrors[tab]) {
      className += ' error';
    } else if (horoscopeCache[tab]) {
      className += ' loaded';
    }
    
    return className;
  };

  // Background preloading with priority order
  const startBackgroundPreloading = async () => {
    const priorityOrder = ['today', 'tomorrow', 'thisWeek', 'nextWeek', 'thisMonth', 'nextMonth'];
    const currentIndex = priorityOrder.indexOf(activeTab);
    
    // Create a reordered list starting with current tab
    const orderedTabs = [
      ...priorityOrder.slice(currentIndex),
      ...priorityOrder.slice(0, currentIndex)
    ];
    
    for (let i = 1; i < orderedTabs.length; i++) { // Skip index 0 (current tab)
      const tab = orderedTabs[i];
      
      // Only preload if not already loaded or loading
      if (!loadedTabs.has(tab) && !horoscopeCache[tab] && !tabLoadingStates[tab]) {
        // Add delay between requests to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Check if we should still preload (user might have navigated away)
        if (userId) {
          fetchHoroscopeForTab(tab);
        }
      }
    }
  };

  // Load horoscope when active tab changes
  useEffect(() => {
    if (userId) {
      fetchHoroscopeForTab(activeTab).then(() => {
        // Start background preloading after current tab loads successfully
        startBackgroundPreloading();
      });
    }
  }, [activeTab, userId]); // fetchHoroscopeForTab is defined in this component, not an external dependency

  // Add new function to handle transit selection
  const handleTransitSelection = (transitId) => {
    setSelectedTransits(prev => {
      const newSet = new Set(prev);
      if (newSet.has(transitId)) {
        newSet.delete(transitId);
      } else {
        newSet.add(transitId);
      }
      return newSet;
    });
  };

  // Determine period from active tab
  const getActivePeriod = () => {
    if (activeTab === 'today' || activeTab === 'tomorrow') return 'daily';
    if (activeTab === 'thisWeek' || activeTab === 'nextWeek') return 'weekly';
    if (activeTab === 'thisMonth' || activeTab === 'nextMonth') return 'monthly';
    return 'weekly';
  };

  // Add new function to generate custom/chat/hybrid horoscope
  const handleGenerateCustomHoroscope = async () => {
    const hasQuery = typeof customQuery === 'string' && customQuery.trim().length > 0;
    const selectedTransitEvents = filteredTransits
      .filter((_, index) => selectedTransits.has(index))
      .map(transit => ({
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
      }));

    if (!hasQuery && selectedTransitEvents.length === 0) {
      setCustomHoroscopeError('Enter a question or select at least one transit.');
      return;
    }

    setGeneratingCustom(true);
    setCustomHoroscopeError(null);

    try {
      const period = getActivePeriod();
      // Cap selection to avoid overflow in hybrid mode
      const MAX_EVENTS = 8;
      const cappedEvents = selectedTransitEvents.slice(0, MAX_EVENTS);

      const requestBody = {
        period,
      };
      if (hasQuery) requestBody.query = customQuery.trim();
      if (cappedEvents.length > 0) requestBody.selectedTransits = cappedEvents;

      const response = await generateCustomHoroscope(userId, requestBody);
      // Be flexible with backend shape: allow either { success, horoscope } or direct horoscope response
      const hasSuccess = response && typeof response.success === 'boolean';
      const gotHoroscope = response?.horoscope || (!hasSuccess && response && (response.interpretation || response.text));

      if ((hasSuccess && response.success) || gotHoroscope) {
        const incoming = response?.horoscope || response;
        setCustomHoroscope(incoming);
        setCustomCached(!!(response && response.cached));
        // Clear query only if it was used
        if (hasQuery) setCustomQuery('');
      } else {
        throw new Error(response?.error || 'Failed to generate custom horoscope');
      }
    } catch (error) {
      console.error('Error generating custom horoscope:', error);
      setCustomHoroscopeError(error.message);
    } finally {
      setGeneratingCustom(false);
    }
  };

  if (loading) {
    return (
      <div className="horoscope-container">
        <div className="loading-message">Loading horoscope data...</div>
      </div>
    );
  }

  // Only show full error state if we have no data at all
  const hasAnyData = Object.values(horoscopeCache).some(value => value !== null);
  if ((error || horoscopeError) && !hasAnyData) {
    return (
      <div className="horoscope-container">
        <div className="error-message">Error loading data: {error || horoscopeError}</div>
      </div>
    );
  }

  return (
    <div className="horoscope-container">
      <h2>Horoscope Forecast</h2>
      
      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button 
          className={getTabClassName('today')}
          onClick={() => setActiveTab('today')}
        >
          Today {tabLoadingStates.today && '⏳'} {tabErrors.today && '❌'} {horoscopeCache.today && '✓'}
        </button>
        <button 
          className={getTabClassName('tomorrow')}
          onClick={() => setActiveTab('tomorrow')}
        >
          Tomorrow {tabLoadingStates.tomorrow && '⏳'} {tabErrors.tomorrow && '❌'} {horoscopeCache.tomorrow && '✓'}
        </button>
        <button 
          className={getTabClassName('thisWeek')}
          onClick={() => setActiveTab('thisWeek')}
        >
          This Week {tabLoadingStates.thisWeek && '⏳'} {tabErrors.thisWeek && '❌'} {horoscopeCache.thisWeek && '✓'}
        </button>
        <button 
          className={getTabClassName('nextWeek')}
          onClick={() => setActiveTab('nextWeek')}
        >
          Next Week {tabLoadingStates.nextWeek && '⏳'} {tabErrors.nextWeek && '❌'} {horoscopeCache.nextWeek && '✓'}
        </button>
        <button 
          className={getTabClassName('thisMonth')}
          onClick={() => setActiveTab('thisMonth')}
        >
          This Month {tabLoadingStates.thisMonth && '⏳'} {tabErrors.thisMonth && '❌'} {horoscopeCache.thisMonth && '✓'}
        </button>
        <button 
          className={getTabClassName('nextMonth')}
          onClick={() => setActiveTab('nextMonth')}
        >
          Next Month {tabLoadingStates.nextMonth && '⏳'} {tabErrors.nextMonth && '❌'} {horoscopeCache.nextMonth && '✓'}
        </button>
      </div>

      {/* Partial Error Indicator */}
      {horoscopeError && hasAnyData && (
        <div className="partial-error-notice">
          <p>⚠️ Some horoscopes couldn't be loaded. Switch to other tabs to see available content.</p>
        </div>
      )}

      {/* Horoscope Content */}
      <div className="horoscope-content">
        {tabLoadingStates[activeTab] && !horoscopeCache[activeTab] ? (
          <div className="horoscope-loading">
            <h3>Loading {activeTab === 'today' || activeTab === 'tomorrow' ? 'Daily' : activeTab.includes('Week') ? 'Weekly' : 'Monthly'} Horoscope...</h3>
            <div className="loading-spinner">⏳</div>
            {retryAttempts[activeTab] > 0 && (
              <p className="retry-info">Retry attempt {retryAttempts[activeTab]}/3...</p>
            )}
          </div>
        ) : tabErrors[activeTab] ? (
          <div className="horoscope-error">
            <h3>Failed to Load Horoscope</h3>
            <p>{tabErrors[activeTab]}</p>
            <button 
              className="retry-button"
              onClick={() => retryHoroscope(activeTab)}
              disabled={tabLoadingStates[activeTab]}
            >
              {tabLoadingStates[activeTab] ? 'Retrying...' : 'Try Again'}
            </button>
          </div>
        ) : horoscopeCache[activeTab] ? (
          <div className="horoscope-text">
            <h3>Your {activeTab === 'today' || activeTab === 'tomorrow' ? 'Daily' : activeTab.includes('Week') ? 'Weekly' : 'Monthly'} Horoscope</h3>
            <p>{horoscopeCache[activeTab].text || horoscopeCache[activeTab].interpretation || 'No horoscope content available.'}</p>
            <p className="horoscope-date-range">
              {formatDateRange(horoscopeCache[activeTab].startDate, horoscopeCache[activeTab].endDate)}
            </p>
            
            {/* Daily horoscope key transits */}
            {(activeTab === 'today' || activeTab === 'tomorrow') && horoscopeCache[activeTab].keyTransits && horoscopeCache[activeTab].keyTransits.length > 0 && (
              <div className="key-transits">
                <h4>Key Planetary Influences</h4>
                <ul>
                  {horoscopeCache[activeTab].keyTransits.map((transit, index) => (
                    <li key={index} className="transit-item">
                      <strong>{transit.transitingPlanet}</strong> {transit.aspect} {transit.targetPlanet}
                      <span className="transit-date">
                        (exact: {new Date(transit.exactDate).toLocaleDateString()})
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Weekly/Monthly horoscope key themes */}
            {!(activeTab === 'today' || activeTab === 'tomorrow') && horoscopeCache[activeTab].analysis?.keyThemes && (
              <div className="key-themes">
                <h4>Key Themes</h4>
                <ul>
                  {horoscopeCache[activeTab].analysis.keyThemes.map((theme, index) => (
                    <li key={index}>
                      {theme.transitingPlanet} {theme.aspect} {theme.targetPlanet || ''} 
                      {theme.exactDate && ` (${formatDate(theme.exactDate)})`}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div className="horoscope-placeholder">
            <h3>{activeTab === 'today' || activeTab === 'tomorrow' ? 'Daily' : activeTab.includes('Week') ? 'Weekly' : 'Monthly'} Horoscope</h3>
            <p>Click to load your {activeTab} horoscope</p>
            <button 
              className="load-button" 
              onClick={() => fetchHoroscopeForTab(activeTab)}
              disabled={tabLoadingStates[activeTab]}
            >
              {tabLoadingStates[activeTab] ? 'Loading...' : 'Load Horoscope'}
            </button>
          </div>
        )}

        {/* Custom Horoscope Section */}
        {customHoroscope && (
          <div className="custom-horoscope-section">
            <h3>Custom Horoscope</h3>
            <p>{customHoroscope.text || customHoroscope.interpretation}</p>
            {customHoroscope.startDate && customHoroscope.endDate && (
              <p className="horoscope-date-range">
                {formatDateRange(customHoroscope.startDate, customHoroscope.endDate)}
              </p>
            )}
            <div style={{ marginTop: '8px', color: '#9ca3af' }}>
              {customHoroscope?.metadata?.mode && (
                <span>
                  Mode: {customHoroscope.metadata.mode}
                  {customHoroscope?.metadata?.transitEventCount != null ? ` • ${customHoroscope.metadata.transitEventCount} events` : ''}
                </span>
              )}
              {customCached != null && (
                <span style={{ marginLeft: 12 }}>
                  {customCached ? 'Cached result' : 'Freshly generated'}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Custom Request Panel (always visible) */}
        <div className="custom-request-panel" style={{
          margin: '16px 0',
          padding: '16px',
          background: 'rgba(139, 92, 246, 0.08)',
          border: '1px solid rgba(139, 92, 246, 0.25)',
          borderRadius: 8
        }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#a78bfa' }}>Custom Horoscope Request</h4>
          <textarea
            value={customQuery}
            onChange={(e) => setCustomQuery(e.target.value)}
            placeholder={
              selectedTransits.size > 0
                ? 'Optionally add a question to guide the reading (hybrid mode)'
                : 'Ask a question about this period (chat mode)'
            }
            rows={3}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '6px',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              background: 'rgba(139, 92, 246, 0.08)',
              color: 'white',
              outline: 'none'
            }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 10, flexWrap: 'wrap' }}>
            <div style={{ fontSize: 12, color: '#9ca3af' }}>
              {selectedTransits.size > 0 ? `${selectedTransits.size} transit(s) selected` : 'No transits selected'}
              {` • Period: ${getActivePeriod()}`}
            </div>
            <button 
              className="generate-custom-button"
              onClick={handleGenerateCustomHoroscope}
              disabled={generatingCustom}
            >
              {generatingCustom ? 'Generating...' : 'Generate Custom Horoscope'}
            </button>
            {customHoroscopeError && (
              <div className="error-message">{customHoroscopeError}</div>
            )}
          </div>
        </div>

        {/* Collapsible Transit Section */}
        <div className="transit-section">
          <button 
            className="transit-toggle"
            onClick={() => setShowTransits(!showTransits)}
          >
            {showTransits ? 'Hide' : 'Show'} Transit Details
          </button>
          
          {showTransits && (
            <div className="transit-description-container">
              {filteredTransits.length === 0 ? (
                <div className="no-transits-message">
                  No significant transits found for {
                    activeTab === 'thisWeek' ? 'this week' :
                    activeTab === 'nextWeek' ? 'next week' :
                    activeTab === 'thisMonth' ? 'this month' : 'next month'
                  }.
                </div>
              ) : (
                <>
                  <table className="transit-description-table">
                    <thead>
                      <tr>
                        <th>Select</th>
                        <th>Description</th>
                        <th>Date Range</th>
                        <th>Exact Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTransits.map((transit, index) => (
                        <tr key={index} className="transit-description-row">
                          <td>
                            <input
                              type="checkbox"
                              checked={selectedTransits.has(index)}
                              onChange={() => handleTransitSelection(index)}
                            />
                          </td>
                          <td>{getTransitDescription(transit)}</td>
                          <td>{formatDateRange(transit.start, transit.end)}</td>
                          <td>{formatDate(transit.exact)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HoroscopeContainer;
