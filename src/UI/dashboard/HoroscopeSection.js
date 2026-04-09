import React, { useState, useEffect, useCallback } from 'react';
import HoroscopeContent from './horoscope/HoroscopeContent';
import LockedContent from '../shared/LockedContent';

import {
  getTransitWindows,
  generateDailyHoroscope,
  generateWeeklyHoroscope,
  generateMonthlyHoroscope
} from '../../Utilities/api';
import {
  formatLocalDateParam,
  getUtcWeekStartDateString,
  getUtcMonthStartDateString,
  isCurrentHoroscopeForPeriod
} from '../../Utilities/horoscopeDates';
import './HoroscopeSection.css';

function HoroscopeSection({ userId, user, entitlements }) {
  // Current time period selection
  const [timePeriod, setTimePeriod] = useState('today');

  // Transit windows state
  const [transitWindows, setTransitWindows] = useState([]);
  const [transitLoading, setTransitLoading] = useState(true);
  const [transitError, setTransitError] = useState(null);

  // Horoscope cache
  const [horoscopeCache, setHoroscopeCache] = useState({
    today: null,
    week: null,
    month: null
  });

  // Per-period loading states
  const [loadingStates, setLoadingStates] = useState({
    today: false,
    week: false,
    month: false
  });

  // Per-period error states
  const [errors, setErrors] = useState({
    today: null,
    week: null,
    month: null
  });

  // Retry attempts tracking
  const [retryAttempts, setRetryAttempts] = useState({
    today: 0,
    week: 0,
    month: 0
  });

  const getPeriodStartDate = useCallback((period) => {
    const today = formatLocalDateParam();

    switch (period) {
      case 'today':
        return today;
      case 'week':
        return getUtcWeekStartDateString(today);
      case 'month':
        return getUtcMonthStartDateString(today);
      default:
        throw new Error(`Unknown period: ${period}`);
    }
  }, []);

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
    return Math.min(1000 * Math.pow(3, attemptNumber), 10000);
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

  // Fetch horoscope for a specific period
  const fetchHoroscope = useCallback(async (period, isRetry = false, attemptNumber = 0) => {
    if (!userId) return;

    // Skip if already loaded and not a retry
    if (!isRetry && horoscopeCache[period]) return;

    // Check access for locked periods
    if (period === 'today' && !entitlements?.canAccessDaily) return;

    setLoadingStates(prev => ({ ...prev, [period]: true }));
    if (isRetry) {
      setErrors(prev => ({ ...prev, [period]: null }));
    }

    try {
      let response;

      switch (period) {
        case 'today':
          response = await withTimeout(generateDailyHoroscope(userId, getPeriodStartDate(period)));
          break;
        case 'week':
          response = await withTimeout(generateWeeklyHoroscope(userId));
          break;
        case 'month':
          response = await withTimeout(generateMonthlyHoroscope(userId));
          break;
        default:
          throw new Error(`Unknown period: ${period}`);
      }

      if (!response.success) {
        throw new Error('Failed to fetch horoscope');
      }

      // Daily still uses an explicit client-supplied date anchor. Weekly/monthly now let the
      // server resolve the current period, so rejecting those responses from the client side
      // would reintroduce clock-skew bugs that the backend patch is designed to avoid.
      if (period === 'today' && !isCurrentHoroscopeForPeriod(period, response.horoscope)) {
        throw new Error(
          `Received stale ${period} horoscope starting ${response.horoscope?.startDate || 'unknown'}`
        );
      }

      setHoroscopeCache(prev => ({
        ...prev,
        [period]: response.horoscope
      }));
      setRetryAttempts(prev => ({ ...prev, [period]: 0 }));
      setErrors(prev => ({ ...prev, [period]: null }));
    } catch (err) {
      console.error(`Error fetching ${period} horoscope:`, err);

      const currentAttempts = retryAttempts[period] || attemptNumber;
      const maxRetries = 3;

      if (currentAttempts < maxRetries) {
        const delay = getRetryDelay(currentAttempts);
        console.log(`Retrying ${period} horoscope in ${delay}ms (attempt ${currentAttempts + 1}/${maxRetries})`);

        setRetryAttempts(prev => ({ ...prev, [period]: currentAttempts + 1 }));

        setTimeout(() => {
          fetchHoroscope(period, true, currentAttempts + 1);
        }, delay);
      } else {
        setErrors(prev => ({
          ...prev,
          [period]: `Failed to load horoscope: ${err.message}`
        }));
      }
    } finally {
      setLoadingStates(prev => ({ ...prev, [period]: false }));
    }
  }, [userId, horoscopeCache, retryAttempts, entitlements?.canAccessDaily, getPeriodStartDate]);

  // Handle time period change
  const handleTimePeriodChange = useCallback((newPeriod) => {
    setTimePeriod(newPeriod);

    // Fetch horoscope if not already loaded
    if (!horoscopeCache[newPeriod] && !loadingStates[newPeriod]) {
      fetchHoroscope(newPeriod);
    }
  }, [horoscopeCache, loadingStates, fetchHoroscope]);

  // Retry handler
  const handleRetry = useCallback(() => {
    setRetryAttempts(prev => ({ ...prev, [timePeriod]: 0 }));
    fetchHoroscope(timePeriod, true);
  }, [timePeriod, fetchHoroscope]);

  // Load handler
  const handleLoad = useCallback(() => {
    fetchHoroscope(timePeriod);
  }, [timePeriod, fetchHoroscope]);

  // Refresh handler
  const handleRefresh = useCallback(() => {
    // Clear cache for current period and refetch
    setHoroscopeCache(prev => ({ ...prev, [timePeriod]: null }));
    setRetryAttempts(prev => ({ ...prev, [timePeriod]: 0 }));
    fetchHoroscope(timePeriod, true);
  }, [timePeriod, fetchHoroscope]);

  // Auto-load today's horoscope on mount
  useEffect(() => {
    if (userId && !horoscopeCache.today && !loadingStates.today) {
      fetchHoroscope('today');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // Check if current period is locked
  const isDailyLocked = timePeriod === 'today' && !entitlements?.canAccessDaily;

  // Get current horoscope data
  const currentHoroscope = horoscopeCache[timePeriod];
  const isLoading = loadingStates[timePeriod] || transitLoading;
  const error = errors[timePeriod] || transitError;

  return (
    <div className="horoscope-section">
      {isDailyLocked ? (
        <HoroscopeContent
          timePeriod={timePeriod}
          onTimePeriodChange={handleTimePeriodChange}
          horoscope={null}
          loading={false}
          error={null}
          onRetry={handleRetry}
          onLoad={handleLoad}
          onRefresh={handleRefresh}
          userId={userId}
          transitWindows={transitWindows}
          lockedContent={
            <LockedContent
              title="Daily Horoscope"
              description="Get personalized daily insights based on your exact birth chart."
              features={[
                'Daily planetary influence readings',
                'Personalized energy forecasts',
                'Key themes for your day'
              ]}
              ctaText="Available with Plus"
            />
          }
        />
      ) : (
        <HoroscopeContent
          timePeriod={timePeriod}
          onTimePeriodChange={handleTimePeriodChange}
          horoscope={currentHoroscope}
          loading={isLoading}
          error={error}
          onRetry={handleRetry}
          onLoad={handleLoad}
          onRefresh={handleRefresh}
          userId={userId}
          transitWindows={transitWindows}
        />
      )}
    </div>
  );
}

export default HoroscopeSection;
