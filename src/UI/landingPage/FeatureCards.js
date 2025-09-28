import React from 'react';

export default function FourPillarsSection() {
  return (
    <section className="four-pillars-section">
      <div className="pillars-container">

        <div className="pillar">
          <h3>Birth Chart, Made Clear</h3>
          <p className="pillar-subtitle">AI birth-chart deep dive.</p>
          <p className="pillar-description">
            Generate your full chart and explore planets, houses, and aspects with an interactive wheel.
            Tap anything for a plain-English breakdown—works even without an exact birth time (we flag
            time-sensitive factors).
          </p>
          <p className="pillar-example">"What does Venus in my 7th mean for relationships?"</p>
        </div>

        <div className="pillar">
          <h3>Compatibility, Clarified</h3>
          <p className="pillar-subtitle">Relationship analysis that goes beyond a vibe.</p>
          <p className="pillar-description">
            Get 0–100 chemistry across key dimensions (connection, communication, passion, stability, growth),
            plus synastry &amp; composite insights for anyone you add.
          </p>
          <p className="pillar-example">"Where do we clash—and how do we fix it?"</p>
        </div>

        <div className="pillar">
          <h3>Smart Horoscopes</h3>
          <p className="pillar-subtitle">Daily/weekly/monthly, tuned to your chart.</p>
          <p className="pillar-description">
            See how today's—and any date range's—transits land for you, with clear guidance you can act on.
          </p>
          <p className="pillar-example">"Is today good for the tough conversation?"</p>
        </div>

        <div className="pillar">
          <h3>Ask Anything</h3>
          <p className="pillar-subtitle highlight-chat">24/7 chart-aware chat.</p>
          <p className="pillar-description">
            Ask about your placements, your relationship, or today's transits. Get instant, contextual
            answers—and follow up until it clicks.
          </p>
          <p className="pillar-example">"What's the difference between synastry and composite for us?"</p>
        </div>

      </div>
    </section>
  );
}

/* Notes: */
/* - Add or adjust .feature-card CSS to ensure consistent padding, border, and hover states. */
/* - Ensure .features-section uses a semi-opaque overlay or gradient for contrast under text. */
/* - Tailwind's bg-[rgba...] and backdrop-blur-md require enabling JIT or appropriate CSS config. */ 