import { postGptResponse, postGptResponsePlanets, postGptDominanceResponse, postPromptGPT, updateHeadingInterpretation } from './api';
import { heading_map, getBigFourType } from './constants';

async function generatePrompt(heading, bigFourType, bigFourPromptDescriptions, setSubHeadingsPromptDescriptionsMap) {
    const inputData = {
      heading: `${bigFourType.toUpperCase()}: ${heading}`,
      description: bigFourPromptDescriptions
    };
  
    console.log('inputData', inputData);
  
    try {
      const responseObject = await postPromptGPT(inputData);
      console.log(responseObject.response);
  
      if (checkResponseAgainstEverything(responseObject.response, bigFourPromptDescriptions)) {
        console.log('Response contains codes found in everythingData');
        setSubHeadingsPromptDescriptionsMap(heading, responseObject.response);
        return true;
      } else {
        console.error('Response contains codes not found in everythingData');
        return await generatePrompt(heading, bigFourType, bigFourPromptDescriptions, setSubHeadingsPromptDescriptionsMap);

      }
    } catch (error) {
      console.error('Error:', error);
      return false;
    }
  }
  
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



  async function saveResponseToDatabase(userId, heading, promptDescription, interpretation) {
    console.log("saveResponseToDatabase", heading, interpretation, promptDescription)
    try {

        // if interpretation and/or promptDescription are empty strings, don't save
        if (!interpretation || !promptDescription || !userId) {
            return;
        }

        const response = await updateHeadingInterpretation(userId, heading, promptDescription, interpretation);
        console.log(response);
        return true;

    } catch (error) {
        console.error('Failed to save interpretation:', error);
        return false;
    }
};




  async function generateInterpretation(userId, heading, componentType, subHeadingsPromptDescriptionsMap, promptDescriptionsMap, setHeadingInterpretationMap, setSubHeadingsPromptDescriptionsMap) {
    let inputData;
    console.log("generateInterpretation", heading, componentType)
    if (componentType === 'bigFour') {
        console.log("generateInterpretation bigFour: ", heading)

        // determine the bigFourType based on the heading
        const bigFourType = getBigFourType(heading)
        const promptDescriptions = subHeadingsPromptDescriptionsMap[heading]

      const promptGenerated = await generatePrompt(heading, bigFourType, promptDescriptions, setSubHeadingsPromptDescriptionsMap);
      if (!promptGenerated) {
        console.error('Failed to generate prompt for BigFour component');
        return;
      }
      inputData = {
        heading: heading,
        description: subHeadingsPromptDescriptionsMap[heading]
      };
    } else if (componentType === 'dominance') {
      inputData = {
        heading: heading,
        everythingData: promptDescriptionsMap['everything'],
        description: subHeadingsPromptDescriptionsMap[heading],
      };
    } else if (componentType === 'planet') {
      const modifiedInput = subHeadingsPromptDescriptionsMap[heading];
      console.log("modifiedInput", modifiedInput)
      inputData = {
        heading: heading.toUpperCase(),
        description: modifiedInput
      };
    } else {
      console.error('Invalid component type');
      return;
    }
  
    try {
      let response;
      if (componentType === 'planet') {
        response = await postGptResponsePlanets(inputData);
      } else if (componentType === 'dominance') {
        response = await postGptDominanceResponse(inputData);
      } else {
        response = await postGptResponse(inputData);
      }
      console.log("response from generateInterpretation", response)
      // save the response to the database
      const promptDescription = subHeadingsPromptDescriptionsMap[heading]
      const saveSuccess = saveResponseToDatabase(userId, heading, promptDescription, response);
      if (saveSuccess) {
        setHeadingInterpretationMap(heading, response);
      }

    } catch (error) {
      console.error('Error:', error);
    }
  }

export { generateInterpretation };