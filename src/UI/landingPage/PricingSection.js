import React from 'react';

export default function PricingSection() {
  return (
    <section className="pricing-section">
      <div className="pricing-header">
        <h2 className="section-title">Choose Your Plan</h2>
      </div>

      {/* Main Plans */}
      <div className="pricing-grid">
        <div className="pricing-card free">
          <h3>Free</h3>
          <div className="price">$0</div>
          <p className="description">Dip your toes in the stars.</p>
          <ul className="features-list">
            <li>Your Quick Chart Overview when You Sign Up</li>
            <li>Personalizd Weekly Horoscope </li>
            <li>Any mix of 5 Quick Chart Overviews (For Guests) or Quick Compatibility Scores per month</li>
            <li>No chat. Upgrade for daily/monthly, Reports, and chat.</li>
          </ul>
        </div>

        <div className="pricing-card premium">
          <div className="popular-badge">Most Popular</div>
          <h3>Premium</h3>
          <div className="price">$20<span>/mo</span></div>
          <p className="description">Full access to personalized insights.</p>
          <ul className="features-list">
            <li>Your Full Natal Report</li>
            <li>Daily + Weekly + Monthly horoscopes</li>
            <li>2 Full Natal or Compatibility Reports per month </li>
            <li>10 Quick Chart Overviews or Quick Compatibility Scores per month</li>
            <li>200 AI chat questions per month about your chart, your horoscopes or relationships</li>
          </ul>
        </div>

        <div className="pricing-card pro">
          <h3>Pro</h3>
          <div className="price">$49<span>/mo</span></div>
          <p className="description">For coaches & power users.</p>
          <ul className="features-list">
            <li>Everything in Premium</li>
            <li>10 Full Natal or Compatibility Reports/mo (roll for 3 months)</li>
            <li>Unlimited Quick Chart Overviews or Compatibility Scores</li>
            <li>Unlinited AI Chat</li>
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