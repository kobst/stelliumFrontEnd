import React, { useEffect, useState } from 'react';
import { postGptResponse, updateHeadingInterpretation } from '../../Utilities/api'; 
import useStore from '../../Utilities/store';

const DominanceComponent = ({ dominanceTopic }) => {
    const promptDescriptionsMap = useStore(state => state.promptDescriptionsMap);
    // const dominanceResponsesMap = useStore(state => state.dominanceResponsesMap);
    const [promptData, setPromptData] = useState('')
    const userId = useStore(state => state.userId)

    const setDominanceResponsesMap = useStore(state => state.setDominanceResponsesMap);


    const setHeadingInterpretationMap = useStore(state => state.setHeadingInterpretationMap)
    const headingInterpretationMap = useStore(state => state.headingInterpretationMap)
    const setSubHeadingsPromptDescriptionsMap = useStore(state => state.setSubHeadingsPromptDescriptionsMap)
    const subHeadingsPromptDescriptionsMap = useStore(state => state.subHeadingsPromptDescriptionsMap)


    useEffect(() => {
        setPromptData(subHeadingsPromptDescriptionsMap[dominanceTopic])

        // setSubHeadingsPromptDescriptionsMap(dominanceTopic, promptDescriptionsMap[dominanceTopic])
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
            // setDominanceResponsesMap(dominanceTopic, response);
            setHeadingInterpretationMap(dominanceTopic, response);
        } catch (error) {
            console.error('Error:', error);
        }
    }

    const saveHeadingInterpretation = async (heading) => {
        try {
            const interpretation = headingInterpretationMap[heading];
            const promptDescription = subHeadingsPromptDescriptionsMap[heading];
            // if intepretation and/or promptDescription are empty strings, don't save
            if (!interpretation || !promptDescription) {
                return;
            }

            await updateHeadingInterpretation(userId, heading, promptDescription, interpretation);
        } catch (error) {
            console.error('Failed to save interpretation:', error);
        }
    };


    return (
        <div className="planet-component">
            <div>
                <h4 style={{ color: 'white' }}>{dominanceTopic}</h4>
                {subHeadingsPromptDescriptionsMap[dominanceTopic] !== "" && (
                <div style={{ color: 'white' }}>
                    <pre style={{ color: 'white' }}>{subHeadingsPromptDescriptionsMap[dominanceTopic]}</pre>  
                    <button onClick={generateResponse}>Generate Responses</button>
                </div>
                )}
            </div>
            {headingInterpretationMap[dominanceTopic] !== "" && (
                <div>
                    <div className="planet-response" color='white'>
                        <pre>{headingInterpretationMap[dominanceTopic]}</pre>
                    </div>
                    <button onClick={() => saveHeadingInterpretation(dominanceTopic)}>Save Interpretation</button>
                </div>
            )}
        </div>
    );
}

export default DominanceComponent