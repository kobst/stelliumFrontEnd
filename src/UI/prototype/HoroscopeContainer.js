import React, { useState, useMemo } from 'react';
import './HoroscopeContainer.css';

const HoroscopeContainer = ({ transitWindows = [], loading = false, error = null }) => {
  const [activeTab, setActiveTab] = useState('weekly');

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

  // Helper function to get current week's date range
  const getCurrentWeekRange = () => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // End of week (Saturday)
    
    return { start: startOfWeek, end: endOfWeek };
  };

  // Helper function to get current month's date range
  const getCurrentMonthRange = () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    return { start: startOfMonth, end: endOfMonth };
  };

  // Filter transit windows based on active tab
  const filteredTransits = useMemo(() => {
    if (!transitWindows || transitWindows.length === 0) return [];

    const now = new Date();
    let dateRange;

    if (activeTab === 'weekly') {
      dateRange = getCurrentWeekRange();
    } else {
      dateRange = getCurrentMonthRange();
    }

    return transitWindows.filter(transit => {
      const transitStart = new Date(transit.start);
      const transitEnd = new Date(transit.end);
      
      // Check if transit overlaps with the selected time period
      return (transitStart <= dateRange.end && transitEnd >= dateRange.start);
    }).sort((a, b) => new Date(a.start) - new Date(b.start));
  }, [transitWindows, activeTab]);

  // Helper function to capitalize aspect names
  const capitalizeAspect = (aspect) => {
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
      
      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button 
          className={`tab-button ${activeTab === 'weekly' ? 'active' : ''}`}
          onClick={() => setActiveTab('weekly')}
        >
          This Week
        </button>
        <button 
          className={`tab-button ${activeTab === 'monthly' ? 'active' : ''}`}
          onClick={() => setActiveTab('monthly')}
        >
          This Month
        </button>
      </div>

      {/* Transit Table */}
      <div className="transit-table-container">
        {filteredTransits.length === 0 ? (
          <div className="no-transits-message">
            No significant transits found for this {activeTab === 'weekly' ? 'week' : 'month'}.
          </div>
        ) : (
          <table className="transit-table">
            <thead>
              <tr>
                <th>Date Range</th>
                <th>Transit</th>
                <th>Aspect</th>
                <th>Natal Planet</th>
                <th>Exact Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransits.map((transit, index) => (
                <tr key={index} className="transit-row">
                  <td className="date-range">
                    {formatDateRange(transit.start, transit.end)}
                  </td>
                  <td className="transiting-planet">
                    {transit.transiting}
                  </td>
                  <td className="aspect">
                    <span 
                      className="aspect-badge"
                      style={{ backgroundColor: getAspectColor(transit.aspect) }}
                    >
                      {capitalizeAspect(transit.aspect)}
                    </span>
                  </td>
                  <td className="natal-planet">
                    {transit.natal}
                  </td>
                  <td className="exact-date">
                    {formatDate(transit.exact)}
                  </td>
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