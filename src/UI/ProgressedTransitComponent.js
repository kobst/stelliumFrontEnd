import React, { useEffect, useState } from 'react';
import Emphemeris from './shared/Ephemeris'
import { PlanetPositions } from './PlanetPositions';
import useStore from '../Utilities/store';
import { findAspects } from '../Utilities/generateTransitDescriptions';

const ProgressedTransitComponent = ( {transitType} ) => {
    // const birthData = useStore(state => state.birthData)
    const progressedBirthData = useStore(state => state.progressedBirthData);
    // const setProgressedBirthData = useStore(state => state.setProgressedBirthData);
    // const modifiedBirthData = useStore(state => state.modifiedBirthData)
    const dailyPersonalTransitDescriptions = useStore(state => state.dailyPersonalTransitDescriptions)
    const dailyTransitDescriptions = useStore(state => state.dailyTransitDescriptions)

    // const setDailyTransitDescriptions = useStore(state => state.setDailyTransitDescriptions)
    const progressedTransitDescriptions = useStore(state => state.progressedTransitDescriptions)
    // const setProgressedTransitDescriptions = useStore(state => state.setProgressedTransitDescriptions)
    // const setDailyTransits = useStore(state => state.setDailyTransits)
    const dailyTransits = useStore(state => state.dailyTransits)


    useEffect(() => {
 
        generateResponse();

    }, []);



    async function generateResponse() {
        // to be filled
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
                    <Emphemeris transits={progressedBirthData}/>
                    
                </div>
            )}
            {transitType === 'Transits' && dailyPersonalTransitDescriptions !== "" && (
                <div className="planet-response">
                    <pre>{JSON.stringify(dailyTransits)}</pre>  
                    {/* <pre>{dailyPersonalTransitDescriptions.join('\n')}</pre> 
                    <pre>{dailyTransitDescriptions.join('\n')}</pre>  */}
                    <pre>{dailyPersonalTransitDescriptions}</pre> 
                    <pre>{dailyTransitDescriptions}</pre> 


                    <Emphemeris transits={dailyTransits}/>


                </div>
            )}
        </div>
    );
};

export default ProgressedTransitComponent;
