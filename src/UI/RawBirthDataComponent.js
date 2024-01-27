import React, { useEffect } from 'react';
import useStore from '../Utilities/store';
import modifyRawResponse from '../Utilities/modifyResponse';
import { findAspects } from '../Utilities/generateTransitDescriptions'
import {generateResponse, findPlanetsInQuadrant, findPlanetsInElements, findPlanetsInModalities} from '../Utilities/generatePrompts';
import { identifyBirthChartPattern } from '../Utilities/patternSummarizer';

const RawBirthDataComponent = () => {

    const rawBirthData = useStore(state => state.rawBirthData);
    const todaysTransits = useStore(state => state.dailyTransits);
    const modifiedBirthData = useStore(state => state.modifiedBirthData);
    const progressedBirthData = useStore(state => state.progressedBirthData);
    const setModifiedBirthData = useStore(state => state.setModifiedBirthData);
    const setPromptDescriptionsMap = useStore(state => state.setPromptDescriptionsMap)
    // const setAscendantDegree = useStore(state => state.setAscendantDegree)
    const setDailyTransitDescriptions = useStore(state => state.setDailyTransitDescriptions);
    const setProgressedTransitDescriptions = useStore(state => state.setProgressedTransitDescriptions)

    useEffect(() => {
        if (rawBirthData !== '' && todaysTransits !== '' && progressedBirthData !== ''){
            // setAscendantDegree(rawBirthData['ascendant'])
            const pattern = identifyBirthChartPattern(rawBirthData)
            const modified = modifyRawResponse(rawBirthData)
            const everything = generateResponse('everything', modified)
            const personality = generateResponse('personality', modified)
            const home = generateResponse('home', modified)
            const relationships = generateResponse('relationships', modified)
            const career = generateResponse('career', modified)
            const quadrants = findPlanetsInQuadrant(modified)
            const elements = findPlanetsInElements(modified)
            const modalities = findPlanetsInModalities(modified)
            const todaysTransitDescriptions = findAspects(todaysTransits, modified )
            const progressedTransitDescriptions = findAspects(progressedBirthData, modified )
            
            setProgressedTransitDescriptions(progressedTransitDescriptions)
            setDailyTransitDescriptions(todaysTransitDescriptions)
            setPromptDescriptionsMap('personality', personality)
            setPromptDescriptionsMap('home', home)
            setPromptDescriptionsMap('relationships', relationships)
            setPromptDescriptionsMap('career', career)
            setPromptDescriptionsMap('everything', everything)
            setPromptDescriptionsMap('Quadrants', quadrants)
            setPromptDescriptionsMap('Elements', elements)
            setPromptDescriptionsMap('Modalities', modalities)
            setPromptDescriptionsMap('Pattern', pattern)
            setModifiedBirthData(modified)
            // console.log(JSON.stringify(modified, null, 2))

        }
        

    }, [rawBirthData, todaysTransits, setPromptDescriptionsMap, setModifiedBirthData])


    return (
        <div>
            {rawBirthData !== "" && 
            <div>
            <pre>raw data ready</pre>  
            </div>}
            {modifiedBirthData !== "" && 
            <div>
            <pre>prompts ready</pre>  
            </div>}
        </div>
    );
};

export default RawBirthDataComponent;
