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
            <li>Your Quick Chart (at signup)</li>
            <li>Weekly horoscope (personalized)</li>
            <li>Any mix of 5 Quick Charts (guests) or Quick Matches (relationships/celebs) per month</li>
            <li>No chat. Upgrade for daily/monthly, Reports, and chat.</li>
          </ul>
        </div>

        <div className="pricing-card premium">
          <div className="popular-badge">Most Popular</div>
          <h3>Premium</h3>
          <div className="price">$20<span>/mo</span></div>
          <p className="description">Full access to personalized insights.</p>
          <ul className="features-list">
            <li>Your Natal Report included</li>
            <li>Daily + Weekly + Monthly horoscopes</li>
            <li>2 Reports/mo — Natal or Compatibility (roll for 3 months)</li>
            <li>10 Quick Charts or Quick Matches per month</li>
            <li>Unlimited AI chat (fair use): Transit Chat + Chart Chat (for anyone with a Natal Report) + Relationship Chat (for any pair with a Compatibility Report)</li>
          </ul>
        </div>

        <div className="pricing-card pro">
          <h3>Pro</h3>
          <div className="price">$49<span>/mo</span></div>
          <p className="description">For coaches & power users.</p>
          <ul className="features-list">
            <li>Everything in Premium</li>
            <li>10 Reports/mo (roll for 3 months)</li>
            <li>Unlimited Quick actions (Quick Charts & Quick Matches)</li>
            <li>Higher chat cap</li>
          </ul>
        </div>
      </div>

      {/* One-time Add-ons */}
      <div className="addons-section">
        <h3>One-time add-ons (yours forever)</h3>
        <p className="addons-subtitle">Perfect if you're not ready to subscribe. You keep purchased reports forever.</p>

        <div className="addons-grid">
          <div className="addon-card">
            <h4>Natal Report</h4>
            <div className="addon-price">$20</div>
          </div>

          <div className="addon-card">
            <h4>Compatibility Report</h4>
            <div className="addon-price">$10</div>
          </div>
        </div>

        <p className="addons-chat-note">Includes 20 free chat questions without a Premium account.</p>
      </div>

      {/* Microcopy */}
      <div className="pricing-microcopy">
        Cancel anytime • Keep purchased reports forever • Works without a birth time
      </div>
    </section>
  );
} 