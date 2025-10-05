# Horoscope Backend Configuration Requirements

## Issues Identified

### 1. CORS Configuration Inconsistency
**Problem**: Daily horoscope endpoints (`/users/{userId}/horoscope/daily`) are returning CORS errors while weekly and monthly endpoints work correctly.

**Error**: 
```
Access to fetch at 'https://0ujnh1e86h.execute-api.us-east-1.amazonaws.com/dev/users/{userId}/horoscope/daily' 
from origin 'https://main.d36g3neun79jnt.amplifyapp.com' has been blocked by CORS policy: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

### 2. Performance Issues
**Problem**: Horoscope generation appears to be slow, potentially causing timeouts.

## Required Backend Changes

### 1. Fix CORS Headers for Daily Horoscope Endpoints

Ensure all horoscope endpoints have consistent CORS configuration:

```javascript
// Add to all horoscope endpoint responses
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://main.d36g3neun79jnt.amplifyapp.com',
  'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
  'Access-Control-Allow-Methods': 'POST,OPTIONS'
};
```

**Endpoints requiring CORS fix**:
- `POST /users/{userId}/horoscope/daily`
- `OPTIONS /users/{userId}/horoscope/daily` (preflight)

### 2. Add Response Caching

Implement caching to improve performance:

```javascript
// Cache generated horoscopes for 24 hours
const cacheKey = `horoscope:${userId}:${type}:${startDate}`;
const cacheTimeToLive = 24 * 60 * 60; // 24 hours in seconds

// Check cache before generating
const cachedHoroscope = await getFromCache(cacheKey);
if (cachedHoroscope) {
  return {
    success: true,
    horoscope: cachedHoroscope,
    cached: true
  };
}

// Generate and cache new horoscope
const horoscope = await generateHoroscope(params);
await setCache(cacheKey, horoscope, cacheTimeToLive);
```

### 3. Add Rate Limiting

Prevent API overload:

```javascript
// Implement rate limiting per user
const rateLimit = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10, // max 10 horoscope requests per minute per user
  keyGenerator: (req) => req.pathParameters.userId
};
```

### 4. Add Request Timeout Handling

Set appropriate timeouts for horoscope generation:

```javascript
// Set timeout for AI generation calls
const HOROSCOPE_GENERATION_TIMEOUT = 25000; // 25 seconds
```

### 5. Add Circuit Breaker Pattern

Implement circuit breaker for AI service calls:

```javascript
const circuitBreaker = {
  failureThreshold: 5,
  resetTimeout: 60000, // 1 minute
  monitoringPeriod: 60000 // 1 minute
};
```

### 6. Add Endpoint Health Monitoring

Monitor which endpoints are failing:

```javascript
// Log endpoint performance metrics
const endpointMetrics = {
  endpoint: '/users/{userId}/horoscope/daily',
  responseTime: Date.now() - startTime,
  status: response.statusCode,
  userId: userId,
  timestamp: new Date().toISOString()
};
```

## Testing Recommendations

### 1. CORS Testing
```bash
# Test CORS headers on all horoscope endpoints
curl -H "Origin: https://main.d36g3neun79jnt.amplifyapp.com" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     https://0ujnh1e86h.execute-api.us-east-1.amazonaws.com/dev/users/test/horoscope/daily
```

### 2. Performance Testing
```bash
# Test response times for each endpoint
time curl -X POST \
     -H "Content-Type: application/json" \
     -d '{"startDate": "2025-07-19"}' \
     https://0ujnh1e86h.execute-api.us-east-1.amazonaws.com/dev/users/test/horoscope/daily
```

### 3. Load Testing
- Test concurrent requests to horoscope endpoints
- Monitor memory usage during AI generation
- Test with various user IDs and date ranges

## Priority Implementation Order

1. **High Priority**: Fix CORS headers for daily horoscope endpoints
2. **High Priority**: Add response caching for improved performance  
3. **Medium Priority**: Implement rate limiting
4. **Medium Priority**: Add request timeout handling
5. **Low Priority**: Implement circuit breaker pattern
6. **Low Priority**: Add comprehensive monitoring

## Frontend Changes Made

The frontend has been updated to handle these issues gracefully:

1. ✅ **Promise.allSettled**: Partial failures no longer break the entire UI
2. ✅ **Lazy Loading**: Only loads horoscope for active tab, reducing initial load
3. ✅ **Retry Logic**: Users can retry failed horoscope requests
4. ✅ **Timeout Handling**: 30-second timeout prevents indefinite hanging
5. ✅ **Error Handling**: Shows partial data when available, specific error messages

## Notes

- The weekly and monthly endpoints are working correctly, suggesting the CORS issue is specific to the daily endpoint configuration
- Frontend timeout is set to 30 seconds, so backend should respond within 25 seconds to allow for network latency
- The current error suggests missing CORS headers entirely on the daily endpoint, not just misconfigured headers



{
  "scores": {
    "OVERALL_ATTRACTION_CHEMISTRY": {
      "overall": 60.958749999999995,
      "synastry": 49,
      "composite": 100,
      "synastryHousePlacements": 100,
      "compositeHousePlacements": 63
    },
    "EMOTIONAL_SECURITY_CONNECTION": {
      "overall": 35.2,
      "synastry": 27,
      "composite": 28.000000000000004,
      "synastryHousePlacements": 97,
      "compositeHousePlacements": 53
    },
    "SEX_AND_INTIMACY": {
      "overall": 71.035,
      "synastry": 68,
      "composite": 69,
      "synastryHousePlacements": 96,
      "compositeHousePlacements": 66
    },
    "COMMUNICATION_AND_MENTAL_CONNECTION": {
      "overall": 67.9,
      "synastry": 62,
      "composite": 87,
      "synastryHousePlacements": 53,
      "compositeHousePlacements": 36
    },
    "COMMITMENT_LONG_TERM_POTENTIAL": {
      "overall": 63.122499999999995,
      "synastry": 56.99999999999999,
      "composite": 77,
      "synastryHousePlacements": 68,
      "compositeHousePlacements": 63
    },
    "KARMIC_LESSONS_GROWTH": {
      "overall": 29.695000000000004,
      "synastry": 5,
      "composite": 50,
      "synastryHousePlacements": 97,
      "compositeHousePlacements": 71
    },
    "PRACTICAL_GROWTH_SHARED_GOALS": {
      "overall": 33.177499999999995,
      "synastry": 9,
      "composite": 56.99999999999999,
      "synastryHousePlacements": 94,
      "compositeHousePlacements": 96
    }
  },
  "scoreAnalysis": {
    "OVERALL_ATTRACTION_CHEMISTRY": {
      "scoredItems": [
        {
          "score": 25,
          "source": "composite",
          "type": "aspect",
          "reason": "Positive composite aspect (25 points)",
          "description": "Sun exact conjunction Mars",
          "aspect": "conjunction",
          "orb": 0.8,
          "pairKey": "mars_sun"
        },
        {
          "score": 23,
          "source": "composite",
          "type": "aspect",
          "reason": "Positive composite aspect (23 points)",
          "description": "Venus close conjunction Mars",
          "aspect": "conjunction",
          "orb": 1.8,
          "pairKey": "mars_venus"
        },
        {
          "score": 20,
          "source": "synastryHousePlacement",
          "type": "housePlacement",
          "reason": "Positive synastry house placement (20 points): Intensifies pleasure and attraction",
          "description": "test's Venus in Anothe's house 5",
          "planet": "Venus",
          "house": 5,
          "direction": "A->B"
        },
        {
          "score": 20,
          "source": "synastryHousePlacement",
          "type": "housePlacement",
          "reason": "Positive synastry house placement (20 points): Creates romantic spark and vitality",
          "description": "Anothe's Sun in test's house 5",
          "planet": "Sun",
          "house": 5,
          "direction": "B->A"
        },
        {
          "score": 17,
          "source": "composite",
          "type": "aspect",
          "reason": "Positive composite aspect (17 points)",
          "description": "Venus close conjunction Sun",
          "aspect": "conjunction",
          "orb": 2.5,
          "pairKey": "sun_venus"
        },
        {
          "score": 15,
          "source": "synastryHousePlacement",
          "type": "housePlacement",
          "reason": "Positive synastry house placement (15 points): Boosts optimism and confidence",
          "description": "test's Jupiter in Anothe's house 1",
          "planet": "Jupiter",
          "house": 1,
          "direction": "A->B"
        },
        {
          "score": 15,
          "source": "synastryHousePlacement",
          "type": "housePlacement",
          "reason": "Positive synastry house placement (15 points): Strong physical attraction",
          "description": "Anothe's Ascendant in test's house 1",
          "planet": "Ascendant",
          "house": 1,
          "direction": "B->A"
        },
        {
          "score": 15,
          "source": "compositeHousePlacement",
          "type": "housePlacement",
          "reason": "Positive composite house placement (15 points): Strong physical attraction",
          "description": "Ascendant in house 1 and Virgo",
          "planet": "Ascendant",
          "house": 1,
          "direction": "composite"
        },
        {
          "score": 12.5,
          "source": "synastry",
          "type": "aspect",
          "reason": "Positive synastry aspect (12.5 points)",
          "description": "test's Venus in Leo their 6 house is exact sextile Anothe's Moon in Libra and their 7 house",
          "aspect": "sextile",
          "orb": 0.8,
          "planet1Sign": "Leo",
          "planet2Sign": "Libra",
          "planet1House": 6,
          "planet2House": 7,
          "pairKey": "moon_venus"
        },
        {
          "score": 10,
          "source": "synastryHousePlacement",
          "type": "housePlacement",
          "reason": "Positive synastry house placement (10 points): Creates emotional desire to support",
          "description": "test's Moon in Anothe's house 7",
          "planet": "Moon",
          "house": 7,
          "direction": "A->B"
        },
        {
          "score": 10,
          "source": "synastryHousePlacement",
          "type": "housePlacement",
          "reason": "Positive synastry house placement (10 points): Creates emotional desire to support",
          "description": "Anothe's Moon in test's house 7",
          "planet": "Moon",
          "house": 7,
          "direction": "B->A"
        },
        {
          "score": 9,
          "source": "synastry",
          "type": "aspect",
          "reason": "Positive synastry aspect (9 points)",
          "description": "test's Venus in Leo their 6 house is square Anothe's Pluto in Scorpio and their 7 house",
          "aspect": "square",
          "orb": 4.6,
          "planet1Sign": "Leo",
          "planet2Sign": "Scorpio",
          "planet1House": 6,
          "planet2House": 7,
          "pairKey": "pluto_venus"
        },
        {
          "score": 8,
          "source": "composite",
          "type": "aspect",
          "reason": "Positive composite aspect (8 points)",
          "description": "Venus close sextile Ascendant",
          "aspect": "sextile",
          "orb": 2.7,
          "pairKey": "ascendant_venus"
        },
        {
          "score": 6,
          "source": "composite",
          "type": "aspect",
          "reason": "Positive composite aspect (6 points)",
          "description": "Mars sextile Ascendant",
          "aspect": "sextile",
          "orb": 4.4,
          "pairKey": "ascendant_mars"
        },
        {
          "score": 5,
          "source": "synastry",
          "type": "aspect",
          "reason": "Positive synastry aspect (5 points)",
          "description": "test's Sun in Gemini their 4 house is close opposition Anothe's Midheaven in Capricorn and their 10 house",
          "aspect": "opposition",
          "orb": 1.7,
          "planet1Sign": "Gemini",
          "planet2Sign": "Capricorn",
          "planet1House": 4,
          "planet2House": 10,
          "pairKey": "midheaven_sun"
        },
        {
          "score": 5,
          "source": "synastry",
          "type": "aspect",
          "reason": "Positive synastry aspect (5 points)",
          "description": "test's Mars in Libra their 8 house is close square Anothe's Sun in Cancer and their 5 house",
          "aspect": "square",
          "orb": 2.1,
          "planet1Sign": "Libra",
          "planet2Sign": "Cancer",
          "planet1House": 8,
          "planet2House": 5,
          "pairKey": "mars_sun"
        },
        {
          "score": 5,
          "source": "composite",
          "type": "aspect",
          "reason": "Positive composite aspect (5 points)",
          "description": "Sun sextile Ascendant",
          "aspect": "sextile",
          "orb": 5.2,
          "pairKey": "ascendant_sun"
        },
        {
          "score": 5,
          "source": "synastryHousePlacement",
          "type": "housePlacement",
          "reason": "Positive synastry house placement (5 points): General house placement",
          "description": "test's Mercury in Anothe's house 5",
          "planet": "Mercury",
          "house": 5,
          "direction": "A->B"
        },
        {
          "score": 5,
          "source": "synastryHousePlacement",
          "type": "housePlacement",
          "reason": "Positive synastry house placement (5 points): General house placement",
          "description": "test's Mars in Anothe's house 7",
          "planet": "Mars",
          "house": 7,
          "direction": "A->B"
        },
        {
          "score": -5,
          "source": "synastryHousePlacement",
          "type": "housePlacement",
          "reason": "Challenging synastry house placement (-5 points): Creates self-consciousness",
          "description": "test's Saturn in Anothe's house 1",
          "planet": "Saturn",
          "house": 1,
          "direction": "A->B"
        },
        {
          "score": 5,
          "source": "synastryHousePlacement",
          "type": "housePlacement",
          "reason": "Positive synastry house placement (5 points): General house placement",
          "description": "test's Node in Anothe's house 5",
          "planet": "Node",
          "house": 5,
          "direction": "A->B"
        },
        {
          "score": 5,
          "source": "synastryHousePlacement",
          "type": "housePlacement",
          "reason": "Positive synastry house placement (5 points): General house placement",
          "description": "Anothe's Mercury in test's house 5",
          "planet": "Mercury",
          "house": 5,
          "direction": "B->A"
        },
        {
          "score": 5,
          "source": "synastryHousePlacement",
          "type": "housePlacement",
          "reason": "Positive synastry house placement (5 points): General house placement",
          "description": "Anothe's Mars in test's house 1",
          "planet": "Mars",
          "house": 1,
          "direction": "B->A"
        },
        {
          "score": 5,
          "source": "synastryHousePlacement",
          "type": "housePlacement",
          "reason": "Positive synastry house placement (5 points): General house placement",
          "description": "Anothe's Chiron in test's house 1",
          "planet": "Chiron",
          "house": 1,
          "direction": "B->A"
        },
        {
          "score": 5,
          "source": "synastryHousePlacement",
          "type": "housePlacement",
          "reason": "Positive synastry house placement (5 points): General house placement",
          "description": "Anothe's Node in test's house 1",
          "planet": "Node",
          "house": 1,
          "direction": "B->A"
        },
        {
          "score": 5,
          "source": "compositeHousePlacement",
          "type": "housePlacement",
          "reason": "Positive composite house placement (5 points): General placement in relevant house",
          "description": "Moon in house 1 and Libra",
          "planet": "Moon",
          "house": 1,
          "direction": "composite"
        },
        {
          "score": 5,
          "source": "compositeHousePlacement",
          "type": "housePlacement",
          "reason": "Positive composite house placement (5 points): General placement in relevant house",
          "description": "Uranus in house 5 and Capricorn",
          "planet": "Uranus",
          "house": 5,
          "direction": "composite"
        },
        {
          "score": 5,
          "source": "compositeHousePlacement",
          "type": "housePlacement",
          "reason": "Positive composite house placement (5 points): General placement in relevant house",
          "description": "Neptune in house 5 and Capricorn",
          "planet": "Neptune",
          "house": 5,
          "direction": "composite"
        },
        {
          "score": 5,
          "source": "compositeHousePlacement",
          "type": "housePlacement",
          "reason": "Positive composite house placement (5 points): General placement in relevant house",
          "description": "Chiron in house 7 and Aries",
          "planet": "Chiron",
          "house": 7,
          "direction": "composite"
        },
        {
          "score": 4,
          "source": "synastry",
          "type": "aspect",
          "reason": "Positive synastry aspect (4 points)",
          "description": "test's Moon in Libra their 7 house is sextile Anothe's Sun in Cancer and their 5 house",
          "aspect": "sextile",
          "orb": 6.2,
          "planet1Sign": "Libra",
          "planet2Sign": "Cancer",
          "planet1House": 7,
          "planet2House": 5,
          "pairKey": "moon_sun"
        },
        {
          "score": 4,
          "source": "synastry",
          "type": "aspect",
          "reason": "Positive synastry aspect (4 points)",
          "description": "test's Sun in Gemini their 4 house is square Anothe's Mars in Aries and their 1 house",
          "aspect": "square",
          "orb": 3.7,
          "planet1Sign": "Gemini",
          "planet2Sign": "Aries",
          "planet1House": 4,
          "planet2House": 1,
          "pairKey": "mars_sun"
        },
        {
          "score": 4,
          "source": "synastry",
          "type": "aspect",
          "reason": "Positive synastry aspect (4 points)",
          "description": "test's Sun in Gemini their 4 house is square Anothe's Ascendant in Aries and their 1 house",
          "aspect": "square",
          "orb": 3.3,
          "planet1Sign": "Gemini",
          "planet2Sign": "Aries",
          "planet1House": 4,
          "planet2House": 1,
          "pairKey": "ascendant_sun"
        },
        {
          "score": 3.75,
          "source": "synastry",
          "type": "aspect",
          "reason": "Positive synastry aspect (3.75 points)",
          "description": "test's Neptune in Aquarius their 12 house is close sextile Anothe's Ascendant in Aries and their 1 house",
          "aspect": "sextile",
          "orb": 1.2,
          "planet1Sign": "Aquarius",
          "planet2Sign": "Aries",
          "planet1House": 12,
          "planet2House": 1,
          "pairKey": "ascendant_neptune"
        },
        {
          "score": 3,
          "source": "composite",
          "type": "aspect",
          "reason": "Positive composite aspect (3 points)",
          "description": "Moon square Sun",
          "aspect": "square",
          "orb": 4,
          "pairKey": "moon_sun"
        },
        {
          "score": 1,
          "source": "composite",
          "type": "aspect",
          "reason": "Positive composite aspect (1 points)",
          "description": "Moon square Venus",
          "aspect": "square",
          "orb": 6.5,
          "pairKey": "moon_venus"
        }
      ],
      "analysis": "no analysis"
    },
    "EMOTIONAL_SECURITY_CONNECTION": {
      "scoredItems": [
        {
          "score": 15,
          "source": "synastryHousePlacement",
          "type": "housePlacement",
          "reason": "Positive synastry house placement (15 points): Deep empathy and emotional support",
          "description": "test's Moon in Anothe's house 7",
          "planet": "Moon",
          "house": 7,
          "direction": "A->B"
        },
        {
          "score": 15,
          "source": "synastryHousePlacement",
          "type": "housePlacement",
          "reason": "Positive synastry house placement (15 points): Deep empathy and emotional support",
          "description": "Anothe's Moon in test's house 7",
          "planet": "Moon",
          "house": 7,
          "direction": "B->A"
        },
        {
          "score": 15,
          "source": "synastryHousePlacement",
          "type": "housePlacement",
          "reason": "Positive synastry house placement (15 points): Brings harmony to home life",
          "description": "Anothe's Venus in test's house 4",
          "planet": "Venus",
          "house": 4,
          "direction": "B->A"
        },
        {
          "score": 12.5,
          "source": "synastry",
          "type": "aspect",
          "reason": "Positive synastry aspect (12.5 points)",
          "description": "test's Venus in Leo their 6 house is exact sextile Anothe's Moon in Libra and their 7 house",
          "aspect": "sextile",
          "orb": 0.8,
          "planet1Sign": "Leo",
          "planet2Sign": "Libra",
          "planet1House": 6,
          "planet2House": 7,
          "pairKey": "moon_venus"
        },
        {
          "score": -10,
          "source": "synastry",
          "type": "aspect",
          "reason": "Challenging synastry aspect (-10 points)",
          "description": "test's Sun in Gemini their 4 house is exact square Anothe's Chiron in Aries and their 12 house",
          "aspect": "square",
          "orb": 0.6,
          "planet1Sign": "Gemini",
          "planet2Sign": "Aries",
          "planet1House": 4,
          "planet2House": 12,
          "pairKey": "chiron_sun"
        },
        {
          "score": 9,
          "source": "synastry",
          "type": "aspect",
          "reason": "Positive synastry aspect (9 points)",
          "description": "test's Moon in Libra their 7 house is trine Anothe's Jupiter in Taurus and their 2 house",
          "aspect": "trine",
          "orb": 4.8,
          "planet1Sign": "Libra",
          "planet2Sign": "Taurus",
          "planet1House": 7,
          "planet2House": 2,
          "pairKey": "jupiter_moon"
        },
        {
          "score": -5,
          "source": "synastry",
          "type": "aspect",
          "reason": "Challenging synastry aspect (-5 points)",
          "description": "test's Saturn in Taurus their 2 house is close quincunx Anothe's Moon in Libra and their 7 house",
          "aspect": "quincunx",
          "orb": 1.9,
          "planet1Sign": "Taurus",
          "planet2Sign": "Libra",
          "planet1House": 2,
          "planet2House": 7,
          "pairKey": "moon_saturn"
        },
        {
          "score": 5,
          "source": "synastryHousePlacement",
          "type": "housePlacement",
          "reason": "Positive synastry house placement (5 points): General house placement",
          "description": "test's Mars in Anothe's house 7",
          "planet": "Mars",
          "house": 7,
          "direction": "A->B"
        },
        {
          "score": 5,
          "source": "compositeHousePlacement",
          "type": "housePlacement",
          "reason": "Positive composite house placement (5 points): General placement in relevant house",
          "description": "Midheaven in house 4 and Sagittarius",
          "planet": "Midheaven",
          "house": 4,
          "direction": "composite"
        },
        {
          "score": 5,
          "source": "compositeHousePlacement",
          "type": "housePlacement",
          "reason": "Positive composite house placement (5 points): General placement in relevant house",
          "description": "Chiron in house 7 and Aries",
          "planet": "Chiron",
          "house": 7,
          "direction": "composite"
        },
        {
          "score": -3,
          "source": "synastry",
          "type": "aspect",
          "reason": "Challenging synastry aspect (-3 points)",
          "description": "test's Moon in Libra their 7 house is opposition Anothe's Chiron in Aries and their 12 house",
          "aspect": "opposition",
          "orb": 4.6,
          "planet1Sign": "Libra",
          "planet2Sign": "Aries",
          "planet1House": 7,
          "planet2House": 12,
          "pairKey": "chiron_moon"
        },
        {
          "score": 2,
          "source": "synastry",
          "type": "aspect",
          "reason": "Positive synastry aspect (2 points)",
          "description": "test's Moon in Libra their 7 house is square Anothe's Midheaven in Capricorn and their 10 house",
          "aspect": "square",
          "orb": 3.4,
          "planet1Sign": "Libra",
          "planet2Sign": "Capricorn",
          "planet1House": 7,
          "planet2House": 10,
          "pairKey": "midheaven_moon"
        },
        {
          "score": 1,
          "source": "composite",
          "type": "aspect",
          "reason": "Positive composite aspect (1 points)",
          "description": "Moon square Venus",
          "aspect": "square",
          "orb": 6.5,
          "pairKey": "moon_venus"
        }
      ],
      "analysis": "no analysis"
    },
    "SEX_AND_INTIMACY": {
      "scoredItems": [
        {
          "score": 23,
          "source": "composite",
          "type": "aspect",
          "reason": "Positive composite aspect (23 points)",
          "description": "Venus close conjunction Mars",
          "aspect": "conjunction",
          "orb": 1.8,
          "pairKey": "mars_venus"
        },
        {
          "score": 15,
          "source": "synastryHousePlacement",
          "type": "housePlacement",
          "reason": "Positive synastry house placement (15 points): Deep transformation through intimacy",
          "description": "test's Pluto in Anothe's house 8",
          "planet": "Pluto",
          "house": 8,
          "direction": "A->B"
        },
        {
          "score": 15,
          "source": "synastryHousePlacement",
          "type": "housePlacement",
          "reason": "Positive synastry house placement (15 points): Deep transformation through intimacy",
          "description": "Anothe's Pluto in test's house 8",
          "planet": "Pluto",
          "house": 8,
          "direction": "B->A"
        },
        {
          "score": 14,
          "source": "synastry",
          "type": "aspect",
          "reason": "Positive synastry aspect (14 points)",
          "description": "test's Mars in Libra their 8 house is close square Anothe's Sun in Cancer and their 5 house",
          "aspect": "square",
          "orb": 2.1,
          "planet1Sign": "Libra",
          "planet2Sign": "Cancer",
          "planet1House": 8,
          "planet2House": 5,
          "pairKey": "mars_sun"
        },
        {
          "score": 14,
          "source": "synastry",
          "type": "aspect",
          "reason": "Positive synastry aspect (14 points)",
          "description": "test's Uranus in Aquarius their 12 house is close trine Anothe's Venus in Gemini and their 3 house",
          "aspect": "trine",
          "orb": 2,
          "planet1Sign": "Aquarius",
          "planet2Sign": "Gemini",
          "planet1House": 12,
          "planet2House": 3,
          "pairKey": "uranus_venus"
        },
        {
          "score": 12.5,
          "source": "synastry",
          "type": "aspect",
          "reason": "Positive synastry aspect (12.5 points)",
          "description": "test's Venus in Leo their 6 house is exact sextile Anothe's Moon in Libra and their 7 house",
          "aspect": "sextile",
          "orb": 0.8,
          "planet1Sign": "Leo",
          "planet2Sign": "Libra",
          "planet1House": 6,
          "planet2House": 7,
          "pairKey": "moon_venus"
        },
        {
          "score": 12.5,
          "source": "synastry",
          "type": "aspect",
          "reason": "Positive synastry aspect (12.5 points)",
          "description": "test's Neptune in Aquarius their 12 house is exact sextile Anothe's Mars in Aries and their 1 house",
          "aspect": "sextile",
          "orb": 0.8,
          "planet1Sign": "Aquarius",
          "planet2Sign": "Aries",
          "planet1House": 12,
          "planet2House": 1,
          "pairKey": "mars_neptune"
        },
        {
          "score": 11,
          "source": "synastry",
          "type": "aspect",
          "reason": "Positive synastry aspect (11 points)",
          "description": "test's Sun in Gemini their 4 house is square Anothe's Mars in Aries and their 1 house",
          "aspect": "square",
          "orb": 3.7,
          "planet1Sign": "Gemini",
          "planet2Sign": "Aries",
          "planet1House": 4,
          "planet2House": 1,
          "pairKey": "mars_sun"
        },
        {
          "score": 11,
          "source": "synastry",
          "type": "aspect",
          "reason": "Positive synastry aspect (11 points)",
          "description": "test's Sun in Gemini their 4 house is square Anothe's Ascendant in Aries and their 1 house",
          "aspect": "square",
          "orb": 3.3,
          "planet1Sign": "Gemini",
          "planet2Sign": "Aries",
          "planet1House": 4,
          "planet2House": 1,
          "pairKey": "ascendant_sun"
        },
        {
          "score": 10,
          "source": "synastry",
          "type": "aspect",
          "reason": "Positive synastry aspect (10 points)",
          "description": "test's Mars in Libra their 8 house is close sextile Anothe's Uranus in Sagittarius and their 9 house",
          "aspect": "sextile",
          "orb": 1.6,
          "planet1Sign": "Libra",
          "planet2Sign": "Sagittarius",
          "planet1House": 8,
          "planet2House": 9,
          "pairKey": "mars_uranus"
        },
        {
          "score": 10,
          "source": "compositeHousePlacement",
          "type": "housePlacement",
          "reason": "Positive composite house placement (10 points): Exciting, unpredictable attraction",
          "description": "Uranus in house 5 and Capricorn",
          "planet": "Uranus",
          "house": 5,
          "direction": "composite"
        },
        {
          "score": 9,
          "source": "synastry",
          "type": "aspect",
          "reason": "Positive synastry aspect (9 points)",
          "description": "test's Venus in Leo their 6 house is square Anothe's Pluto in Scorpio and their 7 house",
          "aspect": "square",
          "orb": 4.6,
          "planet1Sign": "Leo",
          "planet2Sign": "Scorpio",
          "planet1House": 6,
          "planet2House": 7,
          "pairKey": "pluto_venus"
        },
        {
          "score": 6,
          "source": "synastry",
          "type": "aspect",
          "reason": "Positive synastry aspect (6 points)",
          "description": "test's Mars in Libra their 8 house is sextile Anothe's Midheaven in Capricorn and their 10 house",
          "aspect": "sextile",
          "orb": 4.9,
          "planet1Sign": "Libra",
          "planet2Sign": "Capricorn",
          "planet1House": 8,
          "planet2House": 10,
          "pairKey": "mars_midheaven"
        },
        {
          "score": 5,
          "source": "synastryHousePlacement",
          "type": "housePlacement",
          "reason": "Positive synastry house placement (5 points): General house placement",
          "description": "test's Mercury in Anothe's house 5",
          "planet": "Mercury",
          "house": 5,
          "direction": "A->B"
        },
        {
          "score": 5,
          "source": "synastryHousePlacement",
          "type": "housePlacement",
          "reason": "Positive synastry house placement (5 points): General house placement",
          "description": "test's Venus in Anothe's house 5",
          "planet": "Venus",
          "house": 5,
          "direction": "A->B"
        },
        {
          "score": 5,
          "source": "synastryHousePlacement",
          "type": "housePlacement",
          "reason": "Positive synastry house placement (5 points): General house placement",
          "description": "test's Node in Anothe's house 5",
          "planet": "Node",
          "house": 5,
          "direction": "A->B"
        },
        {
          "score": 5,
          "source": "synastryHousePlacement",
          "type": "housePlacement",
          "reason": "Positive synastry house placement (5 points): General house placement",
          "description": "Anothe's Mercury in test's house 5",
          "planet": "Mercury",
          "house": 5,
          "direction": "B->A"
        },
        {
          "score": 5,
          "source": "synastryHousePlacement",
          "type": "housePlacement",
          "reason": "Positive synastry house placement (5 points): General house placement",
          "description": "Anothe's Sun in test's house 5",
          "planet": "Sun",
          "house": 5,
          "direction": "B->A"
        },
        {
          "score": 5,
          "source": "compositeHousePlacement",
          "type": "housePlacement",
          "reason": "Positive composite house placement (5 points): General placement in relevant house",
          "description": "Jupiter in house 8 and Taurus",
          "planet": "Jupiter",
          "house": 8,
          "direction": "composite"
        },
        {
          "score": 5,
          "source": "compositeHousePlacement",
          "type": "housePlacement",
          "reason": "Positive composite house placement (5 points): General placement in relevant house",
          "description": "Neptune in house 5 and Capricorn",
          "planet": "Neptune",
          "house": 5,
          "direction": "composite"
        },
        {
          "score": 4,
          "source": "synastry",
          "type": "aspect",
          "reason": "Positive synastry aspect (4 points)",
          "description": "test's Moon in Libra their 7 house is sextile Anothe's Sun in Cancer and their 5 house",
          "aspect": "sextile",
          "orb": 6.2,
          "planet1Sign": "Libra",
          "planet2Sign": "Cancer",
          "planet1House": 7,
          "planet2House": 5,
          "pairKey": "moon_sun"
        }
      ],
      "analysis": "no analysis"
    },
    "COMMUNICATION_AND_MENTAL_CONNECTION": {
      "scoredItems": [
        {
          "score": 15,
          "source": "synastryHousePlacement",
          "type": "housePlacement",
          "reason": "Positive synastry house placement (15 points): Expands daily communication",
          "description": "Anothe's Jupiter in test's house 3",
          "planet": "Jupiter",
          "house": 3,
          "direction": "B->A"
        },
        {
          "score": 13,
          "source": "composite",
          "type": "aspect",
          "reason": "Positive composite aspect (13 points)",
          "description": "Mercury close conjunction Venus",
          "aspect": "conjunction",
          "orb": 2.3,
          "pairKey": "mercury_venus"
        },
        {
          "score": 12.5,
          "source": "synastry",
          "type": "aspect",
          "reason": "Positive synastry aspect (12.5 points)",
          "description": "test's Uranus in Aquarius their 12 house is close trine Anothe's Moon in Libra and their 7 house",
          "aspect": "trine",
          "orb": 1.2,
          "planet1Sign": "Aquarius",
          "planet2Sign": "Libra",
          "planet1House": 12,
          "planet2House": 7,
          "pairKey": "moon_uranus"
        },
        {
          "score": 10,
          "source": "synastry",
          "type": "aspect",
          "reason": "Positive synastry aspect (10 points)",
          "description": "test's Saturn in Taurus their 2 house is exact sextile Anothe's Mercury in Cancer and their 4 house",
          "aspect": "sextile",
          "orb": 0.7,
          "planet1Sign": "Taurus",
          "planet2Sign": "Cancer",
          "planet1House": 2,
          "planet2House": 4,
          "pairKey": "mercury_saturn"
        },
        {
          "score": 10,
          "source": "composite",
          "type": "aspect",
          "reason": "Positive composite aspect (10 points)",
          "description": "Mercury conjunction Mars",
          "aspect": "conjunction",
          "orb": 4,
          "pairKey": "mercury_mars"
        },
        {
          "score": 9,
          "source": "synastry",
          "type": "aspect",
          "reason": "Positive synastry aspect (9 points)",
          "description": "test's Mercury in Cancer their 5 house is conjunction Anothe's Sun in Cancer and their 5 house",
          "aspect": "conjunction",
          "orb": 5,
          "planet1Sign": "Cancer",
          "planet2Sign": "Cancer",
          "planet1House": 5,
          "planet2House": 5,
          "pairKey": "mercury_sun"
        },
        {
          "score": 9,
          "source": "composite",
          "type": "aspect",
          "reason": "Positive composite aspect (9 points)",
          "description": "Mercury conjunction Sun",
          "aspect": "conjunction",
          "orb": 4.8,
          "pairKey": "mercury_sun"
        },
        {
          "score": 5,
          "source": "composite",
          "type": "aspect",
          "reason": "Positive composite aspect (5 points)",
          "description": "Mercury sextile Jupiter",
          "aspect": "sextile",
          "orb": 4.4,
          "pairKey": "mercury_jupiter"
        },
        {
          "score": 5,
          "source": "synastryHousePlacement",
          "type": "housePlacement",
          "reason": "Positive synastry house placement (5 points): General house placement",
          "description": "test's Sun in Anothe's house 3",
          "planet": "Sun",
          "house": 3,
          "direction": "A->B"
        },
        {
          "score": 5,
          "source": "synastryHousePlacement",
          "type": "housePlacement",
          "reason": "Positive synastry house placement (5 points): General house placement",
          "description": "test's Midheaven in Anothe's house 9",
          "planet": "Midheaven",
          "house": 9,
          "direction": "A->B"
        },
        {
          "score": 5,
          "source": "compositeHousePlacement",
          "type": "housePlacement",
          "reason": "Positive composite house placement (5 points): General placement in relevant house",
          "description": "Pluto in house 3 and Scorpio",
          "planet": "Pluto",
          "house": 3,
          "direction": "composite"
        },
        {
          "score": 5,
          "source": "compositeHousePlacement",
          "type": "housePlacement",
          "reason": "Positive composite house placement (5 points): General placement in relevant house",
          "description": "Node in house 3 and Scorpio",
          "planet": "Node",
          "house": 3,
          "direction": "composite"
        },
        {
          "score": -4,
          "source": "composite",
          "type": "aspect",
          "reason": "Challenging composite aspect (-4 points)",
          "description": "Mercury close opposition Neptune",
          "aspect": "opposition",
          "orb": 2.4,
          "pairKey": "mercury_neptune"
        },
        {
          "score": 4,
          "source": "composite",
          "type": "aspect",
          "reason": "Positive composite aspect (4 points)",
          "description": "Mercury trine Pluto",
          "aspect": "trine",
          "orb": 5.5,
          "pairKey": "mercury_pluto"
        },
        {
          "score": 3,
          "source": "synastry",
          "type": "aspect",
          "reason": "Positive synastry aspect (3 points)",
          "description": "test's Mercury in Cancer their 5 house is sextile Anothe's Jupiter in Taurus and their 2 house",
          "aspect": "sextile",
          "orb": 6.4,
          "planet1Sign": "Cancer",
          "planet2Sign": "Taurus",
          "planet1House": 5,
          "planet2House": 2,
          "pairKey": "jupiter_mercury"
        },
        {
          "score": 3,
          "source": "synastry",
          "type": "aspect",
          "reason": "Positive synastry aspect (3 points)",
          "description": "test's Mercury in Cancer their 5 house is trine Anothe's Chiron in Aries and their 12 house",
          "aspect": "trine",
          "orb": 6.6,
          "planet1Sign": "Cancer",
          "planet2Sign": "Aries",
          "planet1House": 5,
          "planet2House": 12,
          "pairKey": "chiron_mercury"
        },
        {
          "score": -2,
          "source": "synastry",
          "type": "aspect",
          "reason": "Challenging synastry aspect (-2 points)",
          "description": "test's Moon in Libra their 7 house is square Anothe's Uranus in Sagittarius and their 9 house",
          "aspect": "square",
          "orb": 6.7,
          "planet1Sign": "Libra",
          "planet2Sign": "Sagittarius",
          "planet1House": 7,
          "planet2House": 9,
          "pairKey": "moon_uranus"
        },
        {
          "score": -2,
          "source": "composite",
          "type": "aspect",
          "reason": "Challenging composite aspect (-2 points)",
          "description": "Mercury opposition Uranus",
          "aspect": "opposition",
          "orb": 3.5,
          "pairKey": "mercury_uranus"
        },
        {
          "score": -1,
          "source": "synastry",
          "type": "aspect",
          "reason": "Challenging synastry aspect (-1 points)",
          "description": "test's Uranus in Aquarius their 12 house is close quincunx Anothe's Mercury in Cancer and their 4 house",
          "aspect": "quincunx",
          "orb": 2.5,
          "planet1Sign": "Aquarius",
          "planet2Sign": "Cancer",
          "planet1House": 12,
          "planet2House": 4,
          "pairKey": "mercury_uranus"
        }
      ],
      "analysis": "no analysis"
    },
    "COMMITMENT_LONG_TERM_POTENTIAL": {
      "scoredItems": [
        {
          "score": 15,
          "source": "synastryHousePlacement",
          "type": "housePlacement",
          "reason": "Positive synastry house placement (15 points): Supports long-term goals",
          "description": "Anothe's Saturn in test's house 10",
          "planet": "Saturn",
          "house": 10,
          "direction": "B->A"
        },
        {
          "score": 14,
          "source": "synastry",
          "type": "aspect",
          "reason": "Positive synastry aspect (14 points)",
          "description": "test's Jupiter in Aries their 2 house is close trine Anothe's Saturn in Sagittarius and their 9 house",
          "aspect": "trine",
          "orb": 1.6,
          "planet1Sign": "Aries",
          "planet2Sign": "Sagittarius",
          "planet1House": 2,
          "planet2House": 9,
          "pairKey": "jupiter_saturn"
        },
        {
          "score": 14,
          "source": "composite",
          "type": "aspect",
          "reason": "Positive composite aspect (14 points)",
          "description": "Venus close conjunction Mars",
          "aspect": "conjunction",
          "orb": 1.8,
          "pairKey": "mars_venus"
        },
        {
          "score": 10,
          "source": "synastry",
          "type": "aspect",
          "reason": "Positive synastry aspect (10 points)",
          "description": "test's Mars in Libra their 8 house is exact sextile Anothe's Saturn in Sagittarius and their 9 house",
          "aspect": "sextile",
          "orb": 0.9,
          "planet1Sign": "Libra",
          "planet2Sign": "Sagittarius",
          "planet1House": 8,
          "planet2House": 9,
          "pairKey": "mars_saturn"
        },
        {
          "score": -9,
          "source": "synastry",
          "type": "aspect",
          "reason": "Challenging synastry aspect (-9 points)",
          "description": "test's Sun in Gemini their 4 house is close opposition Anothe's Saturn in Sagittarius and their 9 house",
          "aspect": "opposition",
          "orb": 2.2,
          "planet1Sign": "Gemini",
          "planet2Sign": "Sagittarius",
          "planet1House": 4,
          "planet2House": 9,
          "pairKey": "saturn_sun"
        },
        {
          "score": 7,
          "source": "synastry",
          "type": "aspect",
          "reason": "Positive synastry aspect (7 points)",
          "description": "test's Venus in Leo their 6 house is sextile Anothe's Venus in Gemini and their 3 house",
          "aspect": "sextile",
          "orb": 4.1,
          "planet1Sign": "Leo",
          "planet2Sign": "Gemini",
          "planet1House": 6,
          "planet2House": 3,
          "pairKey": "venus_venus"
        },
        {
          "score": 6,
          "source": "synastry",
          "type": "aspect",
          "reason": "Positive synastry aspect (6 points)",
          "description": "test's Saturn in Taurus their 2 house is close sextile Anothe's Node in Pisces and their 12 house",
          "aspect": "sextile",
          "orb": 1.8,
          "planet1Sign": "Taurus",
          "planet2Sign": "Pisces",
          "planet1House": 2,
          "planet2House": 12,
          "pairKey": "node_saturn"
        },
        {
          "score": -5,
          "source": "synastry",
          "type": "aspect",
          "reason": "Challenging synastry aspect (-5 points)",
          "description": "test's Saturn in Taurus their 2 house is close quincunx Anothe's Moon in Libra and their 7 house",
          "aspect": "quincunx",
          "orb": 1.9,
          "planet1Sign": "Taurus",
          "planet2Sign": "Libra",
          "planet1House": 2,
          "planet2House": 7,
          "pairKey": "moon_saturn"
        },
        {
          "score": 5,
          "source": "synastryHousePlacement",
          "type": "housePlacement",
          "reason": "Positive synastry house placement (5 points): General house placement",
          "description": "test's Moon in Anothe's house 7",
          "planet": "Moon",
          "house": 7,
          "direction": "A->B"
        },
        {
          "score": 5,
          "source": "synastryHousePlacement",
          "type": "housePlacement",
          "reason": "Positive synastry house placement (5 points): General house placement",
          "description": "test's Mars in Anothe's house 7",
          "planet": "Mars",
          "house": 7,
          "direction": "A->B"
        },
        {
          "score": 5,
          "source": "synastryHousePlacement",
          "type": "housePlacement",
          "reason": "Positive synastry house placement (5 points): General house placement",
          "description": "Anothe's Moon in test's house 7",
          "planet": "Moon",
          "house": 7,
          "direction": "B->A"
        },
        {
          "score": 5,
          "source": "synastryHousePlacement",
          "type": "housePlacement",
          "reason": "Positive synastry house placement (5 points): General house placement",
          "description": "Anothe's Uranus in test's house 10",
          "planet": "Uranus",
          "house": 10,
          "direction": "B->A"
        },
        {
          "score": 5,
          "source": "synastryHousePlacement",
          "type": "housePlacement",
          "reason": "Positive synastry house placement (5 points): General house placement",
          "description": "Anothe's Midheaven in test's house 10",
          "planet": "Midheaven",
          "house": 10,
          "direction": "B->A"
        },
        {
          "score": 5,
          "source": "compositeHousePlacement",
          "type": "housePlacement",
          "reason": "Positive composite house placement (5 points): General placement in relevant house",
          "description": "Mercury in house 10 and Cancer",
          "planet": "Mercury",
          "house": 10,
          "direction": "composite"
        },
        {
          "score": 5,
          "source": "compositeHousePlacement",
          "type": "housePlacement",
          "reason": "Positive composite house placement (5 points): General placement in relevant house",
          "description": "Venus in house 10 and Cancer",
          "planet": "Venus",
          "house": 10,
          "direction": "composite"
        },
        {
          "score": 5,
          "source": "compositeHousePlacement",
          "type": "housePlacement",
          "reason": "Positive composite house placement (5 points): General placement in relevant house",
          "description": "Sun in house 10 and Cancer",
          "planet": "Sun",
          "house": 10,
          "direction": "composite"
        },
        {
          "score": 5,
          "source": "compositeHousePlacement",
          "type": "housePlacement",
          "reason": "Positive composite house placement (5 points): General placement in relevant house",
          "description": "Mars in house 10 and Cancer",
          "planet": "Mars",
          "house": 10,
          "direction": "composite"
        },
        {
          "score": 5,
          "source": "compositeHousePlacement",
          "type": "housePlacement",
          "reason": "Positive composite house placement (5 points): General placement in relevant house",
          "description": "Chiron in house 7 and Aries",
          "planet": "Chiron",
          "house": 7,
          "direction": "composite"
        },
        {
          "score": 4,
          "source": "synastry",
          "type": "aspect",
          "reason": "Positive synastry aspect (4 points)",
          "description": "test's Moon in Libra their 7 house is sextile Anothe's Sun in Cancer and their 5 house",
          "aspect": "sextile",
          "orb": 6.2,
          "planet1Sign": "Libra",
          "planet2Sign": "Cancer",
          "planet1House": 7,
          "planet2House": 5,
          "pairKey": "moon_sun"
        },
        {
          "score": 3,
          "source": "synastry",
          "type": "aspect",
          "reason": "Positive synastry aspect (3 points)",
          "description": "test's Jupiter in Aries their 2 house is exact square Anothe's Sun in Cancer and their 5 house",
          "aspect": "square",
          "orb": 0.4,
          "planet1Sign": "Aries",
          "planet2Sign": "Cancer",
          "planet1House": 2,
          "planet2House": 5,
          "pairKey": "jupiter_sun"
        },
        {
          "score": 1,
          "source": "synastry",
          "type": "aspect",
          "reason": "Positive synastry aspect (1 points)",
          "description": "test's Sun in Gemini their 4 house is close opposition Anothe's Midheaven in Capricorn and their 10 house",
          "aspect": "opposition",
          "orb": 1.7,
          "planet1Sign": "Gemini",
          "planet2Sign": "Capricorn",
          "planet1House": 4,
          "planet2House": 10,
          "pairKey": "midheaven_sun"
        },
        {
          "score": 1,
          "source": "composite",
          "type": "aspect",
          "reason": "Positive composite aspect (1 points)",
          "description": "Moon square Sun",
          "aspect": "square",
          "orb": 4,
          "pairKey": "sun_moon"
        }
      ],
      "analysis": "no analysis"
    },
    "KARMIC_LESSONS_GROWTH": {
      "scoredItems": [
        {
          "score": -10,
          "source": "synastry",
          "type": "aspect",
          "reason": "Challenging synastry aspect (-10 points)",
          "description": "test's Sun in Gemini their 4 house is exact square Anothe's Chiron in Aries and their 12 house",
          "aspect": "square",
          "orb": 0.6,
          "planet1Sign": "Gemini",
          "planet2Sign": "Aries",
          "planet1House": 4,
          "planet2House": 12,
          "pairKey": "chiron_sun"
        },
        {
          "score": 10,
          "source": "synastryHousePlacement",
          "type": "housePlacement",
          "reason": "Positive synastry house placement (10 points): Healing past wounds",
          "description": "test's Chiron in Anothe's house 12",
          "planet": "Chiron",
          "house": 12,
          "direction": "A->B"
        },
        {
          "score": 10,
          "source": "compositeHousePlacement",
          "type": "housePlacement",
          "reason": "Positive composite house placement (10 points): Working through past karma",
          "description": "Saturn in house 12 and Virgo",
          "planet": "Saturn",
          "house": 12,
          "direction": "composite"
        },
        {
          "score": 6,
          "source": "synastry",
          "type": "aspect",
          "reason": "Positive synastry aspect (6 points)",
          "description": "test's Saturn in Taurus their 2 house is close sextile Anothe's Node in Pisces and their 12 house",
          "aspect": "sextile",
          "orb": 1.8,
          "planet1Sign": "Taurus",
          "planet2Sign": "Pisces",
          "planet1House": 2,
          "planet2House": 12,
          "pairKey": "node_saturn"
        },
        {
          "score": 5,
          "source": "synastryHousePlacement",
          "type": "housePlacement",
          "reason": "Positive synastry house placement (5 points): General house placement",
          "description": "test's Moon in Anothe's house 7",
          "planet": "Moon",
          "house": 7,
          "direction": "A->B"
        },
        {
          "score": 5,
          "source": "synastryHousePlacement",
          "type": "housePlacement",
          "reason": "Positive synastry house placement (5 points): General house placement",
          "description": "test's Mars in Anothe's house 7",
          "planet": "Mars",
          "house": 7,
          "direction": "A->B"
        },
        {
          "score": 5,
          "source": "synastryHousePlacement",
          "type": "housePlacement",
          "reason": "Positive synastry house placement (5 points): General house placement",
          "description": "test's Jupiter in Anothe's house 1",
          "planet": "Jupiter",
          "house": 1,
          "direction": "A->B"
        },
        {
          "score": 5,
          "source": "synastryHousePlacement",
          "type": "housePlacement",
          "reason": "Positive synastry house placement (5 points): General house placement",
          "description": "test's Saturn in Anothe's house 1",
          "planet": "Saturn",
          "house": 1,
          "direction": "A->B"
        },
        {
          "score": 5,
          "source": "synastryHousePlacement",
          "type": "housePlacement",
          "reason": "Positive synastry house placement (5 points): General house placement",
          "description": "test's Uranus in Anothe's house 12",
          "planet": "Uranus",
          "house": 12,
          "direction": "A->B"
        },
        {
          "score": 5,
          "source": "synastryHousePlacement",
          "type": "housePlacement",
          "reason": "Positive synastry house placement (5 points): General house placement",
          "description": "test's Ascendant in Anothe's house 12",
          "planet": "Ascendant",
          "house": 12,
          "direction": "A->B"
        },
        {
          "score": 5,
          "source": "synastryHousePlacement",
          "type": "housePlacement",
          "reason": "Positive synastry house placement (5 points): General house placement",
          "description": "Anothe's Moon in test's house 7",
          "planet": "Moon",
          "house": 7,
          "direction": "B->A"
        },
        {
          "score": 5,
          "source": "synastryHousePlacement",
          "type": "housePlacement",
          "reason": "Positive synastry house placement (5 points): General house placement",
          "description": "Anothe's Mars in test's house 1",
          "planet": "Mars",
          "house": 1,
          "direction": "B->A"
        },
        {
          "score": 5,
          "source": "synastryHousePlacement",
          "type": "housePlacement",
          "reason": "Positive synastry house placement (5 points): General house placement",
          "description": "Anothe's Ascendant in test's house 1",
          "planet": "Ascendant",
          "house": 1,
          "direction": "B->A"
        },
        {
          "score": 5,
          "source": "synastryHousePlacement",
          "type": "housePlacement",
          "reason": "Positive synastry house placement (5 points): General house placement",
          "description": "Anothe's Chiron in test's house 1",
          "planet": "Chiron",
          "house": 1,
          "direction": "B->A"
        },
        {
          "score": 5,
          "source": "synastryHousePlacement",
          "type": "housePlacement",
          "reason": "Positive synastry house placement (5 points): General house placement",
          "description": "Anothe's Node in test's house 1",
          "planet": "Node",
          "house": 1,
          "direction": "B->A"
        },
        {
          "score": 5,
          "source": "compositeHousePlacement",
          "type": "housePlacement",
          "reason": "Positive composite house placement (5 points): General placement in relevant house",
          "description": "Moon in house 1 and Libra",
          "planet": "Moon",
          "house": 1,
          "direction": "composite"
        },
        {
          "score": 5,
          "source": "compositeHousePlacement",
          "type": "housePlacement",
          "reason": "Positive composite house placement (5 points): General placement in relevant house",
          "description": "Ascendant in house 1 and Virgo",
          "planet": "Ascendant",
          "house": 1,
          "direction": "composite"
        },
        {
          "score": 5,
          "source": "compositeHousePlacement",
          "type": "housePlacement",
          "reason": "Positive composite house placement (5 points): General placement in relevant house",
          "description": "Chiron in house 7 and Aries",
          "planet": "Chiron",
          "house": 7,
          "direction": "composite"
        },
        {
          "score": -4,
          "source": "synastry",
          "type": "aspect",
          "reason": "Challenging synastry aspect (-4 points)",
          "description": "test's Saturn in Taurus their 2 house is opposition Anothe's Pluto in Scorpio and their 7 house",
          "aspect": "opposition",
          "orb": 3.5,
          "planet1Sign": "Taurus",
          "planet2Sign": "Scorpio",
          "planet1House": 2,
          "planet2House": 7,
          "pairKey": "pluto_saturn"
        },
        {
          "score": -3.75,
          "source": "synastry",
          "type": "aspect",
          "reason": "Challenging synastry aspect (-3.75 points)",
          "description": "test's Node in Leo their 6 house is close quincunx Anothe's Node in Pisces and their 12 house",
          "aspect": "quincunx",
          "orb": 1.1,
          "planet1Sign": "Leo",
          "planet2Sign": "Pisces",
          "planet1House": 6,
          "planet2House": 12,
          "pairKey": "node_node"
        },
        {
          "score": -3,
          "source": "synastry",
          "type": "aspect",
          "reason": "Challenging synastry aspect (-3 points)",
          "description": "test's Moon in Libra their 7 house is opposition Anothe's Chiron in Aries and their 12 house",
          "aspect": "opposition",
          "orb": 4.6,
          "planet1Sign": "Libra",
          "planet2Sign": "Aries",
          "planet1House": 7,
          "planet2House": 12,
          "pairKey": "chiron_moon"
        },
        {
          "score": -1.25,
          "source": "synastry",
          "type": "aspect",
          "reason": "Challenging synastry aspect (-1.25 points)",
          "description": "test's Venus in Leo their 6 house is exact quincunx Anothe's Node in Pisces and their 12 house",
          "aspect": "quincunx",
          "orb": 0.6,
          "planet1Sign": "Leo",
          "planet2Sign": "Pisces",
          "planet1House": 6,
          "planet2House": 12,
          "pairKey": "node_venus"
        }
      ],
      "analysis": "no analysis"
    },
    "PRACTICAL_GROWTH_SHARED_GOALS": {
      "scoredItems": [
        {
          "score": 15,
          "source": "composite",
          "type": "aspect",
          "reason": "Positive composite aspect (15 points)",
          "description": "Sun exact sextile Jupiter",
          "aspect": "sextile",
          "orb": 0.4,
          "pairKey": "jupiter_sun"
        },
        {
          "score": 15,
          "source": "synastryHousePlacement",
          "type": "housePlacement",
          "reason": "Positive synastry house placement (15 points): Supports shared ambitions",
          "description": "test's Jupiter in Anothe's house 1",
          "planet": "Jupiter",
          "house": 1,
          "direction": "A->B"
        },
        {
          "score": 14,
          "source": "synastry",
          "type": "aspect",
          "reason": "Positive synastry aspect (14 points)",
          "description": "test's Jupiter in Aries their 2 house is close trine Anothe's Saturn in Sagittarius and their 9 house",
          "aspect": "trine",
          "orb": 1.6,
          "planet1Sign": "Aries",
          "planet2Sign": "Sagittarius",
          "planet1House": 2,
          "planet2House": 9,
          "pairKey": "jupiter_saturn"
        },
        {
          "score": -10,
          "source": "synastry",
          "type": "aspect",
          "reason": "Challenging synastry aspect (-10 points)",
          "description": "test's Sun in Gemini their 4 house is exact square Anothe's Chiron in Aries and their 12 house",
          "aspect": "square",
          "orb": 0.6,
          "planet1Sign": "Gemini",
          "planet2Sign": "Aries",
          "planet1House": 4,
          "planet2House": 12,
          "pairKey": "chiron_sun"
        },
        {
          "score": -10,
          "source": "synastryHousePlacement",
          "type": "housePlacement",
          "reason": "Challenging synastry house placement (-10 points): Creates self-consciousness",
          "description": "test's Saturn in Anothe's house 1",
          "planet": "Saturn",
          "house": 1,
          "direction": "A->B"
        },
        {
          "score": -10,
          "source": "synastryHousePlacement",
          "type": "housePlacement",
          "reason": "Challenging synastry house placement (-10 points): Creates self-consciousness",
          "description": "Anothe's Saturn in test's house 10",
          "planet": "Saturn",
          "house": 10,
          "direction": "B->A"
        },
        {
          "score": 6,
          "source": "synastry",
          "type": "aspect",
          "reason": "Positive synastry aspect (6 points)",
          "description": "test's Mars in Libra their 8 house is sextile Anothe's Midheaven in Capricorn and their 10 house",
          "aspect": "sextile",
          "orb": 4.9,
          "planet1Sign": "Libra",
          "planet2Sign": "Capricorn",
          "planet1House": 8,
          "planet2House": 10,
          "pairKey": "mars_midheaven"
        },
        {
          "score": 5,
          "source": "synastryHousePlacement",
          "type": "housePlacement",
          "reason": "Positive synastry house placement (5 points): General house placement",
          "description": "test's Moon in Anothe's house 7",
          "planet": "Moon",
          "house": 7,
          "direction": "A->B"
        },
        {
          "score": 5,
          "source": "synastryHousePlacement",
          "type": "housePlacement",
          "reason": "Positive synastry house placement (5 points): General house placement",
          "description": "test's Mercury in Anothe's house 5",
          "planet": "Mercury",
          "house": 5,
          "direction": "A->B"
        },
        {
          "score": 5,
          "source": "synastryHousePlacement",
          "type": "housePlacement",
          "reason": "Positive synastry house placement (5 points): General house placement",
          "description": "test's Venus in Anothe's house 5",
          "planet": "Venus",
          "house": 5,
          "direction": "A->B"
        },
        {
          "score": 5,
          "source": "synastryHousePlacement",
          "type": "housePlacement",
          "reason": "Positive synastry house placement (5 points): General house placement",
          "description": "test's Mars in Anothe's house 7",
          "planet": "Mars",
          "house": 7,
          "direction": "A->B"
        },
        {
          "score": 5,
          "source": "synastryHousePlacement",
          "type": "housePlacement",
          "reason": "Positive synastry house placement (5 points): General house placement",
          "description": "test's Node in Anothe's house 5",
          "planet": "Node",
          "house": 5,
          "direction": "A->B"
        },
        {
          "score": 5,
          "source": "synastryHousePlacement",
          "type": "housePlacement",
          "reason": "Positive synastry house placement (5 points): General house placement",
          "description": "Anothe's Moon in test's house 7",
          "planet": "Moon",
          "house": 7,
          "direction": "B->A"
        },
        {
          "score": 5,
          "source": "synastryHousePlacement",
          "type": "housePlacement",
          "reason": "Positive synastry house placement (5 points): General house placement",
          "description": "Anothe's Mercury in test's house 5",
          "planet": "Mercury",
          "house": 5,
          "direction": "B->A"
        },
        {
          "score": 5,
          "source": "synastryHousePlacement",
          "type": "housePlacement",
          "reason": "Positive synastry house placement (5 points): General house placement",
          "description": "Anothe's Sun in test's house 5",
          "planet": "Sun",
          "house": 5,
          "direction": "B->A"
        },
        {
          "score": 5,
          "source": "synastryHousePlacement",
          "type": "housePlacement",
          "reason": "Positive synastry house placement (5 points): General house placement",
          "description": "Anothe's Mars in test's house 1",
          "planet": "Mars",
          "house": 1,
          "direction": "B->A"
        },
        {
          "score": 5,
          "source": "synastryHousePlacement",
          "type": "housePlacement",
          "reason": "Positive synastry house placement (5 points): General house placement",
          "description": "Anothe's Uranus in test's house 10",
          "planet": "Uranus",
          "house": 10,
          "direction": "B->A"
        },
        {
          "score": 5,
          "source": "synastryHousePlacement",
          "type": "housePlacement",
          "reason": "Positive synastry house placement (5 points): General house placement",
          "description": "Anothe's Ascendant in test's house 1",
          "planet": "Ascendant",
          "house": 1,
          "direction": "B->A"
        },
        {
          "score": 5,
          "source": "synastryHousePlacement",
          "type": "housePlacement",
          "reason": "Positive synastry house placement (5 points): General house placement",
          "description": "Anothe's Midheaven in test's house 10",
          "planet": "Midheaven",
          "house": 10,
          "direction": "B->A"
        },
        {
          "score": 5,
          "source": "synastryHousePlacement",
          "type": "housePlacement",
          "reason": "Positive synastry house placement (5 points): General house placement",
          "description": "Anothe's Chiron in test's house 1",
          "planet": "Chiron",
          "house": 1,
          "direction": "B->A"
        },
        {
          "score": 5,
          "source": "synastryHousePlacement",
          "type": "housePlacement",
          "reason": "Positive synastry house placement (5 points): General house placement",
          "description": "Anothe's Node in test's house 1",
          "planet": "Node",
          "house": 1,
          "direction": "B->A"
        },
        {
          "score": 5,
          "source": "compositeHousePlacement",
          "type": "housePlacement",
          "reason": "Positive composite house placement (5 points): General placement in relevant house",
          "description": "Moon in house 1 and Libra",
          "planet": "Moon",
          "house": 1,
          "direction": "composite"
        },
        {
          "score": 5,
          "source": "compositeHousePlacement",
          "type": "housePlacement",
          "reason": "Positive composite house placement (5 points): General placement in relevant house",
          "description": "Mercury in house 10 and Cancer",
          "planet": "Mercury",
          "house": 10,
          "direction": "composite"
        },
        {
          "score": 5,
          "source": "compositeHousePlacement",
          "type": "housePlacement",
          "reason": "Positive composite house placement (5 points): General placement in relevant house",
          "description": "Venus in house 10 and Cancer",
          "planet": "Venus",
          "house": 10,
          "direction": "composite"
        },
        {
          "score": 5,
          "source": "compositeHousePlacement",
          "type": "housePlacement",
          "reason": "Positive composite house placement (5 points): General placement in relevant house",
          "description": "Sun in house 10 and Cancer",
          "planet": "Sun",
          "house": 10,
          "direction": "composite"
        },
        {
          "score": 5,
          "source": "compositeHousePlacement",
          "type": "housePlacement",
          "reason": "Positive composite house placement (5 points): General placement in relevant house",
          "description": "Mars in house 10 and Cancer",
          "planet": "Mars",
          "house": 10,
          "direction": "composite"
        },
        {
          "score": 5,
          "source": "compositeHousePlacement",
          "type": "housePlacement",
          "reason": "Positive composite house placement (5 points): General placement in relevant house",
          "description": "Uranus in house 5 and Capricorn",
          "planet": "Uranus",
          "house": 5,
          "direction": "composite"
        },
        {
          "score": 5,
          "source": "compositeHousePlacement",
          "type": "housePlacement",
          "reason": "Positive composite house placement (5 points): General placement in relevant house",
          "description": "Neptune in house 5 and Capricorn",
          "planet": "Neptune",
          "house": 5,
          "direction": "composite"
        },
        {
          "score": 5,
          "source": "compositeHousePlacement",
          "type": "housePlacement",
          "reason": "Positive composite house placement (5 points): General placement in relevant house",
          "description": "Ascendant in house 1 and Virgo",
          "planet": "Ascendant",
          "house": 1,
          "direction": "composite"
        },
        {
          "score": 5,
          "source": "compositeHousePlacement",
          "type": "housePlacement",
          "reason": "Positive composite house placement (5 points): General placement in relevant house",
          "description": "Chiron in house 7 and Aries",
          "planet": "Chiron",
          "house": 7,
          "direction": "composite"
        },
        {
          "score": -4,
          "source": "synastry",
          "type": "aspect",
          "reason": "Challenging synastry aspect (-4 points)",
          "description": "test's Saturn in Taurus their 2 house is opposition Anothe's Pluto in Scorpio and their 7 house",
          "aspect": "opposition",
          "orb": 3.5,
          "planet1Sign": "Taurus",
          "planet2Sign": "Scorpio",
          "planet1House": 2,
          "planet2House": 7,
          "pairKey": "pluto_saturn"
        },
        {
          "score": -3,
          "source": "synastry",
          "type": "aspect",
          "reason": "Challenging synastry aspect (-3 points)",
          "description": "test's Moon in Libra their 7 house is opposition Anothe's Chiron in Aries and their 12 house",
          "aspect": "opposition",
          "orb": 4.6,
          "planet1Sign": "Libra",
          "planet2Sign": "Aries",
          "planet1House": 7,
          "planet2House": 12,
          "pairKey": "chiron_moon"
        },
        {
          "score": 3,
          "source": "synastry",
          "type": "aspect",
          "reason": "Positive synastry aspect (3 points)",
          "description": "test's Jupiter in Aries their 2 house is exact square Anothe's Sun in Cancer and their 5 house",
          "aspect": "square",
          "orb": 0.4,
          "planet1Sign": "Aries",
          "planet2Sign": "Cancer",
          "planet1House": 2,
          "planet2House": 5,
          "pairKey": "jupiter_sun"
        },
        {
          "score": -1.25,
          "source": "synastry",
          "type": "aspect",
          "reason": "Challenging synastry aspect (-1.25 points)",
          "description": "test's Venus in Leo their 6 house is exact quincunx Anothe's Node in Pisces and their 12 house",
          "aspect": "quincunx",
          "orb": 0.6,
          "planet1Sign": "Leo",
          "planet2Sign": "Pisces",
          "planet1House": 6,
          "planet2House": 12,
          "pairKey": "node_venus"
        },
        {
          "score": 1,
          "source": "synastry",
          "type": "aspect",
          "reason": "Positive synastry aspect (1 points)",
          "description": "test's Sun in Gemini their 4 house is close opposition Anothe's Midheaven in Capricorn and their 10 house",
          "aspect": "opposition",
          "orb": 1.7,
          "planet1Sign": "Gemini",
          "planet2Sign": "Capricorn",
          "planet1House": 4,
          "planet2House": 10,
          "pairKey": "midheaven_sun"
        },
        {
          "score": 0,
          "source": "synastry",
          "type": "aspect",
          "reason": "Challenging synastry aspect (0 points)",
          "description": "test's Sun in Gemini their 4 house is close opposition Anothe's Uranus in Sagittarius and their 9 house",
          "aspect": "opposition",
          "orb": 1.5,
          "planet1Sign": "Gemini",
          "planet2Sign": "Sagittarius",
          "planet1House": 4,
          "planet2House": 9,
          "pairKey": "sun_uranus"
        },
        {
          "score": 0,
          "source": "composite",
          "type": "aspect",
          "reason": "Challenging composite aspect (0 points)",
          "description": "Venus close sextile Jupiter",
          "aspect": "sextile",
          "orb": 2.1,
          "pairKey": "jupiter_venus"
        }
      ],
      "analysis": "no analysis"
    }
  },
  "clusterAnalysis": {
    
  },
  "holisticOverview": {
    
  },
  "profileAnalysis": {
    "profileResult": {
      "tier": "Challenging",
      "profile": "Learning Curve / Needs Work",
      "clusterScores": {
        "Heart": 45,
        "Body": 68,
        "Mind": 68,
        "Life": 48,
        "Soul": 30
      },
      "statistics": {
        "avg": 51.8,
        "high": 68,
        "low": 30,
        "spread": 38,
        "stdev": 14.6,
        "dominantClusters": [
          "Body",
          "Mind"
        ],
        "laggingClusters": [
          "Soul"
        ]
      },
      "uniformity": "Varied",
      "explanation": "Consistent friction or gaps. Requires conscious effort and growth in multiple areas. Particularly strong in body, mind. Growth opportunities in soul.",
      "confidence": 0.3
    },
    "rawCategoryScores": {
      "OVERALL_ATTRACTION_CHEMISTRY": 61,
      "EMOTIONAL_SECURITY_CONNECTION": 35,
      "SEX_AND_INTIMACY": 71,
      "COMMUNICATION_AND_MENTAL_CONNECTION": 68,
      "COMMITMENT_LONG_TERM_POTENTIAL": 63,
      "KARMIC_LESSONS_GROWTH": 30,
      "PRACTICAL_GROWTH_SHARED_GOALS": 33
    },
    "generatedAt": "2025-07-19T22:32:42.543Z",
    "version": "1.0"
  },
  "tensionFlowAnalysis": {
    "supportDensity": 1.371,
    "challengeDensity": 0.283,
    "polarityRatio": 4.83,
    "quadrant": "Dynamic",
    "totalAspects": 55,
    "supportAspects": 24,
    "challengeAspects": 7,
    "keystoneAspects": [
      {
        "nodes": [
          "A_Sun",
          "B_Chiron"
        ],
        "betweenness": 5.5,
        "score": -10,
        "edgeType": "challenge",
        "aspectType": "square",
        "description": "test's Sun in Gemini their 4 house is exact square Anothe's Chiron in Aries and their 12 house"
      },
      {
        "nodes": [
          "A_Sun",
          "B_Saturn"
        ],
        "betweenness": 5.4,
        "score": -9,
        "edgeType": "challenge",
        "aspectType": "opposition",
        "description": "test's Sun in Gemini their 4 house is close opposition Anothe's Saturn in Sagittarius and their 9 house"
      },
      {
        "nodes": [
          "A_Sun",
          "B_Midheaven"
        ],
        "betweenness": 5,
        "score": 5,
        "edgeType": "support",
        "aspectType": "opposition",
        "description": "test's Sun in Gemini their 4 house is close opposition Anothe's Midheaven in Capricorn and their 10 house"
      },
      {
        "nodes": [
          "A_Moon",
          "B_Sun"
        ],
        "betweenness": 4.9,
        "score": 4,
        "edgeType": "support",
        "aspectType": "sextile",
        "description": "test's Moon in Libra their 7 house is sextile Anothe's Sun in Cancer and their 5 house"
      },
      {
        "nodes": [
          "A_Venus",
          "B_Moon"
        ],
        "betweenness": 4.75,
        "score": 12.5,
        "edgeType": "support",
        "aspectType": "sextile",
        "description": "test's Venus in Leo their 6 house is exact sextile Anothe's Moon in Libra and their 7 house"
      }
    ],
    "networkMetrics": {
      "totalPossibleConnections": 130,
      "actualConnections": 34,
      "connectionDensity": 0.262,
      "averageScore": 4.1
    },
    "insight": {
      "quadrant": "Dynamic",
      "polarityRatio": 4.8,
      "description": "passionate, growth-oriented relationship with both harmony and constructive tension. This partnership thrives on both support and challenge.",
      "recommendations": [
        "Channel the intense energy into creative projects and mutual growth",
        "Learn to distinguish between constructive tension and destructive conflict",
        "Use challenging moments as opportunities for deeper understanding"
      ]
    }
  },
  "categoryTensionFlowAnalysis": null,
  "tensionFlowAnalysisGeneratedAt": null,
  "debug": {
    "inputSummary": {
      "compositeChartId": "687c1d15776effdd74a68758",
      "userAId": "687b0c6b1750220ee4092c9c",
      "userBId": "687c12ef66c231f66d6566db",
      "userAName": "test",
      "userBName": "Anothe"
    },
    "patterns": {
      "totalItems": 169,
      "topStrengthsCount": 7,
      "keyChallengesCount": 5
    },
    "categoryDistribution": {
      "strongestCategories": [
        {
          "category": "SEX_AND_INTIMACY",
          "score": 71.035
        },
        {
          "category": "COMMUNICATION_AND_MENTAL_CONNECTION",
          "score": 67.9
        },
        {
          "category": "COMMITMENT_LONG_TERM_POTENTIAL",
          "score": 63.122499999999995
        }
      ],
      "weakestCategories": [
        {
          "category": "KARMIC_LESSONS_GROWTH",
          "score": 29.695000000000004
        },
        {
          "category": "PRACTICAL_GROWTH_SHARED_GOALS",
          "score": 33.177499999999995
        }
      ],
      "averageScore": 51.58410714285714
    },
    "clusterItemCounts": {
      "Heart": 48,
      "Body": 56,
      "Mind": 19,
      "Life": 59,
      "Soul": 22
    },
    "tensionFlow": {
      "quadrant": "Dynamic",
      "supportDensity": 1.371,
      "challengeDensity": 0.283,
      "keystoneAspectsCount": 5
    }
  },
  "analysis": {
    "OVERALL_ATTRACTION_CHEMISTRY": {
      "relevantPosition": "Synastry Aspects:\n  - test's Venus in Leo their 6 house is exact sextile Anothe's Moon in Libra and their 7 house\n  - test's Venus in Leo their 6 house is square Anothe's Pluto in Scorpio and their 7 house\n  - test's Sun in Gemini their 4 house is close opposition Anothe's Midheaven in Capricorn and their 10 house\n  - test's Mars in Libra their 8 house is close square Anothe's Sun in Cancer and their 5 house\n  - test's Moon in Libra their 7 house is sextile Anothe's Sun in Cancer and their 5 house\n  - test's Sun in Gemini their 4 house is square Anothe's Mars in Aries and their 1 house\n  - test's Sun in Gemini their 4 house is square Anothe's Ascendant in Aries and their 1 house\n  - test's Neptune in Aquarius their 12 house is close sextile Anothe's Ascendant in Aries and their 1 house\n\nSynastry House Placements:\n  - test's Venus in Anothe's house 5\n  - Anothe's Sun in test's house 5\n  - test's Jupiter in Anothe's house 1\n  - Anothe's Ascendant in test's house 1\n  - test's Moon in Anothe's house 7\n  - Anothe's Moon in test's house 7\n  - test's Mercury in Anothe's house 5\n  - test's Mars in Anothe's house 7\n  - test's Saturn in Anothe's house 1\n  - test's Node in Anothe's house 5\n  - Anothe's Mercury in test's house 5\n  - Anothe's Mars in test's house 1\n  - Anothe's Chiron in test's house 1\n  - Anothe's Node in test's house 1\n\nComposite Chart Aspects:\n  - Sun exact conjunction Mars\n  - Venus close conjunction Mars\n  - Venus close conjunction Sun\n  - Venus close sextile Ascendant\n  - Mars sextile Ascendant\n  - Sun sextile Ascendant\n  - Moon square Sun\n  - Moon square Venus\n\nComposite House Placements:\n  - Ascendant in house 1 and Virgo\n  - Moon in house 1 and Libra\n  - Uranus in house 5 and Capricorn\n  - Neptune in house 5 and Capricorn\n  - Chiron in house 7 and Aries",
      "panels": {
        "synastry": "The connection between you is ignited by a powerful romantic spark, highlighted by your Venus and Sun both gracing each other's fifth house, enhancing attraction and vitality. Your emotional landscapes intertwine beautifully, with both moons nestled in your partnership houses, fostering a deep desire for mutual support and nurturing. The uplifting presence of test's Jupiter in Anothe's first house further nurtures optimism and confidence, enriching the chemistry between you.\n\nHowever, a shadow looms as test's Saturn in Anothe's first house may instigate self-consciousness and barriers to vulnerability. This dynamic can create an unspoken tension that affects self-image, leading to potential misunderstandings. To navigate this challenge, focus on open conversations rooted in trust. Allow each other to express insecurities without judgment, fostering a safe space for authenticity. This allows deeper bonding, transforming self-doubt into collective strength.",
        "composite": "The composite chart between Test and Anothe highlights a complex interplay of attraction and tension. With strong Sun-Mars and Venus-Mars conjunctions, the relationship embodies vibrant passion and physical chemistry, suggesting a dynamic energy that draws them together. However, the presence of challenging Moon-Sun and Moon-Venus squares indicates emotional friction and differing needs that can complicate their connection. This tension may bring intense moments but can also stir insecurities.\n\nIn contrast, their synastry shows above-average compatibility, which provides a solid foundation. The composite energy adds layers of attraction while simultaneously highlighting potential pitfalls, inviting both partners to navigate emotional complexities. Overall, this relationship vibrates with alluring chemistry and vibrant potential, yet requires conscious effort to harmonize its more intricate emotional dynamics. The key lies in balancing passion with emotional understanding.",
        "fullAnalysis": "In this relationship, there is a delightful blend of energies that create an exciting, passionate connection. The attraction between both of you feels vibrant and beautifully alive, drawing you closer through shared interests, romantic pursuits, and mutual admiration. \n\nYour dynamic is enriched by the presence of vibrant Sun and Venus placements in each other's fifth house, amplifying the romance, joy, and enthusiasm. Emotional layers deepen as both of your moons find a home within each other’s partnership houses, nurturing a profound desire to support and care for one another. The boost of optimism from test's Jupiter in Anothe's first house adds bright energy to your interactions, fostering a belief in each other and the shared journey ahead.\n\nYet, there's a subtle tension stemming from test's Saturn nestled in Anothe's first house, which may create feelings of self-consciousness and inhibit vulnerability. This dynamic may lead to misunderstandings or feelings of inadequacy if not addressed openly. The challenging aspects from your composite chart, including the Moon-Sun square, indicate that differing emotional needs can arise, sparking moments of friction. Embracing open and honest communication will be vital in navigating these complexities—transforming insecurities into healing discussions that can strengthen your bond.\n\nFor test, leaning into this relationship means embracing vulnerability and encouraging an authentic expression of feelings. Show Anothe that you appreciate their unique qualities, helping dispel any lingering self-doubt. \n\nConversely, for Anothe, being an empathetic listener and reassuring test through words of affirmation can ease their concerns. Openly share your thoughts and feelings to foster closeness, encouraging a nurturing environment where self-assurance can flourish. By actively acknowledging each other's strengths and vulnerabilities, you both can pave the way for deeper intimacy and emotional harmony."
      },
      "generatedAt": "2025-07-22T01:16:53.767Z"
    },

  },
  "vectorizationStatus": {
    "categories": {
      "OVERALL_ATTRACTION_CHEMISTRY": true,
      "EMOTIONAL_SECURITY_CONNECTION": true,
      "SEX_AND_INTIMACY": true,
      "COMMUNICATION_AND_MENTAL_CONNECTION": true,
      "COMMITMENT_LONG_TERM_POTENTIAL": true,
      "KARMIC_LESSONS_GROWTH": true,
      "PRACTICAL_GROWTH_SHARED_GOALS": true
    }
  },
  "workflowStatus": {
    "executionArn": "arn:aws:states:us-east-1:547054413317:execution:RelationshipWorkflowStateMachine-dev:rel-687c1d15-1753146997136-os9y",
    "isRunning": true,
    "startedAt": "2025-07-22T01:16:37.662Z",
    "stepFunctions": {
      "workflowId": "687c1d15776effdd74a68758",
      "workflowType": "relationship",
      "executionArn": "arn:aws:states:us-east-1:547054413317:execution:RelationshipWorkflowStateMachine-dev:rel-687c1d15-1753146997136-os9y",
      "executionName": "rel-687c1d15-1753146997136-os9y",
      "status": "RUNNING",
      "startedAt": "2025-07-22T01:16:37.662Z",
      "createdAt": "2025-07-22T01:16:37.662Z"
    }
  },
  "_id": "687c1d150a1cba497b2c6fd8"
}