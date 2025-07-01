import React from 'react';

export default function FeaturesSection() {
  return (
    <section className="features-section py-16 px-4">
      {/* Subtitle */}
      <div className="text-center mb-12">
        <h4 className="feature-subtitle">
          A FULLY FEATURED ASTROLOGER FOR ALL YOUR NEEDS
        </h4>
      </div>

      {/* Grid */}
      <div className="features-grid">

        {/* 1. Deep-Dive Natal Analysis */}
        <div className="feature-card">
          <div className="feature-icon">🧬</div>
          <h3>Decode Your Cosmic DNA</h3>
          <div className="value-hook">AI-powered birth-chart deep dive.</div>
          <p>
            Reveal hidden talents, blind spots, and life themes in a shareable report.
          </p>
        </div>

        {/* 2. Personalized Horoscopes */}
        <div className="feature-card">
          <div className="feature-icon">📅</div>
          <h3>Guidance That Moves With You</h3>
          <div className="value-hook">Chart-specific daily, weekly, and monthly forecasts.</div>
          <p>
            Wake up to personalized horoscopes delivered by push or email—no generic sun-sign fluff.
          </p>
        </div>

        {/* 3. Transit Explorer */}
        <div className="feature-card">
          <div className="feature-icon">🔍</div>
          <h3>Zoom In on Any Transit</h3>
          <div className="value-hook">Instant readings for any planetary aspect.</div>
          <p>
            Ask about today's Mars square or your upcoming Saturn return and get context-rich guidance.
          </p>
        </div>

        {/* 4. Guest & Family Charts */}
        <div className="feature-card">
          <div className="feature-icon">👥</div>
          <h3>Read Anyone — Instantly</h3>
          <div className="value-hook">Quick overview or deep dive for friends and family.</div>
          <p>
            Add loved ones to your chart library, then switch between summaries, full reports, and chat insights.
          </p>
        </div>

        {/* 5. Relationship Analysis */}
        <div className="feature-card">
          <div className="feature-icon">💕</div>
          <h3>Chemistry, Clarified</h3>
          <div className="value-hook">0–100 quick score to full synastry report.</div>
          <p>
            Compare two charts—see harmony/tension scores, then unlock story-driven analysis with chat.
          </p>
        </div>

        {/* 6. AI Chat */}
        <div className="feature-card">
          <div className="feature-icon">💬</div>
          <h3>Ask Anything, Anytime</h3>
          <div className="value-hook">24/7 conversational astrology guidance.</div>
          <p>
            Inquire about love, career, or transits—get personalized, empathetic answers in seconds.
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