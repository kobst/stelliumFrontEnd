import React, { useRef, useEffect, useState, useCallback, memo, useMemo } from 'react';
import {PlanetPositions} from '../PlanetPositions'
import useStore from '../../Utilities/store';


  
const zodiacIcons = [
    '/assets/signs/aries.svg',
    '/assets/signs/taurus.svg',
    '/assets/signs/gemini.svg',
    '/assets/signs/cancer.svg',
    '/assets/signs/leo.svg',
    '/assets/signs/virgo.svg',
    '/assets/signs/libra.svg',
    '/assets/signs/scorpio.svg',
    '/assets/signs/sagittarius.svg',
    '/assets/signs/capricorn.svg',
    '/assets/signs/aquarius.svg',
    '/assets/signs/pisces.svg'
];


const planetIcons = [
    '/assets/planets/Sun.svg',
    '/assets/planets/Moon.svg',
    '/assets/planets/Mercury.svg',
    '/assets/planets/Venus.svg',
    '/assets/planets/Mars.svg',
    '/assets/planets/Jupiter.svg',
    '/assets/planets/Saturn.svg',
    '/assets/planets/Uranus.svg',
    '/assets/planets/Neptune.svg',
    '/assets/planets/Pluto.svg'
]


const planetNameToIndex = {
    "Sun": 0,
    "Moon": 1,
    "Mercury": 2,
    "Venus": 3,
    "Mars": 4,
    "Jupiter": 5,
    "Saturn": 6,
    "Uranus": 7,
    "Neptune": 8,
    "Pluto": 9,
};

// Cache for SVG URLs
const svgCache = new Map();

const loadAndModifySVG = async (url, color, instanceId) => {
    const cacheKey = `${instanceId}-${url}-${color}`;
    
    if (svgCache.has(cacheKey)) {
        return svgCache.get(cacheKey);
    }

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch SVG: ${response.status}`);
        }
        const text = await response.text();
        const modifiedSVG = text.replace(/fill="[^"]*"/g, `fill='${color}'`);
        const blob = new Blob([modifiedSVG], { type: 'image/svg+xml' });
        const objectUrl = URL.createObjectURL(blob);
        
        svgCache.set(cacheKey, objectUrl);
        return objectUrl;
    } catch (error) {
        console.error(`Error loading SVG from ${url}:`, error);
        return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="${color}"/></svg>`;
    }
};

const getColorForZodiac = (index) => {
    // if (index === 0 || index === 4 || index === 8) return 'red';
    // if (index === 1 || index === 5 || index === 9) return 'brown';
    // if (index === 2 || index === 6 || index === 10) return 'green';
    // if (index === 3 || index === 7 || index === 11) return 'blue';
    return 'purple';
  };

// Move constants outside component
const CANVAS_DIMENSIONS = {
    centerX: 300,
    centerY: 300,
    outerRadius: 170,
    innerRadius: 105,
    houseCircleRadius: 180
};

const Ephemeris = memo(({ planets, houses, aspects, transits, ascendantDegree = 0, instanceId }) => {
    const canvasRef = useRef(null);
    const [planetsArray, setPlanetsArray] = useState([]);
    
    // Get ascendant degree from houses
    const currentAscendantDegree = useMemo(() => {
        return (houses && houses.length !== 0) ? houses[0].degree : ascendantDegree;
    }, [houses, ascendantDegree]);

    // Memoize the drawing functions
    const drawHouses = useCallback((ctx, houses, houseRotationRadians) => {
        console.log("drawing houses")
        houses.forEach(house => {
            const houseDegree = house.degree;
            const houseRadians = ((270 - houseDegree) % 360) * Math.PI / 180 + houseRotationRadians;
            ctx.beginPath();
            ctx.moveTo(CANVAS_DIMENSIONS.centerX + CANVAS_DIMENSIONS.outerRadius * Math.cos(houseRadians), CANVAS_DIMENSIONS.centerY + CANVAS_DIMENSIONS.outerRadius * Math.sin(houseRadians));
            ctx.lineTo(CANVAS_DIMENSIONS.centerX + CANVAS_DIMENSIONS.houseCircleRadius * Math.cos(houseRadians), CANVAS_DIMENSIONS.centerY + CANVAS_DIMENSIONS.houseCircleRadius * Math.sin(houseRadians));
            if ([1, 10].includes(house.house)) {
                ctx.lineWidth = 6;
            } else {
                ctx.lineWidth = 1;
            }
            ctx.strokeStyle = 'white';
            ctx.stroke();
            ctx.lineWidth = 1;
        });
    }, []); // Empty dependency array since using constant CANVAS_DIMENSIONS

    // Memoize planets state update
    const updatePlanetsArray = useCallback((planets) => {
        setPlanetsArray(planets);
    }, []);

    const drawPlanets = useCallback((ctx, planets, rotationRadians) => {
        // Only update planets array if it's different
        if (JSON.stringify(planetsArray) !== JSON.stringify(planets)) {
            updatePlanetsArray(planets);
        }
        
        planets.forEach(async planet => {
            const planetIndex = planetNameToIndex[planet.name];
            if (planetIndex !== undefined) {
                const planetDegree = planet.full_degree;
                const planetRadians = ((270 - planetDegree) % 360) * Math.PI / 180 + rotationRadians;
                const planetX = CANVAS_DIMENSIONS.centerX + (CANVAS_DIMENSIONS.outerRadius + 60) * Math.cos(planetRadians) - 10;
                const planetY = CANVAS_DIMENSIONS.centerY + (CANVAS_DIMENSIONS.outerRadius + 60) * Math.sin(planetRadians) - 10;

                const planetIcon = await loadAndModifySVG(planetIcons[planetIndex], 'red', instanceId);
                const planetImage = new Image();
                planetImage.src = planetIcon;
                planetImage.onload = () => {
                    ctx.drawImage(planetImage, planetX, planetY, 40, 40);
                };

                const planetHashRadians = ((270 - planetDegree) % 360) * Math.PI / 180 + rotationRadians;
                ctx.beginPath();
                ctx.moveTo(CANVAS_DIMENSIONS.centerX + CANVAS_DIMENSIONS.outerRadius * Math.cos(planetHashRadians), CANVAS_DIMENSIONS.centerY + CANVAS_DIMENSIONS.outerRadius * Math.sin(planetHashRadians));
                ctx.lineTo(CANVAS_DIMENSIONS.centerX + CANVAS_DIMENSIONS.houseCircleRadius * Math.cos(planetHashRadians), CANVAS_DIMENSIONS.centerY + CANVAS_DIMENSIONS.houseCircleRadius * Math.sin(planetHashRadians));
                ctx.strokeStyle = 'red';
                ctx.stroke();
            }
        });
    }, [planetsArray, updatePlanetsArray, instanceId]);

    const drawAspectLines = useCallback((ctx, aspects, innerRadius, rotationRadians) => {
  

        aspects.forEach(aspect => {
            if (aspect.transitingPlanet === "South Node"|| aspect.aspectingPlanet === "Chiron"
                || aspect.transitingPlanet === "Chiron"|| aspect.aspectingPlanet === "South Node"
                || aspect.transitingPlanet === "Part of Fortune"|| aspect.aspectingPlanet === "Part of Fortune"
            ) {
                return
            }

            const transitingDegree = aspect.transitingPlanetDegree;
            const aspectingDegree = aspect.aspectingPlanetDegree;

            const transitingRadians = ((270 - transitingDegree) % 360) * Math.PI / 180 + rotationRadians;
            const aspectingRadians  = ((270 - aspectingDegree ) % 360) * Math.PI / 180 + rotationRadians;


            // const transitingRadians = ((270 - transitingDegree) % 360) * Math.PI / 180 + Math.PI/2;
            // const aspectingRadians = ((270 - aspectingDegree) % 360) * Math.PI / 180 + Math.PI/2;

            const startX = CANVAS_DIMENSIONS.centerX + innerRadius * Math.cos(transitingRadians);
            const startY = CANVAS_DIMENSIONS.centerY + innerRadius * Math.sin(transitingRadians);
            const endX = CANVAS_DIMENSIONS.centerX + innerRadius * Math.cos(aspectingRadians);
            const endY = CANVAS_DIMENSIONS.centerY + innerRadius * Math.sin(aspectingRadians);

            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);

            // Set line color based on aspect type
            if (aspect.aspectType === 'sextile' || aspect.aspectType === 'trine') {
                ctx.strokeStyle = 'blue';
            } else {
                ctx.strokeStyle = 'red';
            }

            ctx.lineWidth = 1;
            ctx.stroke();
        });
    }, []); // Empty dependency array since using constant CANVAS_DIMENSIONS

    const drawTransits = useCallback((ctx, transits, rotationRadians, houseRotationRadians) => {
        console.log("Drawing transits", transits);
        transits.forEach(planet => {
            const planetIndex = planetNameToIndex[planet.name];
            if (planetIndex !== undefined) {
                const planetDegree = planet.full_degree;
                const planetRadians = ((270 - planetDegree) % 360) * Math.PI / 180 + rotationRadians;
                const planetX = CANVAS_DIMENSIONS.centerX + (CANVAS_DIMENSIONS.outerRadius + 50) * Math.cos(planetRadians) - 25;
                const planetY = CANVAS_DIMENSIONS.centerY + (CANVAS_DIMENSIONS.outerRadius + 50) * Math.sin(planetRadians) - 25;

                // console.log(`Drawing transit for ${planet.name} at (${planetX}, ${planetY})`);

                const planetImage = new Image();
                planetImage.src = planetIcons[planetIndex];
                planetImage.onload = () => {
                    ctx.drawImage(planetImage, planetX, planetY, 50, 50);
                };
                planetImage.onerror = (error) => {
                    console.error(`Error loading image for ${planet.name}:`, error);
                };

                const planetHashRadians = ((270 - planetDegree) % 360) * Math.PI / 180 + houseRotationRadians;
                ctx.beginPath();
                ctx.moveTo(CANVAS_DIMENSIONS.centerX + CANVAS_DIMENSIONS.outerRadius * Math.cos(planetHashRadians), CANVAS_DIMENSIONS.centerY + CANVAS_DIMENSIONS.outerRadius * Math.sin(planetHashRadians));
                ctx.lineTo(CANVAS_DIMENSIONS.centerX + CANVAS_DIMENSIONS.houseCircleRadius * Math.cos(planetHashRadians), CANVAS_DIMENSIONS.centerY + CANVAS_DIMENSIONS.houseCircleRadius * Math.sin(planetHashRadians));
                ctx.strokeStyle = 'blue';
                ctx.stroke();
            }
        });
    }, []); // Empty dependency array since using constant CANVAS_DIMENSIONS


    const drawZodiacWheel = useCallback(async (ctx, planets, houses, aspects, transits) => {

        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        const rotationRadians = ((270 + currentAscendantDegree) % 360) * Math.PI / 180;
        const houseRotationRadians = Math.PI / 180;

        ctx.save();

        ctx.translate(CANVAS_DIMENSIONS.centerX, CANVAS_DIMENSIONS.centerY);
        ctx.rotate(rotationRadians);
        ctx.translate(-CANVAS_DIMENSIONS.centerX, -CANVAS_DIMENSIONS.centerY);

        ctx.strokeStyle = 'white';

        ctx.beginPath();
        ctx.arc(CANVAS_DIMENSIONS.centerX, CANVAS_DIMENSIONS.centerY, CANVAS_DIMENSIONS.outerRadius, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(CANVAS_DIMENSIONS.centerX, CANVAS_DIMENSIONS.centerY, CANVAS_DIMENSIONS.innerRadius, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(CANVAS_DIMENSIONS.centerX, CANVAS_DIMENSIONS.centerY, CANVAS_DIMENSIONS.houseCircleRadius, 0, 2 * Math.PI);
        ctx.stroke();

        for (let i = 0; i < 12; i++) {
            const angle = (i * 30) * Math.PI / 180;
            ctx.beginPath();
            ctx.moveTo(CANVAS_DIMENSIONS.centerX + CANVAS_DIMENSIONS.innerRadius * Math.cos(angle), CANVAS_DIMENSIONS.centerY + CANVAS_DIMENSIONS.innerRadius * Math.sin(angle));
            ctx.lineTo(CANVAS_DIMENSIONS.centerX + CANVAS_DIMENSIONS.outerRadius * Math.cos(angle), CANVAS_DIMENSIONS.centerY + CANVAS_DIMENSIONS.outerRadius * Math.sin(angle));
            ctx.lineWidth = 1;
            ctx.stroke();
        }

        zodiacIcons.forEach(async (iconAddress, index) => {
            const icon = await loadAndModifySVG(iconAddress, getColorForZodiac(index), instanceId);
            const iconDegree = 15 + index * 30;
            const iconRadians = ((270 - iconDegree) % 360) * Math.PI / 180 + rotationRadians;
            const iconX = CANVAS_DIMENSIONS.centerX + (CANVAS_DIMENSIONS.innerRadius + 32) * Math.cos(iconRadians) - 25;
            const iconY = CANVAS_DIMENSIONS.centerY + (CANVAS_DIMENSIONS.innerRadius + 32) * Math.sin(iconRadians) - 25;

            const image = new Image();
            image.src = icon;
            image.onload = () => {
                ctx.drawImage(image, iconX, iconY, 50, 50);
            };
        });

        if (planets && planets.length !== 0) {
            drawPlanets(ctx, planets, rotationRadians)
        }

        if (houses && houses.length !== 0) {
            drawHouses(ctx, houses, houseRotationRadians)
        }

        if (aspects && aspects.length !== 0) {
            drawAspectLines(ctx, aspects, CANVAS_DIMENSIONS.innerRadius, houseRotationRadians);
        }

        if (transits && transits.length !== 0) {
            console.log("Calling drawTransits");
            drawTransits(ctx, transits, rotationRadians, houseRotationRadians);
        }

        ctx.restore();
        ctx.strokeStyle = '#000000';
    }, [currentAscendantDegree, drawHouses, drawPlanets, drawAspectLines, drawTransits, instanceId]);

    // Single effect for drawing
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const context = canvas.getContext('2d');
        drawZodiacWheel(context, planets, houses, aspects, transits);
        
        // Cleanup function to release resources
        return () => {
            // Release any cached SVGs when component unmounts
            svgCache.forEach(url => URL.revokeObjectURL(url));
            svgCache.clear();
        };
    }, [planets, houses, aspects, transits, drawZodiacWheel]);

    useEffect(() => {
        console.log('Props changed:', { planets, houses, aspects, transits });
    }, [planets, houses, aspects, transits]);

    
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <canvas ref={canvasRef} width={600} height={600} />
            <div style={{ width: '800px', display: 'flex', justifyContent: 'center' }}>
                {/* <PlanetPositions planets={planetsArray}/> */}
            </div>
        </div>
    );
});

export default Ephemeris;
