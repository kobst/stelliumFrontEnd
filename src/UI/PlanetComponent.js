import React, { useEffect } from 'react';
import { postGptResponsePlanets } from '../Utilities/api'; 
import useStore from '../Utilities/store';

const PlanetComponent = ({ planet }) => {
    const promptDescriptionsMap = useStore(state => state.promptDescriptionsMap);
    const planetResponsesMap = useStore(state => state.planetResponsesMap);
    const setPlanetResponsesMap = useStore(state => state.setPlanetResponsesMap);

    useEffect(() => {
        // Check if the planet response is already fetched
        if (!planetResponsesMap[planet] || planetResponsesMap[planet] === '') {
            generateResponse();
        }
    }, [planet, promptDescriptionsMap, planetResponsesMap]);

    async function generateResponse() {
        if (!planet || planet === '') {
            console.error('Planet or planet type is undefined');
            return;
        }
        console.log("generate planet response");
        const modifiedInput = promptDescriptionsMap['everything'] + "\n" +  planet.toUpperCase() + " ANALYSIS";
        try {
            const response = await postGptResponsePlanets(modifiedInput);
            setPlanetResponsesMap(planet, response);
        } catch (error) {
            console.error('Error:', error);
        }
    }

    return (
        <div className="planet-component">
            <div>
                <h4>{planet}</h4>
                <button onClick={generateResponse}>Generate Planet Interpretation</button>
            </div>
            {planetResponsesMap[planet] !== "" && (
                <div className="planet-response">
                    <pre>{planetResponsesMap[planet]}</pre>  
                </div>
            )}
        </div>
    );
};

export default PlanetComponent;
