import React from 'react';

export default function ThreePillarsSection() {
  return (
    <section className="three-pillars-section">
      <div className="pillars-container">

        {/* Pillar 1: Know Yourself */}
        <div className="pillar">
          <h3>Know Yourself</h3>
          <p className="pillar-subtitle">AI birth-chart deep dive.</p>
          <p className="pillar-description">
            Tap any planet, house, or aspect to get a clear, friendly explanation—even without an exact birth time.
          </p>
        </div>

        {/* Pillar 2: Know Your Relationships */}
        <div className="pillar">
          <h3>Know Your Relationships</h3>
          <p className="pillar-subtitle">Compatibility, clarified.</p>
          <p className="pillar-description">
            0–100 chemistry scores plus story-driven synastry & composite insights for anyone you add.
          </p>
        </div>

        {/* Pillar 3: Know Your Moment */}
        <div className="pillar">
          <h3>Know Your Moment</h3>
          <p className="pillar-subtitle">Smart horoscopes.</p>
          <p className="pillar-description">
            Daily/weekly/monthly transits mapped to your chart; ask the AI about any transit, anytime.
          </p>
        </div>

      </div>
    </section>
  );
}

/* Notes: */
/* - Add or adjust .feature-card CSS to ensure consistent padding, border, and hover states. */
/* - Ensure .features-section uses a semi-opaque overlay or gradient for contrast under text. */
/* - Tailwind's bg-[rgba...] and backdrop-blur-md require enabling JIT or appropriate CSS config. */ 