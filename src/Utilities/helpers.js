

export const updateObjectKeys = (response) => {
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


// Utility function to get the difference between degrees considering circular nature
export function degreeDifference(deg1, deg2) {
    let diff = Math.abs(deg1 - deg2);
    return diff > 180 ? 360 - diff : diff;
}


// just a test function, takes in grouped transits and returns a map of planetary transits
export function trackPlanetaryTransits(transitsData) {
    const planetaryTransits = {};

    // Initialize the structure for each planet
    for (const date in transitsData) {
        if (transitsData.hasOwnProperty(date)) {
            const dailyTransits = transitsData[date];
            dailyTransits.forEach(transit => {
                if (!planetaryTransits[transit.name]) {
                    planetaryTransits[transit.name] = {
                        planet: transit.name,
                        transitSigns: []
                    };
                }
            });
            break; // Only need to initialize once
        }
    }

    // Track the transits
    for (const date in transitsData) {
        if (transitsData.hasOwnProperty(date)) {
            const dailyTransits = transitsData[date];
            dailyTransits.forEach(transit => {
                const planetName = transit.name;
                const currentSign = transit.sign;
                const previousTransit = planetaryTransits[planetName].transitSigns.slice(-1)[0];

                if (previousTransit && previousTransit.transitingSign === currentSign) {
                    // If the sign is the same, just update the endDate
                    previousTransit.dateRange[1] = date;
                } else {
                    // If the sign changes, finalize the previous transit and start a new one
                    planetaryTransits[planetName].transitSigns.push({
                        transitingSign: currentSign,
                        dateRange: [date, date]
                    });
                }
            });
        }
    }

    return planetaryTransits;
}


// takes in grouped transits and returns a list of planets with their transits through the given birth chart houses
export function trackPlanetaryHouses(transitsData, birthChartHouses) {
    const planetaryHouses = {};

    // Sort the birthChartHouses by degree
    birthChartHouses.sort((a, b) => a.degree - b.degree);

    // Initialize the structure for each planet
    for (const date in transitsData) {
        if (transitsData.hasOwnProperty(date)) {
            const dailyTransits = transitsData[date];
            dailyTransits.forEach(transit => {
                if (!planetaryHouses[transit.name]) {
                    planetaryHouses[transit.name] = {
                        planet: transit.name,
                        transitHouses: []
                    };
                }
            });
            break; // Only need to initialize once
        }
    }

    // Track the houses
    for (const date in transitsData) {
        if (transitsData.hasOwnProperty(date)) {
            const dailyTransits = transitsData[date];
            dailyTransits.forEach(transit => {
                const planetName = transit.name;
                const currentDegree = transit.fullDegree;
                
                // Determine the current house based on the fullDegree
                let currentHouse = null;
                for (let i = 0; i < birthChartHouses.length; i++) {
                    const currentHouseDegree = birthChartHouses[i].degree;
                    const nextHouseDegree = i < birthChartHouses.length - 1 
                        ? birthChartHouses[i + 1].degree 
                        : birthChartHouses[0].degree + 360; // Wrap-around case

                    if (currentDegree >= currentHouseDegree && currentDegree < nextHouseDegree) {
                        currentHouse = birthChartHouses[i].house;
                        break;
                    }
                }

                const previousHouseTransit = planetaryHouses[planetName].transitHouses.slice(-1)[0];

                if (previousHouseTransit && previousHouseTransit.transitingHouse === currentHouse) {
                    // If the house is the same, just update the endDate
                    previousHouseTransit.dateRange[1] = date;
                } else {
                    // If the house changes, finalize the previous transit and start a new one
                    planetaryHouses[planetName].transitHouses.push({
                        transitingHouse: currentHouse,
                        dateRange: [date, date]
                    });
                }
            });
        }
    }

    return planetaryHouses;
}