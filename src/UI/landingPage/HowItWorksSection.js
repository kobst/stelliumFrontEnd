import React from 'react';

export default function HowItWorksSection() {
  return (
    <section className="how-it-works-section">
      <div className="how-it-works-content">
        <h2>How it works</h2>
        <div className="steps-container">

          <div className="step">
            <div className="step-number">1</div>
            <h3>Create your chart</h3>
            <p>Enter birthday; we handle unknown times.</p>
          </div>

          <div className="step">
            <div className="step-number">2</div>
            <h3>Ask anything</h3>
            <p>Chat about love, career, or today's transit.</p>
          </div>

          <div className="step">
            <div className="step-number">3</div>
            <h3>Go deeper</h3>
            <p>Run compatibility or save full reports for future reference.</p>
          </div>

        </div>
      </div>
    </section>
  );
}