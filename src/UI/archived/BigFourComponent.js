import React, { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { postGptResponse, postPromptGPT, updateHeadingInterpretation } from '../../Utilities/api'; 
import { heading_map } from '../../Utilities/constants';
// import { checkResponseAgainstEverything } from '../../Utilities/checkResponses';
import useStore from '../../Utilities/store';

const BigFourComponent = ({ bigFourType }) => {
    // const [responses, setResponses] = useState({});
    const [subHeadings, setSubHeadings] = useState([]);
    // const [promptData, setPromptData] = useState("")
    const [everythingData, setEverythingData] = useState("")
    const [bigFourPromptDescriptions, setBigFourPromptDescriptions] = useState("")
    const promptDescriptionsMap = useStore(state => state.promptDescriptionsMap)
    const setHeadingInterpretationMap = useStore(state => state.setHeadingInterpretationMap)
    const headingInterpretationMap = useStore(state => state.headingInterpretationMap)
    const setSubHeadingsPromptDescriptionsMap = useStore(state => state.setSubHeadingsPromptDescriptionsMap)
    const subHeadingsPromptDescriptionsMap = useStore(state => state.subHeadingsPromptDescriptionsMap)
    const userId = useStore(state => state.userId)


    useEffect(() => {
        setSubHeadings(heading_map[bigFourType]);
        // setPromptData(promptDescriptionsMap[bigFourType])
        setEverythingData(promptDescriptionsMap['everything'])
        setBigFourPromptDescriptions(promptDescriptionsMap[bigFourType])

    }, [bigFourType, promptDescriptionsMap]);


    // useEffect(() => {
    //     const generateAllResponses = async () => {
    //       for (const heading of subHeadings) {
    //         if (!subHeadingsPromptDescriptionsMap[heading] || !headingInterpretationMap[heading] || headingInterpretationMap[heading] === '') {
    //           await generateResponse(heading);
    //           await generateInterpretation(heading);
    //         }
    //       }
    //     };
      
    //     generateAllResponses();
    //   }, [subHeadings, everythingData, subHeadingsPromptDescriptionsMap, headingInterpretationMap]);



    function checkResponseAgainstEverything(response, everythingData) {
        console.log("everythingData")
        console.log(everythingData)
        // Extract codes from the response
        const responseCodes = response.match(/\(([^)]+)\)/g) || [];
        
        // Extract codes from everythingData

        const everythingCodes = everythingData.flatMap(item => {
            const matches = item.match(/\(([^)]+)\)/g) || [];
            return matches.map(match => match.trim());
          });        
        // Check if all response codes are in everythingCodes
        const missingCodes = responseCodes.filter(code => !everythingCodes.includes(code));
        
        if (missingCodes.length > 0) {
          console.warn('The following codes from the response are not in everythingData:', missingCodes);
          return false;
        }
        
        return true;
      }



    async function generatePrompt(heading) {
        // const modifiedInput = promptData + "\n" + heading + "\nEvery time you mention a particular aspect or position, please include its reference number provided";

        // const modifiedInput = `${everythingData}\n${bigFourType.toUpperCase()}: ${heading}`;

        const inputData = {
            heading: `${bigFourType.toUpperCase()}: ${heading}`,
            description: bigFourPromptDescriptions
            // description: everythingData
        };

        console.log('inputData')
        console.log(inputData)
        try {
            setHeadingInterpretationMap(heading, '')
            const responseObject = await postPromptGPT(inputData)
            console.log(responseObject)
            console.log(responseObject.response)
            // setBigFourMap(heading, responseObject.response)
            // add check to see if responseObject contains aspects and/or transits included in everythingData
            if (checkResponseAgainstEverything(responseObject.response, bigFourPromptDescriptions)) {
                
                console.log('Response contains codes found in everythingData')
                setSubHeadingsPromptDescriptionsMap(heading, responseObject.response);
              } else {
                console.error('Response contains codes not found in everythingData');
                // regenerate response
                generatePrompt(heading);
              }
        } catch (error) {
          console.error('Error:', error);
        }
    }



    const handleRedo = (heading) => {
        generatePrompt(heading);
    };


    async function generateInterpretation(heading) {
        const inputData = {
            heading: heading,
            description: subHeadingsPromptDescriptionsMap[heading]
        };
        const modifiedInput = `${subHeadingsPromptDescriptionsMap[heading]}: ${heading}`;
        try {
            const responseObject = await postGptResponse(inputData)
            console.log(responseObject)
            setHeadingInterpretationMap(heading, responseObject)
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

            const response = await updateHeadingInterpretation(userId, heading, promptDescription, interpretation);
            console.log(response);
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



    const renderResponseForHeading = (heading) => {
        return (
            <div key={heading}>
                <h4 className="heading">{heading}</h4>
                <div className="button-container">
                    <button className="redo-button" onClick={() => handleRedo(heading)}>Generate Relevant Birth Data</button>
                    <button className="redo-button" onClick={() => generateInterpretation(heading)}>Generate Interpretation</button>
                </div>
                <div className="response-container">
                    <div className="prompt-description" style={{backgroundColor: '#f0f0f0'}}>
                        <pre>{subHeadingsPromptDescriptionsMap[heading]}</pre>
                    </div>
                    <div className="interpretation">
                        <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word', color: 'white' }}>
                                {headingInterpretationMap[heading]}
                            </pre>
                        </div>
                        <button className="redo-button" onClick={() => saveHeadingInterpretation(heading)}>Save Interpretation</button>
                </div>
            </div>
        );
    };

    return (
        <div>
        {subHeadingsPromptDescriptionsMap && Object.keys(subHeadingsPromptDescriptionsMap).length > 0 ? (
          <>
            {subHeadings.map(renderResponseForHeading)}
          </>
        ) : (
          <p>No birth chart interpretation available for this user.</p>
        )}
        <ToastContainer />
      </div>
    );
};

export default BigFourComponent;
