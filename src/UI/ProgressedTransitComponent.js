import React, { useEffect, useState } from 'react';
import Emphemeris from './shared/Ephemeris'
import { PlanetPositions } from './PlanetPositions';
import useStore from '../Utilities/store';
import { findAspects } from '../Utilities/generateTransitDescriptions';
import { getPeriodAspectsForUser } from '../Utilities/api';

const ProgressedTransitComponent = ( {transitType} ) => {
    // const birthData = useStore(state => state.birthData)
    const rawBirthData = useStore(state => state.rawBirthData)
    const ascendantDegree = useStore(state => state.ascendantDegree)
    const userId = useStore(state => state.userId)
  
    const progressedBirthData = useStore(state => state.progressedBirthData);
    const dailyPersonalTransitDescriptions = useStore(state => state.dailyPersonalTransitDescriptions)
    const dailyTransitDescriptions = useStore(state => state.dailyTransitDescriptions)
    const progressedTransitDescriptions = useStore(state => state.progressedTransitDescriptions)
    const dailyTransits = useStore(state => state.dailyTransits)


    async function generateTransits() {
        const today = new Date();
        // const oneYearFromNow = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());
        const oneMonthFromNow = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
        try {
            // not working yet
            const transitsForUser = await getPeriodAspectsForUser(today.toDateString(), oneMonthFromNow.toDateString(), userId);
            // The groupedAspects will be logged in the getPeriodAspectsForUser function
            // You can do additional processing here if needed
        } catch (error) {
            console.error('Error generating transits:', error);
        }
    }

    return (
        <div className="planet-component">
            <div>
                <h4>{transitType}</h4>
                <button onClick={generateTransits}>Generate TRANSITS</button>
            </div>
            {transitType === 'Progressed' && progressedBirthData !== "" && progressedTransitDescriptions !== "" && (
                <div className="planet-response">
                    <pre>{JSON.stringify(progressedBirthData)}</pre>  
                    <pre>{progressedTransitDescriptions.join('\n')}</pre>  
                    <Emphemeris planets={rawBirthData.planets} houses={rawBirthData.houses} ascendantDegree={ascendantDegree} transits={progressedBirthData}/>
                    
                </div>
            )}
            {transitType === 'Transits' && dailyPersonalTransitDescriptions !== "" && (
                <div className="planet-response">
                    <pre>{JSON.stringify(dailyTransits)}</pre>  
                    {/* <pre>{dailyPersonalTransitDescriptions.join('\n')}</pre> 
                    <pre>{dailyTransitDescriptions.join('\n')}</pre>  */}
                    <pre>{dailyPersonalTransitDescriptions}</pre> 
                    <pre>{dailyTransitDescriptions}</pre> 


                    <Emphemeris planets={rawBirthData.planets} houses={rawBirthData.houses} ascendantDegree={ascendantDegree} transits={dailyTransits}/>


                </div>
            )}
        </div>
    );
};

export default ProgressedTransitComponent;
