import React, { useState } from 'react';
import { useEnvironment } from '../../contexts/EnvironmentContext';
import './EnvironmentSwitcher.css';

const EnvironmentSwitcher = () => {
  const {
    currentEnvironment,
    switchEnvironment,
    availableEnvironments,
    getApiUrl
  } = useEnvironment();

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [targetEnvironment, setTargetEnvironment] = useState(null);

  const handleEnvironmentClick = (envKey) => {
    if (envKey !== currentEnvironment) {
      setTargetEnvironment(envKey);
      setShowConfirmation(true);
    }
  };

  const confirmSwitch = () => {
    switchEnvironment(targetEnvironment);
    setShowConfirmation(false);
    setTargetEnvironment(null);
  };

  const cancelSwitch = () => {
    setShowConfirmation(false);
    setTargetEnvironment(null);
  };

  const getCurrentEnvData = () => {
    return availableEnvironments.find(env => env.key === currentEnvironment);
  };

  return (
    <div className="environment-switcher">
      <div className="environment-header">
        <h3>Environment Control</h3>
        <div className={`current-environment ${currentEnvironment}`}>
          <span className="env-label">Current:</span>
          <span className="env-name">{getCurrentEnvData()?.label}</span>
          <span className="env-url">{getApiUrl()}</span>
        </div>
      </div>

      <div className="environment-tabs">
        {availableEnvironments.map((env) => (
          <button
            key={env.key}
            className={`env-tab ${env.key === currentEnvironment ? 'active' : ''} ${env.key}`}
            onClick={() => handleEnvironmentClick(env.key)}
            disabled={env.key === currentEnvironment}
          >
            <div className="tab-content">
              <span className="tab-label">{env.label}</span>
              <span className="tab-url">{env.url}</span>
            </div>
          </button>
        ))}
      </div>

      {showConfirmation && (
        <div className="confirmation-overlay">
          <div className="confirmation-dialog">
            <h4>Switch Environment</h4>
            <p>
              Are you sure you want to switch from <strong>{getCurrentEnvData()?.label}</strong> to{' '}
              <strong>{availableEnvironments.find(env => env.key === targetEnvironment)?.label}</strong>?
            </p>
            <p className="warning">
              This will change the API endpoint and may clear some cached data.
            </p>
            <div className="confirmation-buttons">
              <button className="confirm-btn" onClick={confirmSwitch}>
                Switch Environment
              </button>
              <button className="cancel-btn" onClick={cancelSwitch}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnvironmentSwitcher;