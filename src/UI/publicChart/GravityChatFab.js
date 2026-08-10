import React from 'react';

/**
 * Floating Gravity Chat trigger for the logged-out celebrity chart.
 * Two lines so the value is set before the click — no bait-and-switch.
 */
function GravityChatFab({ onClick }) {
  return (
    <button type="button" className="pcc pcc-fab" onClick={onClick}>
      <span className="pcc-fab__sp" aria-hidden="true">&#10024;</span>
      <span className="pcc-fab__copy">
        <span className="pcc-fab__title">Ask about this chart with Gravity Chat</span>
        <span className="pcc-fab__sub">
          Sign up free, get <b>5 questions</b> to ask anything
        </span>
      </span>
    </button>
  );
}

export default GravityChatFab;
