import React from 'react';

export default function HowItWorksSection() {
  return (
    <section className="how-it-works-section">
      <div className="how-it-works-content">
        <h2>How Stellium Gets This Personal</h2>
        <div className="steps-container">

          <div className="step">
            <div className="step-number">1</div>
            <h3>Create your chart</h3>
            <p className="step-subtitle">Enter birthday, place, and time (unknown times welcome).</p>
            <p className="step-description">We build a complete model of your planets, houses, and aspects—and clearly flag any time-sensitive assumptions.</p>
          </div>

          <div className="step">
            <div className="step-number">2</div>
            <h3>Get a pro-grade reading</h3>
            <p className="step-subtitle">Depth you'd expect from a professional consult.</p>
            <p className="step-description">Receive a hyper-personal birth-chart interpretation, multi-dimension relationship analysis, and transit-tuned horoscopes—all written for your placements (not generic sun-sign blurbs).</p>
          </div>

          <div className="step">
            <div className="step-number">3</div>
            <h3>Ask anything</h3>
            <p className="step-subtitle">Conversational guidance that knows your chart.</p>
            <p className="step-description">Ask follow-ups about you, your relationship, or today's transits. The chat remembers context and turns astro-speak into clear next steps.</p>
          </div>

        </div>

        <div className="value-ribbon">
          As deep as a one-on-one reading—at a fraction of the cost. Keep every report forever.
        </div>
      </div>
    </section>
  );
}