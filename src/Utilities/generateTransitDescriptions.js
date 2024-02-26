import { updateObjectKeys, degreeDifference } from "./helpers";
import { decodeHouseTransitCode, decodeTransitCode } from "./decoder";
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
    const aspects = [0, 60, 90, 120, 150, 180]; // Conjunction, Sextile, Square, Trine, Opposite
    let aspectType = '';
    let isApplying = false;

    for (let aspectDegree of aspects) {
        let perfectAspectDegree = degree1 + aspectDegree;

        // Adjust if over 360 degrees
        if (perfectAspectDegree >= 360) {
            perfectAspectDegree -= 360;
        }

        // Calculate diff considering the circular nature of zodiac
        let diff = Math.abs(degree2 - perfectAspectDegree);
        if (diff > 180) {
            diff = 360 - diff;
        }

        if (perfectAspectDegree > 357) {
            if (degree2 >= perfectAspectDegree || degree2 < (3 - (360 - perfectAspectDegree))) {
                isApplying = true
            } 
        // } else if (perfectAspectDegree < 3) {
        //     if (degree2 >= perfectAspectDegree || degree2 < (3 - (360 - perfectAspectDegree))) {
        //         isApplying = true
        //     } 
        } else {
            if (degree2 >= perfectAspectDegree && degree2 <= perfectAspectDegree) {
                isApplying = true;
            } 
        }

        isApplying = isRetro ? !isApplying : isApplying

        // Check if the aspect is within orb
        if (diff <= 3) {
            let exactness = diff < 1 ? 'exact ' : '';
            switch (aspectDegree) {
                case 0: aspectType = `${exactness}Conjunction`; break;
                case 60: aspectType = `${exactness}Sextile`; break;
                case 90: aspectType = `${exactness}Square`; break;
                case 120: aspectType = `${exactness}Trine`; break;
                case 150: aspectType =  `${exactness}Quincunx`; break;
                case 180: aspectType = `${exactness}Opposite`; break;
                default: break;
            }
            break; // Exit the loop as aspect is found
        }
    }

    if (aspectType !== '') {
        const aspectStatus = isApplying ? 'applying' : 'separating';
        return `${aspectType} (${aspectStatus})`;
    }

    return '';
}

  

//   function calculateAspect3(degree1, degree2, isRetro) {
//     let diff = Math.abs(degree1 - degree2);
//     let aspectType = '';
//     let code = ''

//     diff = diff > 180 ? 360 - diff : diff; 

//     if (diff <= 3) {
//         let orbDiff = Math.abs(diff - 0);
//         aspectType = 'conjunction'
//         code = transitCodes[aspectType]
//         if (orbDiff < 1) {
//             aspectType = 'exact ' + aspectType
//             code = 'e' + code
//         } else {
//             aspectType = '' + aspectType
//             code = 'g' + code
//         }
//         if (degree1 < degree2 || (degree2 < 3 && degree1 > 360 - degree2)){
//             aspectType = '(applying)' + aspectType
//             code = 'ap' + code
//         }
//     } else if (diff >= 57 && diff <= 63) {
//         let orbDiff = Math.abs(diff - 60);
//         aspectType = 'sextile'
//         code = transitCodes[aspectType]
//         if (orbDiff < 1) {
//             aspectType = 'exact ' + aspectType
//             code = 'e' + code
//         } else {
//             aspectType = '' + aspectType
//             code = 'g' + code
//         }
//         if (degree1 < degree2 || (degree2 < 3 && degree1 > 360 - degree2)){
//             aspectType = '(applying)' + aspectType
//             code = 'ap' + code
//         }
//     } else if (diff >= 87 && diff <= 93) {
//         let orbDiff = Math.abs(diff - 90);
//         aspectType = 'square'
//         code = transitCodes[aspectType]
//         if (orbDiff < 1) {
//             aspectType = 'exact ' + aspectType
//             code = 'e' + code
//         } else {
//             aspectType = '' + aspectType
//             code = 'g' + code
//         }
//         if (degree1 < degree2 || (degree2 < 3 && degree1 > 360 - degree2)){
//             aspectType = '(applying)' + aspectType
//             code = 'ap' + code
//         }
//     } else if (diff >= 117 && diff <= 123) {
//         let orbDiff = Math.abs(diff - 120);
//         aspectType = 'trine'
//         code = transitCodes[aspectType]
//         if (orbDiff < 1) {
//             aspectType = 'exact ' + aspectType
//             code = 'e' + code
//         } else {
//             aspectType = '' + aspectType
//             code = 'g' + code
//         }
//         if (degree1 < degree2 || (degree2 < 3 && degree1 > 360 - degree2)){
//             aspectType = '(applying)' + aspectType
//             code = 'ap' + code
//         }
//     } else if (diff >= 147 && diff <= 150) {
//         let orbDiff = Math.abs(diff - 150);
//         aspectType = 'quincunx'
//         code = transitCodes[aspectType]
//         if (orbDiff < 1) {
//             aspectType = 'exact ' + aspectType
//             code = 'e' + code
//         } else {
//             aspectType = '' + aspectType
//             code = 'g' + code
//         }
//         if (degree1 < degree2 || (degree2 < 3 && degree1 > 360 - degree2)){
//             aspectType = '(applying)' + aspectType
//             code = 'ap' + code
//         }
//     } else if (diff >= 177 && diff <= 183) {
//         let orbDiff = Math.abs(diff - 180);
//         aspectType = 'opposition'
//         code = transitCodes[aspectType]
//         if (orbDiff < 1) {
//             aspectType = 'exact ' + aspectType
//             code = 'e' + code
//         } else {
//             aspectType = '' + aspectType
//             code = 'g' + code
//         }
//         if (degree1 < degree2 || (degree2 < 3 && degree1 > 360 - degree2)){
//             aspectType = '(applying)' + aspectType
//             code = 'ap' + code
//         }
//     } 

//     if (aspectType !== '') {
//         return [`${aspectType}`, code];
//     }

//     return ['', ''];
// }



function calculateAspect3(degree1, degree2, isRetro) {
    let diff = Math.abs(degree1 - degree2);
    diff = diff > 180 ? 360 - diff : diff;
  
    // Define the aspects in an array to simplify the checks
    const aspects = [
      { name: 'conjunction', min: 0, max: 3, orb: 0 },
      { name: 'sextile', min: 57, max: 63, orb: 60 },
      { name: 'square', min: 87, max: 93, orb: 90 },
      { name: 'trine', min: 117, max: 123, orb: 120 },
      { name: 'quincunx', min: 147, max: 150, orb: 150 },
      { name: 'opposition', min: 177, max: 183, orb: 180 },
    ];
  
    for (let aspect of aspects) {
      if (diff >= aspect.min && diff <= aspect.max) {
        let orbDiff = Math.abs(diff - aspect.orb);
        let aspectType = aspect.name;
        let code = transitCodes[aspect.name];
  
        aspectType = orbDiff < 1 ? 'exact ' + aspectType : aspectType;
        code = orbDiff < 1 ? 'e' + code : 'g' + code;



        let perfectOrbDegree = degree1 + aspect.orb
        perfectOrbDegree = perfectOrbDegree > 360 ? perfectOrbDegree - 360 : perfectOrbDegree
  
        if (perfectOrbDegree < degree2 || (degree2 < 3 && perfectOrbDegree > 360 - degree2)) {
            if (!isRetro) {
                aspectType = '(applying) ' + aspectType;
                code = 'ap' + code;
            } else{
                aspectType = '(seperating) ' + aspectType;
                code = 'sp' + code
            }
        } else {
            if (isRetro) {
                aspectType = '(applying) ' + aspectType;
                code = 'ap' + code;
            } else{
                aspectType = '(separating) ' + aspectType;
                code = 'sp' + code
            }
        }
  
        return [aspectType, code];
      }
    }
  
    return ['', ''];
  }

function findTransitingSign(transit) {

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

export const findAspects = (updatedTransits, birthChart) => {
    // const updatedTransits = updateObjectKeys(transits);
    // console.log(updatedTransits)
        // Sort the houses by degree for proper comparison
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

    
        const code = "H" + retroCode + "-" + planetCodes[transit.name] + signTransit + signCodes[transit.sign] + houseTransit
        // const houseDescription = `${retro} ${transit.name} transiting ${transit.sign} ${houseTransit[0]} ${code}`
        const houseDescriptionDecoded = decodeHouseTransitCode(code)
        // aspects.push(houseDescription)
        aspects.push(houseDescriptionDecoded)
        birthChart.planets.forEach(birthPlanet => {
            if (["South Node", "Chiron", "Part of Fortune"].includes(birthPlanet.name)) return
            // var transitAspects = []
            // const aspect = calculateAspect(transit.full_degree, birthPlanet.full_degree, transit.name);
            const aspect3 = calculateAspect3(transit.full_degree, birthPlanet.full_degree, transit.is_retro);
            if (aspect3[0] !== '') {

                const birthPlanetHouseCode = birthPlanet.house.toString().padStart(2, '0'); // Pad the house number to ensure it's 2 digits
                const code = "P" + retroCode + "-" + planetCodes[transit.name] + aspect3[1] + planetCodes[birthPlanet.name] + signCodes[birthPlanet.sign] + birthPlanetHouseCode
                // const transitDescription =  `${retro} ${transit.name} ${aspect} to ${birthPlanet.name} in ${birthPlanet.sign} in your ${birthPlanet.house} house`;
                // const transitDescription3 =  `${retro} ${transit.name} ${aspect3[0]} to ${birthPlanet.name} in ${birthPlanet.sign} in your ${birthPlanet.house} house ${code}`;
                const decodedDesciption = decodeTransitCode(code)
                // aspects.push(transitDescription)
                // aspects.push(transitDescription3)
                aspects.push(decodedDesciption)
            } 
        });
    });

    return aspects;
}

// const aspects = findAspects(transits, birthData);
// console.log(aspects);





