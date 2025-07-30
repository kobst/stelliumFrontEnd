// Helper functions for Aspect Explorer component

// Convert sign names to two-letter codes
const signToCode = {
  'Aries': 'Ar',
  'Taurus': 'Ta',
  'Gemini': 'Ge',
  'Cancer': 'Ca',
  'Leo': 'Le',
  'Virgo': 'Vi',
  'Libra': 'Li',
  'Scorpio': 'Sc',
  'Sagittarius': 'Sa',
  'Capricorn': 'Cp',
  'Aquarius': 'Aq',
  'Pisces': 'Pi'
};

// Convert planet names to codes
const planetToCode = {
  'Sun': 'Su',
  'Moon': 'Mo',
  'Mercury': 'Me',
  'Venus': 'Ve',
  'Mars': 'Ma',
  'Jupiter': 'Ju',
  'Saturn': 'Sa',
  'Uranus': 'Ur',
  'Neptune': 'Ne',
  'Pluto': 'Pl',
  'Ascendant': 'As',
  'Midheaven': 'Mc',
  'Node': 'No',
  'North Node': 'No',
  'Chiron': 'Ch'
};

// Convert aspect types to codes
const aspectToCode = {
  'conjunction': 'Co',
  'opposition': 'Op',
  'trine': 'Tr',
  'square': 'Sq',
  'sextile': 'Sx',
  'quincunx': 'Qu'
};

// Generate aspect code
export const generateAspectCode = (aspect, planet1Data, planet2Data) => {
  const planet1Code = planetToCode[aspect.aspectedPlanet] || aspect.aspectedPlanet.substring(0, 2);
  const planet2Code = planetToCode[aspect.aspectingPlanet] || aspect.aspectingPlanet.substring(0, 2);
  const aspectCode = aspectToCode[aspect.aspectType.toLowerCase()] || aspect.aspectType.substring(0, 2);
  
  const planet1Sign = signToCode[planet1Data.sign] || planet1Data.sign.substring(0, 2);
  const planet2Sign = signToCode[planet2Data.sign] || planet2Data.sign.substring(0, 2);
  
  // House numbers - use 00 if no house data
  const planet1House = planet1Data.house ? String(planet1Data.house).padStart(2, '0') : '00';
  const planet2House = planet2Data.house ? String(planet2Data.house).padStart(2, '0') : '00';
  
  return `A-${planet1Code}s${planet1Sign}${planet1House}Ca${aspectCode}${planet2Code}s${planet2Sign}${planet2House}`;
};

// Generate position code
export const generatePositionCode = (planet) => {
  const planetCode = planetToCode[planet.name] || planet.name.substring(0, 2);
  const signCode = signToCode[planet.sign] || planet.sign.substring(0, 2);
  const houseNumber = planet.house ? String(planet.house).padStart(2, '0') : '00';
  
  return `Pp-${planetCode}${signCode}${houseNumber}`;
};

// Format aspect data for API
export const formatAspectData = (aspect, planet1Data, planet2Data) => {
  return {
    type: 'aspect',
    code: generateAspectCode(aspect, planet1Data, planet2Data),
    planet1: aspect.aspectedPlanet,
    planet1Sign: planet1Data.sign,
    planet1House: planet1Data.house || null,
    planet2: aspect.aspectingPlanet,
    planet2Sign: planet2Data.sign,
    planet2House: planet2Data.house || null,
    aspectType: aspect.aspectType.toLowerCase(),
    orb: aspect.orb,
    description: `${aspect.aspectedPlanet} in ${planet1Data.sign}${planet1Data.house ? ` in ${getOrdinal(planet1Data.house)} house` : ''} ${aspect.aspectType.toLowerCase()} ${aspect.aspectingPlanet} in ${planet2Data.sign}${planet2Data.house ? ` in ${getOrdinal(planet2Data.house)} house` : ''}`
  };
};

// Format position data for API
export const formatPositionData = (planet) => {
  return {
    type: 'position',
    code: generatePositionCode(planet),
    planet: planet.name,
    sign: planet.sign,
    house: planet.house || null,
    isRetrograde: planet.is_retro === 'true',
    degree: planet.norm_degree,
    description: `${planet.name} in ${planet.sign}${planet.house ? ` in ${getOrdinal(planet.house)} house` : ''}`
  };
};

// Helper function to get ordinal numbers
const getOrdinal = (n) => {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

// Find planet data by name
export const findPlanetData = (planetName, planets) => {
  return planets.find(p => p.name === planetName) || null;
};