import React, { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
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

        const inputData = {
            heading: dominanceTopic,
            everythingData: promptDescriptionsMap['everything'],
            description: subHeadingsPromptDescriptionsMap[dominanceTopic],
        };

        console.log('inputData', inputData)

        try {
            const response = await postGptResponse(inputData);
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
            // if interpretation and/or promptDescription are empty strings, don't save
            if (!interpretation || !promptDescription) {
                return;
            }

            await updateHeadingInterpretation(userId, heading, promptDescription, interpretation);
            
            // Show success toast
            toast.success('Interpretation saved successfully!', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        } catch (error) {
            console.error('Failed to save interpretation:', error);
            
            // Show error toast
            toast.error('Failed to save interpretation. Please try again.', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        }
    };


    return (
        <div className="dominance-component">
        {subHeadingsPromptDescriptionsMap && Object.keys(subHeadingsPromptDescriptionsMap).length > 0 > 0 ? (
          <>
            <div>
              <h4 style={{ color: 'white' }}>Dominance {dominanceTopic}</h4>
              <div style={{ color: 'white' }}>
                <pre style={{ color: 'white' }}>
                  {/* {subHeadingsPromptDescriptionsMap['dominance'].join('\n')} */}
                  {subHeadingsPromptDescriptionsMap[dominanceTopic]}

                </pre>
                <button onClick={generateResponse}>Generate Dominance Interpretation</button>
              </div>
            </div>
            {headingInterpretationMap && headingInterpretationMap[dominanceTopic] !== "" && (
              <div>
                <div className="dominance-response">
                  <div style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>{headingInterpretationMap[dominanceTopic]}</div>
                </div>
                <button onClick={() => saveHeadingInterpretation(dominanceTopic)}>Save Interpretation</button>
              </div>
            )}
          </>
        ) : (
          <p>No birth chart interpretation available for dominance.</p>
        )}
        <ToastContainer />
      </div>
    );
}

export default DominanceComponent