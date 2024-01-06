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


const Emphemeris = () => {
    const canvasRef = useRef(null);

    const[ascendantDegree, setAscendantDegree] = useState(0)

    const rawBirthData = useStore(state => state.rawBirthData);


    useEffect(() => {
        if (rawBirthData !== '') {
            setAscendantDegree(rawBirthData['ascendant'])
        }
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        drawZodiacWheel(context);

    }, [rawBirthData]);

    const drawZodiacWheel = (ctx) => {
        const centerX = 250;
        const centerY = 250;
        const outerRadius = 200;
        const innerRadius = 90;

       
        // Clear the canvas
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        // Convert ascendant degree to radians and adjust for starting at left (9 o'clock)
        const rotationRadians = ((270 + ascendantDegree) % 360) * Math.PI / 180;

        // Save the unrotated context
        ctx.save();

        // Move to center and rotate the canvas context
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

        ctx.strokeStyle = '#cccccc';

        // Draw 12 sections
        for (let i = 0; i < 12; i++) {
            const angle = (i * 30) * Math.PI / 180; // 30 degrees for each section
            ctx.beginPath();
            ctx.moveTo(centerX + innerRadius * Math.cos(angle), centerY + innerRadius * Math.sin(angle));
            ctx.lineTo(centerX + outerRadius * Math.cos(angle), centerY + outerRadius * Math.sin(angle));
            ctx.stroke();
        }


        zodiacIcons.forEach((icon, index) => {
            // Midpoint degree for each sign, starting with Aries
            const iconDegree = 15 + index * 30; // Ensure degrees are within 0-359

            // Calculate radians for icon position
            // Subtract iconDegree from 270 to start from 9 o'clock and go counter-clockwise
            const iconRadians = ((270 - iconDegree) % 360) * Math.PI / 180 + rotationRadians;

            const iconX = centerX + (innerRadius + 35) * Math.cos(iconRadians) - 25; // Adjust for icon size
            const iconY = centerY + (innerRadius + 35) * Math.sin(iconRadians) - 25; // Adjust for icon size

            const image = new Image();
            image.src = icon;
            image.onload = () => {
                ctx.drawImage(image, iconX, iconY, 50, 50); // Assuming icons are 50x50px
            };
        });

        // Restore the unrotated context for further drawing
        ctx.restore();
        ctx.strokeStyle = '#000000';
    };

    return (
        <>
            <canvas ref={canvasRef} width={500} height={500} />
        </>

    );
};

export default Emphemeris;
