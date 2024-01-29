import { updateObjectKeys } from "./helpers";



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
    const aspects = [0, 60, 90, 120, 180]; // Conjunction, Sextile, Square, Trine, Opposite
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

  

  function calculateAspect3(degree1, degree2, isRetro) {
    let diff = Math.abs(degree1 - degree2);
    let aspectType = '';
    let isApplying = degree1 < degree2; // Check if the aspect is applying

    diff = diff > 180 ? 360 - diff : diff; // Adjust for angles over 180

    if (diff <= 3) {
        let orbDiff = Math.abs(diff - 0);
        aspectType = orbDiff > 1 ? 'Conjunction' : 'exact Conjunction'
    } else if (diff >= 57 && diff <= 63) {
        let orbDiff = Math.abs(diff - 60);
        aspectType = orbDiff > 1 ? 'Sextile' : 'exact Sextile'
    } else if (diff >= 87 && diff <= 93) {
        let orbDiff = Math.abs(diff - 90);
        aspectType = orbDiff > 1 ? 'Square' : 'exact Square'
    } else if (diff >= 117 && diff <= 123) {
        let orbDiff = Math.abs(diff - 120);
        aspectType = orbDiff > 1 ? 'Trine' : 'exact Trine'
    } else if (diff >= 177 && diff <= 183) {
        let orbDiff = Math.abs(diff - 180);
        aspectType = orbDiff > 1 ? 'Opposite' : 'exact Opposite'
    } 

    if (aspectType !== '') {
        const aspectStatus = isApplying && !isRetro ? 'applying' : 'separating';
        return `${aspectType} (${aspectStatus})`;
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
            // console.log(sortedHouses[i].degree + ' house deegre')
            return sortedHouses[i].house;
        }
    }

    // If not found, the planet might be transiting the last house
    return sortedHouses[sortedHouses.length - 1].house.toString();
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
        let retro = transit.is_retro === 'true' ? 'retrograde ' : ''
        let transitHouse = findTransitingHouse(transit, sortedHouses)
        birthChart.planets.forEach(birthPlanet => {
            if (["South Node", "Chiron", "Part of Fortune"].includes(birthPlanet.name)) return
                const aspect = calculateAspect(transit.full_degree, birthPlanet.full_degree, transit.name);
                if (aspect !== '') {
                    const description =  `${retro} ${transit.name} transiting ${transit.sign} in your ${transitHouse} house ${aspect} to ${birthPlanet.name} in ${birthPlanet.sign} in your ${birthPlanet.house} house`;
                    aspects.push(description)
                }

        });
    });

    return aspects;
}

// const aspects = findAspects(transits, birthData);
// console.log(aspects);





