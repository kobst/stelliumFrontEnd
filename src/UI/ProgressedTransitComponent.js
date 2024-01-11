import React, { useEffect } from 'react';
import {  } from '../Utilities/api'; 
import useStore from '../Utilities/store';

const ProgressedTransitComponent = ( ) => {
    const progressedBirthData = useStore(state => state.progressedBirthData);

    useEffect(() => {
        // Check if the planet response is already fetched
        generateResponse();
        console.log(JSON.stringify(progressedBirthData, null, 2))

    }, [progressedBirthData]);

    async function generateResponse() {
        console.log("generate progressed chart response");
        // const modifiedInput = promptDescriptionsMap['everything'] + "\n" +  planet.toUpperCase() + " ANALYSIS";
        // try {
        //     const response = await postGptResponsePlanets(modifiedInput);
        //     setPlanetResponsesMap(planet, response);
        // } catch (error) {
        //     console.error('Error:', error);
        // }
    }

    return (
        <div className="planet-component">
            <div>
                <h4>progressed chart</h4>
                <button onClick={generateResponse}>Generate Progressed Chart Interpretation</button>
            </div>
            {progressedBirthData !== "" && (
                <div className="planet-response">
                    <pre>{JSON.stringify(progressedBirthData, null, 2)}</pre>  
                </div>
            )}
        </div>
    );
};

export default ProgressedTransitComponent;
