import { heading_map } from '../Utilities/constants';
import { postGptResponse } from '../Utilities/api';

export const checkResponseAgainstEverything = (response, everythingData) => {
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

  export const checkResponseAgainstWeeklyTransits = (response, weeklyTransits) => {
    const responseCodes = response.match(/\(([^)]+)\)/g) || [];
    const weeklyTransitsCodes = weeklyTransits.flatMap(item => {
        const matches = item.match(/\(([^)]+)\)/g) || [];
        return matches.map(match => match.trim());
      });
    const missingCodes = responseCodes.filter(code => !weeklyTransitsCodes.includes(code));
    
    if (missingCodes.length > 0) {
      console.warn('The following codes from the response are not in weeklyTransits:', missingCodes);
      return false;
    }
    
    return true;
  }

  export const generateInterpretation = async (heading, subHeadingsPromptDescription) => {
    const inputData = {
        heading: heading,
        description: subHeadingsPromptDescription
    };
    try {
        const responseObject = await postGptResponse(inputData)
        console.log(responseObject)
        return responseObject
    } catch (error) {
      console.error('Error:', error);
    }
}
