import React from 'react';

export default function PricingSection() {
  return (
    <section className="pricing-section">
      <div className="pricing-header">
        <h2 className="section-title">Ready for your first personalized reading?</h2>
        <p className="pricing-subtitle">
          Get a quick overview of your birth chart in minutes.
        </p>
      </div>

      {/* Main Plans */}
      <div className="pricing-grid">
        <div className="pricing-card free">
          <h3>Free</h3>
          <div className="price">$0</div>
          <p className="description">Dip your toes in the stars.</p>
          <ul className="features-list">
            <li>5 AI chat messages / month</li>
            <li>Quick compatibility score (one saved match)</li>
            <li>Save 1 personal chart</li>
          </ul>
          <button className="pricing-cta">Get Started</button>
        </div>

        <div className="pricing-card premium">
          <div className="popular-badge">Most Popular</div>
          <h3>Premium</h3>
          <div className="price">$20<span>/mo</span></div>
          <p className="description">Full access to personalized insights.</p>
          <ul className="features-list">
            <li>Unlimited AI chat</li>
            <li>Personalized daily/weekly/monthly horoscopes</li>
            <li>2 full reports / month (Birth Chart or Relationship)</li>
            <li>Bank unused reports for 3 months</li>
            <li>Save up to 10 charts</li>
          </ul>
          <button className="pricing-cta primary">Get My Reading</button>
        </div>

        <div className="pricing-card pro">
          <h3>Pro</h3>
          <div className="price">$49<span>/mo</span></div>
          <p className="description">For coaches & power users.</p>
          <ul className="features-list">
            <li>Everything in Premium</li>
            <li>10 full reports / month</li>
            <li>Client folders & priority support</li>
          </ul>
          <button className="pricing-cta">Upgrade</button>
        </div>
      </div>

      {/* One-time Add-ons */}
      <div className="addons-section">
        <h3>One-time add-ons</h3>
        <p className="addons-subtitle">Perfect if you're not ready to subscribe. You keep purchased reports forever.</p>

        <div className="addons-grid">
          <div className="addon-card">
            <h4>Birth Chart Reading</h4>
            <div className="addon-price">$20</div>
            <p>Complete natal analysis with lifetime access</p>
          </div>

          <div className="addon-card">
            <h4>Relationship Analysis</h4>
            <div className="addon-price">$10</div>
            <p>Synastry & composite insights for any relationship</p>
          </div>
        </div>
      </div>

      {/* Microcopy */}
      <div className="pricing-microcopy">
        Cancel anytime • Keep purchased reports forever • Works without a birth time
      </div>
    </section>
  );
} 