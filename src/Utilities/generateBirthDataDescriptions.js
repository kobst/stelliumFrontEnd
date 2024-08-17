import { 
    elements, 
    quadrants, 
    signCodes, 
    planetCodes, 
    transitCodes, 
    orbCodes, 
    ignorePlanets, 
    modalities, 
    ignorePoints,
    rulers, 
    elementPoints } from '../Utilities/constants'




// planets
export function describePlanets(birthData) {
    let planetDescriptions = [];
    
    birthData.planets.forEach(planet => {
      const description = describePlanet(planet);
      planetDescriptions.push(description);
    });
    
    return planetDescriptions;
  }
  
  
function describePlanet(planet) {
    let description = `${planet.name} in ${planet.sign} in the ${getOrdinal(planet.house)} house`;

    if (planet.is_retro === 'true') {
        description += " (retrograde)";
    }

    const planetCode = planetCodes[planet.name];
    const signCode = signCodes[planet.sign];
    const houseCode = planet.house.toString().padStart(2, '0');
    const retroCode = planet.is_retro === 'true' ? 'Pr-' : 'Pp-';

    const code = `${retroCode}${planetCode}${signCode}${houseCode}`;

    return `${description} (${code})`;
}
  
function getOrdinal(n) {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
  

// houses

export function describeHouses(birthData) {
    let responses = [];
    birthData.houses.forEach(houseData => {
        const sign = houseData.sign;
        const houseNum = houseData.house;
        const rulerPlanet = rulers[sign]; 
        if (rulerPlanet) {
          const planetData = birthData.planets.find(p => p.name === rulerPlanet);
          const rulerRetroCode = planetData.is_retro === 'true' ? 'Rr-' : 'Rp-'
          const houseCode = houseNum.toString().padStart(2, '0'); // Pad the house number to ensure it's 2 digits
          const houseCodePlanet = planetData.house.toString().padStart(2, '0')
   
          const description = `${rulerPlanet} ruler of ${sign} and the ${houseNum} house in ${planetData.sign} in ${planetData.house} house`
          const code =  rulerRetroCode + rulerRetroCode.substring(1, 2) + planetCodes[rulerPlanet] + signCodes[sign] + houseCode + signCodes[planetData.sign] + houseCodePlanet
          responses.push(`${description} (${code})`)
          // responses = responses.concat(findAspects(rulerPlanet, birthData));
        }
    })
    return responses;
}


// aspects
export function findAspectsComputed(birthData) {
    let aspectDescriptions = [];
    
    birthData.aspectsComputed.forEach(aspect => {
      const description = addAspectDescriptionComputed(aspect, birthData);
      aspectDescriptions.push(description);
    });
    
    return aspectDescriptions;
  }
  
function addAspectDescriptionComputed(aspect, birthData) {
    const transitingPlanetData = birthData.planets.find(p => p.name === aspect.transitingPlanet);
    const aspectingPlanetData = birthData.planets.find(p => p.name === aspect.aspectingPlanet);

    if (!transitingPlanetData || !aspectingPlanetData) {
        console.error(`Could not find planet data for ${aspect.transitingPlanet} or ${aspect.aspectingPlanet}`);
        return '';
    }

    const orbDesc = orbDescription(aspect.orb);
    const aspectTypeFormatted = aspect.aspectType.charAt(0).toUpperCase() + aspect.aspectType.slice(1);

    const description = `${aspect.transitingPlanet} in ${transitingPlanetData.sign} in the ${transitingPlanetData.house} house ${orbDesc} ${aspectTypeFormatted} ${aspect.aspectingPlanet} in ${aspectingPlanetData.sign} in the ${aspectingPlanetData.house} house`;

    const transitingPlanetCode = planetCodes[aspect.transitingPlanet];
    const aspectingPlanetCode = planetCodes[aspect.aspectingPlanet];
    const transitingSignCode = signCodes[transitingPlanetData.sign];
    const aspectingSignCode = signCodes[aspectingPlanetData.sign];
    const transitingHouseCode = transitingPlanetData.house.toString().padStart(2, '0');
    const aspectingHouseCode = aspectingPlanetData.house.toString().padStart(2, '0');
    const aspectTypeCode = transitCodes[aspect.aspectType];
    const orbCode = orbCodes[orbDesc];

    const code = `A-${transitingPlanetCode}${transitingSignCode}${transitingHouseCode}${orbCode}${aspectTypeCode}${aspectingPlanetCode}${aspectingSignCode}${aspectingHouseCode}`;
    return `${description} (${code})`;
}

// Assuming orbDescription function is defined elsewhere
function orbDescription(orb) {
    if (orb < 1) return "exact";
    if (orb >= 1 && orb < 3) return "close";
    if (orb >= 7 && orb < 10) return "loose";
    return "";
}






// modalities

function getDominanceDescriptionQuadrant(percent) {
    let category = "";
    if (percent > 40.0) {
      category = "extremely concentrated";
    } else if (percent >= 33.5 && percent <= 40.0) {
      category = "very concentrated";
    } else if (percent >= 27.0 && percent <= 33.5) {
      category = "quite concentrated";
    } else if (percent >= 18 && percent <= 27) {
      category = "normally concentrated";
    } else if (percent >= 10 && percent <= 18) {
      category = "sparsely populated";
    } else {
      category = "hardly populated";
    }
    return category;
  }
  
  export function findPlanetsInQuadrant(chartData) {
    const planetsInQuadrants = {
      'SouthEast': [],
      'SouthWest': [],
      'NorthWest': [],
      'NorthEast': []
    };
  
    const quadrantPercentiles = {};
    chartData.planets.forEach(planetData => {
      if (ignorePlanets.includes(planetData.name)) {
        return;
      }
      for (const [quadrant, houses] of Object.entries(quadrants)) {
        if (houses.includes(planetData.house)) {
          planetsInQuadrants[quadrant].push(planetData.name);
        }
      }
    });
  
    const result = [];
    for (const [quad, list] of Object.entries(planetsInQuadrants)) {
      const num = list.length;
      const percentage = num / 10;
      quadrantPercentiles[quad] = percentage;
      const formattedValue = (percentage * 100).toFixed(1);
      const category = getDominanceDescriptionQuadrant(percentage * 100);
      result.push(`${quad} is ${category} with a Percentage: ${formattedValue}% of planets: ${list}`);
    }
  
    const easternHemisphere = quadrantPercentiles['SouthEast'] + quadrantPercentiles['NorthEast'];
    const northernHemisphere = quadrantPercentiles['NorthWest'] + quadrantPercentiles['NorthEast'];
  
    if (easternHemisphere > 0.80) {
      result.push("Vast majority of planets are in the Eastern hemisphere");
    }
    if (easternHemisphere < 0.20) {
      result.push("Vast majority of planets are in the Western hemisphere");
    }
    if (northernHemisphere > 0.80) {
      result.push("Vast majority of planets are in the Northern hemisphere");
    }
    if (northernHemisphere < 0.20) {
      result.push("Vast majority of planets are in the Southern hemisphere");
    }
  
    // console.log(result)
    return result.join("\n");
  }
  
  
  function getDescriptionElementDominance(percent) {
    let category = "";
    if (percent > 40.0) {
      category = "extremely dominant";
    } else if (percent >= 33.5 && percent <= 40.0) {
      category = "very dominant";
    } else if (percent >= 27.0 && percent <= 33.5) {
      category = "very influential";
    } else if (percent >= 18 && percent <= 27) {
      category = "influential";
    } else if (percent >= 10 && percent <= 18) {
      category = "weakly influential";
    } else {
      category = "a negligible influence";
    }
    return category;
  }
  
  export function findPlanetsInElements(chartData) {
    const planetsInElements = { 'Fire': [], 'Earth': [], 'Air': [], 'Water': [] };
    const elementPercentiles = {};
    chartData.planets.forEach(planetData => {
      if (ignorePoints.includes(planetData.name)) {
        return;
      }
      for (const [element, signs] of Object.entries(elements)) {
        if (signs.includes(planetData.sign)) {
          planetsInElements[element].push(planetData.name);
        }
      }
    });
  
    const result = [];
    for (const [element, list] of Object.entries(planetsInElements)) {
      let points = 0;
      list.forEach(planet => {
        if (elementPoints.hasOwnProperty(planet)) {
          points += elementPoints[planet];
        }
      });
  
      const percentage = points / 21;
      elementPercentiles[element] = percentage;
      const formattedValue = (percentage * 100).toFixed(1);
      const category = getDescriptionElementDominance(percentage * 100);
      result.push(`${element} is ${category} with dominance percentage: ${formattedValue}% planets: ${list}`);
    }
  
    return result.join("\n");
  }
   
  
// const modalities = {
// 'Cardinal': ["Aries", "Cancer", "Libra", "Capricorn"],
// 'Fixed': ["Taurus", "Leo", "Scorpio", "Aquarius"],
// 'Mutable': ["Gemini", "Virgo", "Sagittarius", "Pisces"]
// }
const ignoreModalityPoints = [
"Chiron", "Part of Fortune", "South Node", "Midheaven", "Node"
]

export function findPlanetsInModalities(chartData) {
    const planetsInModalities = { 'Cardinal': [], 'Fixed': [], 'Mutable': [] };
    const modalityPercentiles = {};
  
    chartData.planets.forEach(planetData => {
      if (ignoreModalityPoints.includes(planetData.name)) {
        return;
      }
      for (const [modality, signs] of Object.entries(modalities)) {
        if (signs.includes(planetData.sign)) {
          planetsInModalities[modality].push(planetData.name);
        }
      }
    });
  
    const result = [];
    for (const [modality, list] of Object.entries(planetsInModalities)) {
      const num = list.length;
      const percentage = num / 11; // Assuming there are 11 planets
      modalityPercentiles[modality] = percentage;
      const formattedValue = (percentage * 100).toFixed(1);
      result.push(`${modality} Percentage: ${formattedValue}% planets: ${list}`);
    }
  
    return result.join("\n");
  }
  


// Usage
// export const generateResponse = (promptKey, birthData) => {
// // ... existing code ...

// const aspectDescriptions = findAspectsComputed(birthData);
// responses = responses.concat(aspectDescriptions);

// // ... rest of the existing code ...
// }