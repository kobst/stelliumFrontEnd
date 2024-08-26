

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


// Function to post daily transits data from the DB
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


// Function to post period transits data from the DB
export const postPeriodTransits = async (startDate, endDate)=> {
  try {
      const response = await fetch(`${SERVER_URL}/periodTransits`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({ startDate, endDate})
      });

      if (!response.ok) {
          throw new Error('Network response was not ok');
      }

      const data = await response.json();
      console.log('Transits:', data);
      return data;
  } catch (error) {
      console.error('Error fetching transits:', error);
  }
}


export const createUserProfile = async (email, firstName, lastName, dateOfBirth, placeOfBirth, time, totalOffsetHours, birthChart) => {
  try {
    const response = await fetch(`${SERVER_URL}/saveUserProfile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        email, 
        firstName, 
        lastName, 
        dateOfBirth, 
        placeOfBirth, 
        time, 
        totalOffsetHours, 
        birthChart
      })
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error in API call:', error);
    throw error;
  }
}

export const fetchUsers = async () => {
  try {
    const response = await fetch(`${SERVER_URL}/getUsers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      // Add a body if needed
      // body: JSON.stringify({})
    });
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    console.log('Users:', data);
    return data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

export const postPeriodAspectsForUserChart = async (startDate, endDate, birthChart)=> {
  try {
      const response = await fetch(`${SERVER_URL}/generatePeriodAspectsForChart`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({ startDate, endDate, birthChart})
      });

      if (!response.ok) {
          throw new Error('Network response was not ok');
      }

      const data = await response.json();
      console.log('Transits:', data);
      return data;
  } catch (error) {
      console.error('Error fetching transits:', error);
  }
}

export const postPeriodHouseTransitsForUserChart = async (startDate, endDate, birthChartHouses)=> {
  try {
    console.log("startDate")
    console.log(startDate)
    console.log("endDate")
    console.log(endDate)
    console.log("birthChartHouses")
    console.log(birthChartHouses.length)
    console.log(birthChartHouses[0])
      const response = await fetch(`${SERVER_URL}/generateSummaryTransitHousesForBirthChart`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({ startDate, endDate, birthChartHouses})
      });

      if (!response.ok) {
          throw new Error('Network response was not ok');
      }

      const data = await response.json();
      console.log('Transits:', data);
      return data;
  } catch (error) {
      console.error('Error fetching transits:', error);
  }
}





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


// Function to post daily aspects data
export const postDailyRetrogrades = async (date) => {
  try {
    console.log('date')
    console.log(date)
    console.log(`${SERVER_URL}/dailyRetrogrades`);
    const response = await fetch(`${SERVER_URL}/dailyRetrogrades`, {
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
    const response = await fetch(`${SERVER_URL}/instantTransits`, {
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
export const postPromptGeneration = async (planets, houses, aspects) => {
 console.log('planets')
 console.log(planets)
 console.log('houses')
 console.log(houses)
  const body = JSON.stringify({planets, houses, aspects});

  try {
    console.log(`${SERVER_URL}/promptGeneration`)
    const response = await fetch(`${SERVER_URL}/promptGeneration`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: body
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


export const updateHeadingInterpretation = async (userId, heading, promptDescription, interpretation) => {
  console.log('userId')
  console.log(userId)
  console.log('heading')
  console.log(heading)
  console.log('interpretation')
  console.log(interpretation)
  const response = await fetch(`${SERVER_URL}/saveBirthChartInterpretation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, heading, promptDescription, interpretation })
  });
  return response.json();
};

export const fetchBirthChartInterpretation = async (userId) => {
  console.log('userId')
  console.log(userId)
  const response = await fetch(`${SERVER_URL}/getBirthChartInterpretation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId })
  });
  return response.json();
};


export const getPeriodAspectsForUser = async (startDate, endDate, userId) => {
  try {
    const response = await fetch(`${SERVER_URL}/getPeriodAspectsForUser`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ startDate, endDate, userId })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Grouped Aspects for user:', data.groupedAspects);
    return data;
  } catch (error) {
    console.error('Error fetching period aspects for user:', error);
    throw error;
  }
};

