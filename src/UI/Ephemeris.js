import React, { useRef, useEffect, useState } from 'react';
import useStore from '../Utilities/store';



const zodiacIcons = [
    '/assets/signs/icons8-aries-50.png',
    '/assets/signs/icons8-taurus-50.png',
    '/assets/signs/icons8-gemini-30.png',
    '/assets/signs/icons8-cancer-48.png',
    '/assets/signs/icons8-leo-50.png',
    '/assets/signs/icons8-virgo-50.png',
    '/assets/signs/icons8-libra-50.png',
    '/assets/signs/icons8-scorpio-50.png',
    '/assets/signs/icons8-sagittarius-50.png',
    '/assets/signs/icons8-capricorn-50.png',
    '/assets/signs/icons8-aquarius-50.png',
    '/assets/signs/icons8-pisces-50.png'
];

const planetIcons = [
    '/assets/planets/icons8-sun-symbol-50.png',
    '/assets/planets/icons8-moon-symbol-50.png',
    '/assets/planets/icons8-mercury-50.png',
    '/assets/planets/icons8-venus-symbol-50.png',
    '/assets/planets/icons8-mars-symbol-50.png',
    '/assets/planets/icons8-jupiter-symbol-50.png',
    '/assets/planets/icons8-saturn-symbol-50.png',
    '/assets/planets/icons8-uranus-symbol-50.png',
    '/assets/planets/icons8-neptune-symbol-50.png',
    '/assets/planets/icons8-pluto-50.png'
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
    "Pluto": 9
};


const Emphemeris = () => {
    const canvasRef = useRef(null);
    const [ascendantDegree, setAscendantDegree] = useState(0)
    const [planets, setPlanets] = useState([])
    const [houses, setHouses] = useState([])

    // const ascendantDegree = useStore(state => state.ascendantDegree);
    const rawBirthData = useStore(state => state.rawBirthData);


    useEffect(() => {

        if (rawBirthData.planets) {
            setPlanets(rawBirthData.planets)
            setAscendantDegree(rawBirthData.houses[0].degree)
            setHouses(rawBirthData.houses)
        }
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        drawZodiacWheel(context);

    }, [rawBirthData]);

    const drawZodiacWheel = (ctx) => {
        const centerX = 300;
        const centerY = 300;
        const outerRadius = 200;
        const innerRadius = 90;
        const houseCircleRadius = 220

       
        // Clear the canvas
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        // Convert ascendant degree to radians and adjust for starting at left (9 o'clock)
        const rotationRadians = ((270 + ascendantDegree) % 360) * Math.PI / 180;
        const houseRotationRadians = Math.PI / 180;

        // Save the unrotated context
        ctx.save();

        // // Move to center and rotate the canvas context
        ctx.translate(centerX, centerY);
        ctx.rotate(rotationRadians);
        ctx.translate(-centerX, -centerY);

        // Draw the outer and inner circles
        ctx.beginPath();
        ctx.arc(centerX, centerY, outerRadius, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(centerX, centerY, innerRadius, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(centerX, centerY, houseCircleRadius, 0, 2 * Math.PI);
        ctx.stroke();


        ctx.strokeStyle = '#cccccc';

        //Draw 12 sections
        for (let i = 0; i < 12; i++) {
            const angle = (i * 30) * Math.PI / 180; // 30 degrees for each section
            console.log(angle + "angle")
            ctx.beginPath();
            ctx.moveTo(centerX + innerRadius * Math.cos(angle), centerY + innerRadius * Math.sin(angle));
            ctx.lineTo(centerX + outerRadius * Math.cos(angle), centerY + outerRadius * Math.sin(angle));
            
            if (i === 0) {
                ctx.lineWidth = 6; // Thicker line for main houses
            } else {
                ctx.lineWidth = 1; // Default line width for other houses
            }

            ctx.stroke();
        }


        zodiacIcons.forEach((icon, index) => {
            // Midpoint degree for each sign, starting with Aries
            const iconDegree = 15 + index * 30; // Ensure degrees are within 0-359

            // Calculate radians for icon position
            const iconRadians = ((270 - iconDegree) % 360) * Math.PI / 180 + rotationRadians;

            const iconX = centerX + (innerRadius + 35) * Math.cos(iconRadians) - 25; // Adjust for icon size
            const iconY = centerY + (innerRadius + 35) * Math.sin(iconRadians) - 25; // Adjust for icon size

            const image = new Image();
            image.src = icon;
            image.onload = () => {
                ctx.drawImage(image, iconX, iconY, 50, 50); // Assuming icons are 50x50px
            };
        });

        if (planets.length !== 0) {
            planets.forEach(planet => {
                const planetIndex = planetNameToIndex[planet.name];
                if (planetIndex !== undefined) {
                    const planetDegree = planet.full_degree;

                    const planetRadians = ((270 - planetDegree) % 360) * Math.PI / 180 + rotationRadians;
                    const planetX = centerX + (outerRadius + 50) * Math.cos(planetRadians) - 25;
                    const planetY = centerY + (outerRadius +50) * Math.sin(planetRadians) - 25;
    
                    const planetImage = new Image();
                    planetImage.src = planetIcons[planetIndex];
                    planetImage.onload = () => {
                        ctx.drawImage(planetImage, planetX, planetY, 50, 50);
                    };

                    const planetHashRadians = ((270 - planetDegree) % 360) * Math.PI / 180 + houseRotationRadians;
                    ctx.beginPath();
                    ctx.moveTo(centerX + outerRadius * Math.cos(planetHashRadians), centerY + outerRadius * Math.sin(planetHashRadians));
                    ctx.lineTo(centerX + houseCircleRadius * Math.cos(planetHashRadians), centerY + houseCircleRadius * Math.sin(planetHashRadians));
                    ctx.strokeStyle = 'red';  // Replace 'red' with your desired color
                    ctx.stroke();

                }
            });    
        }


      

        if (houses.length !== 0) {
            console.log("ascendant" + ascendantDegree )
            // const houseRadians = (0) * Math.PI / 180 + rotationRadians;
            // ctx.beginPath();
            // ctx.moveTo(centerX + outerRadius * Math.cos(houseRadians), centerY + outerRadius * Math.sin(houseRadians));
            // ctx.lineTo(centerX + houseCircleRadius * Math.cos(houseRadians), centerY + houseCircleRadius * Math.sin(houseRadians));
            // ctx.lineWidth = 11;
            // ctx.stroke();
            

            houses.forEach(house => {
                const houseDegree = house.degree;
                const houseRadians = ((270 - houseDegree) % 360) * Math.PI / 180 + houseRotationRadians;
                ctx.beginPath();
                ctx.moveTo(centerX + outerRadius * Math.cos(houseRadians), centerY + outerRadius * Math.sin(houseRadians));
                ctx.lineTo(centerX + houseCircleRadius * Math.cos(houseRadians), centerY + houseCircleRadius * Math.sin(houseRadians));
                 // Check if the house is 1, 4, 7, or 10 and adjust the line width accordingly
                if ([1, 10].includes(house.house)) {
                    ctx.lineWidth = 6; // Thicker line for main houses
                } else {
                    ctx.lineWidth = 1; // Default line width for other houses
                }
                ctx.strokeStyle = 'black';  // Replace 'red' with your desired color

                ctx.stroke();
                ctx.lineWidth = 1;
            });
        }


        // Restore the unrotated context for further drawing
        ctx.restore();
        ctx.strokeStyle = '#000000';
    };

    return (
        <>
            <canvas ref={canvasRef} width={600} height={600} />
        </>

    );
};

export default Emphemeris;
