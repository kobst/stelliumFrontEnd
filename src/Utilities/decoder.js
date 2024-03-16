import { planetCodes, signCodes, orbCodes, transitCodes, rulers } from './constants';

// Helper function to find a key by its value in an object
function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
}

export const decodePlanetHouseCode = (code) => {
    // Check for retrograde
    let isRetrograde = false;

    if (code.startsWith('Pr')) {
        isRetrograde = true;
    }
    code = code.substring(3); // Remove the 'R' prefix for processing


    // Extract components from the code
    const planetCode = code.substring(0, 3);
    const signCode = code.substring(3, 6);
    const houseCode = code.substring(6);

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
    const planetCode = code.substring(0, 3);
    const orbCode = code.substring(3, 4);
    const transitCode = code.substring(4, 7); // Includes "T"
    const otherPlanetCode = code.substring(7, 10);
    const signCode = code.substring(10, 13);
    const houseCode = code.substring(13);

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
     const origCode = code

    // Check for retrograde
    let isRetrograde = false;

    if (code.startsWith('Rr')) {
        isRetrograde = true;
    }
    code = code.substring(3); // Remove the 'R' prefix for processing


    const rulerPlanetCode = code.substring(0, 3);
    const signCode = code.substring(3, 6);
    const houseCode = code.substring(6, 8);
    const planetDataSignCode = code.substring(8, 11);
    const houseCodePlanet = code.substring(11, 14); // Assuming the last part follows the pattern

    // Decode each part
    const rulerPlanet = getKeyByValue(planetCodes, rulerPlanetCode);
    const sign = getKeyByValue(signCodes, signCode);
    const houseNum = parseInt(houseCode, 10);
    const planetDataSign = getKeyByValue(signCodes, planetDataSignCode);
    const planetDataHouse = parseInt(houseCodePlanet, 10);

    // Construct the description
    if (isRetrograde) {
        return`retrograde ${rulerPlanet} ruler of ${sign} and the ${houseNum} house in ${planetDataSign} in the ${planetDataHouse} house (ref: ${origCode})`;
    } 
    return`${rulerPlanet} ruler of ${sign} and the ${houseNum} house in ${planetDataSign} in the ${planetDataHouse} house (ref: ${origCode})`;
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
    const origCode = code
    // Extract parts of the code

    const typeTransit = code[1] === 'G' ? 'progressed' : 'transiting'

    code = code.substring(2)
    const retroIndicator = code[0]; // 'r' for retrograde, 't' for direct
    const planetCode = code.substring(2, 5);
    const signStatusIndicator = code[5]
    const signCode = code.substring(6, 9);
    const houseStatusIndicator = code[9]; // E (entering), L (leaving), T (transiting)
    const houseCode = code.substring(10); // Always two digits

    // Map the codes back to their descriptive values
    const retro = retroIndicator === 'r' ? 'retrograde ' : '';
    const planetName = getKeyByValue(planetCodes, planetCode);
    const signName = getKeyByValue(signCodes, signCode);
    const houseNumber = parseInt(houseCode, 10); // Convert string to integer

    // Determine house status description
    let signStatus = ''
    switch (signStatusIndicator) {
        case 'E':
            signStatus = 'entering';
            break;
        case 'L':
            signStatus = 'leaving';
            break;
        case 'T':
        default:
            signStatus = 'in';
            break;
    }
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
            houseStatus = 'in';
            break;
    }

    // Construct the final description
    const description = `${typeTransit} ${retro} ${planetName} ${signStatus} ${signName}, ${houseStatus} your ${houseNumber} house (ref: ${origCode}) ${retroIndicator}`;

    return description;
}



export const decodeTransitNatalAspectCode = (code) => {

    const origCode = code

    const typeTransit = code[0] === 'G' ? 'progressed' : 'transiting'

    code = code.substring(2)

    const isRetrograde = code[0] === 'r'; // Check retrograde status directly after "P"
    // code = code.substring(3); // Properly skip 'P', 'r'/'t', and '-' to start with the planet code

    const transitPlanetCode = code.substring(2, 5);
    const aspectModifier = code.substring(5, 7); // 'ap' or 'sp'
    const orbModifier = code.charAt(7); // 'g', 'l', or 'e'
    const aspectTypeCode = code.substring(8, 11); // Aspect code
    const natalPlanetCode = code.substring(11, 14);
    const natalPlanetSignCode = code.substring(14, 17);
    const natalPlanetHouseCode = code.substring(17); // House number

    // Decoding each component
    const retro = isRetrograde ? 'retrograde ' : '';
    const transitPlanet = getKeyByValue(planetCodes, transitPlanetCode);
    const aspectModifierText = aspectModifier === 'ap' ? '(applying)' : '(separating)';
    const modifierText = orbModifier === 'e' ? 'exact ' : orbModifier === 'l' ? 'loose ' : orbModifier === 'g' ? '' : '';
    const aspectType = getKeyByValue(transitCodes, aspectTypeCode);
    const natalPlanet = getKeyByValue(planetCodes, natalPlanetCode);
    const natalPlanetSign = getKeyByValue(signCodes, natalPlanetSignCode);
    const houseNumber = parseInt(natalPlanetHouseCode, 10);

    // Constructing the description
    const description = `${typeTransit} ${retro}${transitPlanet} ${aspectModifierText} ${modifierText}${aspectType} to ${natalPlanet} in ${natalPlanetSign} in your ${houseNumber} house (ref: ${origCode})`;

    return description;

}

// aspects within a transiting or progressed planets, not relative to natal 
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

export const decodeAspectsInTransits = (code) => {
    // Determine if the aspect is for progressed or transiting planets
    const typeTransit = code.startsWith('GG') ? 'Progressed' : 'Transiting';

    // Extracting encoded parts directly using substring
    const retroIndicatorA = code[3];
    const transitPlanetCode = code.substring(4, 7);
    const transitPlanetSign = code.substring(7, 10)

    const aspectModifier = code.substring(10, 12); // 'ap' or 'sp'
    const orbModifier = code[12]; // 'g', 'l', or 'e'
    const aspectTypeCode = code.substring(13, 16); 
    const retroIndicatorB = code[16];
    const otherPlanetCode = code.substring(17, 20);

    const otherSignCode = code.substring(20, 23);
    const retroA = retroIndicatorA === 'r' ? 'retrograde ' : '';
    const retroB = retroIndicatorB === 'r' ? 'retrograde ' : '';

    // Decoding each component
    const transitPlanet = getKeyByValue(planetCodes, transitPlanetCode);
    const transitSign = getKeyByValue(signCodes, transitPlanetSign)
    const otherPlanet = getKeyByValue(planetCodes, otherPlanetCode);
    const aspectModifierText = aspectModifier === 'ap' ? '(applying)' : '(separating)';
    const modifierText = orbModifier === 'e' ? 'exact ' : orbModifier === 'l' ? 'loose ' : '';
    const aspectType = getKeyByValue(transitCodes, aspectTypeCode);
    const sign = getKeyByValue(signCodes, otherSignCode);
    // const houseNumber = parseInt(houseCode, 10);

    // Constructing the description
    const description = `${typeTransit} ${retroA}${transitPlanet} in ${transitSign} ${aspectModifierText} ${modifierText}${aspectType} to ${typeTransit} ${retroB}${otherPlanet} in ${sign}`;

    return description;
}




