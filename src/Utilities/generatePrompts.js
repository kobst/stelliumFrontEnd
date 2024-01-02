
import { relevantPromptAspects, rulers } from "./constants";

function orbDescription(orb) {
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
  

function generateResponse(promptKey, birthData) {
    const prompt = relevantPromptAspects[promptKey];
    let responses = [];
    console.log(birthData)
    console.log(prompt.planets)
    console.log(prompt.houses)
  
    // Planets and their aspects
    prompt.planets.forEach(planet => {
      const planetData = birthData.planets.find(p => p.name === planet);
      console.log(planetData)
      if (planetData.is_retro === "false") {
        // console.log("retro false")
        responses.push(`${planet} in ${planetData.sign} in the ${planetData.house} house`);
      }
      if (planetData.is_retro === "true") {
        // console.log("retro ")

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


export default generateResponse
  