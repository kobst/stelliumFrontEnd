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
export function describePlanets(birthData, planet = null) {
  let planetDescriptions = [];
  
  birthData.planets.forEach(planetData => {
      if (!planet || planetData.name === planet) {
          const description = describePlanet(planetData);
          planetDescriptions.push(description);
      }
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

export function describeHouses(birthData, planet = null) {
  let responses = [];
  birthData.houses.forEach(houseData => {
      const sign = houseData.sign;
      const houseNum = houseData.house;
      const rulerPlanet = rulers[sign]; 
      if (rulerPlanet && (!planet || rulerPlanet === planet)) {
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
export function findAspectsComputed(birthData, planet = null) {
  let aspectDescriptions = [];
  
  birthData.aspectsComputed.forEach(aspect => {
      if (!planet || aspect.transitingPlanet === planet || aspect.aspectingPlanet === planet) {
          const description = addAspectDescriptionComputed(aspect, birthData);
          aspectDescriptions.push(description);
      }
  });
  
  return aspectDescriptions;
}

/*
 * Deprecated helper that produced aspect descriptions using the non-computed
 * aspects list. It is currently unused but retained for future reference.
 */
// export function findAspectsNonComputed(birthData, planet = null) {
//   let aspectDescriptions = [];
//
//   birthData.aspects.forEach(aspect => {
//       if (!planet || aspect.transitingPlanet === planet || aspect.aspectingPlanet === planet) {
//           const description = addAspectDescriptionComputed(aspect, birthData);
//           aspectDescriptions.push(description);
//       }
//   });
//
//   return aspectDescriptions;
// }
  
export function addAspectDescriptionComputed(aspect, birthData) {
    const transitingPlanetData = birthData.planets.find(p => p.name === aspect.aspectingPlanet);
    const aspectingPlanetData = birthData.planets.find(p => p.name === aspect.aspectedPlanet);

    if (!transitingPlanetData || !aspectingPlanetData) {
        console.error(`Could not find planet data for ${aspect.aspectingPlanet} or ${aspect.aspectedPlanet}`);
        return '';
    }
    console.log("transitingPlanetData", JSON.stringify(transitingPlanetData))
    console.log("aspectingPlanetData", JSON.stringify(aspectingPlanetData))

    const orbDesc = orbDescription(aspect.orb);
    const aspectTypeFormatted = aspect.aspectType.charAt(0).toUpperCase() + aspect.aspectType.slice(1);

    const description = `${aspect.aspectingPlanet} in ${transitingPlanetData.sign} in the ${transitingPlanetData.house} house ${orbDesc} ${aspectTypeFormatted} ${aspect.aspectedPlanet} in ${aspectingPlanetData.sign} in the ${aspectingPlanetData.house} house`;

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


export const generatePlanetPromptDescription = (planet, userPlanets, userHouses, userAspects) =>  {
  // Find the relevant planet data from userPlanets
  const birthData = { planets: userPlanets, houses: userHouses, aspectsComputed: userAspects };

  const planetDescription = describePlanets(birthData, planet)
  const houseDescription = describeHouses(birthData, planet)
  const aspectDescription = findAspectsComputed(birthData, planet)

  const combinedDescriptions = [
      ...(Array.isArray(planetDescription) ? planetDescription : [planetDescription]),
      ...houseDescription,
      ...aspectDescription
  ];

  // Generate the prompt description based on the planet, house, and aspect data
  return combinedDescriptions
}


export const getSynastryAspectDescription = (aspect, birthchartA, birthchartB, userAName, userBName) => {
  const getPlanetObject = (planetName, userPlanets) => {
    return userPlanets.find(planet => planet.name === planetName);
  };

  const { aspectType, orb, planet1, planet2 } = aspect;

  const planet1Object = getPlanetObject(planet1, birthchartA.planets);
  const planet2Object = getPlanetObject(planet2, birthchartB.planets);

  if (!planet1Object || !planet2Object) {
    return 'Invalid planet data';
  }

  const planet1Retro = planet1Object.is_retro === 'true' ? 'retrograde ' : '';
  const planet2Retro = planet2Object.is_retro === 'true' ? 'retrograde ' : '';

  const description = `${userAName}'s ${planet1Retro}${planet1} in ${planet1Object.sign} in their ${planet1Object.house}th house is ${aspectType} ${userBName}'s ${planet2Retro}${planet2} in ${planet2Object.sign} in their ${planet2Object.house}th house with an orb of ${orb} degrees`;

  // Generate code similar to addAspectDescriptionComputed
  const planet1Code = planetCodes[planet1];
  const planet2Code = planetCodes[planet2];
  const sign1Code = signCodes[planet1Object.sign];
  const sign2Code = signCodes[planet2Object.sign];
  const house1Code = planet1Object.house.toString().padStart(2, '0');
  const house2Code = planet2Object.house.toString().padStart(2, '0');
  const aspectTypeCode = transitCodes[aspectType];
  const orbCode = orbCodes[orbDescription(orb)];
  const retro1Code = planet1Object.is_retro === 'true' ? 'R-' : 'P-';
  const retro2Code = planet2Object.is_retro === 'true' ? 'R-' : 'P-';

  const code = `Syn-${retro1Code}${planet1Code}${sign1Code}${house1Code}${orbCode}${aspectTypeCode}${retro2Code}${planet2Code}${sign2Code}${house2Code}`;

  return `${description} (${code})`;
};

export const findHouseSynastry = (planetDegree, houses) => {
  // Normalize the planet degree to be between 0 and 360
  const normalizedDegree = ((planetDegree % 360) + 360) % 360;
  
  // Sort houses by degree to ensure proper order
  const sortedHouses = [...houses].sort((a, b) => a.degree - b.degree);
  
  // Check if the planet is between the last house and the first house (wrapping around 360)
  const lastHouse = sortedHouses[sortedHouses.length - 1];
  const firstHouse = sortedHouses[0];
  
  if (normalizedDegree >= lastHouse.degree || normalizedDegree < firstHouse.degree) {
    return lastHouse.house;
  }
  
  // Check other houses normally
  for (let i = 0; i < sortedHouses.length - 1; i++) {
    const currentHouse = sortedHouses[i];
    const nextHouse = sortedHouses[i + 1];
    
    if (normalizedDegree >= currentHouse.degree && normalizedDegree < nextHouse.degree) {
      return currentHouse.house;
    }
  }
  
  // Fallback (should not reach here if data is valid)
  console.warn("Could not determine house for planet degree:", planetDegree, "Houses:", houses);
  return 1; // Return 1st house as fallback instead of null
};


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
  
/*
 * Calculates quadrant dominance for a birth chart. This routine is currently
 * unused but kept for reference.
 */
// export function findPlanetsInQuadrant(chartData) {
//   const planetsInQuadrants = {
//     'SouthEast': [],
//     'SouthWest': [],
//     'NorthWest': [],
//     'NorthEast': []
//   };
//
//   const quadrantPercentiles = {};
//   chartData.planets.forEach(planetData => {
//     if (ignorePlanets.includes(planetData.name)) {
//       return;
//     }
//     for (const [quadrant, houses] of Object.entries(quadrants)) {
//       if (houses.includes(planetData.house)) {
//         planetsInQuadrants[quadrant].push(planetData.name);
//       }
//     }
//   });
//
//   const result = [];
//   for (const [quad, list] of Object.entries(planetsInQuadrants)) {
//     const num = list.length;
//     const percentage = num / 10;
//     quadrantPercentiles[quad] = percentage;
//     const formattedValue = (percentage * 100).toFixed(1);
//     const category = getDominanceDescriptionQuadrant(percentage * 100);
//     result.push(`${quad} is ${category} with a Percentage: ${formattedValue}% of planets: ${list}`);
//   }
//
//   const easternHemisphere = quadrantPercentiles['SouthEast'] + quadrantPercentiles['NorthEast'];
//   const northernHemisphere = quadrantPercentiles['NorthWest'] + quadrantPercentiles['NorthEast'];
//
//   if (easternHemisphere > 0.80) {
//     result.push("Vast majority of planets are in the Eastern hemisphere");
//   }
//   if (easternHemisphere < 0.20) {
//     result.push("Vast majority of planets are in the Western hemisphere");
//   }
//   if (northernHemisphere > 0.80) {
//     result.push("Vast majority of planets are in the Northern hemisphere");
//   }
//   if (northernHemisphere < 0.20) {
//     result.push("Vast majority of planets are in the Southern hemisphere");
//   }
//
//   return result.join("\n");
// }
  
  
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
  
/*
 * Determines elemental dominance within a chart. Not used by the current UI
 * but left here as a reference implementation.
 */
// export function findPlanetsInElements(chartData) {
//   const planetsInElements = { 'Fire': [], 'Earth': [], 'Air': [], 'Water': [] };
//   const elementPercentiles = {};
//   chartData.planets.forEach(planetData => {
//     if (ignorePoints.includes(planetData.name)) {
//       return;
//     }
//     for (const [element, signs] of Object.entries(elements)) {
//       if (signs.includes(planetData.sign)) {
//         planetsInElements[element].push(planetData.name);
//       }
//     }
//   });
//
//   const result = [];
//   for (const [element, list] of Object.entries(planetsInElements)) {
//     let points = 0;
//     list.forEach(planet => {
//       if (elementPoints.hasOwnProperty(planet)) {
//         points += elementPoints[planet];
//       }
//     });
//
//     const percentage = points / 21;
//     elementPercentiles[element] = percentage;
//     const formattedValue = (percentage * 100).toFixed(1);
//     const category = getDescriptionElementDominance(percentage * 100);
//     result.push(`${element} is ${category} with dominance percentage: ${formattedValue}% planets: ${list}`);
//   }
//
//   return result.join("\n");
// }
   
  
// const modalities = {
// 'Cardinal': ["Aries", "Cancer", "Libra", "Capricorn"],
// 'Fixed': ["Taurus", "Leo", "Scorpio", "Aquarius"],
// 'Mutable': ["Gemini", "Virgo", "Sagittarius", "Pisces"]
// }
const ignoreModalityPoints = [
"Chiron", "Part of Fortune", "South Node", "Midheaven", "Node"
]

/*
 * Calculates modality balance (Cardinal/Fixed/Mutable). Currently unused in the
 * application but left commented for potential future analytics.
 */
// export function findPlanetsInModalities(chartData) {
//     const planetsInModalities = { 'Cardinal': [], 'Fixed': [], 'Mutable': [] };
//     const modalityPercentiles = {};
//
//     chartData.planets.forEach(planetData => {
//       if (ignoreModalityPoints.includes(planetData.name)) {
//         return;
//       }
//       for (const [modality, signs] of Object.entries(modalities)) {
//         if (signs.includes(planetData.sign)) {
//           planetsInModalities[modality].push(planetData.name);
//         }
//       }
//     });
//
//     const result = [];
//     for (const [modality, list] of Object.entries(planetsInModalities)) {
//       const num = list.length;
//       const percentage = num / 11; // Assuming there are 11 planets
//       modalityPercentiles[modality] = percentage;
//       const formattedValue = (percentage * 100).toFixed(1);
//       result.push(`${modality} Percentage: ${formattedValue}% planets: ${list}`);
//     }
//
//     return result.join("\n");
// }
  

  // export const generateBirthChartInterpretation = async (birthData) => {
  //   // const birthData = { planets: userPlanets, houses: userHouses, aspects: userAspects };
  //   const response = describePlanets(birthData)
  //   const houseResponse = describeHouses(birthData)
  //   const aspects = findAspectsNonComputed(birthData)
  //   // const quadrantResponse = findPlanetsInQuadrant(birthData)
  //   // const elementResponse = findPlanetsInElements(birthData)
  //   // const modalityResponse = findPlanetsInModalities(birthData)
  //   // const patternResponse = identifyBirthChartPattern(birthData)
  //   // const everythingResponse = response.concat(houseResponse, aspects)
  //   const promptMapResponse = await postPromptGeneration(response.chartData)
  //   const promptDescriptionsMap = promptMapResponse.promptDescriptionsMap
  //   // setPromptDescriptionsMap('personality', promptDescriptionsMap['personality'])
  //   // setPromptDescriptionsMap('home', promptDescriptionsMap['home'])
  //   // setPromptDescriptionsMap('relationships', promptDescriptionsMap['relationships'])
  //   // setPromptDescriptionsMap('career', promptDescriptionsMap['career'])
  //   // setPromptDescriptionsMap('everything', promptDescriptionsMap['everything'])
  //   // setPromptDescriptionsMap('unconscious', promptDescriptionsMap['unconscious'])
  //   // setPromptDescriptionsMap('communication', promptDescriptionsMap['communication'])
  //   // setPromptDescriptionsMap('Quadrants', promptDescriptionsMap['quadrants'])
  //   // setPromptDescriptionsMap('Elements', promptDescriptionsMap['elements'])
  //   // setPromptDescriptionsMap('Modalities', promptDescriptionsMap['modalities'])
  //   // setPromptDescriptionsMap('Pattern', promptDescriptionsMap['pattern'])

  //   console.log(promptDescriptionsMap)
  //   // big fourinterpretations
  //   for (const heading in heading_map) {
  //     const subHeadings = heading_map[heading];
  //     for (const subHeading of subHeadings) {
  //       const promptDescription = promptDescriptionsMap[heading];
  //       // console.log(promptDescription)
  //       const interpretation = await generateInterpretation(subHeading, promptDescription);
  //       console.log(interpretation)
  //       setHeadingInterpretationMap(subHeading, interpretation)
  //     }
  //   }

  //   // quadrant interpretations
  //   const quadrantInterpretation = await generateInterpretation("Quadrants", promptDescriptionsMap['quadrants'])
  //   const elementInterpretation = await generateInterpretation("Elements", promptDescriptionsMap['elements'])
  //   const modalityInterpretation = await generateInterpretation("Modalities", promptDescriptionsMap['modalities'])
  //   const patternInterpretation = await generateInterpretation("Pattern", promptDescriptionsMap['pattern'])
  //   setHeadingInterpretationMap('Quadrants', quadrantInterpretation)
  //   setHeadingInterpretationMap('Elements', elementInterpretation)
  //   setHeadingInterpretationMap('Modalities', modalityInterpretation)
  //   setHeadingInterpretationMap('Pattern', patternInterpretation)


  //   // planet interpretations
  //   for ( const planet in userPlanets) {
  //     const planetDescription = describePlanets(birthData, planet)
  //     const houseDescription = describeHouses(birthData, planet)
  //     const aspectDescription = findAspectsComputed(birthData, planet)

  //     const combinedDescriptions = [
  //         ...(Array.isArray(planetDescription) ? planetDescription : [planetDescription]),
  //         ...houseDescription,
  //         ...aspectDescription
  //     ];

  //     const inputData = {
  //       heading: planet.toUpperCase(),
  //       description: combinedDescriptions.join('\n')
  //     };

  //     const planetInterpretation = await postGptResponsePlanets(inputData)
  //     setHeadingInterpretationMap(planet, planetInterpretation)

  //   }

  // }

