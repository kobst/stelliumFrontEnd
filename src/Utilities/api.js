import {modifyRawResponse} from './modifyResponse'

const SERVER_URL = process.env.REACT_APP_SERVER_URL;

// Function to post birth data
export const postBirthData = async (birthData) => {
  try {
    const response = await fetch(`${SERVER_URL}/birthdata`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(birthData)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseData = await response.json();
    console.log(responseData)
    return responseData;
  } catch (error) {
    console.error('Error in API call:', error);
    throw error;
  }
};


// Function to post birth data
export const postGptResponse = async (prompt) => {
  try {
    const response = await fetch(`${SERVER_URL}/getBigFour`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({prompt})
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseData = await response.json();
    console.log(responseData)
    return responseData.response;
  } catch (error) {
    console.error('Error in API call:', error);
    throw error;
  }
};

// Function to post birth data
export const postGptResponsePlanets = async (prompt) => {
  try {
    const response = await fetch(`${SERVER_URL}/getPlanetsVer2`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({prompt})
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseData = await response.json();
    console.log(responseData)
    return responseData.response;
  } catch (error) {
    console.error('Error in API call:', error);
    throw error;
  }
};






