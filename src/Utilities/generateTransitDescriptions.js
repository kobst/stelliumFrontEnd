import { updateObjectKeys, degreeDifference } from "./generateUserTranstiDescriptions";
import { decodeHouseTransitCode, decodeTransitNatalAspectCode } from "./decoder";
import { planetCodes, signCodes, transitCodes } from "./constants";


const orbDescription = (orb) => {
    if (orb < 1) {
      return "exact";
    } else if (orb >= 1 && orb < 3) {
      return "close";
    } else if (orb >= 3 && orb < 5) {
        return "loose";
    } else if (orb >= 7 && orb < 10) {
      return "loose";
    } else {
      return "-";
    }
  }

function calculateAspect(degree1, degree2, isRetro) {
  const diff = Math.abs(degree1 - degree2);
  const adjustedDiff = diff > 180 ? 360 - diff : diff;

  const aspects = [
    { name: 'conjunction', orb: 0, maxDiff: 3 },
    { name: 'sextile', orb: 60, maxDiff: 3 },
    { name: 'square', orb: 90, maxDiff: 3 },
    { name: 'trine', orb: 120, maxDiff: 3 },
    { name: 'quincunx', orb: 150, maxDiff: 3 },
    { name: 'opposition', orb: 180, maxDiff: 3 },
  ];

  for (const aspect of aspects) {
    if (Math.abs(adjustedDiff - aspect.orb) <= aspect.maxDiff) {
      const orbDiff = Math.abs(adjustedDiff - aspect.orb);
      const isExact = orbDiff < 1;
      const perfectOrbDegree = (degree1 + aspect.orb) % 360;
      const isApplying = perfectOrbDegree < degree2 || (degree2 < 3 && perfectOrbDegree > 357);

      let code = transitCodes[aspect.name];
      code = (isExact ? 'e' : 'g') + code;
      code = ((isApplying !== isRetro) ? 'ap' : 'sp') + code;

      return code;
    }
  }

  return '';
}

function findTransitingHouse(transit, sortedHouses) {

    // console.log(transit.full_degree + ' planet degree')

    // Find the house the transit is currently in
    for (let i = 0; i < sortedHouses.length - 1; i++) {
        // console.log(sortedHouses[i].degree + ' degree ' + sortedHouses[i + 1].degree)
        // Check if the transit is between the current house cusp and the next one
        if (sortedHouses[i].degree <= transit.full_degree && transit.full_degree < sortedHouses[i + 1].degree) {
            var houseCode = (sortedHouses[i].house).toString().padStart(2, '0'); // Pad the house number to ensure it's 2 digits
            if (degreeDifference(sortedHouses[i].degree, transit.full_degree) < 2) {
                return `E${houseCode}`
            } else if (sortedHouses[i+1] && degreeDifference(sortedHouses[i+1], transit.full_degree) < 2) {
                return `L${houseCode}`
            }
            return `T${houseCode}`
        }
    }
    const lastHouseCode = 12
    if (degreeDifference(sortedHouses[11].degree, transit.full_degree) < 2) {
        return `E${lastHouseCode}`
    } else if (degreeDifference(sortedHouses[1], transit.full_degree) < 2) {
        return `L${lastHouseCode}`
    }
    return `T${lastHouseCode}`

}

export const findAspects = (updatedTransits, birthChart, type) => {
    // const updatedTransits = updateObjectKeys(transits);
    // console.log(updatedTransits)
        // Sort the houses by degree for proper comparison
    const typeDescriptor = type === 'progressed' ? 'G' : 'T'
    const sortedHouses = birthChart.houses.slice().sort((a, b) => a.degree - b.degree);
    sortedHouses.push({ house: 1, sign: sortedHouses[0].sign, degree: sortedHouses[0].degree + 360 });
    const aspects = [];


    updatedTransits.forEach(transit => {
        if (transit.name === 'Ascendant') return
        // console.log(transit)
        let retroCode = transit.is_retro === 'true' ? 'r' : 't'
        let houseTransit= findTransitingHouse(transit, sortedHouses)

        const signTransitDegree = transit.full_degree % 30
        let signTransit = 'T'
        if (signTransitDegree < 3) {
            signTransit = 'E'
        } else if (signTransitDegree > 27) {
            signTransit = 'L'
        }

        const code = "H" + typeDescriptor + "-" + retroCode + planetCodes[transit.name] + signTransit + signCodes[transit.sign] + houseTransit
        // const houseDescription = `${retro} ${transit.name} transiting ${transit.sign} ${houseTransit[0]} ${code}`
        const houseDescriptionDecoded = decodeHouseTransitCode(code)
        // aspects.push(houseDescription)
        aspects.push(houseDescriptionDecoded)
        birthChart.planets.forEach(birthPlanet => {
            if (["South Node", "Chiron", "Part of Fortune"].includes(birthPlanet.name)) return
            const aspect = calculateAspect(transit.full_degree, birthPlanet.full_degree, transit.is_retro);
            if (aspect !== '') {
                const birthPlanetHouseCode = birthPlanet.house.toString().padStart(2, '0'); // Pad the house number to ensure it's 2 digits
                const code = typeDescriptor + "N-" + retroCode + planetCodes[transit.name] + aspect + planetCodes[birthPlanet.name] + signCodes[birthPlanet.sign] + birthPlanetHouseCode
                const decodedDesciption = decodeTransitNatalAspectCode(code)
                aspects.push(decodedDesciption)
            } 
        });
    });

    return aspects;
}






