import React, { useEffect } from 'react';
import useStore from '../Utilities/store';
import modifyRawResponse from '../Utilities/modifyResponse';
import { findAspects } from '../Utilities/generateTransitDescriptions'
import { findAspectsInTransits } from '../Utilities/transitsAspects';
import { postPromptGeneration } from '../Utilities/api';

import {generateResponse, findPlanetsInQuadrant, findPlanetsInElements, findPlanetsInModalities} from '../Utilities/generatePrompts';
import { identifyBirthChartPattern } from '../Utilities/patternSummarizer';

const RawBirthDataComponent = () => {

    const rawBirthData = useStore(state => state.rawBirthData);
    const todaysTransits = useStore(state => state.dailyTransits);
    const modifiedBirthData = useStore(state => state.modifiedBirthData);
    const progressedBirthData = useStore(state => state.progressedBirthData);
    const setModifiedBirthData = useStore(state => state.setModifiedBirthData);
    const setPromptDescriptionsMap = useStore(state => state.setPromptDescriptionsMap)
    const setDailyTransitDescriptions = useStore(state => state.setDailyTransitDescriptions);
    const setProgressedTransitDescriptions = useStore(state => state.setProgressedTransitDescriptions)

    useEffect(  () => {

        if (rawBirthData !== ''){
            const modified = rawBirthData
            const todaysTransitDescriptions = findAspects(todaysTransits, modified )
            const progressedTransitDescriptions = findAspects(progressedBirthData, modified, 'progressed' )
            // const progressedAspects = findAspectsInTransits(progressedBirthData, "progressed")
            // console.log("progressed aspects")
            // console.log(progressedAspects)
            
            setProgressedTransitDescriptions(progressedTransitDescriptions)
            setDailyTransitDescriptions(todaysTransitDescriptions)
        }
        
    }, [rawBirthData, todaysTransits, setPromptDescriptionsMap, setModifiedBirthData])


    return (
        <div>
            {rawBirthData !== "" && modifiedBirthData !== "" && 
            <div>
            <pre>prompts ready</pre>  
            </div>}
        </div>
    );
};

export default RawBirthDataComponent;
