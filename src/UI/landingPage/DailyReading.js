import React, { useEffect, useState } from 'react';

const signOrder = [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", 
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
  ];
  
  const getHouseNumber = (risingSign, planetSign) => {
    const risingIndex = signOrder.indexOf(risingSign);
    const planetIndex = signOrder.indexOf(planetSign);
    if (risingIndex === -1 || planetIndex === -1) return -1; // Error handling if sign not found
    return ((planetIndex - risingIndex + 12) % 12) + 1;
  };
  
  const orbDegrees = {
    'Moon': 8,
    'Mercury': 5,
    'Venus': 5,
    'Sun': 5,
    'Mars': 3,
    'Jupiter': 3,
    'Saturn': 3,
    'Uranus': 3,
    'Neptune': 3,
    'Pluto': 3
  };

  const aspects = [
    { 'name': 'conjunction', 'orb': 0 },
    { 'name': 'sextile', 'orb': 60 },
    { 'name': 'square', 'orb': 90 },
    { 'name': 'trine', 'orb': 120 },
    { 'name': 'quincunx', 'orb': 150 },
    { 'name': 'opposition', 'orb': 180 },
  ];

  const moonPhases = {
    conjunction: 'New Moon',
    square: 'Quarter Moon',
    opposition: 'Full Moon',
    sextile: 'Waxing/Waning Moon',
    trine: 'Waxing/Waning Moon'
  };
  

const calculateAspect = (degree1, degree2, isRetro, transitName) => {
    let diff = Math.abs(degree1 - degree2);
    diff = diff > 180 ? 360 - diff : diff;
    const maxOrb = orbDegrees[transitName];
  
    for (let aspect of aspects) {
      let orbDiff = Math.abs(diff - aspect.orb);
      if (orbDiff <= maxOrb) {
        return { aspectType: aspect.name, orb: orbDiff.toFixed(1) };
      }
    }
    return { aspectType: '', orb: 0 };
  };

const DailyReading = ({ transitAspectObjects, transits, risingSign ="Scorpio" }) => {
    const getPlanetData = (planetName) => {
        return transits.find(transit => transit.name === planetName);
    };

    const formatTransits = (transit, risingSign) => {
        const { name, sign, norm_degree, house } = transit;
      
        let transitDescription = `The ${name} is transiting ${sign}`;
      
        if (risingSign) {
          const planetHouse = getHouseNumber(risingSign, sign);
          transitDescription += ` in your ${planetHouse} house`;
        }
      
        if (norm_degree < 3) {
          transitDescription += ` (The ${name} is entering ${sign})`;
        } else if (norm_degree > 27) {
          transitDescription += ` (The ${name} is exiting ${sign})`;
        }
      
        return transitDescription;
      };

    const formatTransitData = (aspect) => {
        const transitingPlanetData = getPlanetData(aspect.transitingPlanet);
        const aspectingPlanetData = getPlanetData(aspect.aspectingPlanet);
    
        if (!transitingPlanetData || !aspectingPlanetData) {
          return "Data not available";
        }
    
        const { aspectType, orb } = calculateAspect(
          transitingPlanetData.full_degree,
          aspectingPlanetData.full_degree,
          transitingPlanetData.is_retro === "true",
          aspect.transitingPlanet
        );
    
        if (!aspectType) {
          return "No valid aspect found";
        }

        let description = '';

    
        if (risingSign) {
          const transitingPlanetHouse = getHouseNumber(risingSign, transitingPlanetData.sign);
          const aspectingPlanetHouse = getHouseNumber(risingSign, aspectingPlanetData.sign);

        //   const transitingPlanetDescription = `${aspect.transitingPlanet} in ${transitingPlanetData.sign} in the ${transitingPlanetHouse} house at ${transitingPlanetData.norm_degree.toFixed(1)} degrees`;
        // const aspectingPlanetDescription = `${aspect.aspectingPlanet} in ${aspectingPlanetData.sign} in the ${aspectingPlanetHouse} house at ${aspectingPlanetData.norm_degree.toFixed(1)} degrees`;
    
          const transitingPlanetDescription = `${aspect.transitingPlanet} in ${transitingPlanetData.sign} in the ${transitingPlanetHouse} house`;
          const aspectingPlanetDescription = `${aspect.aspectingPlanet} in ${aspectingPlanetData.sign} in the ${aspectingPlanetHouse} house`;
    
          description = `${transitingPlanetDescription} forming a ${aspectType} to ${aspectingPlanetDescription} with an orb of ${orb} degrees`;
        } else {

            // const transitingPlanetDescription = `${aspect.transitingPlanet} in ${transitingPlanetData.sign} at ${transitingPlanetData.norm_degree.toFixed(1)} degrees`;
            // const aspectingPlanetDescription = `${aspect.aspectingPlanet} in ${aspectingPlanetData.sign} at ${aspectingPlanetData.norm_degree.toFixed(1)} degrees`;
          const transitingPlanetDescription = `${aspect.transitingPlanet} in ${transitingPlanetData.sign}`;
          const aspectingPlanetDescription = `${aspect.aspectingPlanet} in ${aspectingPlanetData.sign}`;
    
          description = `${transitingPlanetDescription} forming a ${aspectType} to ${aspectingPlanetDescription} with an orb of ${orb} degrees`;
        }
        if (aspect.transitingPlanet === 'Moon' && aspect.aspectingPlanet === 'Sun') {
            const moonPhase = getMoonPhase(aspectType, transitingPlanetData.full_degree, aspectingPlanetData.full_degree);
            description += ` (${moonPhase})`;
          }

          return description;

      };


    const getMoonPhase = (aspectType, moonDegree, sunDegree) => {
        if (aspectType === 'square' || aspectType === 'sextile' || aspectType === 'trine') {
          const normalizedMoonDegree = (moonDegree + 360) % 360;
          const normalizedSunDegree = (sunDegree + 360) % 360;
          const isWaxing = normalizedMoonDegree > normalizedSunDegree 
            ? (normalizedMoonDegree - normalizedSunDegree <= 180) 
            : (normalizedSunDegree - normalizedMoonDegree > 180);
      
          if (aspectType === 'square') {
            return isWaxing ? 'First Quarter Moon' : 'Last Quarter Moon';
          }
          if (aspectType === 'sextile' || aspectType === 'trine') {
            return isWaxing ? 'Waxing Moon' : 'Waning Moon';
          }
        }
        return moonPhases[aspectType] || '';
      };

    async function generateResponse() {
        // to be filled
    }


    return (
        <div style={{ color: 'white' }}>
          <div style={{ marginBottom: '20px' }}>
            <h4>Transit Descriptions</h4>
            {transits.map((transit, index) => (
              <div key={index}>{formatTransits(transit, risingSign)}</div>
            ))}
          </div>
          <div style={{ marginBottom: '20px' }}>
            <h4>Aspect Descriptions</h4>
            {transitAspectObjects.map((aspect, index) => (
              <div key={index}>{formatTransitData(aspect, transits, risingSign)}</div>
            ))}
          </div>
          <div style={{ marginBottom: '20px' }}>
            <h4>Today's Reading</h4>
            <button onClick={generateResponse}>Generate Chart Interpretation</button>
          </div>
        </div>
      );


};

export default DailyReading;

