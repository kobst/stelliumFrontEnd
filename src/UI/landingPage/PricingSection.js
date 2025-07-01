import React from 'react';

export default function PricingSection() {
  return (
    <section className="pricing-section">
      <div className="pricing-header">
        <h2 className="section-title">Pick Your Cosmic Path</h2>
        <p className="pricing-subtitle">
          Unlock deeper self‑knowledge and relationship insight with the plan that
          matches your journey.
        </p>
      </div>
      
      <div className="pricing-grid">
        <div className="pricing-card free">
          <h3>Free</h3>
          <div className="price">$0</div>
          <p className="description">Dip your toes in the stars — no credit card required.</p>
          <ul className="features-list">
            <li>✓ Browse celebrity charts</li>
            <li>✓ Unlimited Quick Compatibility Scores</li>
          </ul>
          <button className="pricing-cta">Get Started</button>
        </div>

        <div className="pricing-card base">
          <div className="popular-badge">⭐ Most Popular</div>
          <h3>Base Plan</h3>
          <div className="price">$20<span>/mo</span></div>
          <p className="description">Daily guidance + deep insights into your own chart.</p>
          <ul className="features-list">
            <li>✓ Daily / Weekly / Monthly Horoscopes</li>
            <li>✓ Transit Vision Chat for *your* chart</li>
            <li>✓ 1 Full Birth Chart Reading (or credit)</li>
            <li>✓ 1 Celebrity Compatibility Analysis / mo</li>
          </ul>
          <button className="pricing-cta primary">Start Free Month</button>
        </div>

        <div className="pricing-card chart">
          <h3>Birth Chart Reading</h3>
          <div className="price">$20<span>one‑time</span></div>
          <p className="description">Detailed natal analysis + 1‑hr Insight Chat.</p>
          <ul className="features-list">
            <li>✓ Lifetime access to your reading</li>
            <li>✓ 1‑hr Insight Chat Q&A</li>
            <li>✓ Includes 1‑month Base Plan trial</li>
          </ul>
          <button className="pricing-cta">Purchase</button>
        </div>

        <div className="pricing-card relationship">
          <h3>Relationship Analysis</h3>
          <div className="price">$10<span>each</span></div>
          <p className="description">Synastry + composite report between two charts.</p>
          <ul className="features-list">
            <li>✓ Full compatibility report</li>
            <li>✓ 1‑hr Insight Chat Q&A</li>
            <li>✓ Upgrade to Transit Vision for +$10/mo</li>
          </ul>
          <button className="pricing-cta">Purchase</button>
        </div>

        <div className="pricing-card pro">
          <h3>Pro</h3>
          <div className="price">$100<span>/mo</span></div>
          <p className="description">For coaches & astro pros managing many clients.</p>
          <ul className="features-list">
            <li>✓ Up to 10 charts / relationships</li>
            <li>✓ Transit Vision Chat for each</li>
            <li>✓ Priority support</li>
          </ul>
          <button className="pricing-cta">Upgrade</button>
        </div>

        <div className="pricing-card max">
          <h3>Pro Max</h3>
          <div className="price">$200<span>/mo</span></div>
          <p className="description">For studios & power users — unlimited guidance.</p>
          <ul className="features-list">
            <li>✓ Up to 30 charts / relationships</li>
            <li>✓ Transit Vision Chat for each</li>
            <li>✓ White‑glove onboarding</li>
          </ul>
          <button className="pricing-cta">Upgrade</button>
        </div>
      </div>
    </section>
  );
} 