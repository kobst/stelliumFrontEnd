import React, { useState, useEffect, useCallback } from 'react';
import TabMenu from '../shared/TabMenu';
import HoroscopeTabContent from './HoroscopeTabContent';
import AskStelliumTab from './AskStelliumTab';
import LockedContent from '../shared/LockedContent';
import TrialBadge from '../shared/TrialBadge';
import {
  getTransitWindows,
  generateDailyHoroscope,
  generateWeeklyHoroscope,
  generateMonthlyHoroscope
} from '../../Utilities/api';
import './HoroscopeSection.css';

function HoroscopeSection({ userId, user, entitlements }) {
  // Transit windows state
  const [transitWindows, setTransitWindows] = useState([]);
  const [transitLoading, setTransitLoading] = useState(true);
  const [transitError, setTransitError] = useState(null);

  // Horoscope cache
  const [horoscopeCache, setHoroscopeCache] = useState({
    today: null,
    thisWeek: null,
    thisMonth: null
  });

  // Per-tab loading states
  const [tabLoadingStates, setTabLoadingStates] = useState({
    today: false,
    thisWeek: false,
    thisMonth: false
  });

  // Per-tab error states
  const [tabErrors, setTabErrors] = useState({
    today: null,
    thisWeek: null,
    thisMonth: null
  });

  // Retry attempts tracking
  const [retryAttempts, setRetryAttempts] = useState({
    today: 0,
    thisWeek: 0,
    thisMonth: 0
  });

  // Date range helpers
  const getTodayRange = () => {
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);
    return { start: startOfDay, end: endOfDay };
  };

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

  const getCurrentMonthRange = () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    startOfMonth.setHours(0, 0, 0, 0);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    endOfMonth.setHours(23, 59, 59, 999);
    return { start: startOfMonth, end: endOfMonth };
  };

  // Helper function to add timeout to promises
  const withTimeout = (promise, timeoutMs = 30000) => {
    return Promise.race([
      promise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), timeoutMs)
      )
    ]);
  };

  // Helper function for retry delay with exponential backoff
  const getRetryDelay = (attemptNumber) => {
    return Math.min(1000 * Math.pow(3, attemptNumber), 10000); // 1s, 3s, 9s, max 10s
  };

  // Fetch transit windows on mount
  useEffect(() => {
    const fetchTransits = async () => {
      if (!userId) return;

      try {
        setTransitLoading(true);
        setTransitError(null);

        const now = new Date();
        const fromDate = new Date(now.getFullYear(), now.getMonth(), 1);
        const toDate = new Date(now.getFullYear(), now.getMonth() + 2, 0);

        const response = await getTransitWindows(
          userId,
          fromDate.toISOString(),
          toDate.toISOString()
        );

        if (response && (response.transitEvents || response.transitToTransitEvents)) {
          const allTransitEvents = [
            ...(response.transitEvents || []),
            ...(response.transitToTransitEvents || [])
          ];
          setTransitWindows(allTransitEvents);
        } else if (Array.isArray(response)) {
          setTransitWindows(response);
        }
      } catch (err) {
        console.error('Error fetching transit windows:', err);
        setTransitError('Failed to load transit data');
      } finally {
        setTransitLoading(false);
      }
    };

    fetchTransits();
  }, [userId]);

  // Fetch horoscope for a specific tab
  const fetchHoroscope = useCallback(async (tab, isRetry = false, attemptNumber = 0) => {
    if (!userId) return;

    // Skip if already loaded and not a retry
    if (!isRetry && horoscopeCache[tab]) return;

    setTabLoadingStates(prev => ({ ...prev, [tab]: true }));
    if (isRetry) {
      setTabErrors(prev => ({ ...prev, [tab]: null }));
    }

    try {
      let startDate;
      let response;

      switch (tab) {
        case 'today':
          startDate = getTodayRange().start.toISOString().split('T')[0];
          response = await withTimeout(generateDailyHoroscope(userId, startDate));
          break;
        case 'thisWeek':
          startDate = getCurrentWeekRange().start;
          response = await withTimeout(generateWeeklyHoroscope(userId, startDate));
          break;
        case 'thisMonth':
          startDate = getCurrentMonthRange().start;
          response = await withTimeout(generateMonthlyHoroscope(userId, startDate));
          break;
        default:
          throw new Error(`Unknown tab: ${tab}`);
      }

      if (!response.success) {
        throw new Error('Failed to fetch horoscope');
      }

      setHoroscopeCache(prev => ({
        ...prev,
        [tab]: response.horoscope
      }));
      setRetryAttempts(prev => ({ ...prev, [tab]: 0 }));
      setTabErrors(prev => ({ ...prev, [tab]: null }));
    } catch (err) {
      console.error(`Error fetching ${tab} horoscope:`, err);

      const currentAttempts = retryAttempts[tab] || attemptNumber;
      const maxRetries = 3;

      if (currentAttempts < maxRetries) {
        // Retry with exponential backoff
        const delay = getRetryDelay(currentAttempts);
        console.log(`Retrying ${tab} horoscope in ${delay}ms (attempt ${currentAttempts + 1}/${maxRetries})`);

        setRetryAttempts(prev => ({ ...prev, [tab]: currentAttempts + 1 }));

        setTimeout(() => {
          fetchHoroscope(tab, true, currentAttempts + 1);
        }, delay);
      } else {
        setTabErrors(prev => ({
          ...prev,
          [tab]: `Failed to load horoscope: ${err.message}`
        }));
      }
    } finally {
      setTabLoadingStates(prev => ({ ...prev, [tab]: false }));
    }
  }, [userId, horoscopeCache, retryAttempts]);

  // Retry handler
  const handleRetry = (tab) => {
    setRetryAttempts(prev => ({ ...prev, [tab]: 0 }));
    fetchHoroscope(tab, true);
  };

  // Load handler (for initial load button click)
  const handleLoad = (tab) => {
    fetchHoroscope(tab);
  };

  // Auto-load today's horoscope on mount
  useEffect(() => {
    if (userId && !horoscopeCache.today && !tabLoadingStates.today) {
      fetchHoroscope('today');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // Locked content for Weekly horoscope
  const LockedWeeklyContent = () => (
    <LockedContent
      title="Weekly Horoscope"
      description="Get deeper insights into your week ahead with comprehensive weekly readings."
      features={[
        'Day-by-day energy forecasts',
        'Key dates and opportunities',
        'Weekly planetary influences'
      ]}
      ctaText="Available with Plus"
    />
  );

  // Locked content for Ask Stellium
  const LockedAskStelliumContent = () => (
    <LockedContent
      title="Ask Stellium"
      description="Get personalized answers about your transits and horoscope from our AI astrologer."
      features={[
        'Ask unlimited questions',
        'Personalized transit insights',
        'Custom horoscope readings'
      ]}
      ctaText="Available with Plus"
    />
  );

  // Weekly tab content with trial badge or locked state
  const WeeklyTabContent = () => {
    if (!entitlements?.canAccessWeekly) {
      return <LockedWeeklyContent />;
    }

    return (
      <div className="horoscope-tab-wrapper">
        {entitlements?.isTrialActive && (
          <div className="trial-banner-inline">
            <TrialBadge text="Unlocked for your first 7 days" />
          </div>
        )}
        <HoroscopeTabContent
          type="weekly"
          horoscope={horoscopeCache.thisWeek}
          loading={tabLoadingStates.thisWeek}
          error={tabErrors.thisWeek}
          onRetry={() => handleRetry('thisWeek')}
          onLoad={() => handleLoad('thisWeek')}
        />
      </div>
    );
  };

  // Ask Stellium content with trial message or locked state
  const AskStelliumContent = () => {
    if (!entitlements?.canAccessAskStelliumHoroscope) {
      return <LockedAskStelliumContent />;
    }

    return (
      <div className="ask-stellium-wrapper">
        {entitlements?.isTrialActive && (
          <div className="trial-message">
            <TrialBadge text="Includes 5 free questions this week" />
          </div>
        )}
        <AskStelliumTab
          userId={userId}
          transitWindows={transitWindows}
        />
      </div>
    );
  };

  // Tab content components
  const horoscopeTabs = [
    {
      id: 'today',
      label: 'Today',
      content: (
        <HoroscopeTabContent
          type="daily"
          horoscope={horoscopeCache.today}
          loading={tabLoadingStates.today}
          error={tabErrors.today}
          onRetry={() => handleRetry('today')}
          onLoad={() => handleLoad('today')}
        />
      )
    },
    {
      id: 'week',
      label: entitlements?.isTrialActive && entitlements?.canAccessWeekly ? (
        <span className="tab-label-with-badge">
          This Week
          <TrialBadge text="Trial" variant="small" />
        </span>
      ) : 'This Week',
      content: <WeeklyTabContent />
    },
    {
      id: 'month',
      label: 'This Month',
      content: (
        <HoroscopeTabContent
          type="monthly"
          horoscope={horoscopeCache.thisMonth}
          loading={tabLoadingStates.thisMonth}
          error={tabErrors.thisMonth}
          onRetry={() => handleRetry('thisMonth')}
          onLoad={() => handleLoad('thisMonth')}
        />
      )
    },
    {
      id: 'chat',
      label: 'Ask Stellium',
      content: <AskStelliumContent />
    }
  ];

  // Handle tab change to trigger loading
  const handleTabChange = (tabId) => {
    const tabMapping = {
      'today': 'today',
      'week': 'thisWeek',
      'month': 'thisMonth'
    };

    const cacheKey = tabMapping[tabId];
    if (cacheKey && !horoscopeCache[cacheKey] && !tabLoadingStates[cacheKey]) {
      fetchHoroscope(cacheKey);
    }
  };

  return (
    <div className="horoscope-section">
      {transitLoading && (
        <div className="horoscope-transit-loading">
          Loading transit data...
        </div>
      )}
      {transitError && (
        <div className="horoscope-transit-error">
          {transitError}
        </div>
      )}
      <TabMenu
        tabs={horoscopeTabs}
        onTabChange={handleTabChange}
      />
    </div>
  );
}

export default HoroscopeSection;
