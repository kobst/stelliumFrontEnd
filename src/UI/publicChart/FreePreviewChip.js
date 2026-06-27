import React from 'react';

/**
 * Top-bar chip for the logged-out celebrity chart.
 * Replaces the logged-in "credits" pill with an honest free-preview prompt.
 */
function FreePreviewChip({ onClick }) {
  return (
    <button type="button" className="pcc pcc-free-chip" onClick={onClick}>
      <span className="pcc-free-chip__g" aria-hidden="true">&#10022;</span>
      <span className="pcc-free-chip__txt">
        Free preview · <span className="pcc-free-chip__b">25 credits</span> on sign-up
      </span>
      <span className="pcc-free-chip__go">Start free →</span>
    </button>
  );
}

export default FreePreviewChip;
