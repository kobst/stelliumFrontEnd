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

// API for handling profile creation when birth time is unknown
export const postUserProfileUnknownTime = async (birthData) => {
  try {
    const response = await fetch(`${SERVER_URL}/createUserUnknownTime`, {
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
    return responseData;
  } catch (error) {
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



export const startWorkflow = async (userId) => {
  console.log("Starting workflow for userId:", userId);
  try {
    const response = await fetch(`${SERVER_URL}/workflow/individual/start`, {
      method: HTTP_POST,
      headers: { [CONTENT_TYPE_HEADER]: APPLICATION_JSON },
      body: JSON.stringify({ userId })
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
      body: JSON.stringify({ userId })
    });
    
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

// Relationship Workflow API Functions

export const startRelationshipWorkflow = async (userIdA, userIdB, compositeChartId) => {
  console.log("Starting relationship workflow with:", { userIdA, userIdB, compositeChartId });
  console.log("API URL:", `${SERVER_URL}/workflow/relationship/start`);
  try {
    const response = await fetch(`${SERVER_URL}/workflow/relationship/start`, {
      method: HTTP_POST,
      headers: { [CONTENT_TYPE_HEADER]: APPLICATION_JSON },
      body: JSON.stringify({ userIdA, userIdB, compositeChartId })
    });
    
    console.log("Start workflow response status:", response.status);
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Start workflow error response:", errorText);
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
  console.log("API URL:", `${SERVER_URL}/workflow/relationship/status`);
  try {
    const response = await fetch(`${SERVER_URL}/workflow/relationship/status`, {
      method: HTTP_POST,
      headers: { [CONTENT_TYPE_HEADER]: APPLICATION_JSON },
      body: JSON.stringify({ compositeChartId })
    });
    
    console.log("Status check response status:", response.status);
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Status check error response:", errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }
    
    const responseData = await response.json();
    console.log("Relationship workflow status:", responseData);
    return responseData;
  } catch (error) {
    console.error('Error getting relationship workflow status:', error);
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

