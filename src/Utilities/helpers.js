import { orbDegrees, aspects, moonPhases } from './constants';


export const signOrder = [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", 
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
  ];

export const updateObjectKeys = (response) => {
    return response.map(item => {
        return {
            ...item,
            full_degree: item.fullDegree,
            norm_degree: item.normDegree,
            is_retro: item.isRetro,
            // Remove the old keys
            fullDegree: undefined,
            normDegree: undefined,
            isRetro: undefined
        };
    }).map(item => {
        // Clean up the undefined properties
        delete item.fullDegree;
        delete item.normDegree;
        delete item.isRetro;
        return item;
    });
}


// Utility function to get the difference between degrees considering circular nature
export function degreeDifference(deg1, deg2) {
    let diff = Math.abs(deg1 - deg2);
    return diff > 180 ? 360 - diff : diff;
}



const getPlanetData = (transits, planetName) => {
    return transits.find(transit => transit.name === planetName);
};

const getHouseNumber = (risingSign, planetSign) => {
    const risingIndex = signOrder.indexOf(risingSign);
    const planetIndex = signOrder.indexOf(planetSign);
    if (risingIndex === -1 || planetIndex === -1) return -1; // Error handling if sign not found
    return ((planetIndex - risingIndex + 12) % 12) + 1;
  };
  

const calculateAspect = (degree1, degree2, isRetro, transitName) => {
    let diff = Math.abs(degree1 - degree2);
    diff = diff > 180 ? 360 - diff : diff;
    const maxOrb = orbDegrees[transitName];
  
    for (let aspect of aspects) {
      let orbDiff = Math.abs(diff - aspect.orb);
      if (orbDiff <= maxOrb) {
        return { aspectType: aspect.name, orb: orbDiff.toFixed(1) };
      }
    }
    return { aspectType: '', orb: 0 };
  };


  const getMoonPhase = (aspectType, moonDegree, sunDegree) => {
    if (aspectType === 'square' || aspectType === 'sextile' || aspectType === 'trine') {
      const normalizedMoonDegree = (moonDegree + 360) % 360;
      const normalizedSunDegree = (sunDegree + 360) % 360;
      const isWaxing = normalizedMoonDegree > normalizedSunDegree 
        ? (normalizedMoonDegree - normalizedSunDegree <= 180) 
        : (normalizedSunDegree - normalizedMoonDegree > 180);
  
      if (aspectType === 'square') {
        return isWaxing ? 'First Quarter Moon' : 'Last Quarter Moon';
      }
      if (aspectType === 'sextile' || aspectType === 'trine') {
        return isWaxing ? 'Waxing Moon' : 'Waning Moon';
      }
    }
    return moonPhases[aspectType] || '';
  };



export const formatTransitData = (aspect, transits, risingSign = null) => {
    const transitingPlanetData = getPlanetData(transits,aspect.transitingPlanet);
    const aspectingPlanetData = getPlanetData(transits,aspect.aspectingPlanet);

    if (!transitingPlanetData || !aspectingPlanetData) {
      return "Data not available";
    }

    const { aspectType, orb } = calculateAspect(
      transitingPlanetData.full_degree,
      aspectingPlanetData.full_degree,
      transitingPlanetData.is_retro === "true",
      aspect.transitingPlanet
    );

    if (!aspectType) {
      return "No valid aspect found";
    }

    let description = '';


    if (risingSign) {
      const transitingPlanetHouse = getHouseNumber(risingSign, transitingPlanetData.sign);
      const aspectingPlanetHouse = getHouseNumber(risingSign, aspectingPlanetData.sign);

    //   const transitingPlanetDescription = `${aspect.transitingPlanet} in ${transitingPlanetData.sign} in the ${transitingPlanetHouse} house at ${transitingPlanetData.norm_degree.toFixed(1)} degrees`;
    // const aspectingPlanetDescription = `${aspect.aspectingPlanet} in ${aspectingPlanetData.sign} in the ${aspectingPlanetHouse} house at ${aspectingPlanetData.norm_degree.toFixed(1)} degrees`;

      const transitingPlanetDescription = `${aspect.transitingPlanet} in ${transitingPlanetData.sign} in the ${transitingPlanetHouse} house`;
      const aspectingPlanetDescription = `${aspect.aspectingPlanet} in ${aspectingPlanetData.sign} in the ${aspectingPlanetHouse} house`;

      description = `${transitingPlanetDescription} forming a ${aspectType} to ${aspectingPlanetDescription} with an orb of ${orb} degrees`;
    } else {

        // const transitingPlanetDescription = `${aspect.transitingPlanet} in ${transitingPlanetData.sign} at ${transitingPlanetData.norm_degree.toFixed(1)} degrees`;
        // const aspectingPlanetDescription = `${aspect.aspectingPlanet} in ${aspectingPlanetData.sign} at ${aspectingPlanetData.norm_degree.toFixed(1)} degrees`;
      const transitingPlanetDescription = `${aspect.transitingPlanet} in ${transitingPlanetData.sign}`;
      const aspectingPlanetDescription = `${aspect.aspectingPlanet} in ${aspectingPlanetData.sign}`;

      description = `${transitingPlanetDescription} forming a ${aspectType} to ${aspectingPlanetDescription} with an orb of ${orb} degrees`;
    }
    if (aspect.transitingPlanet === 'Moon' && aspect.aspectingPlanet === 'Sun') {
        const moonPhase = getMoonPhase(aspectType, transitingPlanetData.full_degree, aspectingPlanetData.full_degree);
        description += ` (${moonPhase})`;
      }
      return description;

  };


  export const formatTransits = (transit, risingSign) => {
    const { name, sign, norm_degree, house } = transit;
  
    let transitDescription = `The ${name} is transiting ${sign}`;
  
    if (risingSign) {
      const planetHouse = getHouseNumber(risingSign, sign);
      transitDescription += ` in your ${planetHouse} house`;
    }
  
    if (norm_degree < 3) {
      transitDescription += ` (The ${name} is entering ${sign})`;
    } else if (norm_degree > 27) {
      transitDescription += ` (The ${name} is exiting ${sign})`;
    }
  
    return transitDescription;
  };


  export const formatTransitDataForTable = (aspect, transits ) => {
    const transitingPlanetData = getPlanetData(transits,aspect.transitingPlanet);
    const aspectingPlanetData = getPlanetData(transits,aspect.aspectingPlanet);

    if (!transitingPlanetData || !aspectingPlanetData) {
      return "Data not available";
    }

    const { aspectType, orb } = calculateAspect(
      transitingPlanetData.full_degree,
      aspectingPlanetData.full_degree,
      transitingPlanetData.is_retro === "true",
      aspect.transitingPlanet
    );

    if (!aspectType) {
      return "No valid aspect found";
    }

    return {
        aspectType,
        orb,
        transitingPlanet: aspect.transitingPlanet,
        transitingPlanetDegree: transitingPlanetData.full_degree,
        aspectingPlanet: aspect.aspectingPlanet,
        aspectingPlanetDegree: aspectingPlanetData.full_degree
    }

  

  };