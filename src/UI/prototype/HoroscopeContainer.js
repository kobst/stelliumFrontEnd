import React, { useState, useMemo, useEffect } from 'react';
import { generateWeeklyHoroscope, generateMonthlyHoroscope, generateCustomHoroscope, generateDailyHoroscope } from '../../Utilities/api';
import './HoroscopeContainer.css';

const HoroscopeContainer = ({ transitWindows = [], loading = false, error = null, userId }) => {
  const [activeTab, setActiveTab] = useState('today');
  const [showTransits, setShowTransits] = useState(true);
  const [selectedTransits, setSelectedTransits] = useState(new Set());
  const [customHoroscope, setCustomHoroscope] = useState(null);
  const [generatingCustom, setGeneratingCustom] = useState(false);
  const [customHoroscopeError, setCustomHoroscopeError] = useState(null);
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

  // Helper function to get horoscope for a specific period
  const getHoroscopeForPeriod = async (userId, startDate, type) => {
    try {
      let response;
      switch (type) {
        case 'daily':
          response = await generateDailyHoroscope(userId, startDate);
          break;
        case 'weekly':
          response = await generateWeeklyHoroscope(userId, startDate);
          break;
        case 'monthly':
          response = await generateMonthlyHoroscope(userId, startDate);
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

  // Fetch all horoscopes when component mounts
  useEffect(() => {
    const fetchAllHoroscopes = async () => {
      if (!userId) return;
      
      setHoroscopeLoading(true);
      setHoroscopeError(null);
      
      try {
        // Get start dates for all periods
        const todayStart = getTodayRange().start;
        const tomorrowStart = getTomorrowRange().start;
        const thisWeekStart = getCurrentWeekRange().start;
        const nextWeekStart = getNextWeekRange().start;
        const thisMonthStart = getCurrentMonthRange().start;
        const nextMonthStart = getNextMonthRange().start;

        // Fetch all horoscopes in parallel
        const [
          todayHoroscope,
          tomorrowHoroscope,
          thisWeekHoroscope,
          nextWeekHoroscope,
          thisMonthHoroscope,
          nextMonthHoroscope
        ] = await Promise.all([
          getHoroscopeForPeriod(userId, todayStart.toISOString().split('T')[0], 'daily'),
          getHoroscopeForPeriod(userId, tomorrowStart.toISOString().split('T')[0], 'daily'),
          getHoroscopeForPeriod(userId, thisWeekStart, 'weekly'),
          getHoroscopeForPeriod(userId, nextWeekStart, 'weekly'),
          getHoroscopeForPeriod(userId, thisMonthStart, 'monthly'),
          getHoroscopeForPeriod(userId, nextMonthStart, 'monthly')
        ]);

        // Update cache with all horoscopes
        setHoroscopeCache({
          today: todayHoroscope,
          tomorrow: tomorrowHoroscope,
          thisWeek: thisWeekHoroscope,
          nextWeek: nextWeekHoroscope,
          thisMonth: thisMonthHoroscope,
          nextMonth: nextMonthHoroscope
        });
      } catch (error) {
        console.error('Error fetching horoscopes:', error);
        setHoroscopeError(error.message);
      } finally {
        setHoroscopeLoading(false);
      }
    };

    fetchAllHoroscopes();
  }, [userId]);

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

  // Add new function to generate custom horoscope
  const handleGenerateCustomHoroscope = async () => {
    if (selectedTransits.size === 0) {
      setCustomHoroscopeError('Please select at least one transit event');
      return;
    }

    setGeneratingCustom(true);
    setCustomHoroscopeError(null);

    try {
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

      const response = await generateCustomHoroscope(userId, selectedTransitEvents);
      if (response.success) {
        setCustomHoroscope(response.horoscope);
      } else {
        throw new Error('Failed to generate custom horoscope');
      }
    } catch (error) {
      console.error('Error generating custom horoscope:', error);
      setCustomHoroscopeError(error.message);
    } finally {
      setGeneratingCustom(false);
    }
  };

  if (loading || horoscopeLoading) {
    return (
      <div className="horoscope-container">
        <div className="loading-message">Loading horoscope data...</div>
      </div>
    );
  }

  if (error || horoscopeError) {
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
          className={`tab-button ${activeTab === 'today' ? 'active' : ''}`}
          onClick={() => setActiveTab('today')}
        >
          Today
        </button>
        <button 
          className={`tab-button ${activeTab === 'tomorrow' ? 'active' : ''}`}
          onClick={() => setActiveTab('tomorrow')}
        >
          Tomorrow
        </button>
        <button 
          className={`tab-button ${activeTab === 'thisWeek' ? 'active' : ''}`}
          onClick={() => setActiveTab('thisWeek')}
        >
          This Week
        </button>
        <button 
          className={`tab-button ${activeTab === 'nextWeek' ? 'active' : ''}`}
          onClick={() => setActiveTab('nextWeek')}
        >
          Next Week
        </button>
        <button 
          className={`tab-button ${activeTab === 'thisMonth' ? 'active' : ''}`}
          onClick={() => setActiveTab('thisMonth')}
        >
          This Month
        </button>
        <button 
          className={`tab-button ${activeTab === 'nextMonth' ? 'active' : ''}`}
          onClick={() => setActiveTab('nextMonth')}
        >
          Next Month
        </button>
      </div>

      {/* Horoscope Content */}
      <div className="horoscope-content">
        {horoscopeCache[activeTab] && (
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
        )}

        {/* Custom Horoscope Section */}
        {customHoroscope && (
          <div className="custom-horoscope-section">
            <h3>Custom Horoscope</h3>
            <p>{customHoroscope.text}</p>
            <p className="horoscope-date-range">
              {formatDateRange(customHoroscope.startDate, customHoroscope.endDate)}
            </p>
          </div>
        )}

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
                  <div className="transit-actions">
                    <button 
                      className="generate-custom-button"
                      onClick={handleGenerateCustomHoroscope}
                      disabled={selectedTransits.size === 0 || generatingCustom}
                    >
                      {generatingCustom ? 'Generating...' : 'Generate Custom Horoscope'}
                    </button>
                    {customHoroscopeError && (
                      <div className="error-message">{customHoroscopeError}</div>
                    )}
                  </div>
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