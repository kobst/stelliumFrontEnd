import React, { useEffect, useState } from 'react';
import { postGptResponse } from '../Utilities/api'; 
import useStore from '../Utilities/store';

const DominanceComponent = ({ dominanceTopic }) => {
    const promptDescriptionsMap = useStore(state => state.promptDescriptionsMap);
    const dominanceResponsesMap = useStore(state => state.dominanceResponsesMap);
    const [promptData, setPromptData] = useState('')

    const setDominanceResponsesMap = useStore(state => state.setDominanceResponsesMap);

    useEffect(() => {
        console.log(promptDescriptionsMap[dominanceTopic])
        setPromptData(promptDescriptionsMap[dominanceTopic])
    }, [dominanceTopic, setPromptData, promptDescriptionsMap]);

    async function generateResponse() {
        if (!dominanceTopic || dominanceTopic === '') {
            console.error('Dominance type is undefined');
            return;
        }
        console.log("generate dominance response " + dominanceTopic);

        let modifiedInput
        if (dominanceTopic === 'Elements') {
            modifiedInput = promptDescriptionsMap['everything'] + "\nELEMENTAL ANALYSIS\n" + promptDescriptionsMap[dominanceTopic];
        } else {
            modifiedInput = promptDescriptionsMap['everything'] + "\n" +  dominanceTopic.toUpperCase() + " ANALYSIS\n" + promptDescriptionsMap[dominanceTopic];
        }

        try {
            const response = await postGptResponse(modifiedInput);
            setDominanceResponsesMap(dominanceTopic, response);
        } catch (error) {
            console.error('Error:', error);
        }
    }

    return (
        <div className="planet-component">
            <div>
                <h4>{dominanceTopic}</h4>
                {promptData !== "" && (
                <div>
                    <pre>{promptData}</pre>  
                    <button onClick={generateResponse}>Generate Responses</button>
                </div>
                )}
            </div>
            {dominanceResponsesMap[dominanceTopic] !== "" && (
                <div className="planet-response">
                    <pre>{dominanceResponsesMap[dominanceTopic]}</pre>  
                </div>
            )}
        </div>
    );
}

export default DominanceComponent