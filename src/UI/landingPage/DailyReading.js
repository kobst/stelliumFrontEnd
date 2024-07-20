import React, { useEffect, useState } from 'react';
import Emphemeris from '../shared/Ephemeris'
import useStore from '../../Utilities/store';

const DailyReading = ( ) => {
    const dailyTransitDescriptions = useStore(state => state.dailyTransitDescriptions)
    const dailyTransits = useStore(state => state.dailyTransits)


    useEffect(() => {
        

    }, []);



    async function generateResponse() {
        // to be filled
    }

    return (
        <div className="planet-component">
            <div>
                <h4>Today's Reading</h4>
                <button onClick={generateResponse}>Generate Chart Interpretation</button>
            </div>
                <div className="planet-response">
                    <pre>{JSON.stringify(dailyTransits)}</pre>  
                    {/* <pre>{progressedTransitDescriptions.join('\n')}</pre>   */}
                    <Emphemeris transits={dailyTransits}/>
                </div>
        </div>
    );
};

export default DailyReading;


