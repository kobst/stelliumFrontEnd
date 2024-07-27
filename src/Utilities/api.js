import { json } from 'react-router-dom';
import {modifyRawResponse} from './modifyResponse'

const SERVER_URL = process.env.REACT_APP_SERVER_URL;
// const SERVER_URL = process.env.REACT_APP_LOCAL_URL;


export const fetchTimeZone = async (lat, lon, epochTimeSeconds) => {
  const apiKey = process.env.REACT_APP_GOOGLE_API_KEY; // Replace with your API key
  const url = `https://maps.googleapis.com/maps/api/timezone/json?location=${lat},${lon}&timestamp=${epochTimeSeconds}&key=${apiKey}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    if (data.status !== 'OK') {
      throw new Error(`Error from TimeZone API: ${data.status}`);
    }

    // Convert offsets to hours
    const totalOffsetHours = (data.rawOffset + data.dstOffset) / 3600;
    console.log(`Total Offset in Hours: ${totalOffsetHours}`);
    
    return totalOffsetHours; // Return the total offset in hours
  } catch (error) {
    console.error('Error fetching time zone:', error);
    throw error; // Propagate the error
  }
}


// Function to post daily transits data
export const postDailyTransits = async (date) => {
  try {
    console.log(`${SERVER_URL}/dailyTransits`);
    const response = await fetch(`${SERVER_URL}/dailyTransits`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ date })  // Ensure the date is sent as a JSON object
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseData = await response.json();
    // console.log(responseData)
    return responseData;
  } catch (error) {
    console.error('Error in API call:', error);
    throw error;
  }
};


// Function to post daily aspects data
export const postDailyAspects = async (date) => {
  try {
    console.log('date')
    console.log(date)
    console.log(`${SERVER_URL}/dailyAspects`);
    const response = await fetch(`${SERVER_URL}/dailyAspects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ date })  // Ensure the date is sent as a JSON object
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error('Error in API call:', error);
    throw error;
  }
};


// Function to post period aspects data
export const postPeriodAspects = async (startDate, endDate) => {
  try {
    console.log(`${SERVER_URL}/periodAspects`);
    const response = await fetch(`${SERVER_URL}/periodAspects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ startDate, endDate })  // Ensure the dates are sent as a JSON object
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error('Error in API call:', error);
    throw error;
  }
};

// TODO - Retrogrades


// Function to post birth data
export const postBirthData = async (birthData) => {
  try {
    console.log(`${SERVER_URL}/birthdata`)
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
    // console.log(responseData)
    return responseData;
  } catch (error) {
    console.error('Error in API call:', error);
    throw error;
  }
};

// Function to post birth data
export const postProgressedChart = async (birthData) => {
  try {
    const response = await fetch(`${SERVER_URL}/progressedChart`, {
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
    // console.log(responseData)
    return responseData;
  } catch (error) {
    console.error('Error in API call:', error);
    throw error;
  }
};

// Function to post birth data
export const postDailyTransit = async (birthData) => {
  try {
    const response = await fetch(`${SERVER_URL}/dayTransits`, {
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
    // console.log(responseData)
    return responseData;
  } catch (error) {
    console.error('Error in API call:', error);
    throw error;
  }
};


// Function to post birth data
export const postPromptGeneration = async (birthchart) => {
  try {
    console.log(`${SERVER_URL}/promptGeneration`)
    const response = await fetch(`${SERVER_URL}/promptGeneration`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(birthchart)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseData = await response.json();
    // console.log(responseData)
    return responseData;
  } catch (error) {
    console.error('Error in API call:', error);
    throw error;
  }
};



// Function to post birth data
export const postPromptGPT = async (input) => {
  // console.log(JSON.stringify({input}))
  console.log('json strigify')
  console.log(JSON.stringify(input))
  console.log(input)
  try {
    console.log(`${SERVER_URL}/getPrompts`)
    const response = await fetch(`${SERVER_URL}/getPrompts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({input})
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseData = await response.json();
    // console.log(responseData)
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
    // console.log(responseData)
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
    // console.log(responseData)
    return responseData.response;
  } catch (error) {
    console.error('Error in API call:', error);
    throw error;
  }
};






