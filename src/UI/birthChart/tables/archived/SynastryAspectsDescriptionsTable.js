import React, { useState, useEffect } from 'react';
import './SynastryAspectsDescriptionsTable.css';

const SynastryAspectsDescriptionsTable = ({ synastryAspects, birthchartA, birthchartB, userAName, userBName }) => {
  const [synastryAspectDescriptions, setSynastryAspectDescriptions] = useState(null);
  

    // Function to get the planet object from the user's planets array
  const getPlanetObject = (planetName, userPlanets) => {
    return userPlanets.find(planet => planet.name === planetName);
  };

  // Function to generate the aspect description
  const getAspectDescription = (aspect, birthchartA, birthchartB, userAName, userBName) => {
    const { aspectType, orb, planet1, planet2 } = aspect;

    const planet1Object = getPlanetObject(planet1, birthchartA.planets);
    const planet2Object = getPlanetObject(planet2, birthchartB.planets);

    if (!planet1Object || !planet2Object) {
      return 'Invalid planet data';
    }

    const planet1Retro = planet1Object.is_retro === 'true' ? 'retrograde ' : '';
    const planet2Retro = planet2Object.is_retro === 'true' ? 'retrograde ' : '';

    return `${userAName}'s ${planet1Retro}${planet1} in ${planet1Object.sign} in their ${planet1Object.house}th house is ${aspectType} ${userBName}'s ${planet2Retro}${planet2} in ${planet2Object.sign} in their ${planet2Object.house}th house with an orb of ${orb} degrees`;
  };


  useEffect(() => {
    const fetchSynastryAspectDescriptions = () => {
        const synastryAspectDescriptions = [];
        synastryAspects.forEach(aspect => {
            const description = getAspectDescription(aspect, birthchartA, birthchartB, userAName, userBName);
            synastryAspectDescriptions.push(description);
        })
        setSynastryAspectDescriptions(synastryAspectDescriptions);
    }
    fetchSynastryAspectDescriptions();
  }, [synastryAspects, birthchartA, birthchartB, userAName, userBName]);




  return (
    <div className="synastry-aspects-descriptions-container">
      <table className="synastry-aspects-descriptions-table">
        <thead>
          <tr>
            <th>Synastry Aspects</th>
          </tr>
        </thead>
        <tbody>
          {synastryAspectDescriptions && synastryAspectDescriptions.map((aspect, index) => (
            <tr key={index}>
              <td>{aspect}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SynastryAspectsDescriptionsTable;