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


// Direct user creation API - creates user with immediate overview
export const createUser = async (userData) => {
  try {
    console.log('Creating user:', userData);
    const endpoint = userData.time === 'unknown' ? '/createUserUnknownTime' : '/createUser';
    const requestData = { ...userData };
    
    // Remove time field for unknown time endpoint
    if (userData.time === 'unknown') {
      delete requestData.time;
    }
    
    const response = await fetch(`${SERVER_URL}${endpoint}`, {
      method: HTTP_POST,
      headers: {
        [CONTENT_TYPE_HEADER]: APPLICATION_JSON
      },
      body: JSON.stringify(requestData)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseData = await response.json();
    console.log('User creation with overview response:', responseData);
    return responseData;
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      console.error('Network/CORS error - likely the new API endpoint is not deployed yet');
      throw new Error('Cannot connect to new API endpoint. The backend may not be updated with the new endpoints yet.');
    }
    console.error(ERROR_API_CALL, error);
    throw error;
  }
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

// Enhanced users API with pagination and search
export const fetchUsersPaginated = async (options = {}) => {
  try {
    const {
      usePagination = true,
      page = 1,
      limit = 20,
      search,
      sortBy = 'name',
      sortOrder = 'asc'
    } = options;

    const requestBody = {
      usePagination,
      page,
      limit,
      sortBy,
      sortOrder
    };

    if (search) {
      requestBody.search = search;
    }

    const response = await fetch(`${SERVER_URL}/getUsers`, {
      method: HTTP_POST,
      headers: {
        [CONTENT_TYPE_HEADER]: APPLICATION_JSON
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch users');
    }

    return result;
  } catch (error) {
    console.error('Error fetching users with pagination:', error);
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


// Enhanced relationship creation API - creates relationship with scores, scoreAnalysis, and holisticOverview
export const createRelationshipDirect = async (userIdA, userIdB, ownerUserId = null, celebRelationship = false) => {
  try {
    console.log('Creating relationship with enhanced API:', { userIdA, userIdB, ownerUserId, celebRelationship });
    
    const requestBody = { 
      userIdA, 
      userIdB 
    };
    
    // Add ownerUserId if provided
    if (ownerUserId) {
      requestBody.ownerUserId = ownerUserId;
    }
    
    // Add celebRelationship flag if true
    if (celebRelationship) {
      requestBody.celebRelationship = true;
    }
    
    // Try new endpoint first, fallback to old if 404
    let response;
    try {
      response = await fetch(`${SERVER_URL}/enhanced-relationship-analysis`, {
        method: HTTP_POST,
        headers: { [CONTENT_TYPE_HEADER]: APPLICATION_JSON },
        body: JSON.stringify(requestBody)
      });
    } catch (error) {
      console.warn('New endpoint failed, trying fallback:', error);
      // Fallback to old endpoint if new one fails
      response = await fetch(`${SERVER_URL}/experimental/relationship-analysis-enhanced`, {
        method: HTTP_POST,
        headers: { [CONTENT_TYPE_HEADER]: APPLICATION_JSON },
        body: JSON.stringify(requestBody)
      });
    }

    // If we get 404 from new endpoint, try old endpoint
    if (!response.ok && response.status === 404) {
      console.warn('New endpoint returned 404, trying fallback endpoint...');
      response = await fetch(`${SERVER_URL}/experimental/relationship-analysis-enhanced`, {
        method: HTTP_POST,
        headers: { [CONTENT_TYPE_HEADER]: APPLICATION_JSON },
        body: JSON.stringify(requestBody)
      });
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.error || `HTTP error! status: ${response.status}`);
    }

    const responseData = await response.json();
    console.log('Enhanced relationship creation response:', responseData);
    return responseData;
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      console.error('Network/CORS error - likely the enhanced endpoint is not deployed yet');
      throw new Error('Cannot connect to enhanced endpoint. The backend may not be updated with the new endpoints yet.');
    }
    console.error(ERROR_API_CALL, error);
    throw error;
  }
};

// Legacy relationship creation (kept for backward compatibility)
export const postCreateRelationshipProfile = async (userA, userB, ownerUserId = null) => {
  console.log("userA")
  console.log(userA)
  console.log("userB")
  console.log(userB)
  console.log("ownerUserId")
  console.log(ownerUserId)
  
  // Use direct API with user IDs
  const userIdA = userA._id || userA.id;
  const userIdB = userB._id || userB.id;
  
  try {
    return await createRelationshipDirect(userIdA, userIdB, ownerUserId);
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

// UNUSED - Commented out as it's not being used in the current codebase
// export const getRelationshipScore = async (synastryAspects, compositeChart, userA, userB, compositeChartId) => {
//   try {
//     console.log("Calling getRelationshipScore API");
//     console.log("synastryAspects: ", synastryAspects)
//     console.log("compositeChart: ", compositeChart)
//     console.log("birthChart1: ", userA.birthChart)
//     console.log("birthChart2: ", userB.birthChart)
//     const response = await fetch(`${SERVER_URL}/getRelationshipScore`, {
//       method: HTTP_POST,
//       headers: {
//         [CONTENT_TYPE_HEADER]: APPLICATION_JSON
//       },
//       body: JSON.stringify({
//         synastryAspects,
//         compositeChart,
//         userA,
//         userB, 
//         compositeChartId
//       })
//     });

//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }

//     const relationshipScore = await response.json();
//     console.log("Relationship score received:", relationshipScore);
//     return relationshipScore;
//   } catch (error) {
//     console.error('Error getting relationship score:', error);
//     throw error;
//   }
// };

// UNUSED - Commented out as it's not being used in the current codebase
// export const generateRelationshipAnalysis = async (compositeChartId) => {
//   console.log("compositeChartId: ", compositeChartId)
//   try {
//     const response = await fetch(`${SERVER_URL}/generateRelationshipAnalysis`, {
//       method: HTTP_POST,
//       headers: { [CONTENT_TYPE_HEADER]: APPLICATION_JSON },
//       body: JSON.stringify({compositeChartId})
//     });
//     const responseData = await response.json();
//     console.log("responseData: ", responseData)
//     return responseData;
//   } catch (error) {
//     console.error(ERROR_API_CALL, error);
//     throw error;
//   }
// }

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

// UNUSED - Commented out as it's not being used in the current codebase
// export const getFullBirthChartAnalysis = async (user) => {

//   console.log("user: ", user)
//   try {
//     const response = await fetch(`${SERVER_URL}/getBirthChartAnalysis`, {
//       method: HTTP_POST,
//       headers: { [CONTENT_TYPE_HEADER]: APPLICATION_JSON },
//       body: JSON.stringify({user})
//     });
//     console.log("response", response)
//     const responseData = await response.json();
//     return responseData;
//   } catch (error) {
//     console.error(ERROR_API_CALL, error);
//     throw error;
//   }
// }

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

// UNUSED - Commented out as it's not being used in the current codebase (replaced by workflow)
// export const generateTopicAnalysis = async (userId, existingAnalysis = {}) => {
//   console.log("Starting topic analysis for user:", userId);

//   try {
//     const topics = Object.entries(BroadTopicsEnum);
//     const results = JSON.parse(JSON.stringify(existingAnalysis || {}));

//     for (const [broadTopic, topicData] of topics) {
//       console.log(`Processing topic: ${broadTopic}`);

//       if (!results[broadTopic]) {
//         results[broadTopic] = {
//           label: topicData.label,
//           subtopics: {}
//         };
//       }

//       for (const [subtopicKey, subtopicLabel] of Object.entries(topicData.subtopics)) {
//         if (results[broadTopic].subtopics && results[broadTopic].subtopics[subtopicKey]) {
//           // Skip already generated subtopic
//           continue;
//         }

//         console.log(`Processing subtopic: ${subtopicKey}`);

//         const response = await fetch(`${SERVER_URL}/getSubtopicAnalysis`, {
//           method: HTTP_POST,
//           headers: { [CONTENT_TYPE_HEADER]: APPLICATION_JSON },
//           body: JSON.stringify({
//             userId,
//             broadTopic,
//             subtopicKey,
//             subtopicLabel
//           })
//         });

//         if (!response.ok) {
//           const errorText = await response.text();
//           throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
//         }

//         const result = await response.json();

//         if (!result.success) {
//           throw new Error(result.error || `Subtopic analysis failed for ${subtopicLabel}`);
//         }

//         results[broadTopic].subtopics[subtopicKey] = result.result;
//         console.log(`Completed subtopic: ${subtopicKey}`);
//       }
//     }

//     console.log("All topics and subtopics completed");
//     return {
//       success: true,
//       message: "Topic analysis completed successfully",
//       results
//     };

//   } catch (error) {
//     console.error('Error in topic analysis:', error);
//     throw error;
//   }
// };

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

// UNUSED - Commented out as it's not being used in the current codebase (replaced by workflow)
// export const processAndVectorizeBasicAnalysis = async (userId) => {
//   console.log("Starting vectorization for user:", userId);
//   let section = 'overview';
//   let index = 0;
//   let isComplete = false;

//   while (!isComplete) {
//     try {
//       console.log(`Processing section: ${section}, index: ${index}`);
//       const response = await fetch(`${SERVER_URL}/processBasicAnalysis`, {
//         method: HTTP_POST,
//         headers: { [CONTENT_TYPE_HEADER]: APPLICATION_JSON },
//         body: JSON.stringify({ userId, section, index })
//       });

//       if (!response.ok) {
//         const errorText = await response.text();
//         throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
//       }

//       const result = await response.json();
      
//       if (!result.success) {
//         throw new Error(result.error || 'Vectorization failed');
//       }

//       // Log progress
//       console.log(`Processed ${result.recordCount} records for ${section}`);
      
//       // Update for next iteration
//       section = result.nextSection;
//       index = result.nextIndex;
//       isComplete = result.isComplete;

//     } catch (error) {
//       console.error('Error in vectorization process:', error);
//       throw error;
//     }
//   }

//   console.log("Vectorization complete for user:", userId);
//   return { success: true };
// };

// UNUSED - Commented out as it's not being used in the current codebase (replaced by workflow)
// export const processAndVectorizeTopicAnalysis = async (userId, vectorization = {}) => {
//   let currentTopic = null;
//   let currentSubtopic = null;
//   let isComplete = false;

//   // Determine starting point based on vectorization status
//   const topics = Object.entries(BroadTopicsEnum);
//   outer: {
//     for (const [topicKey, topicData] of topics) {
//       const subtopics = Object.keys(topicData.subtopics);
//       for (const sub of subtopics) {
//         if (!vectorization?.topicAnalysis?.[topicKey]?.[sub]) {
//           currentTopic = topicKey;
//           currentSubtopic = sub;
//           break outer;
//         }
//       }
//     }
//     if (currentTopic === null && currentSubtopic === null) {
//       isComplete = true;
//     }
//   }

//   if (isComplete) {
//     console.log('Topic analysis vectorization already complete');
//     return { success: true, isComplete: true };
//   }

//   try {
//     while (!isComplete) {
//       console.log(`Processing topic: ${currentTopic}, subtopic: ${currentSubtopic}`);
      
//       const response = await fetch(`${SERVER_URL}/processTopicAnalysis`, {
//         method: HTTP_POST,
//         headers: { [CONTENT_TYPE_HEADER]: APPLICATION_JSON },
//         body: JSON.stringify({ 
//           userId, 
//           topic: currentTopic, 
//           subtopic: currentSubtopic 
//         })
//       });

//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }

//       const data = await response.json();
      
//       if (!data.success) {
//         throw new Error(data.error || 'Vectorization failed');
//       }

//       isComplete = data.isComplete;
//       currentTopic = data.nextTopic;
//       currentSubtopic = data.nextSubtopic;

//       // Return progress update for UI
//       if (!isComplete) {
//         console.log(`Processed ${currentTopic} - ${currentSubtopic}`);
//         // Add delay before next request to prevent server timeout
//         await new Promise(resolve => setTimeout(resolve, 1500));
//       }
//     }

//     console.log('Topic analysis vectorization complete');
//     return { success: true, isComplete: true };

//   } catch (error) {
//     console.error('Error in vectorization process:', error);
//     return { 
//       success: false, 
//       error: error.message,
//       lastProcessedTopic: currentTopic,
//       lastProcessedSubtopic: currentSubtopic
//     };
//   }
// };


// UNUSED - Commented out as it's not being used in the current codebase (replaced by workflow)
// export const processAndVectorizeRelationshipAnalysis = async (compositeChartId, vectorizationStatus = {}) => {
//   let currentCategory = null;
//   let isComplete = false;

//   // Define the categories in order (should match backend)
//   const RelationshipCategoriesEnum = {
//     OVERALL_ATTRACTION_CHEMISTRY: { label: "Overall Attraction & Chemistry" },
//     EMOTIONAL_SECURITY_CONNECTION: { label: "Emotional Security & Connection" },
//     SEX_AND_INTIMACY: { label: "Sex & Intimacy" },
//     COMMUNICATION_AND_MENTAL_CONNECTION: { label: "Communication & Mental Connection" },
//     COMMITMENT_LONG_TERM_POTENTIAL: { label: "Commitment & Long-Term Potential" },
//     KARMIC_LESSONS_GROWTH: { label: "Karmic Lessons & Growth" },
//     PRACTICAL_GROWTH_SHARED_GOALS: { label: "Practical Growth & Shared Goals" }
//   };

//   // Determine starting point based on vectorization status
//   const categories = Object.keys(RelationshipCategoriesEnum);
//   for (const category of categories) {
//     if (!vectorizationStatus?.categories?.[category]) {
//       currentCategory = category;
//       break;
//     }
//   }

//   // If all categories are complete, return early
//   if (currentCategory === null) {
//     console.log('Relationship analysis vectorization already complete');
//     return { success: true, isComplete: true };
//   }

//   try {
//     while (!isComplete) {
//       console.log(`Processing relationship category: ${currentCategory || 'initial'}`);
      
//       const response = await fetch(`${SERVER_URL}/processRelationshipAnalysis`, {
//         method: HTTP_POST,
//         headers: { [CONTENT_TYPE_HEADER]: APPLICATION_JSON },
//         body: JSON.stringify({ 
//           compositeChartId, 
//           category: currentCategory 
//         })
//       });

//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }

//       const data = await response.json();
      
//       if (!data.success) {
//         throw new Error(data.error || 'Relationship analysis processing failed');
//       }

//       isComplete = data.isComplete;
//       currentCategory = data.nextCategory;

//       // Return progress update for UI
//       if (!isComplete && currentCategory) {
//         console.log(`Processed category: ${currentCategory}`);
//         // Add delay before next request to prevent server timeout
//         await new Promise(resolve => setTimeout(resolve, 3000)); // 3 second delay
//       }
//     }

//     console.log('Relationship analysis processing complete');
//     return { success: true, isComplete: true };

//   } catch (error) {
//     console.error('Error in relationship analysis processing:', error);
//     return { 
//       success: false, 
//       error: error.message,
//       lastProcessedCategory: currentCategory
//     };
//   }
// };


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

export const chatForUserRelationship = async (userId, compositeChartId, query) => {
  console.log("userId: ", userId)
  console.log("compositeChartId: ", compositeChartId)
  console.log("query: ", query)
  try {
    const response = await fetch(`${SERVER_URL}/userChatRelationshipAnalysis`, {
      method: HTTP_POST,
      headers: { [CONTENT_TYPE_HEADER]: APPLICATION_JSON },
      body: JSON.stringify({userId, compositeChartId, query})
    });
    const responseData = await response.json();
    console.log("responseData: ", responseData)
    return responseData;
  } catch (error) {
    console.error(ERROR_API_CALL, error);
    throw error;
  }
}

export const fetchUserChatRelationshipAnalysis = async (userId, compositeChartId) => {
  console.log("userId: ", userId)
  console.log("compositeChartId: ", compositeChartId)
  try {
    const response = await fetch(`${SERVER_URL}/fetchUserChatRelationshipAnalysis`, {
      method: HTTP_POST,
      headers: { [CONTENT_TYPE_HEADER]: APPLICATION_JSON },
      body: JSON.stringify({userId, compositeChartId})
    });
    const responseData = await response.json();
    console.log("responseData: ", responseData)
    return responseData;
  } catch (error) {
    console.error(ERROR_API_CALL, error);
    throw error;
  }
}



export const getTransitWindows = async (userId, from, to) => {
  console.log("userId: ", userId)
  console.log("from: ", from)
  console.log("to: ", to)
  try {
    const response = await fetch(`${SERVER_URL}/getTransitWindows`, {
      method: HTTP_POST,
      headers: { [CONTENT_TYPE_HEADER]: APPLICATION_JSON },
      body: JSON.stringify({userId, from, to})
    });
    const responseData = await response.json();
    console.log("responseData: ", responseData)
    return responseData;
  } catch (error) {
    console.error(ERROR_API_CALL, error);
    throw error;
  }
}



// Check user creation workflow status
export const checkUserCreationStatus = async (workflowId) => {
  console.log('Checking user creation status for workflowId:', workflowId);
  try {
    const response = await fetch(`${SERVER_URL}/user/creation-status`, {
      method: HTTP_POST,
      headers: { [CONTENT_TYPE_HEADER]: APPLICATION_JSON },
      body: JSON.stringify({ workflowId })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const responseData = await response.json();
    console.log('User creation status:', responseData);
    return responseData;
  } catch (error) {
    console.error('Error checking user creation status:', error);
    throw error;
  }
};

// Check celebrity creation workflow status
export const checkCelebrityCreationStatus = async (workflowId) => {
  console.log('Checking celebrity creation status for workflowId:', workflowId);
  try {
    const response = await fetch(`${SERVER_URL}/celebrity/creation-status`, {
      method: HTTP_POST,
      headers: { [CONTENT_TYPE_HEADER]: APPLICATION_JSON },
      body: JSON.stringify({ workflowId })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const responseData = await response.json();
    console.log('Celebrity creation status:', responseData);
    return responseData;
  } catch (error) {
    console.error('Error checking celebrity creation status:', error);
    throw error;
  }
};

// Check guest creation workflow status
export const checkGuestCreationStatus = async (workflowId) => {
  console.log('Checking guest creation status for workflowId:', workflowId);
  try {
    const response = await fetch(`${SERVER_URL}/guest/creation-status`, {
      method: HTTP_POST,
      headers: { [CONTENT_TYPE_HEADER]: APPLICATION_JSON },
      body: JSON.stringify({ workflowId })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const responseData = await response.json();
    console.log('Guest creation status:', responseData);
    return responseData;
  } catch (error) {
    console.error('Error checking guest creation status:', error);
    throw error;
  }
};

// Legacy function - backwards compatibility
export const checkCreationStatus = checkUserCreationStatus;

// Legacy workflow functions for dashboard analysis workflows (not creation workflows)
export const startWorkflow = async (userId, immediate = true) => {
  console.log("🔥 startWorkflow called - userId:", userId, "immediate:", immediate);
  try {
    const requestBody = { userId };
    if (!immediate) {
      requestBody.immediate = false;
    }
    
    console.log("📤 REQUEST BODY:", JSON.stringify(requestBody));
    console.log("📍 REQUEST URL:", `${SERVER_URL}/workflow/individual/start`);
    
    const response = await fetch(`${SERVER_URL}/workflow/individual/start`, {
      method: HTTP_POST,
      headers: { [CONTENT_TYPE_HEADER]: APPLICATION_JSON },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const responseData = await response.json();
    console.log("Workflow started:", responseData);
    return responseData;
  } catch (error) {
    console.error('Error starting workflow:', error);
    throw error;
  }
};

export const getWorkflowStatus = async (userId) => {
  console.log("Getting workflow status for userId:", userId);
  try {
    const response = await fetch(`${SERVER_URL}/workflow/individual/status`, {
      method: HTTP_POST,
      headers: { [CONTENT_TYPE_HEADER]: APPLICATION_JSON },
      body: JSON.stringify({ workflowId: userId })
    });
    
    // Handle 400 errors specifically - these are expected for new workflow users
    if (response.status === 400) {
      console.log('Legacy workflow status not found (expected for new workflow users)');
      return { success: false, isNewWorkflowUser: true };
    }
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const responseData = await response.json();
    console.log("Workflow status:", responseData);
    return responseData;
  } catch (error) {
    console.error('Error getting workflow status:', error);
    throw error;
  }
};

export const resumeWorkflow = async (userId) => {
  console.log("Resuming workflow for userId:", userId);
  try {
    const response = await fetch(`${SERVER_URL}/workflow/individual/resume`, {
      method: HTTP_POST,
      headers: { [CONTENT_TYPE_HEADER]: APPLICATION_JSON },
      body: JSON.stringify({ workflowId: userId })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const responseData = await response.json();
    console.log("Workflow resumed:", responseData);
    return responseData;
  } catch (error) {
    console.error('Error resuming workflow:', error);
    throw error;
  }
};

// Get complete workflow data (subject + analysis) after completion
export const getCompleteWorkflowData = async (userId, workflowId) => {
  console.log('Getting complete workflow data for userId:', userId, 'workflowId:', workflowId);
  try {
    const requestBody = {};
    if (userId) requestBody.userId = userId;
    if (workflowId) requestBody.workflowId = workflowId;
    
    const response = await fetch(`${SERVER_URL}/workflow/get-complete-data`, {
      method: HTTP_POST,
      headers: { [CONTENT_TYPE_HEADER]: APPLICATION_JSON },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const responseData = await response.json();
    console.log('Complete workflow data:', responseData);
    return responseData;
  } catch (error) {
    console.error('Error getting complete workflow data:', error);
    throw error;
  }
};

// Relationship Workflow API Functions

export const startRelationshipWorkflow = async (userIdA, userIdB, compositeChartId, immediate = true) => {
  console.log("🔥 startRelationshipWorkflow called:", { userIdA, userIdB, compositeChartId, immediate });
  try {
    const requestBody = { userIdA, userIdB, compositeChartId };
    if (!immediate) {
      requestBody.immediate = false;
    }
    
    console.log("📤 RELATIONSHIP REQUEST BODY:", JSON.stringify(requestBody));
    console.log("📍 RELATIONSHIP REQUEST URL:", `${SERVER_URL}/workflow/relationship/start`);
    
    const response = await fetch(`${SERVER_URL}/workflow/relationship/start`, {
      method: HTTP_POST,
      headers: { [CONTENT_TYPE_HEADER]: APPLICATION_JSON },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Start relationship workflow error response:", errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }
    
    const responseData = await response.json();
    console.log("Relationship workflow started:", responseData);
    return responseData;
  } catch (error) {
    console.error('Error starting relationship workflow:', error);
    throw error;
  }
};

export const getRelationshipWorkflowStatus = async (compositeChartId) => {
  console.log("Getting relationship workflow status for:", compositeChartId);
  try {
    const response = await fetch(`${SERVER_URL}/workflow/relationship/status`, {
      method: HTTP_POST,
      headers: { [CONTENT_TYPE_HEADER]: APPLICATION_JSON },
      body: JSON.stringify({ compositeChartId })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Status check error response:", errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }
    
    const responseData = await response.json();
    console.log("📊 RELATIONSHIP WORKFLOW STATUS:", JSON.stringify(responseData, null, 2));
    return responseData;
  } catch (error) {
    console.error('Error getting relationship workflow status:', error);
    throw error;
  }
};

export const resumeRelationshipWorkflow = async (compositeChartId) => {
  console.log("🔄 Resuming relationship workflow for:", compositeChartId);
  try {
    const response = await fetch(`${SERVER_URL}/workflow/relationship/resume`, {
      method: HTTP_POST,
      headers: { [CONTENT_TYPE_HEADER]: APPLICATION_JSON },
      body: JSON.stringify({ compositeChartId })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Resume relationship workflow error:", errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }
    
    const responseData = await response.json();
    console.log("📥 RELATIONSHIP WORKFLOW RESUMED:", JSON.stringify(responseData, null, 2));
    return responseData;
  } catch (error) {
    console.error('Error resuming relationship workflow:', error);
    throw error;
  }
};

// Enhanced relationship workflow functions for the new two-stage system

// Start full relationship analysis from existing relationship (Stage 2)
export const startFullRelationshipAnalysis = async (compositeChartId) => {
  console.log("🚀 Starting full relationship analysis for:", compositeChartId);
  try {
    const response = await fetch(`${SERVER_URL}/workflow/relationship/start`, {
      method: HTTP_POST,
      headers: { [CONTENT_TYPE_HEADER]: APPLICATION_JSON },
      body: JSON.stringify({ compositeChartId, immediate: true })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Start full relationship analysis error:", errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }
    
    const responseData = await response.json();
    console.log("📊 FULL RELATIONSHIP ANALYSIS STARTED:", JSON.stringify(responseData, null, 2));
    return responseData;
  } catch (error) {
    console.error('Error starting full relationship analysis:', error);
    throw error;
  }
};

// Auto-create relationship and start full analysis in one call
export const createRelationshipWithFullAnalysis = async (userIdA, userIdB) => {
  console.log("🔥 Creating relationship with full analysis:", { userIdA, userIdB });
  try {
    const response = await fetch(`${SERVER_URL}/workflow/relationship/start`, {
      method: HTTP_POST,
      headers: { [CONTENT_TYPE_HEADER]: APPLICATION_JSON },
      body: JSON.stringify({ userIdA, userIdB, immediate: true })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Create relationship with full analysis error:", errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }
    
    const responseData = await response.json();
    console.log("📊 RELATIONSHIP WITH FULL ANALYSIS STARTED:", JSON.stringify(responseData, null, 2));
    return responseData;
  } catch (error) {
    console.error('Error creating relationship with full analysis:', error);
    throw error;
  }
};

// Horoscope API Functions

export const generateWeeklyHoroscope = async (userId, startDate) => {
  console.log("Generating weekly horoscope for userId:", userId, "startDate:", startDate);
  try {
    const response = await fetch(`${SERVER_URL}/users/${userId}/horoscope/weekly`, {
      method: HTTP_POST,
      headers: { [CONTENT_TYPE_HEADER]: APPLICATION_JSON },
      body: JSON.stringify({ startDate })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const responseData = await response.json();
    console.log("Weekly horoscope generated:", responseData);
    return responseData;
  } catch (error) {
    console.error('Error generating weekly horoscope:', error);
    throw error;
  }
};

export const generateMonthlyHoroscope = async (userId, startDate) => {
  console.log("Generating monthly horoscope for userId:", userId, "startDate:", startDate);
  try {
    const response = await fetch(`${SERVER_URL}/users/${userId}/horoscope/monthly`, {
      method: HTTP_POST,
      headers: { [CONTENT_TYPE_HEADER]: APPLICATION_JSON },
      body: JSON.stringify({ startDate })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const responseData = await response.json();
    console.log("Monthly horoscope generated:", responseData);
    return responseData;
  } catch (error) {
    console.error('Error generating monthly horoscope:', error);
    throw error;
  }
};

export const generateDailyHoroscope = async (userId, startDate) => {
  console.log("Generating daily horoscope for userId:", userId, "startDate:", startDate);
  try {
    const response = await fetch(`${SERVER_URL}/users/${userId}/horoscope/daily`, {
      method: HTTP_POST,
      headers: { [CONTENT_TYPE_HEADER]: APPLICATION_JSON },
      body: JSON.stringify({ startDate })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const responseData = await response.json();
    console.log("Daily horoscope generated:", responseData);
    return responseData;
  } catch (error) {
    console.error('Error generating daily horoscope:', error);
    throw error;
  }
};

export const getHoroscopeHistory = async (userId, type = null, limit = 10) => {
  console.log("Getting horoscope history for userId:", userId, "type:", type, "limit:", limit);
  try {
    let url = `${SERVER_URL}/users/${userId}/horoscopes?limit=${limit}`;
    if (type) {
      url += `&type=${type}`;
    }
    
    const response = await fetch(url, {
      method: 'GET',
      headers: { [CONTENT_TYPE_HEADER]: APPLICATION_JSON }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const responseData = await response.json();
    console.log("Horoscope history retrieved:", responseData);
    return responseData;
  } catch (error) {
    console.error('Error getting horoscope history:', error);
    throw error;
  }
};

export const getLatestHoroscope = async (userId, type = null) => {
  console.log("Getting latest horoscope for userId:", userId, "type:", type);
  try {
    let url = `${SERVER_URL}/users/${userId}/horoscope/latest`;
    if (type) {
      url += `?type=${type}`;
    }
    
    const response = await fetch(url, {
      method: 'GET',
      headers: { [CONTENT_TYPE_HEADER]: APPLICATION_JSON }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const responseData = await response.json();
    console.log("Latest horoscope retrieved:", responseData);
    return responseData;
  } catch (error) {
    console.error('Error getting latest horoscope:', error);
    throw error;
  }
};

export const deleteHoroscope = async (userId, horoscopeId) => {
  console.log("Deleting horoscope for userId:", userId, "horoscopeId:", horoscopeId);
  try {
    const response = await fetch(`${SERVER_URL}/users/${userId}/horoscopes/${horoscopeId}`, {
      method: 'DELETE',
      headers: { [CONTENT_TYPE_HEADER]: APPLICATION_JSON }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const responseData = await response.json();
    console.log("Horoscope deleted:", responseData);
    return responseData;
  } catch (error) {
    console.error('Error deleting horoscope:', error);
    throw error;
  }
};

export const generateCustomHoroscope = async (userId, transitEvents) => {
  try {
    const response = await fetch(`${SERVER_URL}/users/${userId}/horoscope/custom`, {
      method: HTTP_POST,
      headers: {
        [CONTENT_TYPE_HEADER]: APPLICATION_JSON
      },
      body: JSON.stringify({ transitEvents })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error generating custom horoscope:', error);
    throw error;
  }
};

// Celebrity API Functions

export const fetchCelebrities = async () => {
  try {
    const response = await fetch(`${SERVER_URL}/getCelebs`, {
      method: HTTP_POST,
      headers: {
        [CONTENT_TYPE_HEADER]: APPLICATION_JSON
      }
    });
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    console.log('Celebrities:', data);
    return data;
  } catch (error) {
    console.error('Error fetching celebrities:', error);
    throw error;
  }
};

// Enhanced celebrity API with pagination and search
export const fetchCelebritiesPaginated = async (options = {}) => {
  try {
    const {
      usePagination = true,
      page = 1,
      limit = 20,
      search,
      sortBy = 'name',
      sortOrder = 'asc'
    } = options;

    const requestBody = {
      usePagination,
      page,
      limit,
      sortBy,
      sortOrder
    };

    if (search) {
      requestBody.search = search;
    }

    const response = await fetch(`${SERVER_URL}/getCelebs`, {
      method: HTTP_POST,
      headers: {
        [CONTENT_TYPE_HEADER]: APPLICATION_JSON
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch celebrities');
    }

    return result;
  } catch (error) {
    console.error('Error fetching celebrities with pagination:', error);
    throw error;
  }
};

// Fetch celebrity relationships using the new dedicated endpoint
export const getCelebrityRelationships = async (limit = 50) => {
  try {
    console.log('Fetching celebrity relationships with limit:', limit);
    const response = await fetch(`${SERVER_URL}/getCelebrityRelationships`, {
      method: HTTP_POST,
      headers: {
        [CONTENT_TYPE_HEADER]: APPLICATION_JSON
      },
      body: JSON.stringify({ limit })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Celebrity relationships response:', data);
    
    if (data.success) {
      return data.relationships;
    } else {
      throw new Error(data.error || 'Failed to fetch celebrity relationships');
    }
  } catch (error) {
    console.error('Error fetching celebrity relationships:', error);
    throw error;
  }
};

// Direct celebrity creation API - creates celebrity with immediate overview
export const createCelebrity = async (celebrityData) => {
  try {
    console.log('Creating celebrity:', celebrityData);
    const endpoint = celebrityData.time === 'unknown' ? '/createCelebUnknownTime' : '/createCeleb';
    const requestData = { ...celebrityData };
    
    // Remove time field for unknown time endpoint
    if (celebrityData.time === 'unknown') {
      delete requestData.time;
    }
    
    // Remove email field for celebrities (not required)
    delete requestData.email;
    
    const response = await fetch(`${SERVER_URL}${endpoint}`, {
      method: HTTP_POST,
      headers: {
        [CONTENT_TYPE_HEADER]: APPLICATION_JSON
      },
      body: JSON.stringify(requestData)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseData = await response.json();
    console.log('Celebrity creation response:', responseData);
    return responseData;
  } catch (error) {
    console.error(ERROR_API_CALL, error);
    throw error;
  }
};

// User Subjects API Functions

export const getUserSubjects = async (ownerUserId) => {
  try {
    const response = await fetch(`${SERVER_URL}/getUserSubjects`, {
      method: HTTP_POST,
      headers: {
        [CONTENT_TYPE_HEADER]: APPLICATION_JSON
      },
      body: JSON.stringify({ ownerUserId })
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
};

// Enhanced user subjects API with pagination and search
export const getUserSubjectsPaginated = async (ownerUserId, options = {}) => {
  try {
    const {
      usePagination = true,
      page = 1,
      limit = 20,
      search,
      sortBy = 'name',
      sortOrder = 'asc'
    } = options;

    const requestBody = {
      ownerUserId,
      usePagination,
      page,
      limit,
      sortBy,
      sortOrder
    };

    if (search) {
      requestBody.search = search;
    }

    const response = await fetch(`${SERVER_URL}/getUserSubjects`, {
      method: HTTP_POST,
      headers: {
        [CONTENT_TYPE_HEADER]: APPLICATION_JSON
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch user subjects');
    }

    return result;
  } catch (error) {
    console.error('Error fetching user subjects with pagination:', error);
    throw error;
  }
};

export const getUserCompositeCharts = async (ownerUserId) => {
  try {
    const response = await fetch(`${SERVER_URL}/getUserCompositeCharts`, {
      method: HTTP_POST,
      headers: {
        [CONTENT_TYPE_HEADER]: APPLICATION_JSON
      },
      body: JSON.stringify({ ownerUserId })
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
};

// Guest Subject API Functions

// Direct guest creation API - creates guest subject with immediate overview
export const createGuestSubject = async (guestData) => {
  try {
    console.log('Creating guest subject:', guestData);
    const endpoint = guestData.time === 'unknown' ? '/createGuestSubjectUnknownTime' : '/createGuestSubject';
    const requestData = { ...guestData };
    
    // Remove time field for unknown time endpoint
    if (guestData.time === 'unknown') {
      delete requestData.time;
    }
    
    // Remove email field for guest subjects (not required)
    delete requestData.email;
    
    // Ensure ownerUserId is present (required for guest subjects)
    if (!requestData.ownerUserId) {
      throw new Error('ownerUserId is required for guest subjects');
    }
    
    const response = await fetch(`${SERVER_URL}${endpoint}`, {
      method: HTTP_POST,
      headers: {
        [CONTENT_TYPE_HEADER]: APPLICATION_JSON
      },
      body: JSON.stringify(requestData)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseData = await response.json();
    console.log('Guest subject creation response:', responseData);
    return responseData;
  } catch (error) {
    console.error(ERROR_API_CALL, error);
    throw error;
  }
};

// Backward compatibility exports
export const createUserWithOverview = createUser;
export const createCelebrityWithOverview = createCelebrity;
export const createGuestWithOverview = createGuestSubject;

// Full Analysis API Functions - Stage 2 of the workflow system

// Start full analysis for any subject type (user, celebrity, guest)
export const startFullAnalysis = async (userId) => {
  try {
    console.log('Starting full analysis for userId:', userId);
    const response = await fetch(`${SERVER_URL}/analysis/start-full`, {
      method: HTTP_POST,
      headers: {
        [CONTENT_TYPE_HEADER]: APPLICATION_JSON
      },
      body: JSON.stringify({ userId })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseData = await response.json();
    console.log('Full analysis start response:', responseData);
    return responseData;
  } catch (error) {
    console.error('Error starting full analysis:', error);
    throw error;
  }
};

// Check full analysis status with progress tracking
export const checkFullAnalysisStatus = async (userId, workflowId = null) => {
  try {
    console.log('Checking full analysis status for userId:', userId, 'workflowId:', workflowId);
    const requestBody = { userId };
    if (workflowId) {
      requestBody.workflowId = workflowId;
    }

    const response = await fetch(`${SERVER_URL}/analysis/full-status`, {
      method: HTTP_POST,
      headers: {
        [CONTENT_TYPE_HEADER]: APPLICATION_JSON
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseData = await response.json();
    console.log('Full analysis status response:', responseData);
    return responseData;
  } catch (error) {
    console.error('Error checking full analysis status:', error);
    throw error;
  }
};

// Get complete workflow data after both stages are complete (new endpoint for new workflow system)
export const getNewCompleteWorkflowData = async (userId, workflowId = null) => {
  try {
    console.log('Getting complete workflow data for userId:', userId, 'workflowId:', workflowId);
    const requestBody = { userId };
    if (workflowId) {
      requestBody.workflowId = workflowId;
    }

    const response = await fetch(`${SERVER_URL}/analysis/complete-data`, {
      method: HTTP_POST,
      headers: {
        [CONTENT_TYPE_HEADER]: APPLICATION_JSON
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseData = await response.json();
    console.log('Complete workflow data response:', responseData);
    return responseData;
  } catch (error) {
    console.error('Error getting complete workflow data:', error);
    throw error;
  }
};

// Delete API Functions

// Delete subject (user, celebrity, or guest)
export const deleteSubject = async (subjectId, ownerUserId = null) => {
  try {
    console.log('Deleting subject:', subjectId, 'ownerUserId:', ownerUserId);
    
    const requestOptions = {
      method: 'DELETE',
      headers: {
        [CONTENT_TYPE_HEADER]: APPLICATION_JSON
      }
    };

    // Add body only if ownerUserId is provided (for guest subjects)
    if (ownerUserId) {
      requestOptions.body = JSON.stringify({ ownerUserId });
    }

    const response = await fetch(`${SERVER_URL}/subjects/${subjectId}`, requestOptions);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete subject');
    }

    const responseData = await response.json();
    console.log('Subject deletion response:', responseData);
    return responseData;
  } catch (error) {
    console.error('Error deleting subject:', error);
    throw error;
  }
};

// Delete relationship (composite chart)
export const deleteRelationship = async (compositeChartId, ownerUserId = null) => {
  try {
    console.log('Deleting relationship:', compositeChartId, 'ownerUserId:', ownerUserId);
    
    const requestOptions = {
      method: 'DELETE',
      headers: {
        [CONTENT_TYPE_HEADER]: APPLICATION_JSON
      }
    };

    // Add body only if ownerUserId is provided (optional ownership check)
    if (ownerUserId) {
      requestOptions.body = JSON.stringify({ ownerUserId });
    }

    const response = await fetch(`${SERVER_URL}/relationships/${compositeChartId}`, requestOptions);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete relationship');
    }

    const responseData = await response.json();
    console.log('Relationship deletion response:', responseData);
    return responseData;
  } catch (error) {
    console.error('Error deleting relationship:', error);
    throw error;
  }
};

