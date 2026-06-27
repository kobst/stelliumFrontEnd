import React from 'react';

/**
 * Contextual sign-up CTA woven into the long-form content of the logged-out
 * celebrity chart. Framed around the reader's own chart, not the celebrity's.
 */
function InlineSignUpCta({ eyebrow, heading, body, buttonLabel, onActivate }) {
  return (
    <div className="pcc pcc-inline-cta">
      <div className="pcc-inline-cta__copy">
        <div className="pcc-inline-cta__eyebrow">{eyebrow}</div>
        <h3>{heading}</h3>
        <p>{body}</p>
      </div>
      <div className="pcc-inline-cta__action">
        <button type="button" className="pcc-inline-cta__btn" onClick={onActivate}>
          {buttonLabel}
        </button>
        <div className="pcc-inline-cta__note">
          No credit card · <b>25 credits included</b>
        </div>
      </div>
    </div>
  );
}

export default InlineSignUpCta;
