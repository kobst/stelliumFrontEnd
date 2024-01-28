import { ignorePlanets } from "./constants";


// Utility function to get the difference between degrees considering circular nature
function degreeDifference(deg1, deg2) {
    let diff = Math.abs(deg1 - deg2);
    return diff > 180 ? 360 - diff : diff;
}

// Sort planets by their full_degree
function sortPlanetsByDegree(planets) {
    return planets
        .filter(planet => !ignorePlanets.includes(planet.name))
        .sort((a, b) => a.full_degree - b.full_degree);
}


// function isBundlePattern(planets) {
//     let startDegree = planets[0].full_degree;
//     let endDegree = startDegree + 120;

//     // If endDegree is less than 360, check if all planets are within startDegree and endDegree
//     if (endDegree < 360) {
//         return planets.every(planet => planet.full_degree >= startDegree && planet.full_degree <= endDegree);
//     } else {
//         // Adjust endDegree for circular comparison
//         endDegree %= 360;

//         // Check if each planet's degree is either greater than startDegree or less than endDegree
//         return planets.every(planet => 
//             planet.full_degree >= startDegree || planet.full_degree <= endDegree
//         );
//     }
// }


function getConcentratedPatternName(angle) {
    switch (angle) {
        case 120:
            return "Bundle";
        case 180:
            return "Bowl";
        case 240:
            return "Locomotive";
        default:
            return "";
    }
}

function getConcentratedPattern(planets) {

    function getName(index, angle) {
        let patternName = getConcentratedPatternName(angle);
        let lastIndex = index - 1 >=0 ? index - 1 : planets.length - 1
        // console.log(planets[index])
        // console.log(index + " index " + lastIndex + " lastIndex")
        return `${patternName} with all planets within a ${angle} between your ${planets[index].name} in ${planets[index].sign} ` + 
        `in your ${planets[index].house}th house and your ${planets[lastIndex].name} in ${planets[lastIndex].sign} in your ${planets[lastIndex].house}th house`
    }

    const angles = [120, 180, 240];
    for (let angle of angles) {
        for (var i = 0; i < planets.length; i++ ){ //for (var i = 0; i < myArray.length; i++
            let startDegree = planets[i].full_degree;
            let endDegree = startDegree + angle;
            if (endDegree < 360) {
                // Check if all planets are within startDegree and endDegree
                if (planets.every(planet => planet.full_degree >= startDegree && planet.full_degree <= endDegree)) {
                    return getName(i, angle)
                }
            } else {
                // Adjust endDegree for circular comparison
                endDegree %= 360;
                // Check if each planet's degree is either greater than startDegree or less than endDegree
                if (planets.every(planet => planet.full_degree >= startDegree || planet.full_degree <= endDegree)) {
                    return getName(i, angle)
                }
            }
        }
    }
    return "";
}


function checkClusters(cluster1, cluster2, degree) {

    if (degreeDifference(cluster1[0].full_degree, cluster2[cluster2.length - 1].full_degree) <= degree) {
        return false
    } 
    if (degreeDifference(cluster1[cluster1.length - 1].full_degree, cluster2[0].full_degree) <= degree) {
        return false
    } 
    return true
}




function isSeesawPattern(sortedPlanets) {

    function createDescription(clusters) {
        return clusters.map((cluster, index) => {
            const planetDescriptions = cluster.map(planet => `${planet.name} in ${planet.sign} (house ${planet.house})`).join(',');
            return `${index + 1}) ${planetDescriptions}`;
        }).join(' in one cluster \n \n ')
    }


    for (let i = 0; i < sortedPlanets.length - 1; i++) {
        for (let j = i + 1; j < sortedPlanets.length; j++) {
            let cluster1 = sortedPlanets.slice(i, j);
            let cluster2 = [...sortedPlanets.slice(j, sortedPlanets.length), ...sortedPlanets.slice(0, i)];


            if (cluster1.length > 3 && cluster2.length > 3 && checkClusters(cluster1, cluster2, 60)) {
                let clusters = [cluster1, cluster2]
                return `Seesaw pattern with two clusters: \n  ${createDescription(clusters)}`;
            }
        }
    }
    return ''; // Return an empty string if no seesaw pattern is found
}

// function isSplashPattern(planets) {
//     let occupiedSigns = new Set();
//     planets.forEach(planet => {
//         occupiedSigns.add(Math.floor(planet.full_degree / 30));
//     });
//     return occupiedSigns.size >= 7;
// }

function clusterIsContained(cluster) {
    if (cluster.length > 0) {
        return degreeDifference(cluster[0].full_degree, cluster[cluster.length - 1].full_degree) < 60
    } else {return false}
}

function isSplayPattern(sortedPlanets) {

    // Function to create a descriptive string of the clusters
    function createDescription(clusters) {
        return clusters.map((cluster, index) => {
            const planetDescriptions = cluster.map(planet => `${planet.name} in ${planet.sign} (house ${planet.house})`).join(',');
            return `${index + 1}) ${planetDescriptions}`;
        }).join(' in one cluster \n ');
    }    

    for (let i = 0; i < sortedPlanets.length; i++) {
        for (let j = i + 1; j !== i; j = (j + 1) % sortedPlanets.length) {
            for (let k = j + 1; k !== i; k = (k + 1) % sortedPlanets.length) {
                if (j === k) continue;
                let cluster1 = sortedPlanets.slice(i, j);
                let cluster2 = sortedPlanets.slice(j, k);
                let cluster3 = sortedPlanets.slice(k, sortedPlanets.length).concat(sortedPlanets.slice(0, i));

                if (!clusterIsContained(cluster1) ||
                !clusterIsContained(cluster2) || 
                !clusterIsContained(cluster3)) {
                    continue;
                }

                if (cluster1.length > 2 && cluster2.length > 2 && cluster3.length > 2 && 
                    checkClusters(cluster1, cluster2, 30) && 
                    checkClusters(cluster2, cluster3, 30) && 
                    checkClusters(cluster3, cluster1, 30)) {
                    let clusters = [cluster1, cluster2, cluster3];
                    return `Splay pattern with ${clusters.length} clusters of planets: \n  ${createDescription(clusters)}`;
                }
            }
        }
    }

    return ''; // Return an empty string if no splay pattern is found
}


function isGrandTrine(planets) {
    const degreeTolerance = 10; // Tolerance for deviation from exact 120 degrees
    const conjunctionTolerance = 10; // Tolerance for considering a planet is conjunct another


    function findConjunctions(mainPlanet, otherPlanets) {
        return otherPlanets.filter(planet => 
            planet !== mainPlanet &&
            degreeDifference(planet.full_degree, mainPlanet.full_degree) <= conjunctionTolerance
        );
    }

    function isTrine(degree1, degree2) {
        const diff = degreeDifference(degree1, degree2);
        return Math.abs(diff - 120) <= degreeTolerance;
    }

    function createVertexDescription(mainPlanet, conjunctions) {
        if (conjunctions.length === 0) {
            return `${mainPlanet.name} in ${mainPlanet.sign} in your ${mainPlanet.house}th house`;
        }
        const conjunctNames = conjunctions.map(p => p.name).join(' and ');
        return `${mainPlanet.name} and ${conjunctNames}`;
    }

    for (let i = 0; i < planets.length - 2; i++) {
        for (let j = i + 1; j < planets.length - 1; j++) {
            for (let k = j + 1; k < planets.length; k++) {
                if (isTrine(planets[i].full_degree, planets[j].full_degree) &&
                    isTrine(planets[j].full_degree, planets[k].full_degree) &&
                    isTrine(planets[k].full_degree, planets[i].full_degree)) {
                                            // Find conjunctions for each vertex planet
                    const conjunctsWithI = findConjunctions(planets[i], planets);
                    const conjunctsWithJ = findConjunctions(planets[j], planets);
                    const conjunctsWithK = findConjunctions(planets[k], planets);    

                    const vertexIDesc = createVertexDescription(planets[i], conjunctsWithI);
                    const vertexJDesc = createVertexDescription(planets[j], conjunctsWithJ);
                    const vertexKDesc = createVertexDescription(planets[k], conjunctsWithK);

                    return `Grand Trine formed between ${vertexIDesc} at one vertex, ${vertexJDesc} at another vertex, and ${vertexKDesc} at the third vertex.`;
                }
            }
        }
    }

    return ''; // No Grand Trine found
}

function findGrandCrossOrTSquare(planets) {
    const degreeTolerance = 8; // Tolerance for deviation from exact angles

    function isSquareOrOpposition(degree1, degree2) {
        const diff = degreeDifference(degree1, degree2);
        return Math.abs(diff - 90) <= degreeTolerance || Math.abs(diff - 180) <= degreeTolerance;
    }

    let descriptions = [];

    // Check for T-Square or Grand Cross
    for (let i = 0; i < planets.length - 1; i++) {
        for (let j = i + 1; j < planets.length; j++) {
            if (isSquareOrOpposition(planets[i].full_degree, planets[j].full_degree)) {
                for (let k = 0; k < planets.length; k++) {
                    if (k !== i && k !== j && isSquareOrOpposition(planets[i].full_degree, planets[k].full_degree) && 
                        isSquareOrOpposition(planets[j].full_degree, planets[k].full_degree)) {
                        descriptions.push(`T-Square formed by ${planets[i].name} in  ${planets[i].sign}, ${planets[j].name} in  ${planets[j].sign}, and ${planets[k].name} in  ${planets[k].sign}`);

                        // Check for a fourth planet to form a Grand Cross
                        for (let l = 0; l < planets.length; l++) {
                            if (l !== i && l !== j && l !== k && 
                                isSquareOrOpposition(planets[k].full_degree, planets[l].full_degree) &&
                                isSquareOrOpposition(planets[l].full_degree, planets[i].full_degree)) {
                                descriptions.push(`Grand Cross formed by ${planets[i].name} in  ${planets[i].sign}, ${planets[j].name} in ${planets[j].sign}, ${planets[k].name} in ${planets[k].sign}, and ${planets[l].name} in ${planets[l].sign}`);
                            }
                        }
                    }
                }
            }
        }
    }

    return descriptions.length > 0 ? descriptions.join('\n') : 'No Grand Cross or T-Square found';
}

function findStellium(planets) {
    let signGroups = {};

    // Group planets by their sign
    planets.forEach(planet => {
        if (!signGroups[planet.sign]) {
            signGroups[planet.sign] = [];
        }
        signGroups[planet.sign].push(planet.name);
    });

    // Find and describe stelliums
    let stelliumDescriptions = [];
    for (const sign in signGroups) {
        if (signGroups[sign].length >= 3) {
            stelliumDescriptions.push(`Stellium in ${sign} with planets: ${signGroups[sign].join(', ')}`);
        }
    }

    return stelliumDescriptions.length > 0 ? stelliumDescriptions.join('\n') : 'No stellium found';
}


function findYodPattern(planets) {
    const sextileTolerance = 6; // Tolerance for sextile
    const quincunxTolerance = 6; // Tolerance for quincunx
    const conjunctionTolerance = 8; // Tolerance for conjunction

    function withinAngleRange(degree1, degree2, targetAngle, tolerance) {
        const diff = degreeDifference(degree1, degree2);
        return Math.abs(diff - targetAngle) <= tolerance;
    }

    function findConjunctions(apexPlanet, otherPlanets) {
        return otherPlanets.filter(planet => 
            planet !== apexPlanet &&
            degreeDifference(planet.full_degree, apexPlanet.full_degree) <= conjunctionTolerance
        );
    }

    for (let i = 0; i < planets.length - 2; i++) {
        for (let j = i + 1; j < planets.length - 1; j++) {
            for (let k = 0; k < planets.length; k++) {
                if (k !== i && k !== j &&
                    withinAngleRange(planets[i].full_degree, planets[j].full_degree, 60, sextileTolerance) &&
                    withinAngleRange(planets[i].full_degree, planets[k].full_degree, 150, quincunxTolerance) &&
                    withinAngleRange(planets[j].full_degree, planets[k].full_degree, 150, quincunxTolerance)) {
                    // Find conjunctions with the apex planet
                    const apexPlanet = planets[k];
                    const conjunctPlanets = findConjunctions(apexPlanet, planets);
                    const conjunctionDescription = conjunctPlanets.length > 0 ? 
                        ` and ${conjunctPlanets.map(p => p.name).join(', ')} conjunct to it` : '';
                    return `Yod pattern with ${planets[i].name} and ${planets[j].name} sextile to each other, both quincunx to ${apexPlanet.name}${conjunctionDescription} at the apex.`;
                    
                }
            }
        }        
    }
    return ''; // No Yod pattern found
}

function findStelliumByDegrees(planets) {
    const stelliumThreshold = 30; // Degree threshold for a stellium
    let stelliums = [];

    for (let i = 0; i < planets.length - 2; i++) {
        let stelliumCandidates = [planets[i]];

        for (let j = i + 1; j < planets.length; j++) {
            if (degreeDifference(planets[i].full_degree, planets[j].full_degree) <= stelliumThreshold) {
                stelliumCandidates.push(planets[j]);
            }
        }

        if (stelliumCandidates.length >= 3) {
            stelliums.push(stelliumCandidates.map(p => p.name));
        }
    }

    // Remove duplicate stelliums
    let uniqueStelliums = stelliums.filter((stellium, _, array) => 
    !array.some(other => 
        other.length > stellium.length && other.includes(...stellium)));

    return uniqueStelliums.length > 0 ? uniqueStelliums.map(s => `Stellium with planets: ${s}`).join('\n') : 'No stellium found';
}



export const identifyBirthChartPattern = (chartJson) => {
    let planets = chartJson.planets;
    let houses = chartJson.houses;
    let sortedPlanets = sortPlanetsByDegree(planets);


    const concentratedPatternName = getConcentratedPattern(sortedPlanets)
    const splayPatternDescription = isSplayPattern(sortedPlanets)
    const seesawPatternDescription = isSeesawPattern(sortedPlanets)
    const grandTrineDescription = isGrandTrine(sortedPlanets)
    const tSquareDescription = findGrandCrossOrTSquare(sortedPlanets)
    const stelliumBySignDescription = findStellium(sortedPlanets)
    const stelliumByDegreeDescription = findStelliumByDegrees(sortedPlanets)
    const yodPatternDescription = findYodPattern(sortedPlanets)


    const patterns = [concentratedPatternName, splayPatternDescription, 
        seesawPatternDescription, grandTrineDescription, tSquareDescription, stelliumBySignDescription,
        stelliumByDegreeDescription, yodPatternDescription]
    let responses = []


    for (let pattern of patterns) {
        if (pattern !== '') {
            responses.push(pattern)
            // responses = response.concat(pattern + ' '); // Concatenate non-empty patterns
        }
    }

    // console.log("response pattern description " + response)
    return responses.join("\n\n");

}








// function isSeesawPattern(planets) {
//     for (let i = 0; i < planets.length; i++) {
//         let cluster1 = planets.filter(p =>
//             degreeDifference(p.full_degree, planets[i].full_degree) <= 60
//         );

//         let cluster2 = planets.filter(p =>
//             degreeDifference(p.full_degree, planets[i].full_degree) >= 120
//         );

//         if (cluster1.length >= 2 && cluster2.length >= 2 && cluster1.length + cluster2.length === planets.length) {
//             return `Seesaw pattern with two clusters: 1) ${cluster1.map(p => p.name).join(', ')} and 2) ${cluster2.map(p => p.name).join(', ')}`;
//         }
//     }

//     return "";
// }

// function isBucketPattern(planets) {
//     if (planets.length < 2) return false;

//     for (let i = 0; i < planets.length; i++) {
//         let handle = planets[i];
//         let otherPlanets = planets.filter(p => p !== handle);
//         let allWithinHalf = otherPlanets.every(planet =>
//             degreeDifference(planet.full_degree, handle.full_degree) >= 150 &&
//             degreeDifference(planet.full_degree, handle.full_degree) <= 210
//         );

//         if (allWithinHalf) return true;
//     }

//     return false;
// }

// function isBucketPattern(planets) {
//     if (planets.length < 2) return '';

//     let description = '';
//     for (let i = 0; i < planets.length; i++) {
//         let handle = planets[i];
//         let otherPlanets = planets.filter(p => p !== handle);
//         let containedWithinHalf = otherPlanets.every(planet =>
//             degreeDifference(planet.full_degree, handle.full_degree) > 90 
//         );

//         if (containedWithinHalf) {
//             let sortedOtherPlanets = otherPlanets.sort((a, b) => a.full_degree - b.full_degree);
//             let spanStartPlanet = sortedOtherPlanets[0];
//             let spanEndPlanet = sortedOtherPlanets[sortedOtherPlanets.length - 1];
//             description = `Bucket Pattern with ${handle.name} in ${handle.sign} as handle, all the rest of the planets contained between ${spanStartPlanet.name} in ${spanStartPlanet.sign} and ${spanEndPlanet.name} in ${spanEndPlanet.sign}`;
//             return description;
//         }
//     }

//     return '';
// }
