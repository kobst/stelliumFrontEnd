import React, { useEffect } from 'react';
import useStore from '../Utilities/store';
import modifyRawResponse from '../Utilities/modifyResponse';
import {generateResponse, findPlanetsInQuadrant, findPlanetsInElements, findPlanetsInModalities} from '../Utilities/generatePrompts';
import { identifyBirthChartPattern } from '../Utilities/patternSummarizer';

const RawBirthDataComponent = () => {

    const rawBirthData = useStore(state => state.rawBirthData);
    const modifiedBirthData = useStore(state => state.modifiedBirthData);
    const setModifiedBirthData = useStore(state => state.setModifiedBirthData);
    const setPromptDescriptionsMap = useStore(state => state.setPromptDescriptionsMap)
    const setAscendantDegree = useStore(state => state.setAscendantDegree)

    useEffect(() => {
        if (rawBirthData !== ''){
            console.log(rawBirthData)
            setAscendantDegree(rawBirthData['ascendant'])
            const pattern = identifyBirthChartPattern(rawBirthData)
            console.log(pattern)
            const modified = modifyRawResponse(rawBirthData)
            const everything = generateResponse('everything', modified)
            const personality = generateResponse('personality', modified)
            const home = generateResponse('home', modified)
            const relationships = generateResponse('relationships', modified)
            const career = generateResponse('career', modified)
            const quadrants = findPlanetsInQuadrant(modified)
            const elements = findPlanetsInElements(modified)
            const modalities = findPlanetsInModalities(modified)
            setPromptDescriptionsMap('personality', personality)
            setPromptDescriptionsMap('home', home)
            setPromptDescriptionsMap('relationships', relationships)
            setPromptDescriptionsMap('career', career)
            setPromptDescriptionsMap('everything', everything)
            setPromptDescriptionsMap('Quadrants', quadrants)
            setPromptDescriptionsMap('Elements', elements)
            setPromptDescriptionsMap('Modalities', modalities)
            setModifiedBirthData(JSON.stringify(modified, null, 2))
            console.log(JSON.stringify(modified, null, 2))

        }
        

    }, [rawBirthData, setPromptDescriptionsMap, setModifiedBirthData])


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
