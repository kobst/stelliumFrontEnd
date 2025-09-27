import React, { createContext, useContext, useState, useEffect } from 'react';

const EnvironmentContext = createContext();

export const useEnvironment = () => {
  const context = useContext(EnvironmentContext);
  if (!context) {
    throw new Error('useEnvironment must be used within an EnvironmentProvider');
  }
  return context;
};

export const EnvironmentProvider = ({ children }) => {
  const [currentEnvironment, setCurrentEnvironment] = useState(() => {
    // Get from sessionStorage or default to 'dev'
    return sessionStorage.getItem('stellium_environment') || 'dev';
  });

  const getApiUrl = () => {
    switch (currentEnvironment) {
      case 'prod':
        return process.env.REACT_APP_SERVER_URL_PROD;
      case 'dev':
      default:
        return process.env.REACT_APP_SERVER_URL;
    }
  };

  const switchEnvironment = (environment) => {
    if (environment !== currentEnvironment) {
      setCurrentEnvironment(environment);
      sessionStorage.setItem('stellium_environment', environment);

      // Clear any cached data that might be environment-specific
      console.log(`Switched to ${environment} environment: ${getApiUrl()}`);

      // Reload the page to ensure clean state and proper API endpoint usage
      window.location.reload();
    }
  };

  const isProduction = () => currentEnvironment === 'prod';
  const isDevelopment = () => currentEnvironment === 'dev';

  const value = {
    currentEnvironment,
    switchEnvironment,
    getApiUrl,
    isProduction,
    isDevelopment,
    availableEnvironments: [
      { key: 'dev', label: 'Development', url: process.env.REACT_APP_SERVER_URL },
      { key: 'prod', label: 'Production', url: process.env.REACT_APP_SERVER_URL_PROD }
    ]
  };

  // Update the global window object for debugging
  useEffect(() => {
    window.stelliumEnvironment = {
      current: currentEnvironment,
      url: getApiUrl()
    };
  }, [currentEnvironment]);

  return (
    <EnvironmentContext.Provider value={value}>
      {children}
    </EnvironmentContext.Provider>
  );
};

export default EnvironmentContext;