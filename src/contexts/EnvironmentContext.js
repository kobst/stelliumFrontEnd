import React, { createContext, useContext, useState, useEffect } from 'react';

const EnvironmentContext = createContext();

const resolveEnvironment = () => {
  const explicitEnv = (process.env.REACT_APP_ADMIN_ENV || '').toLowerCase();
  if (explicitEnv === 'prod' || explicitEnv === 'production') return 'prod';
  if (explicitEnv === 'dev' || explicitEnv === 'development') return 'dev';

  const apiUrl = process.env.REACT_APP_SERVER_URL || '';
  return apiUrl.includes('api.dev.') ? 'dev' : 'prod';
};

export const useEnvironment = () => {
  const context = useContext(EnvironmentContext);
  if (!context) {
    throw new Error('useEnvironment must be used within an EnvironmentProvider');
  }
  return context;
};

export const EnvironmentProvider = ({ children }) => {
  const [currentEnvironment] = useState(resolveEnvironment);

  const getApiUrl = () => {
    return process.env.REACT_APP_SERVER_URL;
  };

  const switchEnvironment = () => {
    console.warn('Environment switching is disabled; API environment is branch-configured.');
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
      { key: currentEnvironment, label: isProduction() ? 'Production' : 'Development', url: process.env.REACT_APP_SERVER_URL }
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
