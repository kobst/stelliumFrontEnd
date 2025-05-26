// import { planetCodes, signCodes, orbCodes, transitCodes, rulers } from './constants';

function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
}




const decodeTransitCode = (code) => {

    const isRetrograde = code[1] === 'r'; // Check retrograde status directly after "P"
    code = code.substring(3); // Properly skip 'P', 'r'/'t', and '-' to start with the planet code

    const transitPlanetCode = code.substring(0, 2);
    const aspectModifier = code.substring(2, 4); // 'ap' or 'sp'
    const orbModifier = code.charAt(4); // 'g', 'l', or 'e'
    const aspectTypeCode = code.substring(5, 7); // Aspect code
    const natalPlanetCode = code.substring(7, 9);
    const natalPlanetSignCode = code.substring(9, 11);
    const natalPlanetHouseCode = code.substring(11); // House number

    // Decoding each component
    const retro = isRetrograde ? 'retrograde ' : '';
    const transitPlanet = getKeyByValue(planetCodes, transitPlanetCode);
    const aspectModifierText = aspectModifier === 'ap' ? '(applying)' : '(separating)';
    const modifierText = orbModifier === 'e' ? 'exact ' : orbModifier === 'l' ? 'loose ' : orbModifier === 'g' ? 'general ' : '';
    const aspectType = getKeyByValue(transitCodes, aspectTypeCode);
    const natalPlanet = getKeyByValue(planetCodes, natalPlanetCode);
    const natalPlanetSign = getKeyByValue(signCodes, natalPlanetSignCode);
    const houseNumber = parseInt(natalPlanetHouseCode, 10);

    // Constructing the description
    const description = `${retro}${transitPlanet} ${aspectModifierText} ${modifierText}${aspectType} to ${natalPlanet} in ${natalPlanetSign} in your ${houseNumber} house`;

    return description;
}


const decodeAspectCode = (code) => {

    code = code.substring(2); 
    // Extract the components from the code
    const planetCode = code.substring(0, 2);
    const orbCode = code.substring(2, 3);
    const transitCode = code.substring(3, 5); // Includes "T"
    const otherPlanetCode = code.substring(5, 7);
    const signCode = code.substring(7, 9);
    const houseCode = code.substring(9);

    // Find the matching descriptions
    const planetName = getKeyByValue(planetCodes, planetCode);
    const otherPlanetName = getKeyByValue(planetCodes, otherPlanetCode);
    const aspectType = getKeyByValue(transitCodes, transitCode);
    const orbDesc = getKeyByValue(orbCodes, orbCode)
    const sign = getKeyByValue(signCodes, signCode);
    const house = parseInt(houseCode, 10);

    // Construct the description
    const description = `${planetName} ${orbDesc} ${aspectType} to ${otherPlanetName} in ${sign} in the ${house} house`;

    return description;
}

const planetCodes = {
    "Sun": "00",
    "Moon": "01",
    "Mercury": "02",
    "Venus": "03",
    "Mars": "04",
    "Jupiter": "05",
    "Saturn": "06",
    "Uranus": "07",
    "Neptune": "08",
    "Pluto": "09",
    "Ascendant": "10",
    "Midheaven": "11",
    "Node": "12",
    "South Node": "13",
    "Chiron": "14",
    "Part of Fortune": "15"
  }

  const signCodes = {
    "Aries": "01",
    "Taurus": "02",
    "Gemini": "03",
    "Cancer": "04",
    "Leo": "05",
    "Virgo": "06",
    "Libra": "07",
    "Scorpio": "08",
    "Sagittarius": "09",
    "Capricorn": "10",
    "Aquarius": "11",
    "Pisces": "12"
  }

const transitCodes = {
    "conjunction": "A1",
    "sextile": "A2",
    "square": "A3",
    "trine": "A4",
    "opposition": "A5",
    "quincunx": "A6"
  }

const orbCodes = {
    "loose": "L",
    "close": "C",
    "exact": "E",
    "": "G",
  }


  const rulers = {
    "Aries": "Mars",
    "Taurus": "Venus",
    "Gemini": "Mercury",
    "Cancer": "Moon",
    "Leo": "Sun",
    "Virgo": "Mercury",
    "Libra": "Venus",
    "Scorpio": "Mars",
    "Sagittarius": "Jupiter",
    "Capricorn": "Saturn",
    "Aquarius": "Uranus",
    "Pisces": "Neptune"
  }
const fs = require('fs');


function generateAstrologyMappings() {
    let mappings = {};

    for (const [planet, planetCode] of Object.entries(planetCodes)) {
        for (const [sign, signCode] of Object.entries(signCodes)) {
            for (let house = 1; house <= 12; house++) {
                const houseCode = house.toString().padStart(2, '0'); // Pad the house number to ensure it's 2 digits
                
                // Non-retrograde case
                let code = `Pp-${planetCode}${signCode}${houseCode}`;
                let description = `${planet} in ${sign} in the ${house} house`;
                mappings[code] = description;

                // Retrograde case
                code = `Pr-${planetCode}${signCode}${houseCode}`;
                description = `${planet} is retrograde in ${sign} in the ${house} house`;
                mappings[code] = description;
            }
        }
    }

    return mappings;
}

const astrologyMappings = generateAstrologyMappings();

// fs.writeFileSync('astrologyMappings.json', JSON.stringify(astrologyMappings, null, 2), 'utf-8');
console.log('Astrology mappings have been written to astrologyMappings.json');



// Generate and map all combinations
// Generate and map all combinations
const generateAspectCodeMappings = () => {
    const mappings = {};

    Object.entries(planetCodes).forEach(([planetName, planetCode]) => {
        Object.entries(orbCodes).forEach(([orbDesc, orbCode]) => {
            Object.entries(transitCodes).forEach(([aspectTypeName, aspectTypeCode]) => {
                Object.entries(planetCodes).forEach(([otherPlanetName, otherPlanetCode]) => {
                    if (planetName === otherPlanetName) return; // Optionally skip same planet combinations
                    Object.entries(signCodes).forEach(([signName, signCode]) => {
                        for (let house = 1; house <= 12; house++) {
                            const houseCode = house.toString().padStart(2, '0');
                            const code = `A-${planetCode}${orbCode}${aspectTypeCode}${otherPlanetCode}${signCode}${houseCode}`;
                            const description = decodeAspectCode(code);
                            mappings[code] = description;
                        }
                    });
                });
            });
        });
    });

    return mappings;
};

const aspectCodeMappings = generateAspectCodeMappings();
// fs.writeFileSync('aspectMappings.json', JSON.stringify(aspectCodeMappings, null, 2), 'utf-8');
console.log('AspectCode mappings have been written to astrologyMappings.json');




function generateRulerMappings() {
    let mappings = {};

    for (const [sign, rulerPlanet] of Object.entries(rulers)) {
        const rulerPlanetCode = planetCodes[rulerPlanet];
        const signCode = signCodes[sign];
        for (let house = 1; house <= 12; house++) {
            const houseCode = house.toString().padStart(2, '0');
            for (const [planetDataSign, planetSignCode] of Object.entries(signCodes)) {
                const code = `r-${rulerPlanetCode}${signCode}${houseCode}${planetSignCode}${houseCode}`;
                const description = `${rulerPlanet} ruler of ${sign} and the ${house} house in ${planetDataSign} in the ${house} house`;
                mappings[code] = description;
            }
        }
    }

    return mappings;
}

const rulerMappings = generateRulerMappings();

// fs.writeFileSync('rulerMappings.json', JSON.stringify(rulerMappings, null, 2), 'utf-8');
console.log('Ruler mappings have been written to rulerMappings.json');



// Assuming the mappings and decodeTransitCode function are defined and accessible
const generateTransitMappings = () => {
    const mappings = {};
    const orbModifiers = { 'exact': 'e', 'loose': 'l', 'general': 'g' };
    const aspectModifiers = { 'applying': 'ap', 'separating': 'sp' };
    const retroIndicators = { 'direct': 't', 'retrograde': 'r' };

    Object.entries(planetCodes).forEach(([planetName, planetCode]) => {
        Object.entries(planetCodes).forEach(([otherPlanetName, otherPlanetCode]) => {
            if (planetName === otherPlanetName) return; // Avoid self aspects
            Object.entries(transitCodes).forEach(([aspectTypeName, aspectTypeCode]) => {
                Object.entries(signCodes).forEach(([signName, signCode]) => {
                    Object.entries(orbModifiers).forEach(([orbName, orbCode]) => {
                        Object.entries(aspectModifiers).forEach(([aspectModifierName, aspectModifierCode]) => {
                            Object.entries(retroIndicators).forEach(([retroName, retroCode]) => {
                                for (let house = 1; house <= 12; house++) {
                                    const houseCode = house.toString().padStart(2, '0');
                                    const code = `P${retroCode}-` + planetCode + aspectModifierCode + orbCode + aspectTypeCode + otherPlanetCode + signCode + houseCode;
                                    const description = decodeTransitCode(code);
                                    mappings[code] = description;                                }
                            });
                        });
                    });
                });
            });
        });
    });

    return mappings;
};


const transitMappings = generateTransitMappings();

// Write the mappings to a file
// fs.writeFileSync('transitMappings.json', JSON.stringify(transitMappings, null, 2), 'utf-8');
console.log('Transit mappings have been written to transitMappings.json');




// Function to merge mappings into combinedMappings
const combinedMappings = {
    ...transitMappings,
    ...rulerMappings,
    ...astrologyMappings,
    ...aspectCodeMappings
};


fs.writeFileSync('combinedMappings.json', JSON.stringify(combinedMappings, null, 2), 'utf-8');
console.log('Transit mappings have been written to transitMappings.json');