/**
 * @deprecated 2026-05-13 — Replaced by the Stellium home redesign.
 *   The "no birth time? no problem" objection is now folded into the
 *   How it works step 1 copy in `src/pages/LandingPage.js`
 *   ("…we clearly flag any time-sensitive assumptions if you're not sure
 *   of the exact minute"). No dedicated section in the new layout.
 *   No longer imported anywhere. Safe to delete.
 */
import React from 'react';

export default function ObjectionBusterSection() {
  return (
    <section className="objection-buster-section">
      <div className="objection-content">
        <h2>No birth time? No problem.</h2>
        <p>
          We intelligently estimate time-sensitive factors and clearly label assumptions so your reading stays accurate—and honest.
        </p>
      </div>
    </section>
  );
}