import { orbDegrees, aspects, moonPhases } from './constants';
import { postDailyAspects, postDailyTransits, postPeriodAspects, postPeriodTransits, postDailyRetrogrades } from './api';

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
    console.log(degree1, degree2, isRetro, transitName)
    let diff = Math.abs(degree1 - degree2);
    diff = diff > 180 ? 360 - diff : diff;
    const maxOrb = orbDegrees[transitName];
    console.log(maxOrb)
  
    for (let aspect of aspects) {
      console.log(aspect.name)
      console.log(diff)
      console.log(aspect.orb)
      let orbDiff = Math.abs(diff - aspect.orb);

      if (orbDiff <= maxOrb) {
        return { aspectType: aspect.name, orb: orbDiff.toFixed(1) };
      }
    }
    return { aspectType: '', orb: 100 };
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
    const aspectingPlanetData = getPlanetData(transits, aspect.aspectingPlanet);

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
    const transitingPlanetData = getPlanetData(transits, aspect.transitingPlanet);
    const aspectingPlanetData = getPlanetData(transits, aspect.aspectingPlanet);

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
      console.log(aspect)
      return "No valid aspect found";
    }

    return {
        aspectType,
        orb,
        transitingPlanet: aspect.transitingPlanet,
        transitingPlanetDegree: transitingPlanetData.full_degree,
        transitingPlanetSign: transitingPlanetData.sign,
        aspectingPlanet: aspect.aspectingPlanet,
        aspectingPlanetDegree: aspectingPlanetData.full_degree,
        aspectingPlanetSign: aspectingPlanetData.sign
    }
  };

  export const isValidPeriodTransits = (transits) => {
    if (!transits || typeof transits !== 'object') return false;
    return Object.values(transits).some(planetData => 
      planetData && 
      Array.isArray(planetData.transitSigns) && 
      planetData.transitSigns.length > 0
    );
  };


  export const formatTransitDataForTableWeekly = (aspect, periodTransits) => {
    const transitingPlanetData = periodTransits[aspect.transitingPlanet];
    const aspectingPlanetData = periodTransits[aspect.aspectingPlanet];
  
    // Find the sign at the closest orb date
    const getSignAtDate = (planetData, date) => {
      return planetData.transitSigns.find(sign => 
        new Date(sign.dateRange[0]) <= new Date(date) && new Date(date) <= new Date(sign.dateRange[1])
      )?.transitingSign || 'Unknown';
    };
  
    return {
      aspectType: aspect.aspectType,
      closestOrbDate: aspect.closestOrbDate,
      transitingPlanetSignAtOrb: getSignAtDate(transitingPlanetData, aspect.closestOrbDate),
      aspectingPlanetSignAtOrb: getSignAtDate(aspectingPlanetData, aspect.closestOrbDate),
      transitingPlanet: aspect.transitingPlanet,
      transitingPlanetAllSigns: transitingPlanetData.transitSigns.map(sign => sign.transitingSign),
      aspectingPlanet: aspect.aspectingPlanet,
      aspectingPlanetAllSigns: aspectingPlanetData.transitSigns.map(sign => sign.transitingSign)
    };
  };



  export const formatTransitDataDescriptionsForTableWeekly = (transit) => {
    const {
      planet,
      transitingSign,
      dateRange,
      signChange
    } = transit;
  
    const startDate = new Date(dateRange[0]).toLocaleDateString();
    const endDate = new Date(dateRange[1]).toLocaleDateString();
  
    let description;
    if (signChange === 'entering') {
      description = `Transiting ${planet} is entering ${transitingSign} on ${startDate}`;
    } else if (signChange === 'exiting') {
      description = `${planet} is exiting ${transitingSign} on ${endDate}`;
    } else {
      description = `Transiting ${planet} in ${transitingSign} from ${startDate} to ${endDate}`;
    }
  
    return description;
  };

  export const formatAspecttDataDescriptionForTableDataWeekly = (aspectData) => {
    const {
      transitingPlanet,
      transitingPlanetSignAtOrb,
      aspectType,
      aspectingPlanet,
      aspectingPlanetSignAtOrb
    } = aspectData;
  
    return `Transiting ${transitingPlanet} in ${transitingPlanetSignAtOrb} ${aspectType} ${aspectingPlanet} in ${aspectingPlanetSignAtOrb}`;
  };



  export const formatTransitDataForUser = (aspect, periodTransits, userPlanets) => {
    const transitingPlanetData = periodTransits[aspect.transitingPlanet];
  // console.log("transitingPlanetData")
  // console.log(transitingPlanetData)
    // Find the sign at the closest orb date
    const getSignAtDate = (planetData, date) => {
      return planetData.transitSigns.find(sign => 
        new Date(sign.dateRange[0]) <= new Date(date) && new Date(date) <= new Date(sign.dateRange[1])
      )?.transitingSign || 'Unknown';
    };

    const aspectingPlanetData = userPlanets.find(planet => planet.name === aspect.aspectingPlanet);
  
    return {
      aspectType: aspect.aspectType,
      dateRange: aspect.dateRange,
      closestOrbDate: aspect.closestOrbDate,
      transitingPlanetSignAtOrb: getSignAtDate(transitingPlanetData, aspect.closestOrbDate),
      transitingPlanet: aspect.transitingPlanet,
      transitingPlanetAllSigns: transitingPlanetData.transitSigns.map(sign => sign.transitingSign),
      aspectingPlanet: aspect.aspectingPlanet,
      aspectingPlanetSign: aspectingPlanetData.sign,
      aspectPlanetHouse: aspectingPlanetData.house
    };
  };



  export const findMostRelevantAspects = (transitAspectObjects, transits) => {
    console.log(transitAspectObjects);
    console.log(transits);

    const relevantPlanets = ['Venus', 'Mercury', 'Mars', 'Moon', 'Jupiter', 'Saturn', 'Sun'];

    // Filter aspects to only include those with relevant transiting planets
    const relevantAspects = transitAspectObjects.filter(aspect => 
      relevantPlanets.includes(aspect.transitingPlanet)
    );

    // If no relevant aspects, return null
    if (relevantAspects.length === 0) {
      return null;
    }

    // Sort aspects by orb value (ascending) and then by planet priority
    const sortedAspects = relevantAspects.sort((a, b) => {
      // First, compare orb values
      if (a.orb !== b.orb) {
        return a.orb - b.orb;
      }
      
      // If orbs are equal, compare planet priority
      return relevantPlanets.indexOf(a.transitingPlanet) - relevantPlanets.indexOf(b.transitingPlanet);
    });

    // Find transits with norm_degree below 1.5 or above 28.5
    const criticalTransits = transits.filter(transit => 
      (transit.norm_degree < 1.5 || transit.norm_degree > 28.5) && relevantPlanets.includes(transit.name)
    );

    // Prepare the result object
    const result = {
      mostRelevantAspect: sortedAspects[0],
      criticalTransits: criticalTransits.length > 0 ? criticalTransits : null
    };

    return result;
  }




  const houseMapping = {
    Aries: 1,
    Taurus: 2,
    Gemini: 3,
    Cancer: 4,
    Leo: 5,
    Virgo: 6,
    Libra: 7,
    Scorpio: 8,
    Sagittarius: 9,
    Capricorn: 10,
    Aquarius: 11,
    Pisces: 12
  };
  
  const houseNumberGetter = (baseSign, targetSign) => {
    const baseHouse = houseMapping[baseSign];
    const targetHouse = houseMapping[targetSign];
    let houseNumber = targetHouse - baseHouse + 1;
    if (houseNumber <= 0) {
      houseNumber += 12;
    }
    return houseNumber;
  };

  export const appendHouseDescriptions = (formattedTransits, formattedAspects, sign) => {
    const appendHouseToTransit = (transit) => {
      const match = transit.match(/Transiting (\w+) is entering (\w+) on (\d{1,2}\/\d{1,2}\/\d{4})/);
      if (match) {
        const [_, planet, transitingSign, date] = match;
        const houseNumber = houseNumberGetter(sign, transitingSign);
        return `Transiting ${planet} is entering ${transitingSign} and your ${houseNumber} house on ${date}`;
      }
      return transit;
    };
  
    const appendHouseToAspect = (aspect) => {
      const match = aspect.match(/Transiting (\w+) in (\w+) (\w+) (\w+) in (\w+)/);
      if (match) {
        const [_, transitingPlanet, transitingSign, aspectType, aspectingPlanet, aspectingSign] = match;
        const transitingHouse = houseNumberGetter(sign, transitingSign);
        const aspectingHouse = houseNumberGetter(sign, aspectingSign);
        return `Transiting ${transitingPlanet} in ${transitingSign} in your ${transitingHouse} house ${aspectType} ${aspectingPlanet} in ${aspectingSign} in your ${aspectingHouse} house`;
      }
      return aspect;
    };
  
    const updatedTransits = formattedTransits.map(appendHouseToTransit);
    const updatedAspects = formattedAspects.map(appendHouseToAspect);
  
    return { updatedTransits, updatedAspects };
  };




  export const handleFetchDailyTransits = async (date) => {
    try {
      const transitsData = await postDailyTransits(date);
      const cleanedTransits = updateObjectKeys(transitsData);
      // console.log("dailyTransits")
      // console.log(dailyTransits)
      return cleanedTransits
    } catch (error) {
      throw new Error(error.message);
    }
  };


  export const handleFetchInstantAspects = async (date) => {
    try {
        const aspectsData = await postDailyAspects(date);
        return aspectsData

        
    } catch (error) {
        throw new Error(error.message);
  }
};



  export const handleFetchDailyAspects = async (date) => {
      try {
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
          // const aspectsData = await postDailyAspects(date);
          // setDailyTransitAspects(aspectsData);
          const aspectsData = await postPeriodAspects(date, endOfDay);
          return aspectsData

          
      } catch (error) {
          throw new Error(error.message);
    }
  };

export const handleFetchPeriodTransits = async (startDate, endDate) => {
  try {
    const transitsData = await postPeriodTransits(startDate, endDate);
  //   const planetaryTransits = trackPlanetaryTransits(transitsData);
  //   console.log("planetaryTransits")
  //   console.log(planetaryTransits)
      // setPeriodTransits(transitsData);   
      return transitsData
  } catch (error) {
    throw new Error(error.message);
  }
};

export const handleFetchPeriodAspects = async (startDate, endDate) => {
    try {
        const periodAspectsData = await postPeriodAspects(startDate, endDate);
        console.log("periodAspectsData (before filtering)", periodAspectsData);

        const filteredAspects = periodAspectsData.filter(aspect => {
            // return true;
          // Keep all aspects where Moon is not the transiting planet
          if (aspect.transitingPlanet !== "Moon") {
            return true;
          }
          // For Moon transits, only keep Sun oppositions and conjunctions
          return (
            aspect.aspectingPlanet === "Sun" &&
            (aspect.aspectType === "opposition" || aspect.aspectType === "conjunction")
          );
        });
        return filteredAspects
    } catch (error) {
      throw new Error(error.message);
    }
  };


  export const handleFetchRetrogrades = async (startDate) => {
    try {
        const retrogrades = await postDailyRetrogrades(startDate);
        return retrogrades
    } catch (error) {
      throw new Error(error.message);
    }
  };


  export const findWeeklyTransits = (transits, userPlanets) => {
    const today = new Date();
    const dayOfWeek = today.getDay();
  
    // Check if today is Sunday (0 represents Sunday)
    // if (dayOfWeek !== 0) {
    //   console.log("not a sunday")
    //   return null;
      
    // }
  
    const nextSevenDays = new Date(today);
    nextSevenDays.setDate(today.getDate() + 7);
  
    const transitsWithinNextSevenDays = transits
      .filter(transit => {
        const closestOrbDate = new Date(transit.closestOrbDate);
        return closestOrbDate >= today && closestOrbDate <= nextSevenDays;
      })
      .map(transit => generateTransitString(transit, userPlanets));

      console.log("transitsWithinNextSevenDays")
      console.log(transitsWithinNextSevenDays)
  
    const transitsWithinCurrentDateRange = transits
      .filter(transit => {
        const startDate = new Date(transit.dateRange[0]);
        const endDate = new Date(transit.dateRange[1]);
        return today >= startDate && today <= endDate;
      })
      .map(transit => generateTransitString(transit, userPlanets));
  

      console.log("transitsWithinCurrentDateRange")
      console.log(transitsWithinCurrentDateRange)
    return {
      transitsWithinNextSevenDays,
      transitsWithinCurrentDateRange
    };
  };


  export const generateTransitString = (transit, userPeriodHouseTransits) => {
    const {
      transitingPlanet,
      transitingPlanetSignAtOrb,
      aspectType,
      aspectingPlanet,
      aspectingPlanetSign,
      aspectPlanetHouse,
      closestOrbDate
    } = transit;
  
    const formattedDate = new Date(closestOrbDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const transitingHouse = findTransitingHouse(transitingPlanet, closestOrbDate, userPeriodHouseTransits);

  
    return `${transitingPlanet} in the ${transitingHouse} house and ${transitingPlanetSignAtOrb} ${aspectType} natal ${aspectingPlanet} in ${aspectingPlanetSign} and the ${aspectPlanetHouse} house on ${formattedDate}`;
  };

  const findTransitingHouse = (planet, date, houseTransits) => {
    console.log("houseTransits")
    console.log(houseTransits)
    console.log("planet")
    console.log(planet)
    console.log("date")
    console.log(date)
    const planetTransits = houseTransits[planet];
    if (!planetTransits) {
      console.log("no planet transits")
      return '';
    }
  
    const transitHouse = planetTransits.transitHouses.find(transit => {
      const startDate = new Date(transit.dateRange[0]);
      const endDate = new Date(transit.dateRange[1]);
      const compareDate = new Date(date);
      return compareDate >= startDate && compareDate <= endDate;
    });
  
    console.log("transitHouse")
    console.log(transitHouse)
    return transitHouse ? `${transitHouse.transitingHouse}` : '';
  };