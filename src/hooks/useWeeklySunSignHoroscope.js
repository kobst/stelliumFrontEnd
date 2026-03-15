import { useEffect, useMemo, useRef, useState } from 'react';
import { getPublicWeeklyHoroscope } from '../Utilities/api';
import { formatLocalDateParam, getUtcWeekStartDateString } from '../Utilities/horoscopeDates';

const STALE_TIME_MS = 60 * 60 * 1000;
const cache = new Map();

const createCacheKey = (sign, weekKey) => `weekly-horoscope:${sign}:${weekKey}`;

export default function useWeeklySunSignHoroscope(sign, requestedDate) {
  const safeRequestedDate = requestedDate || formatLocalDateParam();
  const weekKey = useMemo(
    () => getUtcWeekStartDateString(safeRequestedDate),
    [safeRequestedDate]
  );
  const cacheKey = useMemo(() => createCacheKey(sign, weekKey), [sign, weekKey]);
  const activeRequestRef = useRef(0);
  const [state, setState] = useState({
    loading: true,
    horoscope: null,
    notReady: false,
    error: '',
    details: null
  });
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const requestId = activeRequestRef.current + 1;
    activeRequestRef.current = requestId;

    const cachedValue = cache.get(cacheKey);
    if (cachedValue && Date.now() - cachedValue.timestamp < STALE_TIME_MS) {
      setState(cachedValue.value);
      return () => {
        cancelled = true;
      };
    }

    setState((current) => ({
      ...current,
      loading: true,
      error: '',
      notReady: false
    }));

    const loadHoroscope = async () => {
      try {
        const result = await getPublicWeeklyHoroscope(sign, safeRequestedDate);
        if (cancelled || activeRequestRef.current !== requestId) {
          return;
        }

        const nextState = result.notReady
          ? {
              loading: false,
              horoscope: null,
              notReady: true,
              error: '',
              details: result.data
            }
          : {
              loading: false,
              horoscope: result.data.horoscope,
              notReady: false,
              error: '',
              details: null
            };

        cache.set(cacheKey, {
          timestamp: Date.now(),
          value: nextState
        });
        setState(nextState);
      } catch (error) {
        if (cancelled || activeRequestRef.current !== requestId) {
          return;
        }

        setState({
          loading: false,
          horoscope: null,
          notReady: false,
          error: 'Unable to load horoscope right now. Please try again.',
          details: null
        });
      }
    };

    loadHoroscope();

    return () => {
      cancelled = true;
    };
  }, [cacheKey, reloadToken, safeRequestedDate, sign]);

  const refetch = () => {
    cache.delete(cacheKey);
    setReloadToken((value) => value + 1);
  };

  return {
    ...state,
    requestedDate: safeRequestedDate,
    weekKey,
    refetch
  };
}
