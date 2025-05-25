import { BroadTopicsEnum, HTTP_POST, CONTENT_TYPE_HEADER, APPLICATION_JSON, ERROR_API_CALL } from "./constants";

const SERVER_URL = process.env.REACT_APP_SERVER_URL;

export const fetchTimeZone = async (lat, lon, epochTimeSeconds) => {
  const apiKey = process.env.REACT_APP_GOOGLE_API_KEY; 
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


export const postUserProfile = async (birthData) => {
  try {
    console.log(`${SERVER_URL}/createUser`)
    const response = await fetch(`${SERVER_URL}/createUser`, {
      method: HTTP_POST,
      headers: {
        [CONTENT_TYPE_HEADER]: APPLICATION_JSON
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
    console.error(ERROR_API_CALL, error);
    throw error;
  }
};

// Stubbed API for handling profile creation when birth time is unknown
export const postUserProfileUnknownTime = async (birthData) => {
  console.warn('postUserProfileUnknownTime is a stub and should be implemented on the backend');
  // In a real implementation this would POST to a dedicated endpoint
  return Promise.resolve({ message: 'Stubbed response for unknown birth time' });
};


export const fetchUser = async (userId) => {
  console.log("fetchUseruserId")
  console.log(userId)
  try {
    const response = await fetch(`${SERVER_URL}/getUser`, {
      method: HTTP_POST,
      headers: { [CONTENT_TYPE_HEADER]: APPLICATION_JSON },
      body: JSON.stringify({ userId })
    });
    return response.json();
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
};

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


export const fetchComposites = async () => {
  try {
    const response = await fetch(`${SERVER_URL}/getCompositeCharts`, {
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
    console.log('Composites:', data);
    return data;
  } catch (error) {
    console.error('Error fetching composites:', error);
    throw error;
  }
};

export const handleUserInput = async (userId, query) => {
  console.log(query)
  try {
    console.log("query:", query)
    console.log("userId:", userId)      
    const response = await fetch(`${SERVER_URL}/handleUserQuery`, {
      method: HTTP_POST,
      headers: {
        [CONTENT_TYPE_HEADER]: APPLICATION_JSON,
      },
      body: JSON.stringify({ userId, query }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error(ERROR_API_CALL, error);
    throw error;
  }
}


export const postCreateRelationshipProfile = async (userA, userB) => {
  console.log("userA")
  console.log(userA)
  console.log("userB")
  console.log(userB)
  try {
    const response = await fetch(`${SERVER_URL}/createRelationship`, {
      method: HTTP_POST,
      headers: { [CONTENT_TYPE_HEADER]: APPLICATION_JSON },
      body: JSON.stringify({userA, userB})
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error(ERROR_API_CALL, error);
    throw error;
  }
}





export const createCompositeChartProfile = async (userAId, userBId, userAName, userBName, userA_dateOfBirth, userB_dateOfBirth, synastryAspects, compositeBirthChart) => {
  console.log("compositeBirthChart x:");
  console.log(compositeBirthChart);
  try {
    const response = await fetch(`${SERVER_URL}/saveCompositeChartProfile`, {
      method: HTTP_POST,
      headers: {
        [CONTENT_TYPE_HEADER]: APPLICATION_JSON
      },
      body: JSON.stringify({ 
        userA_id: userAId,
        userB_id: userBId,
        userA_name: userAName,
        userB_name: userBName,
        userA_dateOfBirth: userA_dateOfBirth,
        userB_dateOfBirth: userB_dateOfBirth,
        synastryAspects: synastryAspects,
        compositeBirthChart: compositeBirthChart
      })
    });
    const data = await response.json();
    return data.compositeChartId;
  } catch (error) {
    console.error(ERROR_API_CALL, error);
    throw error;
  }
};

export const getRelationshipScore = async (synastryAspects, compositeChart, userA, userB, compositeChartId) => {
  try {
    console.log("Calling getRelationshipScore API");
    console.log("synastryAspects: ", synastryAspects)
    console.log("compositeChart: ", compositeChart)
    console.log("birthChart1: ", userA.birthChart)
    console.log("birthChart2: ", userB.birthChart)
    const response = await fetch(`${SERVER_URL}/getRelationshipScore`, {
      method: HTTP_POST,
      headers: {
        [CONTENT_TYPE_HEADER]: APPLICATION_JSON
      },
      body: JSON.stringify({
        synastryAspects,
        compositeChart,
        userA,
        userB, 
        compositeChartId
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const relationshipScore = await response.json();
    console.log("Relationship score received:", relationshipScore);
    return relationshipScore;
  } catch (error) {
    console.error('Error getting relationship score:', error);
    throw error;
  }
};

export const generateRelationshipAnalysis = async (compositeChartId) => {
  console.log("compositeChartId: ", compositeChartId)
  try {
    const response = await fetch(`${SERVER_URL}/generateRelationshipAnalysis`, {
      method: HTTP_POST,
      headers: { [CONTENT_TYPE_HEADER]: APPLICATION_JSON },
      body: JSON.stringify({compositeChartId})
    });
    const responseData = await response.json();
    console.log("responseData: ", responseData)
    return responseData;
  } catch (error) {
    console.error(ERROR_API_CALL, error);
    throw error;
  }
}

export const fetchRelationshipAnalysis = async (compositeChartId) => {
  console.log("compositeChartId: ", compositeChartId)
  try {
    const response = await fetch(`${SERVER_URL}/fetchRelationshipAnalysis`, {
      method: HTTP_POST,
      headers: { [CONTENT_TYPE_HEADER]: APPLICATION_JSON },
      body: JSON.stringify({compositeChartId})
    });
    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error(ERROR_API_CALL, error);
    throw error;
  }
}

export const getShortOverview = async (birthData) => {

  console.log("birthchart: ", birthData)
  try {
    const response = await fetch(`${SERVER_URL}/getShortOverview`, {
      method: HTTP_POST,
      headers: { [CONTENT_TYPE_HEADER]: APPLICATION_JSON },
      body: JSON.stringify({birthData})
    });
    console.log("response", response)
    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error(ERROR_API_CALL, error);
    throw error;
  }
}


export const getPlanetOverview = async (planetName, birthData) => {
  console.log("Sending request with:", { planetName, birthData });
  try {
    const response = await fetch(`${SERVER_URL}/getShortOverviewPlanet`, {
      method: HTTP_POST,
      headers: { [CONTENT_TYPE_HEADER]: APPLICATION_JSON },
      body: JSON.stringify({planetName, birthData})
    });

    // Check if the response is ok
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    // Log the raw response
    const rawResponse = await response.text();
    console.log("Raw response:", rawResponse);

    // Try to parse the response as JSON
    let responseData;
    try {
      responseData = JSON.parse(rawResponse);
    } catch (parseError) {
      console.error("Failed to parse JSON response:", parseError);
      throw new Error("Invalid JSON response from server");
    }

    console.log("Parsed response data:", responseData);
    return responseData;
  } catch (error) {
    console.error('Error in getPlanetOverview API call:', error);
    throw error;
  }
}

/*
 * Retrieves overviews for all planets. Currently unused by any component but
 * retained for potential future features.
 */
// export const getAllPlanetOverview = async (birthData) => {
//   console.log("Sending request with:", { birthData });
//   try {
//     const response = await fetch(`${SERVER_URL}/getShortOverviewAllPlanets`, {
//       method: HTTP_POST,
//       headers: { [CONTENT_TYPE_HEADER]: APPLICATION_JSON },
//       body: JSON.stringify({birthData})
//     });
//
//     if (!response.ok) {
//       const errorText = await response.text();
//       throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
//     }
//
//     const rawResponse = await response.text();
//     console.log("Raw response:", rawResponse);
//
//     let responseData;
//     try {
//       responseData = JSON.parse(rawResponse);
//     } catch (parseError) {
//       console.error("Failed to parse JSON response:", parseError);
//       throw new Error("Invalid JSON response from server");
//     }
//
//     console.log("Parsed response data:", responseData);
//     return responseData;
//   } catch (error) {
//     console.error('Error in getPlanetOverview API call:', error);
//     throw error;
//   }
// }

export const getFullBirthChartAnalysis = async (user) => {

  console.log("user: ", user)
  try {
    const response = await fetch(`${SERVER_URL}/getBirthChartAnalysis`, {
      method: HTTP_POST,
      headers: { [CONTENT_TYPE_HEADER]: APPLICATION_JSON },
      body: JSON.stringify({user})
    });
    console.log("response", response)
    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error(ERROR_API_CALL, error);
    throw error;
  }
}

export const fetchAnalysis = async (userId) => {
  console.log("userId: ", userId)
  try {
    const response = await fetch(`${SERVER_URL}/fetchAnalysis`, {
      method: HTTP_POST,
      headers: { [CONTENT_TYPE_HEADER]: APPLICATION_JSON },
      body: JSON.stringify({userId})
    });
    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error(ERROR_API_CALL, error);
    throw error;
  }
}

export const generateTopicAnalysis = async (userId) => {
  console.log("Starting topic analysis for user:", userId);
  
  try {
    const topics = Object.entries(BroadTopicsEnum);
    const results = {};

    for (const [broadTopic, topicData] of topics) {
      console.log(`Processing topic: ${broadTopic}`);
      results[broadTopic] = {
        label: topicData.label,
        subtopics: {}
      };

      // Process each subtopic
      for (const [subtopicKey, subtopicLabel] of Object.entries(topicData.subtopics)) {
        console.log(`Processing subtopic: ${subtopicKey}`);
        
        const response = await fetch(`${SERVER_URL}/getSubtopicAnalysis`, {
          method: HTTP_POST,
          headers: { [CONTENT_TYPE_HEADER]: APPLICATION_JSON },
          body: JSON.stringify({
            userId,
            broadTopic,
            subtopicKey,
            subtopicLabel
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        const result = await response.json();
        
        if (!result.success) {
          throw new Error(result.error || `Subtopic analysis failed for ${subtopicLabel}`);
        }

        // Store result for this subtopic
        results[broadTopic].subtopics[subtopicKey] = result.result;
        console.log(`Completed subtopic: ${subtopicKey}`);
      }
    }

    console.log("All topics and subtopics completed");
    return {
      success: true,
      message: "Topic analysis completed successfully",
      results
    };

  } catch (error) {
    console.error('Error in topic analysis:', error);
    throw error;
  }
};

// Process a single subtopic
/*
 * Helper to analyse a single subtopic. Not referenced by any current UI but
 * kept for completeness of the API layer.
 */
// export const generateSingleSubtopicAnalysis = async (userId, broadTopic, subtopicKey) => {
//   const topicData = BroadTopicsEnum[broadTopic];
//   const subtopicLabel = topicData.subtopics[subtopicKey];
//
//   console.log(`Processing subtopic: ${subtopicLabel}`);
//
//   try {
//     const response = await fetch(`${SERVER_URL}/getSubtopicAnalysis`, {
//       method: HTTP_POST,
//       headers: { [CONTENT_TYPE_HEADER]: APPLICATION_JSON },
//       body: JSON.stringify({
//         userId,
//         broadTopic,
//         subtopicKey,
//         subtopicLabel
//       })
//     });
//
//     if (!response.ok) {
//       const errorText = await response.text();
//       throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
//     }
//
//     const result = await response.json();
//
//     if (!result.success) {
//       throw new Error(result.error || `Subtopic analysis failed for ${subtopicLabel}`);
//     }
//
//     return {
//       success: true,
//       broadTopic,
//       subtopicKey,
//       result: result.result
//     };
//
//   } catch (error) {
//     console.error(`Error analyzing subtopic ${subtopicLabel}:`, error);
//     throw error;
//   }
// };

export const processAndVectorizeBasicAnalysis = async (userId) => {
  console.log("Starting vectorization for user:", userId);
  let section = 'overview';
  let index = 0;
  let isComplete = false;

  while (!isComplete) {
    try {
      console.log(`Processing section: ${section}, index: ${index}`);
      const response = await fetch(`${SERVER_URL}/processBasicAnalysis`, {
        method: HTTP_POST,
        headers: { [CONTENT_TYPE_HEADER]: APPLICATION_JSON },
        body: JSON.stringify({ userId, section, index })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Vectorization failed');
      }

      // Log progress
      console.log(`Processed ${result.recordCount} records for ${section}`);
      
      // Update for next iteration
      section = result.nextSection;
      index = result.nextIndex;
      isComplete = result.isComplete;

    } catch (error) {
      console.error('Error in vectorization process:', error);
      throw error;
    }
  }

  console.log("Vectorization complete for user:", userId);
  return { success: true };
};

export const processAndVectorizeTopicAnalysis = async (userId) => {
  let currentTopic = null;
  let currentSubtopic = null;
  let isComplete = false;

  try {
    while (!isComplete) {
      console.log(`Processing topic: ${currentTopic}, subtopic: ${currentSubtopic}`);
      
      const response = await fetch(`${SERVER_URL}/processTopicAnalysis`, {
        method: HTTP_POST,
        headers: { [CONTENT_TYPE_HEADER]: APPLICATION_JSON },
        body: JSON.stringify({ 
          userId, 
          topic: currentTopic, 
          subtopic: currentSubtopic 
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Vectorization failed');
      }

      isComplete = data.isComplete;
      currentTopic = data.nextTopic;
      currentSubtopic = data.nextSubtopic;

      // Return progress update for UI
      if (!isComplete) {
        console.log(`Processed ${currentTopic} - ${currentSubtopic}`);
      }
    }

    console.log('Topic analysis vectorization complete');
    return { success: true, isComplete: true };

  } catch (error) {
    console.error('Error in vectorization process:', error);
    return { 
      success: false, 
      error: error.message,
      lastProcessedTopic: currentTopic,
      lastProcessedSubtopic: currentSubtopic
    };
  }
};


export const processAndVectorizeRelationshipAnalysis = async (compositeChartId) => {
  let currentCategory = null;
  let isComplete = false;

  try {
    while (!isComplete) {
      console.log(`Processing relationship category: ${currentCategory || 'initial'}`);
      
      const response = await fetch(`${SERVER_URL}/processRelationshipAnalysis`, {
        method: HTTP_POST,
        headers: { [CONTENT_TYPE_HEADER]: APPLICATION_JSON },
        body: JSON.stringify({ 
          compositeChartId, 
          category: currentCategory 
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Relationship analysis processing failed');
      }

      isComplete = data.isComplete;
      currentCategory = data.nextCategory;

      // Return progress update for UI
      if (!isComplete && currentCategory) {
        console.log(`Processed category: ${currentCategory}`);
      }
    }

    console.log('Relationship analysis processing complete');
    return { success: true, isComplete: true };

  } catch (error) {
    console.error('Error in relationship analysis processing:', error);
    return { 
      success: false, 
      error: error.message,
      lastProcessedCategory: currentCategory
    };
  }
}


export const chatForUserBirthChart = async (userId, birthChartAnalysisId, query) => {
  console.log("userId: ", userId)
  console.log("birthChartAnalysisId: ", birthChartAnalysisId)
  console.log("query: ", query)
  try {
    const response = await fetch(`${SERVER_URL}/userChatBirthChartAnalysis`, {
      method: HTTP_POST,
      headers: { [CONTENT_TYPE_HEADER]: APPLICATION_JSON },
      body: JSON.stringify({userId, birthChartAnalysisId, query})
    });
    const responseData = await response.json();
    console.log("responseData: ", responseData)
    return responseData;
  } catch (error) {
    console.error(ERROR_API_CALL, error);
    throw error;
  }
}

export const fetchUserChatBirthChartAnalysis = async (userId, birthChartAnalysisId) => {
  console.log("userId: ", userId)
  console.log("birthChartAnalysisId: ", birthChartAnalysisId)
  try {
    const response = await fetch(`${SERVER_URL}/fetchUserChatBirthChartAnalysis`, {
      method: HTTP_POST,
      headers: { [CONTENT_TYPE_HEADER]: APPLICATION_JSON },
      body: JSON.stringify({userId, birthChartAnalysisId})
    });
    const responseData = await response.json();
    console.log("responseData: ", responseData)
    return responseData;
  } catch (error) {
    console.error(ERROR_API_CALL, error);
    throw error;
  }
}

