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


function isBundlePattern(planets) {
    let startDegree = planets[0].full_degree;
    let endDegree = startDegree + 120;

    // If endDegree is less than 360, check if all planets are within startDegree and endDegree
    if (endDegree < 360) {
        return planets.every(planet => planet.full_degree >= startDegree && planet.full_degree <= endDegree);
    } else {
        // Adjust endDegree for circular comparison
        endDegree %= 360;

        // Check if each planet's degree is either greater than startDegree or less than endDegree
        return planets.every(planet => 
            planet.full_degree >= startDegree || planet.full_degree <= endDegree
        );
    }
}

function getPatternName(angle) {
    switch (angle) {
        case 120:
            return "Bundle";
        case 180:
            return "Bowl";
        case 240:
            return "Locomotive";
        default:
            return "Unknown";
    }
}

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
    let startDegree = planets[0].full_degree;

    const angles = [120, 180, 240];

    for (let angle of angles) {
        let endDegree = startDegree + angle;

        if (endDegree < 360) {
            // Check if all planets are within startDegree and endDegree
            if (planets.every(planet => planet.full_degree >= startDegree && planet.full_degree <= endDegree)) {
                return getConcentratedPatternName(angle);
            }
        } else {
            // Adjust endDegree for circular comparison
            endDegree %= 360;
            // Check if each planet's degree is either greater than startDegree or less than endDegree
            if (planets.every(planet => planet.full_degree >= startDegree || planet.full_degree <= endDegree)) {
                return getConcentratedPatternName(angle);
            }
        }
    }

    return "No discernable pattern";
}




function isBowlPattern(planets) {
    let minDegree = planets[0].full_degree;
    let maxDegree = planets[0].full_degree;

    for (const planet of planets) {
        minDegree = Math.min(minDegree, planet.full_degree);
        maxDegree = Math.max(maxDegree, planet.full_degree);
    }

    return degreeDifference(minDegree, maxDegree) <= 180;
}

function isLocomotivePattern(planets) {
    let sortedPlanets = sortPlanetsByDegree(planets);
    let minDegree = sortedPlanets[0].full_degree;
    let maxDegree = minDegree + 240;

    if (maxDegree >= 360) {
        // Adjust for circular nature of the zodiac
        maxDegree %= 360;
        // Check if there are no planets between 0 and minDegree
        return !sortedPlanets.some(planet => planet.full_degree < minDegree && planet.full_degree > maxDegree);
    } else {
        // Check if all planets fall within the minDegree and maxDegree range
        return sortedPlanets.every(planet => planet.full_degree >= minDegree && planet.full_degree <= maxDegree);
    }
}

// need to account for multiple conjunctions..
function isSplayPattern(planets) {
    // Function to find clusters of planets
    function findClusters(planets) {
        let clusters = [];
        let currentCluster = [planets[0]];

        for (let i = 1; i < planets.length; i++) {
            if (degreeDifference(planets[i].full_degree, planets[i - 1].full_degree) <= 10) {
                currentCluster.push(planets[i]);
            } else {
                clusters.push(currentCluster);
                currentCluster = [planets[i]];
            }
        }

        // Push the last cluster
        clusters.push(currentCluster);

        return clusters;
    }

    // Function to check if clusters are separated by at least one empty sign
    function areClustersWellSeparated(clusters) {
        for (let i = 0; i < clusters.length - 1; i++) {
            let lastPlanetOfCurrentCluster = clusters[i][clusters[i].length - 1];
            let firstPlanetOfNextCluster = clusters[i + 1][0];

            if (Math.abs(lastPlanetOfCurrentCluster.sign_id - firstPlanetOfNextCluster.sign_id) <= 1) {
                return false;
            }
        }

        return true;
    }

    let sortedPlanets = sortPlanetsByDegree(planets);
    let clusters = findClusters(sortedPlanets);

    // Filter out clusters with only one planet
    clusters = clusters.filter(cluster => cluster.length > 1);

    return clusters.length >= 3 && areClustersWellSeparated(clusters);
}




function isBucketPattern(planets) {
    if (planets.length < 2) return false;

    for (let i = 0; i < planets.length; i++) {
        let handle = planets[i];
        let otherPlanets = planets.filter(p => p !== handle);
        let allWithinHalf = otherPlanets.every(planet =>
            degreeDifference(planet.full_degree, handle.full_degree) >= 150 &&
            degreeDifference(planet.full_degree, handle.full_degree) <= 210
        );

        if (allWithinHalf) return true;
    }

    return false;
}

function isSeesawPattern(planets) {
    for (let i = 0; i < planets.length; i++) {
        let cluster1 = planets.filter(p =>
            degreeDifference(p.full_degree, planets[i].full_degree) <= 60
        );

        let cluster2 = planets.filter(p =>
            degreeDifference(p.full_degree, planets[i].full_degree) >= 120 &&
            degreeDifference(p.full_degree, planets[i].full_degree) <= 180
        );

        if (cluster1.length >= 2 && cluster2.length >= 2) return true;
    }

    return false;
}

function isSplashPattern(planets) {
    let occupiedSigns = new Set();
    planets.forEach(planet => {
        occupiedSigns.add(Math.floor(planet.full_degree / 30));
    });
    return occupiedSigns.size >= 7;
}


export const identifyBirthChartPattern = (chartJson) => {
    let planets = chartJson.planets;
    let sortedPlanets = sortPlanetsByDegree(planets);

    console.log(sortedPlanets)


    const concentratedPatternName = getConcentratedPattern(sortedPlanets)
    // if (concentratedPatternName !== "") {
    //     return concentratedPatternName
    // }

    if (isSplashPattern(sortedPlanets)) return 'Splash'
    if (isSplayPattern(sortedPlanets)) return "Splay";


    if (isBucketPattern(sortedPlanets)) return "Bucket";
    if (isSeesawPattern(sortedPlanets)) return "Seesaw";
    // Add checks for Splay, Bowl, Bucket, Seesaw, Splash
    return "No discernable pattern";
}
