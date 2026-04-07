import React, { useEffect, useRef, useState } from 'react';

function AskStelliumCta({ hasFullAccess, onActivate }) {
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const dismissTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (dismissTimerRef.current) {
        clearTimeout(dismissTimerRef.current);
      }
    };
  }, []);

  const showTooltip = () => {
    if (!hasFullAccess) {
      setTooltipVisible(true);
    }
  };

  const hideTooltip = () => {
    setTooltipVisible(false);
  };

  const handleTouchStart = () => {
    if (hasFullAccess) return;

    setTooltipVisible(prev => !prev);

    if (dismissTimerRef.current) {
      clearTimeout(dismissTimerRef.current);
    }

    dismissTimerRef.current = setTimeout(() => {
      setTooltipVisible(false);
    }, 3000);
  };

  return (
    <div className="ask-stellium-cta">
      <div
        className="ask-stellium-wrapper"
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onTouchStart={handleTouchStart}
      >
        <button
          className="ask-stellium-trigger"
          disabled={!hasFullAccess}
          onClick={hasFullAccess ? onActivate : undefined}
        >
          <span className="ask-stellium-trigger__icon">&#10024;</span>
          Ask Stellium
          {!hasFullAccess && (
            <i className="ask-stellium-info-icon" aria-hidden="true">i</i>
          )}
        </button>

        {!hasFullAccess && (
          <div
            className={`ask-stellium-tooltip${tooltipVisible ? ' ask-stellium-tooltip--visible' : ''}`}
            role="tooltip"
          >
            Full analysis required to use Ask Stellium
          </div>
        )}
      </div>
    </div>
  );
}

export default AskStelliumCta;
