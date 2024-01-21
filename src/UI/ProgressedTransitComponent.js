import React, { useEffect, useState } from 'react';
import { postDailyTransit } from '../Utilities/api'; 
import useStore from '../Utilities/store';
import { findAspects } from '../Utilities/generateTransitDescriptions';

const ProgressedTransitComponent = ( {transitType} ) => {
    const progressedBirthData = useStore(state => state.progressedBirthData);
    const modifiedBirthData = useStore(state => state.modifiedBirthData)
    const dailyTransitDescriptions = useStore(state => state.dailyTransitDescriptions)
    const setDailyTransitDescriptions = useStore(state => state.setDailyTransitDescriptions)
    const progressedTransitDescriptions = useStore(state => state.progressedTransitDescriptions)


    useEffect(() => {
        // Check if the planet response is already fetched
        generateResponse();
        console.log(JSON.stringify(progressedBirthData, null, 2))

    }, [progressedBirthData]);

    // useEffect(() => {

    // }, [dailyTransits])

    async function generateResponse() {
        console.log("generate progressed chart response");

        if (transitType === 'Transits' && modifiedBirthData !== '') {
            const todaysPositions = await postDailyTransit();
            const todaysTransits = findAspects(todaysPositions.chartData, modifiedBirthData )
            setDailyTransitDescriptions(todaysTransits)

        }

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
                <h4>{transitType}</h4>
                <button onClick={generateResponse}>Generate Chart Interpretation</button>
            </div>
            {transitType === 'Progressed' && progressedBirthData !== "" && progressedTransitDescriptions !== "" && (
                <div className="planet-response">
                    <pre>{JSON.stringify(progressedBirthData)}</pre>  
                    <pre>{progressedTransitDescriptions.join('\n')}</pre>  
                </div>
            )}
            {transitType === 'Transits' && dailyTransitDescriptions !== "" && (
                <div className="planet-response">
                    <pre>{dailyTransitDescriptions.join('\n')}</pre> 
                </div>
            )}
        </div>
    );
};

export default ProgressedTransitComponent;
