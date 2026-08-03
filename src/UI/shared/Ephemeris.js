import React, { useRef, useEffect, useState, useCallback, memo, useMemo } from 'react';


  
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

// Slate ink on cream paper. Geometry is defined at the 600px base size: the
// wheel fills its plate like the etched reference illustration, with a wider
// ring band, heavier strokes, and planet glyphs tucked inside the ring.
const INK = '#39445a';
const THEMES = {
    ink: {
        ring: 'rgba(57, 68, 90, 0.8)',
        zodiacColor: () => INK,
        planetColor: () => INK,
        aspectSoft: 'rgba(52, 55, 168, 0.5)',
        aspectHard: 'rgba(178, 74, 58, 0.55)',
        // matches the horoscope (WebGL) ink wheel: a narrow sign band near the
        // plate edge with planet glyphs INSIDE the inner circle; collisions
        // dodge sideways along their orbit so nothing can clip the plate
        dims: { centerX: 300, centerY: 300, outerRadius: 268, innerRadius: 225, houseCircleRadius: 277 },
        ringWidth: 1.7,
        zodiacIconSize: 34,
        zodiacRingOffset: 22,
        planetAnchorOffset: 34,
        planetIconSize: 34,
    },
};

const hexToRgba = (hex, alpha = 1) => {
    let h = hex.replace('#', '');
    if (h.length === 3) {
        h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    }
    const bigint = parseInt(h, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
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

// Base canvas size — theme dims are defined at this size and scaled to fit
const BASE_SIZE = 600;

const scaleDimensions = (size, base) => {
    const ratio = size / BASE_SIZE;
    return {
        centerX: base.centerX * ratio,
        centerY: base.centerY * ratio,
        outerRadius: base.outerRadius * ratio,
        innerRadius: base.innerRadius * ratio,
        houseCircleRadius: base.houseCircleRadius * ratio
    };
};

const Ephemeris = memo(({ planets, houses, aspects, transits, ascendantDegree = 0, instanceId, theme = 'ink', emphasisPlanets = null }) => {
    const palette = THEMES[theme] || THEMES.ink;
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const [canvasSize, setCanvasSize] = useState(BASE_SIZE);
    
    // Get ascendant degree from houses
    const currentAscendantDegree = useMemo(() => {
        return (houses && houses.length !== 0) ? houses[0].degree : ascendantDegree;
    }, [houses, ascendantDegree]);

    const dims = useMemo(() => scaleDimensions(canvasSize, palette.dims), [canvasSize, palette]);

    // Memoize the drawing functions
    const drawHouses = useCallback((ctx, houses, houseRotationRadians) => {
        houses.forEach(house => {
            const houseDegree = house.degree;
            const houseRadians = ((270 - houseDegree) % 360) * Math.PI / 180 + houseRotationRadians;
            ctx.beginPath();
            ctx.moveTo(dims.centerX + dims.outerRadius * Math.cos(houseRadians), dims.centerY + dims.outerRadius * Math.sin(houseRadians));
            ctx.lineTo(dims.centerX + dims.houseCircleRadius * Math.cos(houseRadians), dims.centerY + dims.houseCircleRadius * Math.sin(houseRadians));
            if ([1, 10].includes(house.house)) {
                ctx.lineWidth = 6;
            } else {
                ctx.lineWidth = 1;
            }
            ctx.strokeStyle = palette.ring;
            ctx.stroke();
            ctx.lineWidth = 1;
        });
    }, [dims, palette]);

    const drawPlanets = useCallback(async (ctx, planetsToDraw, rotationRadians, isCancelled) => {
        const scale = canvasSize / BASE_SIZE;
        const ICON_WIDTH = Math.round(palette.planetIconSize * scale);
        const ICON_HEIGHT = Math.round(palette.planetIconSize * scale);
        const ICON_DRAW_OFFSET_X = ICON_WIDTH / 2;
        const ICON_DRAW_OFFSET_Y = ICON_HEIGHT / 2;
        const BASE_PLANET_ICON_ANCHOR_RADIUS = dims.innerRadius - palette.planetAnchorOffset * scale;

        // Sort planets by degree to process them in order around the circle
        const sortedPlanets = [...planetsToDraw].sort((a, b) => a.full_degree - b.full_degree);
        
        const planetDrawInfos = []; // Stores info needed for drawing after positions are set
        const occupiedPositions = []; // Stores bounding boxes of already positioned icons

        // Phase 1: Calculate non-overlapping positions
        for (const planet of sortedPlanets) {
            const planetIndex = planetNameToIndex[planet.name];
            if (planetIndex === undefined) continue;

            const planetDegree = planet.full_degree;
            // Calculate the true angular position for the planet, including chart rotation
            const truePlanetRadians = ((270 - planetDegree) % 360) * Math.PI / 180 + rotationRadians;

            // Keep the radius fixed and slide collisions sideways along the
            // ring so glyphs cannot leave the parchment plate.
            const candidates = [{ radius: BASE_PLANET_ICON_ANCHOR_RADIUS, angle: 0 }];
            const angularStep = (ICON_WIDTH * 1.1) / BASE_PLANET_ICON_ANCHOR_RADIUS;
            for (let k = 1; k <= 6; k++) {
                candidates.push({ radius: BASE_PLANET_ICON_ANCHOR_RADIUS, angle: k * angularStep });
                candidates.push({ radius: BASE_PLANET_ICON_ANCHOR_RADIUS, angle: -k * angularStep });
            }

            let adjustedIconTopLeftX;
            let adjustedIconTopLeftY;
            let wasMoved = false;
            for (let i = 0; i < candidates.length; i++) {
                const candidate = candidates[i];
                const candidateRadians = truePlanetRadians + candidate.angle;
                const candidateX = dims.centerX + candidate.radius * Math.cos(candidateRadians) - ICON_DRAW_OFFSET_X;
                const candidateY = dims.centerY + candidate.radius * Math.sin(candidateRadians) - ICON_DRAW_OFFSET_Y;
                const collides = occupiedPositions.some((pos) => (
                    candidateX < pos.x + pos.width &&
                    candidateX + ICON_WIDTH > pos.x &&
                    candidateY < pos.y + pos.height &&
                    candidateY + ICON_HEIGHT > pos.y
                ));
                adjustedIconTopLeftX = candidateX;
                adjustedIconTopLeftY = candidateY;
                wasMoved = i > 0;
                if (!collides) break;
            }

            occupiedPositions.push({
                x: adjustedIconTopLeftX,
                y: adjustedIconTopLeftY,
                width: ICON_WIDTH,
                height: ICON_HEIGHT
            });

            planetDrawInfos.push({
                planetName: planet.name,
                iconUrl: planetIcons[planetIndex],
                drawX: adjustedIconTopLeftX,
                drawY: adjustedIconTopLeftY,
                truePlanetRadians: truePlanetRadians, // Save for drawing hash mark and indicator line
                wasMoved
            });
        }

        // Planets outside the emphasis set draw dimmed (used to isolate one
        // body's aspects); an empty/absent set means everything is full-ink.
        const emphasisSet = emphasisPlanets && emphasisPlanets.length ? new Set(emphasisPlanets) : null;

        // Phase 2: Draw planet icons and their hash marks (and indicator lines if moved)
        for (const info of planetDrawInfos) {
            const { planetName, iconUrl, drawX, drawY, truePlanetRadians, wasMoved } = info;

            const planetColor = palette.planetColor(planetName);
            const drawAlpha = emphasisSet && !emphasisSet.has(planetName) ? 0.25 : 1;

            // Draw the planet hash mark first (so icon can draw over its end if needed)
            ctx.globalAlpha = drawAlpha;
            ctx.beginPath();
            ctx.moveTo(dims.centerX + dims.outerRadius * Math.cos(truePlanetRadians), dims.centerY + dims.outerRadius * Math.sin(truePlanetRadians));
            ctx.lineTo(dims.centerX + dims.houseCircleRadius * Math.cos(truePlanetRadians), dims.centerY + dims.houseCircleRadius * Math.sin(truePlanetRadians));
            ctx.strokeStyle = planetColor; // Planet hash mark color
            ctx.stroke();
            ctx.globalAlpha = 1;

            // Load and draw the planet icon
            try {
                if (isCancelled()) return;
                const coloredIconUrl = await loadAndModifySVG(iconUrl, planetColor, instanceId);
                if (isCancelled()) return;
                const planetImage = new Image();
                planetImage.src = coloredIconUrl;
                planetImage.onload = () => {
                    if (isCancelled()) return;
                    ctx.globalAlpha = drawAlpha;
                    ctx.drawImage(planetImage, drawX, drawY, ICON_WIDTH, ICON_HEIGHT);

                    // If the icon was moved, draw an indicator line
                    if (wasMoved) {
                        ctx.beginPath();
                        // Center of the (potentially moved) icon
                        ctx.moveTo(drawX + ICON_WIDTH / 2, drawY + ICON_HEIGHT / 2);
                        // Point on the wheel along the planet's true radial line
                        const indicatorRadius = dims.innerRadius;
                        const targetX = dims.centerX + indicatorRadius * Math.cos(truePlanetRadians);
                        const targetY = dims.centerY + indicatorRadius * Math.sin(truePlanetRadians);
                        ctx.lineTo(targetX, targetY);
                        ctx.strokeStyle = hexToRgba(planetColor, 0.5); // Faded planet color for indicator
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                        ctx.lineWidth = 1; // Reset line width
                    }
                    ctx.globalAlpha = 1;
                };
                planetImage.onerror = () => {
                    if (isCancelled()) return;
                    console.error(`Error loading image for ${planetName} at ${iconUrl}`);
                    // Fallback drawing for failed image load
                    ctx.fillStyle = planetColor;
                    ctx.fillRect(drawX, drawY, ICON_WIDTH, ICON_HEIGHT);
                    ctx.strokeStyle = 'black';
                    ctx.strokeRect(drawX, drawY, ICON_WIDTH, ICON_HEIGHT);
                };
            } catch (error) {
                console.error(`Error processing SVG for ${planetName}:`, error);
            }
        }
    }, [instanceId, dims, canvasSize, palette, emphasisPlanets]);

    const drawAspectLines = useCallback((ctx, aspects, innerRadius, rotationRadians) => {
  
        aspects.forEach(aspect => {
            if (aspect.aspectedPlanet === "South Node"|| aspect.aspectingPlanet === "Chiron"
                || aspect.aspectedPlanet === "Chiron"|| aspect.aspectingPlanet === "South Node"
                || aspect.aspectedPlanet === "Part of Fortune"|| aspect.aspectingPlanet === "Part of Fortune"
            ) {
                return
            }

            const aspectedDegree = aspect.aspectedPlanetDegree;
            const aspectingDegree = aspect.aspectingPlanetDegree;

            const aspectedRadians = ((270 - aspectedDegree) % 360) * Math.PI / 180 + rotationRadians;
            const aspectingRadians  = ((270 - aspectingDegree ) % 360) * Math.PI / 180 + rotationRadians;

            // const transitingRadians = ((270 - transitingDegree) % 360) * Math.PI / 180 + Math.PI/2;
            // const aspectingRadians = ((270 - aspectingDegree) % 360) * Math.PI / 180 + Math.PI/2;

            const startX = dims.centerX + innerRadius * Math.cos(aspectedRadians);
            const startY = dims.centerY + innerRadius * Math.sin(aspectedRadians);
            const endX = dims.centerX + innerRadius * Math.cos(aspectingRadians);
            const endY = dims.centerY + innerRadius * Math.sin(aspectingRadians);

            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);

            // Set line color based on aspect type
            if (aspect.aspectType === 'sextile' || aspect.aspectType === 'trine') {
                ctx.strokeStyle = palette.aspectSoft;
            } else {
                ctx.strokeStyle = palette.aspectHard;
            }

            ctx.lineWidth = 1;
            ctx.stroke();
        });
    }, [dims, palette]);

    const drawTransits = useCallback(async (ctx, transits, rotationRadians, houseRotationRadians, isCancelled) => {
        const scale = canvasSize / BASE_SIZE;
        const ICON_WIDTH = Math.round(36 * scale);
        const ICON_HEIGHT = Math.round(36 * scale);
        const ICON_DRAW_OFFSET = ICON_WIDTH / 2;
        // Partner/transit glyphs sit just inside the zodiac band. Keeping this
        // ring inside the plate is essential now that parchment is universal.
        const BASE_TRANSIT_RADIUS = dims.innerRadius - Math.round(2 * scale);

        const sortedTransits = [...transits].sort((a, b) => a.full_degree - b.full_degree);
        const transitDrawInfos = [];
        const occupiedPositions = [];

        // Phase 1: Calculate non-overlapping positions
        for (const planet of sortedTransits) {
            const planetIndex = planetNameToIndex[planet.name];
            if (planetIndex === undefined) continue;

            const planetDegree = planet.full_degree;
            const truePlanetRadians = ((270 - planetDegree) % 360) * Math.PI / 180 + rotationRadians;

            let iconX, iconY;
            let wasMoved = false;
            const angularStep = (ICON_WIDTH * 1.1) / BASE_TRANSIT_RADIUS;
            const candidates = [0];
            for (let k = 1; k <= 6; k++) {
                candidates.push(k * angularStep, -k * angularStep);
            }

            for (let i = 0; i < candidates.length; i++) {
                const displayRadians = truePlanetRadians + candidates[i];
                const candidateX = dims.centerX + BASE_TRANSIT_RADIUS * Math.cos(displayRadians) - ICON_DRAW_OFFSET;
                const candidateY = dims.centerY + BASE_TRANSIT_RADIUS * Math.sin(displayRadians) - ICON_DRAW_OFFSET;
                const collides = occupiedPositions.some((pos) => (
                    candidateX < pos.x + pos.width &&
                    candidateX + ICON_WIDTH > pos.x &&
                    candidateY < pos.y + pos.height &&
                    candidateY + ICON_HEIGHT > pos.y
                ));
                iconX = candidateX;
                iconY = candidateY;
                wasMoved = i > 0;
                if (!collides) {
                    break;
                }
            }

            occupiedPositions.push({ x: iconX, y: iconY, width: ICON_WIDTH, height: ICON_HEIGHT });

            transitDrawInfos.push({
                planetName: planet.name,
                iconUrl: planetIcons[planetIndex],
                drawX: iconX,
                drawY: iconY,
                truePlanetRadians,
                wasMoved
            });
        }

        // Phase 2: Draw transit icons with hash marks and indicator lines
        for (const info of transitDrawInfos) {
            const { planetName, iconUrl, drawX, drawY, truePlanetRadians, wasMoved } = info;
            const planetColor = INK;

            // Hash mark on the outer ring
            const hashRadians = ((270 - transits.find(p => p.name === planetName).full_degree) % 360) * Math.PI / 180 + houseRotationRadians;
            ctx.beginPath();
            ctx.moveTo(
                dims.centerX + dims.outerRadius * Math.cos(hashRadians),
                dims.centerY + dims.outerRadius * Math.sin(hashRadians)
            );
            ctx.lineTo(
                dims.centerX + dims.houseCircleRadius * Math.cos(hashRadians),
                dims.centerY + dims.houseCircleRadius * Math.sin(hashRadians)
            );
            ctx.strokeStyle = hexToRgba(planetColor, 0.6);
            ctx.lineWidth = 1;
            ctx.stroke();

            // Draw the planet icon
            try {
                if (isCancelled()) return;
                const coloredIconUrl = await loadAndModifySVG(iconUrl, planetColor, instanceId + '-transit');
                if (isCancelled()) return;
                const planetImage = new Image();
                planetImage.src = coloredIconUrl;
                planetImage.onload = () => {
                    if (isCancelled()) return;
                    ctx.drawImage(planetImage, drawX, drawY, ICON_WIDTH, ICON_HEIGHT);

                    // Indicator line if the glyph slid along the ring.
                    if (wasMoved) {
                        ctx.beginPath();
                        ctx.moveTo(drawX + ICON_WIDTH / 2, drawY + ICON_HEIGHT / 2);
                        ctx.lineTo(
                            dims.centerX + dims.innerRadius * Math.cos(truePlanetRadians),
                            dims.centerY + dims.innerRadius * Math.sin(truePlanetRadians)
                        );
                        ctx.strokeStyle = hexToRgba(planetColor, 0.35);
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                        ctx.lineWidth = 1;
                    }
                };
                planetImage.onerror = () => {
                    if (isCancelled()) return;
                    ctx.fillStyle = planetColor;
                    ctx.beginPath();
                    ctx.arc(drawX + ICON_WIDTH / 2, drawY + ICON_HEIGHT / 2, ICON_WIDTH / 2, 0, 2 * Math.PI);
                    ctx.fill();
                };
            } catch (error) {
                console.error(`Error processing transit SVG for ${planetName}:`, error);
            }
        }
    }, [instanceId, dims, canvasSize]);


    const drawZodiacWheel = useCallback(async (ctx, planets, houses, aspects, transits, isCancelled) => {

        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        const rotationRadians = ((270 + currentAscendantDegree) % 360) * Math.PI / 180;
        const houseRotationRadians = Math.PI / 180;

        ctx.save();

        ctx.translate(dims.centerX, dims.centerY);
        ctx.rotate(rotationRadians);
        ctx.translate(-dims.centerX, -dims.centerY);

        ctx.strokeStyle = palette.ring;
        ctx.lineWidth = palette.ringWidth;

        ctx.beginPath();
        ctx.arc(dims.centerX, dims.centerY, dims.outerRadius, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(dims.centerX, dims.centerY, dims.innerRadius, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(dims.centerX, dims.centerY, dims.houseCircleRadius, 0, 2 * Math.PI);
        ctx.stroke();

        for (let i = 0; i < 12; i++) {
            const angle = (i * 30) * Math.PI / 180;
            ctx.beginPath();
            ctx.moveTo(dims.centerX + dims.innerRadius * Math.cos(angle), dims.centerY + dims.innerRadius * Math.sin(angle));
            ctx.lineTo(dims.centerX + dims.outerRadius * Math.cos(angle), dims.centerY + dims.outerRadius * Math.sin(angle));
            ctx.lineWidth = palette.ringWidth;
            ctx.stroke();
        }
        ctx.lineWidth = 1;

        const scale = canvasSize / BASE_SIZE;
        const zodiacIconSize = Math.round(palette.zodiacIconSize * scale);
        const zodiacIconOffset = Math.round((palette.zodiacIconSize / 2) * scale);
        const zodiacRingOffset = Math.round(palette.zodiacRingOffset * scale);

        zodiacIcons.forEach(async (iconAddress, index) => {
            if (isCancelled()) return;
            const icon = await loadAndModifySVG(iconAddress, palette.zodiacColor(index), instanceId);
            if (isCancelled()) return;
            const iconDegree = 15 + index * 30;
            const iconRadians = ((270 - iconDegree) % 360) * Math.PI / 180 + rotationRadians;
            const iconX = dims.centerX + (dims.innerRadius + zodiacRingOffset) * Math.cos(iconRadians) - zodiacIconOffset;
            const iconY = dims.centerY + (dims.innerRadius + zodiacRingOffset) * Math.sin(iconRadians) - zodiacIconOffset;

            const image = new Image();
            image.src = icon;
            image.onload = () => {
                if (isCancelled()) return;
                ctx.drawImage(image, iconX, iconY, zodiacIconSize, zodiacIconSize);
            };
        });

        if (planets && planets.length !== 0) {
            drawPlanets(ctx, planets, rotationRadians, isCancelled)
        }

        if (houses && houses.length !== 0) {
            drawHouses(ctx, houses, houseRotationRadians)
        }

        if (aspects && aspects.length !== 0) {
            drawAspectLines(ctx, aspects, dims.innerRadius, houseRotationRadians);
        }

        if (transits && transits.length !== 0) {
            drawTransits(ctx, transits, rotationRadians, houseRotationRadians, isCancelled);
        }

        ctx.restore();
        ctx.strokeStyle = '#000000';
    }, [currentAscendantDegree, drawHouses, drawPlanets, drawAspectLines, drawTransits, instanceId, dims, canvasSize, palette]);

    // Single effect for drawing
    useEffect(() => {
        let cancelled = false;
        const isCancelled = () => cancelled;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext('2d');
        drawZodiacWheel(context, planets, houses, aspects, transits, isCancelled);

        // Cleanup cancels stale async draws. The module-level svgCache is
        // deliberately NOT revoked here: it is shared by every Ephemeris
        // instance, and revoking it from one unmounting wheel poisons the
        // blob URLs another mounted wheel has already handed to <img> loads
        // (glyphs silently vanish). The cache is small and bounded, so
        // keeping the object URLs alive for the app's lifetime is fine.
        return () => {
            cancelled = true;
        };
    }, [planets, houses, aspects, transits, drawZodiacWheel]);

    // Resize observer to make canvas responsive
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const updateSize = () => {
            const width = container.clientWidth;
            const newSize = Math.min(width, BASE_SIZE);
            setCanvasSize(newSize);
        };

        updateSize();

        const observer = new ResizeObserver(updateSize);
        observer.observe(container);

        return () => observer.disconnect();
    }, []);

    return (
        <div ref={containerRef} className="ephemeris-container" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            <canvas ref={canvasRef} width={canvasSize} height={canvasSize} />
        </div>
    );
});

export default Ephemeris;
