
import { elements, elementPoints, relevantPromptAspects, rulers, quadrants, ignorePlanets, ignorePoints } from "./constants";

export const orbDescription = (orb) => {
    if (orb < 1) {
      return "exact";
    } else if (orb >= 1 && orb < 3) {
      return "close";
    } else if (orb >= 7 && orb < 10) {
      return "loose";
    } else {
      return "";
    }
  }
  

function findAspects(planetName, birthData) {
    let aspectList = [];
    birthData.aspects.forEach(aspect => {
      if (aspect.aspecting_planet === planetName) {
        const aspectPhrase = addAspectDescription(aspect, birthData, true);
        aspectList.push(aspectPhrase);
      }
      if (aspect.aspected_planet === planetName) {
        const aspectPhrase = addAspectDescription(aspect, birthData, false);
        aspectList.push(aspectPhrase);
      }
    });
    return aspectList;
  }

  function addAspectDescription(aspect, birthData, aspecting) {
    const aspectType = aspect.type.toLowerCase();
    let otherPlanet = "";
    let otherPlanetId = "";
    let planetName = "";
  
    if (aspecting) {
      planetName = aspect.aspecting_planet;
      otherPlanet = 'aspected_planet';
      otherPlanetId = 'aspected_planet_id';
    } else {
      planetName = aspect.aspected_planet;
      otherPlanet = 'aspecting_planet';
      otherPlanetId = 'aspecting_planet_id';
    }
  
    const orbDesc = orbDescription(aspect.orb); // Assuming orbDescription is defined elsewhere
    return `${planetName} ${orbDesc} ${aspectType} to ${aspect[otherPlanet]} in ${birthData.planets[aspect[otherPlanetId]].sign} in ${birthData.planets[aspect[otherPlanetId]].house} house`;
  }
  

export const generateResponse = (promptKey, birthData) => {
    const prompt = relevantPromptAspects[promptKey];
    let responses = [];
    // console.log(birthData)
    // console.log(prompt.planets)
    // console.log(prompt.houses)
  
    // Planets and their aspects
    prompt.planets.forEach(planet => {
      const planetData = birthData.planets.find(p => p.name === planet);
      if (planetData.is_retro === "false") {
        responses.push(`${planet} in ${planetData.sign} in the ${planetData.house} house`);
      }
      if (planetData.is_retro === "true") {

        responses.push(`${planet} is retrograde in ${planetData.sign} in the ${planetData.house} house`);
      }

      // Assuming findAspects is a function defined elsewhere
      responses = responses.concat(findAspects(planet, birthData));
    });
    // console.log(responses)
  
    // Planets in specified houses and their aspects
    prompt.houses.forEach(houseNum => {
      const houseData = birthData.houses.find(h => h.house === houseNum);
      const sign = houseData.sign;
      const rulerPlanet = rulers[sign]; // Assuming rulers is an object defined elsewhere
      if (rulerPlanet) {
        const planetData = birthData.planets.find(p => p.name === rulerPlanet);
        responses.push(`${rulerPlanet} ruler of ${sign} in ${houseNum} house in ${planetData.sign} in ${planetData.house} house`);
        // responses = responses.concat(findAspects(rulerPlanet, birthData));
      }
      birthData.planets.forEach(planet => {
        if (!prompt.planets.includes(planet.name)) {
          if (planet.house === houseNum) {
            if (planet.is_retro === "false") {
              responses.push(`${planet.name} in ${houseNum} house in ${planet.sign} house`);
            }
            if (planet.is_retro === "true") {
              responses.push(`${planet.name} is retrograde in ${houseNum} house in ${planet.sign} house`);
            }
            responses = responses.concat(findAspects(planet.name, birthData));
          }
        }
      });
    });
  
    return responses.join("\n");
  }

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
  
  export const findPlanetsInQuadrant = (chartData) => {
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
  
  export const findPlanetsInElements = (chartData) =>  {
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
   
  
  const modalities = {
    'Cardinal': ["Aries", "Cancer", "Libra", "Capricorn"],
    'Fixed': ["Taurus", "Leo", "Scorpio", "Aquarius"],
    'Mutable': ["Gemini", "Virgo", "Sagittarius", "Pisces"]
  }
  const ignoreModalityPoints = [
    "Chiron", "Part of Fortune", "South Node", "Midheaven", "Node"
  ]

export const findPlanetsInModalities = (chartData) => {
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
  