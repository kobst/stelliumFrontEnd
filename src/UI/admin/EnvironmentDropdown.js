import React, { useState } from 'react';
import { useEnvironment } from '../../contexts/EnvironmentContext';
import './EnvironmentDropdown.css';

const EnvironmentDropdown = () => {
  const {
    currentEnvironment,
    switchEnvironment,
    availableEnvironments,
    isProduction
  } = useEnvironment();

  const [isOpen, setIsOpen] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [targetEnvironment, setTargetEnvironment] = useState(null);

  const handleEnvironmentSelect = (envKey) => {
    if (envKey !== currentEnvironment) {
      setTargetEnvironment(envKey);
      setShowConfirmation(true);
      setIsOpen(false);
    } else {
      setIsOpen(false);
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
    <>
      <div className="environment-dropdown">
        <button
          className={`env-dropdown-trigger admin-badge admin-badge--${currentEnvironment} ${currentEnvironment}`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="env-indicator">
            {isProduction() ? '🔴' : '🟡'} {currentEnvironment.toUpperCase()}
          </span>
          <span className="dropdown-arrow">▼</span>
        </button>

        {isOpen && (
          <div className="env-dropdown-menu">
            {availableEnvironments.map((env) => (
              <button
                key={env.key}
                className={`env-dropdown-item ${env.key} ${env.key === currentEnvironment ? 'active' : ''}`}
                onClick={() => handleEnvironmentSelect(env.key)}
              >
                <span className="env-icon">
                  {env.key === 'prod' ? '🔴' : '🟡'}
                </span>
                <div className="env-details">
                  <span className="env-name">{env.label}</span>
                  <span className="env-url">{env.url}</span>
                </div>
                {env.key === currentEnvironment && (
                  <span className="active-indicator">✓</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Overlay to close dropdown when clicking outside */}
      {isOpen && (
        <div
          className="dropdown-overlay"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Confirmation Dialog */}
      {showConfirmation && (
        <div className="env-dropdown-confirmation-overlay">
          <div className="confirmation-dialog-compact">
            <h4>Switch Environment?</h4>
            <p>
              Switch from <strong>{getCurrentEnvData()?.label}</strong> to{' '}
              <strong>{availableEnvironments.find(env => env.key === targetEnvironment)?.label}</strong>?
            </p>
            <div className="confirmation-buttons">
              <button className="admin-btn admin-btn--danger" onClick={confirmSwitch}>
                Switch
              </button>
              <button className="admin-btn admin-btn--ghost" onClick={cancelSwitch}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EnvironmentDropdown;
