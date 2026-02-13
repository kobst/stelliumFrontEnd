import React from 'react';
import './Toast.css';

function Toast({ message, type = 'info', isVisible, onDismiss }) {
  if (!isVisible) return null;

  return (
    <div className={`toast toast--${type}`}>
      <span className="toast__message">{message}</span>
      <button className="toast__dismiss" onClick={onDismiss} aria-label="Dismiss">
        &times;
      </button>
    </div>
  );
}

export default Toast;
