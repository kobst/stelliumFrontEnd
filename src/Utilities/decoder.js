import { planetCodes, signCodes, orbCodes, transitCodes, rulers } from './constants';

// const planetCodes = {
//     "Sun": "00",
//     "Moon": "01",
//     "Mercury": "02",
//     "Venus": "03",
//     "Mars": "04",
//     "Jupiter": "05",
//     "Saturn": "06",
//     "Uranus": "07",
//     "Neptune": "08",
//     "Pluto": "09",
//     "Ascendant": "10",
//     "Midheaven": "11",
//     "Node": "12",
//     "South Node": "13",
//     "Chiron": "14",
//     "Part of Fortune": "15"
//   }

//  const signCodes = {
//     "Aries": "01",
//     "Taurus": "02",
//     "Gemini": "03",
//     "Cancer": "04",
//     "Leo": "05",
//     "Virgo": "06",
//     "Libra": "07",
//     "Scorpio": "08",
//     "Sagittarius": "09",
//     "Capricorn": "10",
//     "Aquarius": "11",
//     "Pisces": "12"
//   }

//  const transitCodes = {
//     "conjunction": "T01",
//     "sextile": "T02",
//     "square": "T03",
//     "trine": "T04",
//     "opposition": "T05",
//   }

//  const orbCodes = {
//     "loose": "L",
//     "close": "C",
//     "exact": "E",
//     "": "G",
//   }


// Helper function to find a key by its value in an object
function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
}

export const decodeAstrologyCode = (code) => {
    // Check for retrograde
    let isRetrograde = false;

    if (code.startsWith('Pr')) {
        isRetrograde = true;
    }
    code = code.substring(3); // Remove the 'R' prefix for processing


    // Extract components from the code
    const planetCode = code.substring(0, 2);
    const signCode = code.substring(2, 4);
    const houseCode = code.substring(4);

    // Find the matching descriptions
    const planet = getKeyByValue(planetCodes, planetCode);
    const sign = getKeyByValue(signCodes, signCode);
    const house = parseInt(houseCode, 10); // Convert houseCode back to an integer

    // Construct the description
    let description = `${planet} in ${sign} in the ${house} house`;
    if (isRetrograde) {
        description = `${planet} is retrograde in ${sign} in the ${house} house`;
    }

    return description;
}


export const decodeAspectCode = (code) => {
    const origCode = code

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
    const description = `${planetName} ${orbDesc} ${aspectType} to ${otherPlanetName} in ${sign} in the ${house} house (ref: ${origCode})`;

    return description;
}

export const decodeRulerCode = (code) => {
    // Split the code into its components
     // Strip the initial 'r-' if present
     if (code.startsWith("r-")) {
        code = code.substring(2);
    }

    const rulerPlanetCode = code.substring(0, 2);
    const signCode = code.substring(2, 4);
    const houseCode = code.substring(4, 6);
    const planetDataSignCode = code.substring(6, 8);
    const houseCodePlanet = code.substring(8, 10); // Assuming the last part follows the pattern

    // Decode each part
    const rulerPlanet = getKeyByValue(planetCodes, rulerPlanetCode);
    const sign = getKeyByValue(signCodes, signCode);
    const houseNum = parseInt(houseCode, 10);
    const planetDataSign = getKeyByValue(signCodes, planetDataSignCode);
    const planetDataHouse = parseInt(houseCodePlanet, 10);

    // Construct the description
    const description = `${rulerPlanet} ruler of ${sign} and the ${houseNum} house in ${planetDataSign} in the ${planetDataHouse} house (ref: ${code})`;

    return description;
}



export const decodeHouseTransit = (code) => {
    const houseStatus = code[0]; // E, L, or T
    const houseNumber = code.substring(1); // The house number, assuming it's always 2 digits

    let statusDescription;
    switch (houseStatus) {
        case 'E':
            statusDescription = `entering your ${houseNumber} house`;
            break;
        case 'L':
            statusDescription = `leaving your ${houseNumber} house`;
            break;
        case 'T':
        default:
            statusDescription = `in your ${houseNumber} house`;
            break;
    }

    return statusDescription;
}



export const decodeHouseTransitCode = (code) => {
    // Extract parts of the code
    if (code.startsWith("H")) { // will always start with TP
        code = code.substring(1);
    }
    const retroIndicator = code[1]; // 'r' for retrograde, 't' for direct
    const planetCode = code.substring(2, 4);
    const signCode = code.substring(4, 6);
    const houseStatusIndicator = code[6]; // E (entering), L (leaving), T (transiting)
    const houseCode = code.substring(7, 9); // Always two digits

    // Map the codes back to their descriptive values
    const retro = retroIndicator === 'r' ? 'retrograde ' : '';
    const planetName = getKeyByValue(planetCodes, planetCode);
    const signName = getKeyByValue(signCodes, signCode);
    const houseNumber = parseInt(houseCode, 10); // Convert string to integer

    // Determine house status description
    let houseStatus = '';
    switch (houseStatusIndicator) {
        case 'E':
            houseStatus = 'entering';
            break;
        case 'L':
            houseStatus = 'leaving';
            break;
        case 'T':
        default:
            houseStatus = 'transiting';
            break;
    }

    // Construct the final description
    const description = `${retro} ${planetName} transiting ${signName}, ${houseStatus} your ${houseNumber} house (ref: ${code})`;

    return description;
}



export const decodeTransitCode = (code) => {

    const origCode = code
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
    const description = `${retro}${transitPlanet} ${aspectModifierText} ${modifierText}${aspectType} to ${natalPlanet} in ${natalPlanetSign} in your ${houseNumber} house (ref: ${origCode})`;

    return description;

    // if (code.startsWith("P")) {
    //     code = code.substring(2); // Skip 'P' and the next character (t/r) and the dash
    // }
    // const retroIndicator = code[0]; // 'r' for retrograde, 't' for direct, adjusted after skipping 'P'
    // const transitPlanetCode = code.substring(1, 3);
    // const aspectModifier = code.substring(3, 5); // 'ap' or 'sp'
    // const orbModifier = code.charAt(5); // 'g', 'l', or 'e'
    // const aspectTypeCode = code.substring(6, 8); // Aspect code
    // const natalPlanetCode = code.substring(8, 10);
    // const natalPlanetSignCode = code.substring(10, 12);
    // const natalPlanetHouseCode = code.substring(12); // House number

    // // Decoding each component
    // const retro = isRetrograde === 'r' ? 'retrograde ' : '';
    // const transitPlanet = getKeyByValue(planetCodes, transitPlanetCode);
    // const aspectModifierText = aspectModifier === 'ap' ? '(applying)' : '(separating)';
    // const modifierText = orbModifier === 'e' ? 'exact ' : orbModifier === 'l' ? 'loose ' : ' ';
    // const aspectType = getKeyByValue(transitCodes, aspectTypeCode);
    // const natalPlanet = getKeyByValue(planetCodes, natalPlanetCode);
    // const natalPlanetSign = getKeyByValue(signCodes, natalPlanetSignCode);
    // const houseNumber = parseInt(natalPlanetHouseCode, 10);

    // // Constructing the description
    // const description = `${retro}${transitPlanet} ${aspectModifierText} ${modifierText}${aspectType} to ${natalPlanet} in ${natalPlanetSign} in your ${houseNumber} house`;

    // return description;



    
}

export const decodeTransitAspectCode = (aspectCode) => {
    // Example decoding logic, adjust according to your aspectCode structure
    const aspectTypeKey = aspectCode.charAt(1); // Assuming the second char is the key for aspect type
    const isExact = aspectCode.startsWith('e');
    const isApplying = aspectCode.startsWith('ap');

    const aspectType = getKeyByValue(transitCodes, `T${aspectTypeKey}`); // Adjust based on actual keys in transitCodes
    let modifiers = '';
    if (isExact) modifiers += 'exact ';
    if (isApplying) modifiers += '(applying)';

    return { aspectType, modifiers };
}


// function decodeTransitCode(code) {
//     const retroCode = code[1]; // Second character indicates retrograde status
//     const planetCode = code.substring(2, 4);
//     const signCode = code.substring(4, 6);
//     const houseCode = code.substring(6);

//     const retro = retroCode === 'r' ? 'retrograde ' : '';
//     const planetName = getKeyByValue(planetCodes, planetCode);
//     const signName = getKeyByValue(signCodes, signCode);
//     const house = parseInt(houseCode, 10);

//     return `${retro}${planetName} transiting ${signName} ${house}`;
// }


// function decodeTransitAspectCode(code) {
//     const retroCode = code[0] === 'r' ? 'retrograde ' : ''; // Assumes 'r' or direct assumption
//     const planetCode = code.substring(1, 3); // Adjust based on actual structure
//     const aspectCode = code.substring(3, 5); // Simplified for illustration
//     const otherPlanetCode = code.substring(5, 7);
//     const signCode = code.substring(7, 9);
//     const houseCode = code.substring(9);

//     const retro = retroCode ? 'retrograde ' : '';
//     const planetName = getKeyByValue(planetCodes, planetCode);
//     const aspectType = decodeAspectType(aspectCode); // This function needs to interpret aspect + orb + applying
//     const otherPlanetName = getKeyByValue(planetCodes, otherPlanetCode);
//     const signName = getKeyByValue(signCodes, signCode);
//     const house = parseInt(houseCode, 10);

//     return `${retro}${planetName} ${aspectType} to ${otherPlanetName} in ${signName} in your ${house} house`;
// }

