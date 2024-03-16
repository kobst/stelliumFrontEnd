
import { planetCodes, signCodes, transitCodes } from "./constants";
import { decodeAspectsInTransits } from "./decoder";

function orbDescription(orb) {
    if (orb < 1) {
        return 'e'
    } else if (orb < 3) {
        return 'g'
    } else {
        return 'l'
    }

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