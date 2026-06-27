import React from 'react';

/**
 * Sidebar "Compare with your chart" card for the logged-out celebrity chart.
 * Mirrors the listing page's "Want to compare?" block, placed where people are.
 */
function CompareWithYourChartCard({ celebrityName, onCompare }) {
  const firstName = (celebrityName || '').trim().split(/\s+/)[0] || 'them';
  return (
    <div className="pcc pcc-compare">
      <div className="pcc-compare__eyebrow">
        <span className="pcc-compare__dot" aria-hidden="true" /> Want to compare?
      </div>
      <div className="pcc-compare__body">
        See where your sky <span className="pcc-compare__em">meets {firstName}'s.</span>
      </div>
      <button type="button" className="pcc-compare__btn" onClick={onCompare}>
        Compare with your chart →
      </button>
      <div className="pcc-compare__foot">Free · No credit card</div>
    </div>
  );
}

export default CompareWithYourChartCard;
