import React, { useRef, useEffect, useState, useCallback } from 'react';
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
    '/assets/signs/sagitarius.svg',
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

const loadAndModifySVG = async (url, color) => {
    const response = await fetch(url);
    const text = await response.text();
    const modifiedSVG = text.replace(/fill="[^"]*"/g, `fill='${color}'`);
    const blob = new Blob([modifiedSVG], { type: 'image/svg+xml' });
    return URL.createObjectURL(blob);
};

const getColorForZodiac = (index) => {
    if (index === 0 || index === 4 || index === 8) return 'red';
    if (index === 1 || index === 5 || index === 9) return 'brown';
    if (index === 2 || index === 6 || index === 10) return 'green';
    if (index === 3 || index === 7 || index === 11) return 'blue';
    return 'white';
  };



const Emphemeris = ({ planets = [], houses = [], transits = [], ascendantDegree = 0 }) => {
    const canvasRef = useRef(null);
    const [planetsArray, setPlanetsArray] = useState([]);
    const drawZodiacWheel = useCallback(async (ctx, planets, houses, transits, ascendantDegree) => {
        const centerX = 300;
        const centerY = 300;
        const outerRadius = 160;
        const innerRadius = 90;
        const houseCircleRadius = 180;

        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        const rotationRadians = ((270 + ascendantDegree) % 360) * Math.PI / 180;
        const houseRotationRadians = Math.PI / 180;

        ctx.save();

        ctx.translate(centerX, centerY);
        ctx.rotate(rotationRadians);
        ctx.translate(-centerX, -centerY);

        ctx.strokeStyle = 'white';

        ctx.beginPath();
        ctx.arc(centerX, centerY, outerRadius, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(centerX, centerY, innerRadius, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(centerX, centerY, houseCircleRadius, 0, 2 * Math.PI);
        ctx.stroke();

        for (let i = 0; i < 12; i++) {
            const angle = (i * 30) * Math.PI / 180;
            ctx.beginPath();
            ctx.moveTo(centerX + innerRadius * Math.cos(angle), centerY + innerRadius * Math.sin(angle));
            ctx.lineTo(centerX + outerRadius * Math.cos(angle), centerY + outerRadius * Math.sin(angle));
            ctx.lineWidth = 1;
            ctx.stroke();
        }

        zodiacIcons.forEach(async (iconAddress, index) => {

            
            const icon = await loadAndModifySVG(iconAddress, getColorForZodiac(index));
            const iconDegree = 15 + index * 30;
            const iconRadians = ((270 - iconDegree) % 360) * Math.PI / 180 + rotationRadians;
            const iconX = centerX + (innerRadius + 35) * Math.cos(iconRadians) - 25;
            const iconY = centerY + (innerRadius + 35) * Math.sin(iconRadians) - 25;

            const image = new Image();
            image.src = icon;
            image.onload = () => {
                ctx.drawImage(image, iconX, iconY, 50, 50);
            };
        });

        if (planets.length !== 0 && transits.length === 0) {
            setPlanetsArray(planets);
            planets.forEach(async planet => {
                const planetIndex = planetNameToIndex[planet.name];
                if (planetIndex !== undefined) {
                    const planetDegree = planet.full_degree;
                    const planetRadians = ((270 - planetDegree) % 360) * Math.PI / 180 + rotationRadians;
                    const planetX = centerX + (outerRadius + 60) * Math.cos(planetRadians) - 10;
                    const planetY = centerY + (outerRadius + 60) * Math.sin(planetRadians) - 10;

                    const planetIcon = await loadAndModifySVG(planetIcons[planetIndex], 'red');
                    const planetImage = new Image();
                    planetImage.src = planetIcon;
                    planetImage.onload = () => {
                        ctx.drawImage(planetImage, planetX, planetY, 40, 40);
                    };

                    const planetHashRadians = ((270 - planetDegree) % 360) * Math.PI / 180 + rotationRadians;
                    ctx.beginPath();
                    ctx.moveTo(centerX + outerRadius * Math.cos(planetHashRadians), centerY + outerRadius * Math.sin(planetHashRadians));
                    ctx.lineTo(centerX + houseCircleRadius * Math.cos(planetHashRadians), centerY + houseCircleRadius * Math.sin(planetHashRadians));
                    ctx.strokeStyle = 'red';
                    ctx.stroke();
                }
            });
        }

        if (houses.length !== 0) {
            houses.forEach(house => {
                const houseDegree = house.degree;
                const houseRadians = ((270 - houseDegree) % 360) * Math.PI / 180 + houseRotationRadians;
                ctx.beginPath();
                ctx.moveTo(centerX + outerRadius * Math.cos(houseRadians), centerY + outerRadius * Math.sin(houseRadians));
                ctx.lineTo(centerX + houseCircleRadius * Math.cos(houseRadians), centerY + houseCircleRadius * Math.sin(houseRadians));
                if ([1, 10].includes(house.house)) {
                    ctx.lineWidth = 6;
                } else {
                    ctx.lineWidth = 1;
                }
                ctx.strokeStyle = 'white';
                ctx.stroke();
                ctx.lineWidth = 1;
            });
        }

        if (transits.length !== 0) {
            setPlanetsArray(transits);
            transits.forEach(planet => {
                const planetIndex = planetNameToIndex[planet.name];
                if (planetIndex !== undefined) {
                    const planetDegree = planet.full_degree;
                    const planetRadians = ((270 - planetDegree) % 360) * Math.PI / 180 + rotationRadians;
                    const planetX = centerX + (outerRadius + 50) * Math.cos(planetRadians) - 25;
                    const planetY = centerY + (outerRadius + 50) * Math.sin(planetRadians) - 25;

                    const planetImage = new Image();
                    planetImage.src = planetIcons[planetIndex];
                    planetImage.onload = () => {
                        ctx.drawImage(planetImage, planetX, planetY, 50, 50);
                    };

                    const planetHashRadians = ((270 - planetDegree) % 360) * Math.PI / 180 + houseRotationRadians;
                    ctx.beginPath();
                    ctx.moveTo(centerX + outerRadius * Math.cos(planetHashRadians), centerY + outerRadius * Math.sin(planetHashRadians));
                    ctx.lineTo(centerX + houseCircleRadius * Math.cos(planetHashRadians), centerY + houseCircleRadius * Math.sin(planetHashRadians));
                    ctx.strokeStyle = 'blue';
                    ctx.stroke();
                }
            });
        }

        ctx.restore();
        ctx.strokeStyle = '#000000';
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        drawZodiacWheel(context, planets, houses, transits, ascendantDegree);

    }, [planets, houses, transits, ascendantDegree]);


    return (
        <div>
            <canvas ref={canvasRef} width={600} height={600} />
            <PlanetPositions planets={planetsArray}/>
        </div>

    );
};

export default Emphemeris;
