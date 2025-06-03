import React, { useState, useMemo } from 'react';
import './HoroscopeContainer.css';

const HoroscopeContainer = ({ transitWindows = [], loading = false, error = null }) => {
  const [activeTab, setActiveTab] = useState('thisWeek');

  // Helper function to format dates
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

  // UPDATED: Helper function to get current week's date range (Sunday to Saturday)
  const getCurrentWeekRange = () => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // End of week (Saturday)
    endOfWeek.setHours(23, 59, 59, 999);
    
    return { start: startOfWeek, end: endOfWeek };
  };

  // NEW: Helper function to get next week's date range
  const getNextWeekRange = () => {
    const now = new Date();
    const startOfNextWeek = new Date(now);
    startOfNextWeek.setDate(now.getDate() - now.getDay() + 7); // Next Sunday
    startOfNextWeek.setHours(0, 0, 0, 0);
    
    const endOfNextWeek = new Date(startOfNextWeek);
    endOfNextWeek.setDate(startOfNextWeek.getDate() + 6); // Next Saturday
    endOfNextWeek.setHours(23, 59, 59, 999);
    
    return { start: startOfNextWeek, end: endOfNextWeek };
  };

  // UPDATED: Helper function to get current month's date range
  const getCurrentMonthRange = () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    endOfMonth.setHours(23, 59, 59, 999);
    
    return { start: startOfMonth, end: endOfMonth };
  };

  // NEW: Helper function to get next month's date range
  const getNextMonthRange = () => {
    const now = new Date();
    const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    startOfNextMonth.setHours(0, 0, 0, 0);
    
    const endOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 2, 0);
    endOfNextMonth.setHours(23, 59, 59, 999);
    
    return { start: startOfNextMonth, end: endOfNextMonth };
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

  if (loading) {
    return (
      <div className="horoscope-container">
        <div className="loading-message">Loading transit data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="horoscope-container">
        <div className="error-message">Error loading transits: {error}</div>
      </div>
    );
  }

  return (
    <div className="horoscope-container">
      <h2>Transit Forecast</h2>
      
      {/* UPDATED: Tab Navigation with 4 tabs */}
      <div className="tab-navigation">
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

      {/* Transit Description with Date Range and Exact Date */}
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
          <table className="transit-description-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Date Range</th>
                <th>Exact Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransits.map((transit, index) => (
                <tr key={index} className="transit-description-row">
                  <td>{getTransitDescription(transit)}</td>
                  <td>{formatDateRange(transit.start, transit.end)}</td>
                  <td>{formatDate(transit.exact)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default HoroscopeContainer;