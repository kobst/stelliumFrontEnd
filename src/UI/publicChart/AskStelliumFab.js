import React from 'react';

/**
 * Floating Ask-Stellium trigger for the logged-out celebrity chart.
 * Two lines so the value is set before the click — no bait-and-switch.
 */
function AskStelliumFab({ onClick }) {
  return (
    <button type="button" className="pcc pcc-fab" onClick={onClick}>
      <span className="pcc-fab__sp" aria-hidden="true">&#10024;</span>
      <span className="pcc-fab__copy">
        <span className="pcc-fab__title">Ask Stellium about this chart</span>
        <span className="pcc-fab__sub">
          Sign up free, get <b>25 credits</b> to ask anything
        </span>
      </span>
    </button>
  );
}

export default AskStelliumFab;
