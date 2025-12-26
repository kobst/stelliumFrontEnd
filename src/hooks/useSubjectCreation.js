import { useState, useEffect, useCallback } from 'react';
import {
  createUserWithOverview,
  createCelebrityWithOverview,
  createGuestWithOverview,
  checkUserCreationStatus,
  checkCelebrityCreationStatus,
  checkGuestCreationStatus,
  getCompleteWorkflowData,
  getNewCompleteWorkflowData,
  startFullAnalysis,
  startFullAnalysisAdmin,
  checkFullAnalysisStatus,
  checkFullAnalysisStatusAdmin
} from '../Utilities/api';

const useSubjectCreation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [workflowId, setWorkflowId] = useState(null);
  const [status, setStatus] = useState(null);
  const [completeData, setCompleteData] = useState(null);
  const [pollInterval, setPollInterval] = useState(null);
  const [subjectType, setSubjectType] = useState(null); // 'user', 'celebrity', 'guest'
  
  // Full analysis workflow state
  const [fullAnalysisLoading, setFullAnalysisLoading] = useState(false);
  const [fullAnalysisWorkflowId, setFullAnalysisWorkflowId] = useState(null);
  const [fullAnalysisStatus, setFullAnalysisStatus] = useState(null);
  const [fullAnalysisProgress, setFullAnalysisProgress] = useState(null);

  // Create user with direct API - gets immediate response with birth chart + overview
  const createUser = useCallback(async (userData) => {
    setLoading(true);
    setError(null);
    setWorkflowId(null);
    setStatus(null);
    setCompleteData(null);
    setSubjectType('user');
    
    try {
      const response = await createUserWithOverview(userData);
      
      if (response.success) {
        // Set the response data directly - no workflow polling needed
        setStatus({
          ...response,
          completed: true,
          userId: response.userId
        });
        
        // Set complete data with birth chart and overview
        setCompleteData({
          subject: {
            ...response.user,
            birthChart: response.birthChart
          },
          analysis: {
            interpretation: {
              basicAnalysis: {
                overview: response.overview
              }
            }
          }
        });
        
        return response;
      } else {
        throw new Error(response.error || 'Failed to create user');
      }
    } catch (err) {
      setError(err.message || 'Failed to create user');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create celebrity with direct API - gets immediate response with birth chart + overview
  const createCelebrity = useCallback(async (celebrityData) => {
    setLoading(true);
    setError(null);
    setWorkflowId(null);
    setStatus(null);
    setCompleteData(null);
    setSubjectType('celebrity');
    
    try {
      const response = await createCelebrityWithOverview(celebrityData);
      
      if (response.success) {
        // Set the response data directly - no workflow polling needed
        setStatus({
          ...response,
          completed: true,
          userId: response.userId
        });
        
        // Set complete data with birth chart and overview
        setCompleteData({
          subject: {
            ...response.celeb,
            birthChart: response.birthChart
          },
          analysis: {
            interpretation: {
              basicAnalysis: {
                overview: response.overview
              }
            }
          }
        });
        
        return response;
      } else {
        throw new Error(response.error || 'Failed to create celebrity');
      }
    } catch (err) {
      setError(err.message || 'Failed to create celebrity');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create guest with direct API - gets immediate response with birth chart + overview
  const createGuest = useCallback(async (guestData, ownerUserId) => {
    setLoading(true);
    setError(null);
    setWorkflowId(null);
    setStatus(null);
    setCompleteData(null);
    setSubjectType('guest');
    
    try {
      const dataWithOwner = { ...guestData, ownerUserId };
      const response = await createGuestWithOverview(dataWithOwner);
      
      if (response.success) {
        // Set the response data directly - no workflow polling needed
        setStatus({
          ...response,
          completed: true,
          userId: response.userId
        });
        
        // Set complete data with birth chart and overview
        setCompleteData({
          subject: {
            ...response.guestSubject,
            birthChart: response.birthChart
          },
          analysis: {
            interpretation: {
              basicAnalysis: {
                overview: response.overview
              }
            }
          }
        });
        
        return response;
      } else {
        throw new Error(response.error || 'Failed to create guest subject');
      }
    } catch (err) {
      setError(err.message || 'Failed to create guest subject');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Check workflow status
  const checkStatus = useCallback(async (workflowId) => {
    console.log(`🔍 Hook checkStatus called - subjectType: ${subjectType}, workflowId: ${workflowId}`);
    try {
      let response;
      
      // Use the correct status checking function based on subject type
      switch (subjectType) {
        case 'user':
          console.log('📞 Calling checkUserCreationStatus');
          response = await checkUserCreationStatus(workflowId);
          break;
        case 'celebrity':
          console.log('📞 Calling checkCelebrityCreationStatus');
          response = await checkCelebrityCreationStatus(workflowId);
          break;
        case 'guest':
          console.log('📞 Calling checkGuestCreationStatus');
          response = await checkGuestCreationStatus(workflowId);
          break;
        default:
          console.log('📞 Calling default checkUserCreationStatus');
          // Fallback to user status for backwards compatibility
          response = await checkUserCreationStatus(workflowId);
          break;
      }
      
      setStatus(response);
      return response;
    } catch (err) {
      console.error('Failed to check workflow status:', err);
      throw err;
    }
  }, [subjectType]);

  // Get complete data after workflow completion (legacy)
  const getCompleteData = async (userId, workflowId) => {
    try {
      const response = await getCompleteWorkflowData(userId, workflowId);
      setCompleteData(response.data);
      return response.data;
    } catch (err) {
      console.error('Failed to get complete data:', err);
      throw err;
    }
  };

  // Get complete data after new workflow completion
  const getNewCompleteData = async (userId, workflowId) => {
    try {
      const response = await getNewCompleteWorkflowData(userId, workflowId);
      setCompleteData(response.data);
      return response.data;
    } catch (err) {
      console.error('Failed to get new complete data:', err);
      throw err;
    }
  };

  // Start full analysis (Stage 2 of workflow)
  const startFullAnalysisWorkflow = useCallback(async (userId) => {
    setFullAnalysisLoading(true);
    setError(null);
    setFullAnalysisWorkflowId(null);
    setFullAnalysisStatus(null);
    setFullAnalysisProgress(null);

    try {
      const response = await startFullAnalysis(userId);

      if (response.success) {
        setFullAnalysisWorkflowId(response.workflowId);
        setFullAnalysisStatus(response);
        return response;
      } else {
        throw new Error(response.error || 'Failed to start full analysis');
      }
    } catch (err) {
      setError(err.message || 'Failed to start full analysis');
      throw err;
    } finally {
      setFullAnalysisLoading(false);
    }
  }, []);

  // Start full analysis for celebrities via admin endpoint (no auth required)
  const startFullAnalysisWorkflowAdmin = useCallback(async (userId) => {
    setFullAnalysisLoading(true);
    setError(null);
    setFullAnalysisWorkflowId(null);
    setFullAnalysisStatus(null);
    setFullAnalysisProgress(null);

    try {
      const response = await startFullAnalysisAdmin(userId);

      if (response.success) {
        setFullAnalysisWorkflowId(response.workflowId);
        setFullAnalysisStatus(response);
        return response;
      } else {
        // Admin endpoint returns structured error responses
        throw new Error(response.error || 'Failed to start celebrity analysis');
      }
    } catch (err) {
      setError(err.message || 'Failed to start celebrity analysis');
      throw err;
    } finally {
      setFullAnalysisLoading(false);
    }
  }, []);

  // Check full analysis status with progress
  const checkFullAnalysisWorkflowStatus = useCallback(async (userId, workflowId = null) => {
    console.log(`🔍 Checking full analysis status - userId: ${userId}, workflowId: ${workflowId}`);
    try {
      const response = await checkFullAnalysisStatus(userId, workflowId);
      setFullAnalysisStatus(response);
      setFullAnalysisProgress(response.progress);
      return response;
    } catch (err) {
      console.error('Failed to check full analysis status:', err);
      throw err;
    }
  }, []);

  // Check full analysis status for celebrities via admin endpoint (no auth required)
  const checkFullAnalysisWorkflowStatusAdmin = useCallback(async (userId, workflowId = null) => {
    console.log(`🔍 Checking admin full analysis status - userId: ${userId}, workflowId: ${workflowId}`);
    try {
      const response = await checkFullAnalysisStatusAdmin(userId, workflowId);
      setFullAnalysisStatus(response);
      setFullAnalysisProgress(response.progress);
      return response;
    } catch (err) {
      console.error('Failed to check admin full analysis status:', err);
      throw err;
    }
  }, []);

  // Start polling for status updates
  const startPolling = useCallback((workflowId, intervalMs = 3000) => {
    if (pollInterval) {
      clearInterval(pollInterval);
    }

    const interval = setInterval(async () => {
      try {
        const statusResponse = await checkStatus(workflowId);
        
        if (statusResponse.completed) {
          // Workflow completed, get complete data
          const completeResponse = await getCompleteData(statusResponse.userId, workflowId);
          // Clear the interval
          clearInterval(interval);
          setPollInterval(null);
          
          // Workflow completed, data is available in completeResponse
        }
      } catch (error) {
        console.error('Polling error:', error);
        // Continue polling on error, but limit retries could be added here
      }
    }, intervalMs);

    setPollInterval(interval);
    return interval;
  }, [pollInterval, checkStatus, getCompleteData]);

  // Stop polling
  const stopPolling = useCallback(() => {
    if (pollInterval) {
      clearInterval(pollInterval);
      setPollInterval(null);
    }
  }, [pollInterval]);

  // Start full analysis polling with progress updates
  const startFullAnalysisPolling = useCallback((userId, workflowId = null, intervalMs = 5000, onProgress = null) => {
    console.log('Starting full analysis polling for userId:', userId, 'workflowId:', workflowId);

    const interval = setInterval(async () => {
      try {
        const statusResponse = await checkFullAnalysisWorkflowStatus(userId, workflowId);

        // Call progress callback if provided
        if (onProgress) {
          onProgress(statusResponse);
        }

        if (statusResponse.completed) {
          console.log('Full analysis workflow completed!');
          clearInterval(interval);
          return statusResponse;
        }

        // Check for failure
        if (statusResponse.stepFunctionStatus === 'FAILED') {
          console.log('Full analysis workflow failed!');
          clearInterval(interval);
          throw new Error(`Full analysis failed: ${statusResponse.message}`);
        }
      } catch (error) {
        console.error('Full analysis polling error:', error);
        clearInterval(interval);
        throw error;
      }
    }, intervalMs);

    return interval;
  }, [checkFullAnalysisWorkflowStatus]);

  // Start polling for celebrity full analysis status via admin endpoint (no auth required)
  const startFullAnalysisPollingAdmin = useCallback((userId, workflowId = null, intervalMs = 5000, onProgress = null) => {
    console.log('Starting admin full analysis polling for celebrity userId:', userId, 'workflowId:', workflowId);

    const interval = setInterval(async () => {
      try {
        const statusResponse = await checkFullAnalysisWorkflowStatusAdmin(userId, workflowId);

        // Call progress callback if provided
        if (onProgress) {
          onProgress(statusResponse);
        }

        if (statusResponse.completed) {
          console.log('Celebrity full analysis workflow completed!');
          clearInterval(interval);
          return statusResponse;
        }

        // Check for failure
        if (statusResponse.stepFunctionStatus === 'FAILED') {
          console.log('Celebrity full analysis workflow failed!');
          clearInterval(interval);
          throw new Error(`Celebrity full analysis failed: ${statusResponse.message}`);
        }
      } catch (error) {
        console.error('Admin full analysis polling error:', error);
        clearInterval(interval);
        throw error;
      }
    }, intervalMs);

    return interval;
  }, [checkFullAnalysisWorkflowStatusAdmin]);

  // Wait for full analysis completion with progress
  const waitForFullAnalysisComplete = useCallback(async (userId, workflowId = null, onProgress = null) => {
    return new Promise((resolve, reject) => {
      const pollInterval = startFullAnalysisPolling(
        userId, 
        workflowId, 
        5000, // Poll every 5 seconds
        onProgress
      );

      // Timeout after 15 minutes
      const timeout = setTimeout(() => {
        clearInterval(pollInterval);
        reject(new Error('Full analysis workflow timed out'));
      }, 900000);

      // Success handler
      pollInterval.then && pollInterval.then((result) => {
        clearTimeout(timeout);
        resolve(result);
      }).catch((error) => {
        clearTimeout(timeout);
        reject(error);
      });
    });
  }, [startFullAnalysisPolling]);

  // Reset full analysis state (important for switching between users)
  const resetFullAnalysisState = useCallback(() => {
    console.log('Resetting full analysis state');
    setFullAnalysisLoading(false);
    setFullAnalysisWorkflowId(null);
    setFullAnalysisStatus(null);
    setFullAnalysisProgress(null);
  }, []);

  // Auto-polling disabled - handled by components that use this hook

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [pollInterval]);

  return {
    // Creation functions (Stage 1)
    createUser,
    createCelebrity,
    createGuest,
    
    // Status and data functions (Stage 1)
    checkStatus,
    getCompleteData,
    getNewCompleteData,
    
    // Full analysis functions (Stage 2)
    startFullAnalysisWorkflow,
    startFullAnalysisWorkflowAdmin,  // Admin endpoint for celebrities (no auth)
    checkFullAnalysisWorkflowStatus,
    checkFullAnalysisWorkflowStatusAdmin,  // Admin endpoint for celebrities (no auth)
    startFullAnalysisPolling,
    startFullAnalysisPollingAdmin,  // Admin endpoint for celebrities (no auth)
    waitForFullAnalysisComplete,
    
    // Polling control
    startPolling,
    stopPolling,
    
    // State management
    resetFullAnalysisState,
    
    // Stage 1 state
    loading,
    error,
    workflowId,
    status,
    completeData,
    
    // Stage 2 state
    fullAnalysisLoading,
    fullAnalysisWorkflowId,
    fullAnalysisStatus,
    fullAnalysisProgress,
    
    // Computed properties
    isCompleted: status?.completed || false,
    userId: status?.userId || null,
    progress: status?.progress || null,
    // Only treat as complete when backend explicitly says so
    isFullAnalysisCompleted: Boolean(fullAnalysisStatus?.completed) ||
                             ['completed', 'full_analysis_completed'].includes(fullAnalysisStatus?.status) ||
                             ['SUCCEEDED', 'SUCCEEDED_WITH_WARNINGS'].includes(fullAnalysisStatus?.stepFunctionStatus),
    fullAnalysisProgressPercentage: fullAnalysisProgress?.percentage || 0
  };
};

export default useSubjectCreation;
