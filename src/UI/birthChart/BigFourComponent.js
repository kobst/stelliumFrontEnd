import React, { useEffect, useState } from 'react';
import { postGptResponse, postPromptGPT } from '../../Utilities/api'; 
import { heading_map } from '../../Utilities/constants';

import useStore from '../../Utilities/store';

const BigFourComponent = ({ bigFourType }) => {
    // const [responses, setResponses] = useState({});
    const [subHeadings, setSubHeadings] = useState([]);
    // const [promptData, setPromptData] = useState("")
    const [everythingData, setEverythingData] = useState("")
    const promptDescriptionsMap = useStore(state => state.promptDescriptionsMap)
    const setHeadingInterpretationMap = useStore(state => state.setHeadingInterpretationMap)
    const headingInterpretationMap = useStore(state => state.headingInterpretationMap)
    const setSubHeadingsPromptDescriptionsMap = useStore(state => state.setSubHeadingsPromptDescriptionsMap)
    const subHeadingsPromptDescriptionsMap = useStore(state => state.subHeadingsPromptDescriptionsMap)
    // console.log(bigFourMap)

    useEffect(() => {
        setSubHeadings(heading_map[bigFourType]);
        // setPromptData(promptDescriptionsMap[bigFourType])
        setEverythingData(promptDescriptionsMap['everything'])


    }, [bigFourType, promptDescriptionsMap]);

    async function generateResponse(heading) {
        // const modifiedInput = promptData + "\n" + heading + "\nEvery time you mention a particular aspect or position, please include its reference number provided";

        const modifiedInput = `${everythingData}\n${bigFourType.toUpperCase()}: ${heading}`;
        try {
            const responseObject = await postPromptGPT(modifiedInput)
            console.log(responseObject)
            // setBigFourMap(heading, responseObject.response)
            setSubHeadingsPromptDescriptionsMap(heading, responseObject.response)
        } catch (error) {
          console.error('Error:', error);
        }
    }

    const handleRedo = (heading) => {
        generateResponse(heading);
    };


    async function generateInterpretation(heading) {
        const modifiedInput = `${subHeadingsPromptDescriptionsMap[heading]}: ${heading}`;
        try {
            const responseObject = await postGptResponse(modifiedInput)
            console.log(responseObject)
            setHeadingInterpretationMap(heading, responseObject)
        } catch (error) {
          console.error('Error:', error);
        }
    }

    const renderResponseForHeading = (heading) => {
        return (
            <div key={heading}>
                <h4 className="heading"> {heading}</h4>
                <button className="redo-button" onClick={() => handleRedo(heading)}> Generate Relevant Birth Data for this Subheading</button>
                <div className="planet-response">
                    <pre>{subHeadingsPromptDescriptionsMap[heading]}</pre>  
                </div>
                <button className="redo-button" onClick={() => generateInterpretation(heading)}> Generate Interpretation</button>
                <div className="planet-response">
                    <pre>{headingInterpretationMap[heading]}</pre>  
                </div>
            </div>
        );
    };

    return (
        <div>
         
            <div>
                <button onClick={() => subHeadings.forEach(generateResponse)}>Generate Relevant Birth Data for all Subheadings</button>
            </div>
            {subHeadings.map(renderResponseForHeading)}
        </div>
    );
};

export default BigFourComponent;
