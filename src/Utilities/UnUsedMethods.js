import { planetCodes, signCodes, transitCodes } from "./constants";
import { decodeAspectsInTransits } from "./decoder";


import { signs } from "./constants";


// just a test function, takes in grouped transits and returns a map of planetary transits
export function trackPlanetaryTransits(transitsData) {
    const planetaryTransits = {};

    // Initialize the structure for each planet
    for (const date in transitsData) {
        if (transitsData.hasOwnProperty(date)) {
            const dailyTransits = transitsData[date];
            dailyTransits.forEach(transit => {
                if (!planetaryTransits[transit.name]) {
                    planetaryTransits[transit.name] = {
                        planet: transit.name,
                        transitSigns: []
                    };
                }
            });
            break; // Only need to initialize once
        }
    }

    // Track the transits
    for (const date in transitsData) {
        if (transitsData.hasOwnProperty(date)) {
            const dailyTransits = transitsData[date];
            dailyTransits.forEach(transit => {
                const planetName = transit.name;
                const currentSign = transit.sign;
                const previousTransit = planetaryTransits[planetName].transitSigns.slice(-1)[0];

                if (previousTransit && previousTransit.transitingSign === currentSign) {
                    // If the sign is the same, just update the endDate
                    previousTransit.dateRange[1] = date;
                } else {
                    // If the sign changes, finalize the previous transit and start a new one
                    planetaryTransits[planetName].transitSigns.push({
                        transitingSign: currentSign,
                        dateRange: [date, date]
                    });
                }
            });
        }
    }

    return planetaryTransits;
}


// takes in grouped transits and returns a list of planets with their transits through the given birth chart houses
export function trackPlanetaryHouses(transitsData, birthChartHouses) {
    const planetaryHouses = {};

    // Sort the birthChartHouses by degree
    birthChartHouses.sort((a, b) => a.degree - b.degree);

    // Initialize the structure for each planet
    for (const date in transitsData) {
        if (transitsData.hasOwnProperty(date)) {
            const dailyTransits = transitsData[date];
            dailyTransits.forEach(transit => {
                if (!planetaryHouses[transit.name]) {
                    planetaryHouses[transit.name] = {
                        planet: transit.name,
                        transitHouses: []
                    };
                }
            });
            break; // Only need to initialize once
        }
    }

    // Track the houses
    for (const date in transitsData) {
        if (transitsData.hasOwnProperty(date)) {
            const dailyTransits = transitsData[date];
            dailyTransits.forEach(transit => {
                const planetName = transit.name;
                const currentDegree = transit.fullDegree;
                
                // Determine the current house based on the fullDegree
                let currentHouse = null;
                for (let i = 0; i < birthChartHouses.length; i++) {
                    const currentHouseDegree = birthChartHouses[i].degree;
                    const nextHouseDegree = i < birthChartHouses.length - 1 
                        ? birthChartHouses[i + 1].degree 
                        : birthChartHouses[0].degree + 360; // Wrap-around case

                    if (currentDegree >= currentHouseDegree && currentDegree < nextHouseDegree) {
                        currentHouse = birthChartHouses[i].house;
                        break;
                    }
                }

                const previousHouseTransit = planetaryHouses[planetName].transitHouses.slice(-1)[0];

                if (previousHouseTransit && previousHouseTransit.transitingHouse === currentHouse) {
                    // If the house is the same, just update the endDate
                    previousHouseTransit.dateRange[1] = date;
                } else {
                    // If the house changes, finalize the previous transit and start a new one
                    planetaryHouses[planetName].transitHouses.push({
                        transitingHouse: currentHouse,
                        dateRange: [date, date]
                    });
                }
            });
        }
    }

    return planetaryHouses;
}


export const findAspectsInTransits = (positions, type) => {
    let aspects = []
    const transitProgressedType = type === 'progressed' ? 'GG-' : 'TT-'
    for (let i = 0; i < positions.length - 2; i++) {
        for (let j = i + 1; j < positions.length - 1; j++) {
            const planetData_a = positions[i]
            const planetData_b = positions[j]
            const degree_a = planetData_a.full_degree
            const degree_b = planetData_b.full_degree
            const retroCodeA = planetData_a.is_retro === 'true' ? 'r' : 'p'
            const retroCodeB = planetData_b.is_retro === 'true' ? 'r' : 'p'
            const planet_a_sign = planetData_a.sign
            const planet_b_sign = planetData_b.sign
            let aspect = calculateAspect(degree_a, degree_b, planetData_a.is_retro)
            if (aspect !== '') {
                const code = transitProgressedType + retroCodeA + planetCodes[planetData_a.name] + signCodes[planet_a_sign] + aspect 
                + retroCodeB + planetCodes[planetData_b.name] + signCodes[planet_b_sign]
                const description = decodeAspectsInTransits(code)
                aspects.push(code)
                aspects.push(description)
            }
        }
    }
    return aspects
}


export const findEnteringLeavingTransits = (codes) => {
    // Initialize an array to hold codes indicating the Sun or Moon entering or leaving
    let transits = [];
  
    // Regular expression to match codes where the Sun or Moon is entering or leaving
    const pattern = /H[tr]-p(Su|Mo)[EL][es][^T]*T\d{2}/;
  
    // Iterate over each code in the array
    codes.forEach(code => {
      // Check if the code matches the pattern for entering or leaving
      if (pattern.test(code)) {
        transits.push(code);
      }
    });
  
    return transits;
  }



function calculateAspect(degree1, degree2, isRetro) {
    let diff = Math.abs(degree1 - degree2);
    diff = diff > 180 ? 360 - diff : diff;
  
    // Define the aspects in an array to simplify the checks
    const aspects = [
      { name: 'conjunction', min: 0, max: 5, diff: 0 },
      { name: 'sextile', min: 55, max: 66, diff: 60 },
      { name: 'square', min: 85, max: 96, diff: 90 },
      { name: 'trine', min: 115, max: 125, diff: 120 },
      { name: 'quincunx', min: 147, max: 153, diff: 150 },
      { name: 'opposition', min: 177, max: 180, diff: 180 },
    ];
  
    for (let aspect of aspects) {
      if (diff >= aspect.min && diff <= aspect.max) {
        let orbDiff = Math.abs(diff - aspect.diff);
        let code = transitCodes[aspect.name];
  
        code = orbDiff < 1 ? 'e' + code : 'g' + code;

        let perfectOrbDegree = degree1 + aspect.orb
        perfectOrbDegree = perfectOrbDegree > 360 ? perfectOrbDegree - 360 : perfectOrbDegree
  
        if (perfectOrbDegree < degree2 || (degree2 < 3 && perfectOrbDegree > 360 - degree2)) {
            if (!isRetro) {
                code = 'ap' + code;
            } else{
                code = 'sp' + code
            }
        } else {
            if (isRetro) {
                code = 'ap' + code;
            } else{
                code = 'sp' + code
            }
        }
        return code;
      }
    }
    return '';
  }


  export const findSunMoonAspects = (codes) => {
    // Initialize an array to hold codes that indicate an aspect between the Sun and Moon
    let sunMoonAspects = [];
  
    // Iterate over each code in the array
    codes.forEach(code => {
      // Check if the code contains indicators for the Sun and Moon in aspect
      if (code.includes('pSu') && (code.includes('pMo') || code.includes('Mos'))) {
        sunMoonAspects.push(code);
      }
    });
  
    return sunMoonAspects;
  }
  



function generatePlanetObject(name, rawResponse, house) {
    let ascendantDegree = rawResponse[name];
    let normalDegree = ascendantDegree;
    let signId = 1;
    while (normalDegree > 30) {
      signId += 1;
      normalDegree -= 30;
    }
  
    const nameCapped = name.charAt(0).toUpperCase() + name.slice(1);
  
    const newObject = {
      name: nameCapped,
      full_degree: ascendantDegree,
      norm_degree: normalDegree,
      speed: 0.4995,
      is_retro: "false",
      sign_id: signId,
      sign: signs[signId - 1],
      house: house
    };
  
    return newObject;
  }

function addSouthNode(rawResponse) {
    for (let planetObject of rawResponse["planets"]) {
      if (planetObject["name"] === "Node") {
        let fullDegree = planetObject["fullDegree"] + 180;
        let house = planetObject["house"] + 6;
  
        if (fullDegree > 360) {
          fullDegree -= 360;
        }
  
        if (house > 12) {
          house -= 12;
        }
  
        let signId = 1;
        let normalDegree = fullDegree;
        while (normalDegree > 30) {
          signId += 1;
          normalDegree -= 30;
        }
  
        const southNodeObject = {
          name: "South Node",
          full_degree: fullDegree,
          norm_degree: normalDegree,
          speed: 0.4995,
          is_retro: false, // Assuming you want a boolean value here, as in the earlier example
          sign_id: signId,
          sign: signs[signId - 1], // Assumes 'signs' array is defined elsewhere
          house: house
        };
  
        return southNodeObject;
      }
    }
  }
  
function modifyRawResponse(rawResponse) {
  if (rawResponse.planets) {
    for (let planet of rawResponse.planets) {
      if (planet.name === "Ascendant") {
          console.log("Ascendant exists xxx");
          return rawResponse;;
      }
    }
  }
  const ascendantObject = generatePlanetObject("ascendant", rawResponse, 1);
  const midheavenObject = generatePlanetObject("midheaven", rawResponse, 10);
  // console.log(rawResponse)
  const southNodeObject = addSouthNode(rawResponse); 
    rawResponse["planets"].splice(10, 0, ascendantObject);
    rawResponse["planets"].splice(11, 0, midheavenObject);
    rawResponse["planets"].splice(13, 0, southNodeObject);
  
    return rawResponse;
  }

export default modifyRawResponse