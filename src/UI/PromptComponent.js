import React, { useEffect, useState } from 'react';
import { postGptResponse } from '../Utilities/api'; 
import { heading_map } from '../Utilities/constants';

import useStore from '../Utilities/store';

const PromptComponent = ({ bigFourType }) => {
    const [responses, setResponses] = useState({});
    const [subHeadings, setSubHeadings] = useState([]);
    const [promptData, setPromptData] = useState("")

    const promptDescriptionsMap = useStore(state => state.promptDescriptionsMap)


    useEffect(() => {
        setSubHeadings(heading_map[bigFourType]);
        setPromptData(promptDescriptionsMap[bigFourType])
    }, [bigFourType, promptDescriptionsMap]);

    async function generateResponse(heading) {
        const modifiedInput = promptData + "\n" + heading;
        try {
          const response = await postGptResponse(modifiedInput);
          setResponses(prevResponses => ({
            ...prevResponses,
            [heading]: response
          }));
        } catch (error) {
          console.error('Error:', error);
          // Handle the error appropriately
        }
    }

    const handleRedo = (heading) => {
        generateResponse(heading);
    };

    const renderResponseForHeading = (heading) => {
        return (
            <div key={heading}>
                <h4>{heading}</h4>
                <button onClick={() => handleRedo(heading)}>Redo</button>
                <p>{responses[heading]}</p>
            </div>
        );
    };

    return (
        <div>
            {promptData !== "" && (
                <div>
                    <pre>{promptData}</pre>  
                    <button onClick={() => subHeadings.forEach(generateResponse)}>Generate Responses</button>
                </div>
            )}
            {subHeadings.map(renderResponseForHeading)}
        </div>
    );
};

export default PromptComponent;
