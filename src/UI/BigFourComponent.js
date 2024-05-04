import React, { useEffect, useState } from 'react';
import { postGptResponse, postPromptGPT } from '../Utilities/api'; 
import { heading_map } from '../Utilities/constants';

import useStore from '../Utilities/store';

const BigFourComponent = ({ bigFourType }) => {
    // const [responses, setResponses] = useState({});
    const [subHeadings, setSubHeadings] = useState([]);
    const [promptData, setPromptData] = useState("")
    const [everythingData, setEverythingData] = useState("")

    const promptDescriptionsMap = useStore(state => state.promptDescriptionsMap)
    const setBigFourMap = useStore(state => state.setBigFourMap)
    const bigFourMap = useStore(state => state.bigFourResponsesMap)

    // console.log(bigFourMap)

    useEffect(() => {
        setSubHeadings(heading_map[bigFourType]);
        setPromptData(promptDescriptionsMap[bigFourType])
        setEverythingData(promptDescriptionsMap['everything'])


    }, [bigFourType, promptDescriptionsMap]);

    async function generateResponse(heading) {
        // const modifiedInput = promptData + "\n" + heading + "\nEvery time you mention a particular aspect or position, please include its reference number provided";

        const modifiedInput = `${everythingData}\n${bigFourType.toUpperCase()}-${heading}`;

        try {
        //   const response1 = await postGptResponse(modifiedInput);
            const response = await postPromptGPT(modifiedInput)

        //   setResponses(prevResponses => ({
        //     ...prevResponses,
        //     [heading]: response
        // }));
        // const formattedResponse = response.response.replace(/\n/g, '<br />');

        const linesWithRefs = response.response.split('\n').map((line, index) => `${line}`);
        const formattedResponse = linesWithRefs.join('\n');

            setBigFourMap(heading, formattedResponse  )
            // console.log(response1)

            // console.log(response)
        
        
        } catch (error) {
          console.error('Error:', error);
        }
    }

    const handleRedo = (heading) => {
        generateResponse(heading);
    };

    const renderPromptDataWithRefs = () => {
        if (!promptData) {
            return null;
        }

        // Splitting the promptData into lines and adding ref IDs
        const linesWithRefs = promptData.split('\n').map((line, index) => `${line}`);
        return linesWithRefs.join('\n');
    };

    const renderResponseForHeading = (heading) => {
        return (
            <div key={heading}>
                <h4>{heading}</h4>
                <button onClick={() => handleRedo(heading)}>Redo</button>
                <p>{bigFourMap[heading]}</p>
            </div>
        );
    };

    return (
        <div>
            {promptData !== "" && (
                <div>
                    <pre className='prompts'>{renderPromptDataWithRefs()}</pre>  
                    <button onClick={() => subHeadings.forEach(generateResponse)}>Generate Responses</button>
                </div>
            )}
            {subHeadings.map(renderResponseForHeading)}
        </div>
    );
};

export default BigFourComponent;
