


const transits = [
    {
        "name": "Sun",
        "fullDegree": 286.22376300111836,
        "normDegree": 16.223763001118357,
        "speed": 1.0194522746986416,
        "isRetro": "false",
        "sign": "Capricorn",
        "house": 1
    },
    {
        "name": "Moon",
        "fullDegree": 229.38677798877586,
        "normDegree": 19.38677798877586,
        "speed": 12.881609269285496,
        "isRetro": "false",
        "sign": "Scorpio",
        "house": 10
    },
    {
        "name": "Mars",
        "fullDegree": 271.82131282872984,
        "normDegree": 1.8213128287298446,
        "speed": 0.7460207926990318,
        "isRetro": "false",
        "sign": "Capricorn",
        "house": 12
    },
    {
        "name": "Mercury",
        "fullDegree": 263.81362988391425,
        "normDegree": 23.813629883914246,
        "speed": 0.6131829932672538,
        "isRetro": "false",
        "sign": "Sagittarius",
        "house": 12
    },
    {
        "name": "Jupiter",
        "fullDegree": 35.66470750810593,
        "normDegree": 5.664707508105927,
        "speed": 0.024051573912293192,
        "isRetro": "false",
        "sign": "Taurus",
        "house": 4
    },
    {
        "name": "Venus",
        "fullDegree": 250.0083572000911,
        "normDegree": 10.008357200091098,
        "speed": 1.2215046921439294,
        "isRetro": "false",
        "sign": "Sagittarius",
        "house": 11
    },
    {
        "name": "Saturn",
        "fullDegree": 333.80067392689375,
        "normDegree": 3.800673926893751,
        "speed": 0.09507633087350757,
        "isRetro": "false",
        "sign": "Pisces",
        "house": 2
    },
    {
        "name": "Uranus",
        "fullDegree": 49.26501188334822,
        "normDegree": 19.265011883348222,
        "speed": -0.017209522303035935,
        "isRetro": "true",
        "sign": "Taurus",
        "house": 4
    },
    {
        "name": "Neptune",
        "fullDegree": 355.17438972436497,
        "normDegree": 25.17438972436497,
        "speed": 0.017827093128491407,
        "isRetro": "false",
        "sign": "Pisces",
        "house": 3
    },
    {
        "name": "Pluto",
        "fullDegree": 299.5484016981138,
        "normDegree": 29.54840169811382,
        "speed": 0.03183571528216639,
        "isRetro": "false",
        "sign": "Capricorn",
        "house": 1
    },
    {
        "name": "Ascendant",
        "fullDegree": 283.44632564453605,
        "normDegree": 13.446325644536046,
        "speed": 0,
        "isRetro": "false",
        "sign": "Capricorn",
        "house": 1
    }
]


const birthData = {"planets": [
    {
      "name": "Sun",
      "full_degree": 223.5198,
      "norm_degree": 13.5198,
      "speed": 1.0027,
      "is_retro": "false",
      "sign_id": 8,
      "sign": "Scorpio",
      "house": 12
    },
    {
      "name": "Moon",
      "full_degree": 73.6782,
      "norm_degree": 13.6782,
      "speed": 13.6469,
      "is_retro": "false",
      "sign_id": 3,
      "sign": "Gemini",
      "house": 7
    },
    {
      "name": "Mars",
      "full_degree": 143.6397,
      "norm_degree": 23.6397,
      "speed": 0.4995,
      "is_retro": "false",
      "sign_id": 5,
      "sign": "Leo",
      "house": 9
    },
    {
      "name": "Mercury",
      "full_degree": 245.188,
      "norm_degree": 5.188,
      "speed": 0.3931,
      "is_retro": "false",
      "sign_id": 9,
      "sign": "Sagittarius",
      "house": 1
    },
    {
      "name": "Jupiter",
      "full_degree": 156.5129,
      "norm_degree": 6.5129,
      "speed": 0.1386,
      "is_retro": "false",
      "sign_id": 6,
      "sign": "Virgo",
      "house": 10
    },
    {
      "name": "Venus",
      "full_degree": 242.5576,
      "norm_degree": 2.5576,
      "speed": 1.2451,
      "is_retro": "false",
      "sign_id": 9,
      "sign": "Sagittarius",
      "house": 1
    },
    {
      "name": "Saturn",
      "full_degree": 173.8367,
      "norm_degree": 23.8367,
      "speed": 0.0954,
      "is_retro": "false",
      "sign_id": 6,
      "sign": "Virgo",
      "house": 10
    },
    {
      "name": "Uranus",
      "full_degree": 230.8221,
      "norm_degree": 20.8221,
      "speed": 0.0619,
      "is_retro": "false",
      "sign_id": 8,
      "sign": "Scorpio",
      "house": 1
    },
    {
      "name": "Neptune",
      "full_degree": 258.9083,
      "norm_degree": 18.9083,
      "speed": 0.0321,
      "is_retro": "false",
      "sign_id": 9,
      "sign": "Sagittarius",
      "house": 1
    },
    {
      "name": "Pluto",
      "full_degree": 200.0889,
      "norm_degree": 20.0889,
      "speed": 0.0372,
      "is_retro": "false",
      "sign_id": 7,
      "sign": "Libra",
      "house": 11
    },
    {
      "name": "Ascendant",
      "full_degree": 230.11032970466846,
      "norm_degree": 20.11032970466846,
      "speed": 0.4995,
      "is_retro": false,
      "sign_id": 8,
      "sign": "Scorpio",
      "house": 1
    },
    {
      "name": "Midheaven",
      "full_degree": 152.49636128456342,
      "norm_degree": 2.49636128456342,
      "speed": 0.4995,
      "is_retro": false,
      "sign_id": 6,
      "sign": "Virgo",
      "house": 10
    },
    {
      "name": "Node",
      "full_degree": 155.9025,
      "norm_degree": 5.9025,
      "speed": -0.173,
      "is_retro": "true",
      "sign_id": 6,
      "sign": "Virgo",
      "house": 10
    },
    {
      "name": "South Node",
      "full_degree": null,
      "norm_degree": null,
      "speed": 0.4995,
      "is_retro": false,
      "sign_id": 1,
      "sign": "Aries",
      "house": 4
    },
    {
      "name": "Chiron",
      "full_degree": 41.4127,
      "norm_degree": 11.4127,
      "speed": -0.0493,
      "is_retro": "true",
      "sign_id": 2,
      "sign": "Taurus",
      "house": 6
    },
    {
      "name": "Part of Fortune",
      "full_degree": 80.2687,
      "norm_degree": 20.2687,
      "speed": 0,
      "is_retro": "false",
      "sign_id": 3,
      "sign": "Gemini",
      "house": 8
    }
  ],
  "houses": [
    {
      "house": 1,
      "sign": "Scorpio",
      "degree": 230.11033
    },
    {
      "house": 2,
      "sign": "Sagittarius",
      "degree": 260.25642
    },
    {
      "house": 3,
      "sign": "Capricorn",
      "degree": 295.73534
    },
    {
      "house": 4,
      "sign": "Pisces",
      "degree": 332.49636
    },
    {
      "house": 5,
      "sign": "Aries",
      "degree": 4.30637
    },
    {
      "house": 6,
      "sign": "Aries",
      "degree": 29.59781
    },
    {
      "house": 7,
      "sign": "Taurus",
      "degree": 50.11033
    },
    {
      "house": 8,
      "sign": "Gemini",
      "degree": 80.25642
    },
    {
      "house": 9,
      "sign": "Cancer",
      "degree": 115.73534
    },
    {
      "house": 10,
      "sign": "Virgo",
      "degree": 152.49636
    },
    {
      "house": 11,
      "sign": "Libra",
      "degree": 184.30637
    },
    {
      "house": 12,
      "sign": "Libra",
      "degree": 209.59781
    }
  ]}

function updateObjectKeys(response) {
    return response.map(item => {
        return {
            ...item,
            full_degree: item.fullDegree,
            norm_degree: item.normDegree,
            is_retro: item.isRetro,
            // Remove the old keys
            fullDegree: undefined,
            normDegree: undefined,
            isRetro: undefined
        };
    }).map(item => {
        // Clean up the undefined properties
        delete item.fullDegree;
        delete item.normDegree;
        delete item.isRetro;
        return item;
    });
}



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

export const findAspects = (transits, birthChart) => {
    const updatedTransits = updateObjectKeys(transits);
    console.log(updatedTransits)
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





