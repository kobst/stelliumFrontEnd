import { useState, useEffect, useCallback } from 'react';
import { 
  createUserWithOverview, 
  createCelebrityWithOverview, 
  createGuestWithOverview,
  checkUserCreationStatus,
  checkCelebrityCreationStatus,
  checkGuestCreationStatus,
  getCompleteWorkflowData
} from '../Utilities/api';

const useSubjectCreation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [workflowId, setWorkflowId] = useState(null);
  const [status, setStatus] = useState(null);
  const [completeData, setCompleteData] = useState(null);
  const [pollInterval, setPollInterval] = useState(null);
  const [subjectType, setSubjectType] = useState(null); // 'user', 'celebrity', 'guest'

  // Create user with overview
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
        setWorkflowId(response.workflowId);
        setStatus(response);
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

  // Create celebrity with overview
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
        setWorkflowId(response.workflowId);
        setStatus(response);
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

  // Create guest with overview
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
        setWorkflowId(response.workflowId);
        setStatus(response);
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

  // Get complete data after workflow completion
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
    // Creation functions
    createUser,
    createCelebrity,
    createGuest,
    
    // Status and data functions
    checkStatus,
    getCompleteData,
    
    // Polling control
    startPolling,
    stopPolling,
    
    // State
    loading,
    error,
    workflowId,
    status,
    completeData,
    
    // Computed properties
    isCompleted: status?.completed || false,
    userId: status?.userId || null,
    progress: status?.progress || null
  };
};

export default useSubjectCreation;