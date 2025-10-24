import React from 'react';

export default function PricingSection() {
  return (
    <section className="pricing-section">
      <div className="pricing-header">
        <h2 className="section-title">Choose Your Plan</h2>
        <p className="pricing-subtitle">Every insight powered by Stellium Credits</p>
      </div>

      {/* Main Subscription Plans */}
      <div className="pricing-grid">
        <div className="pricing-card free">
          <h3>Free</h3>
          <div className="price">$0</div>
          <p className="description">Dip your toes in the stars</p>

          <div className="credits-highlight">
            <div className="credits-amount">10 credits/month</div>
          </div>

          <div className="credit-budget-section">
            <p className="budget-title">Your 10 credits can get you:</p>
            <ul className="budget-list">
              <li><strong>2 Quick Charts</strong> (5 credits each) OR</li>
              <li><strong>2 Relationship Scores</strong> (5 credits each) OR</li>
              <li><strong>10 Ask Stellium questions</strong> (requires Full Natal or Full Relationship Report)</li>
              <li className="budget-note">...or any combination of the above</li>
            </ul>
          </div>

          <div className="horoscope-access">
            <strong>Horoscopes:</strong> Weekly only
          </div>
        </div>

        <div className="pricing-card premium">
          <div className="popular-badge">Most Popular</div>
          <h3>Premium</h3>
          <div className="price">$19.99<span>/mo</span></div>
          <p className="description">Full access to personalized cosmic insights</p>

          <div className="credits-highlight">
            <div className="credits-amount">200 credits/month</div>
          </div>

          <div className="included-benefit">
            ⭐ Your Full Natal Report included
          </div>

          <div className="credit-budget-section">
            <p className="budget-title">Your 200 credits can get you:</p>
            <ul className="budget-list">
              <li><strong>40 Quick Charts</strong> (5 credits each) OR</li>
              <li><strong>40 Relationship Scores</strong> (5 credits each) OR</li>
              <li><strong>13 Full Natal Reports</strong> (15 credits each) OR</li>
              <li><strong>13 Full Relationship Reports</strong> (15 credits each) OR</li>
              <li><strong>200 Ask Stellium questions</strong></li>
              <li className="budget-note">...or any combination of the above</li>
            </ul>
          </div>

          <div className="horoscope-access">
            <strong>Horoscopes:</strong> Daily + Weekly + Monthly
            <div className="horoscope-detail">Custom horoscopes and transit interpretation with Ask Stellium</div>
          </div>
        </div>

        <div className="pricing-card pro">
          <h3>Pro</h3>
          <div className="price">$49.99<span>/mo</span></div>
          <p className="description">For coaches, astrologers & power users</p>

          <div className="credits-highlight">
            <div className="credits-amount">1000 credits/month</div>
          </div>

          <div className="included-benefit">
            ⭐ Your Full Natal Report included
          </div>

          <div className="credit-budget-section">
            <p className="budget-title">Your 1000 credits can get you:</p>
            <ul className="budget-list">
              <li><strong>200 Quick Charts</strong> (5 credits each) OR</li>
              <li><strong>200 Relationship Scores</strong> (5 credits each) OR</li>
              <li><strong>66 Full Natal Reports</strong> (15 credits each) OR</li>
              <li><strong>66 Full Relationship Reports</strong> (15 credits each) OR</li>
              <li><strong>1000 Ask Stellium questions</strong></li>
              <li className="budget-note">...or any combination of the above</li>
            </ul>
          </div>

          <div className="horoscope-access">
            <strong>Horoscopes:</strong> Daily + Weekly + Monthly
            <div className="horoscope-detail">Custom horoscopes and transit interpretation with Ask Stellium</div>
          </div>
        </div>
      </div>

      {/* Credit Cost Reference Table */}
      <div className="credit-reference-section">
        <h3 className="credit-reference-title">How Stellium Credits Work</h3>
        <p className="credit-reference-subtitle">Use credits for any reports or insights you want to generate</p>

        <div className="credit-reference-grid">
          <div className="credit-reference-item">
            <div className="credit-cost">5 credits</div>
            <div className="credit-action">Quick Chart Overview</div>
            <div className="credit-description">Lightweight chart summary</div>
          </div>

          <div className="credit-reference-item">
            <div className="credit-cost">15 credits</div>
            <div className="credit-action">Full Natal Report</div>
            <div className="credit-description">Complete birth chart analysis</div>
          </div>

          <div className="credit-reference-item">
            <div className="credit-cost">5 credits</div>
            <div className="credit-action">Relationship Overview</div>
            <div className="credit-description">Compatibility score & summary</div>
          </div>

          <div className="credit-reference-item">
            <div className="credit-cost">15 credits</div>
            <div className="credit-action">Full Relationship Report</div>
            <div className="credit-description">Detailed compatibility analysis</div>
          </div>

          <div className="credit-reference-item">
            <div className="credit-cost">1 credit</div>
            <div className="credit-action">Ask Stellium Q&A</div>
            <div className="credit-description">Per question (Premium/Pro only)</div>
          </div>
        </div>

        <div className="credit-note">
          Note: Horoscopes are not credit-based and are included automatically with your plan tier
        </div>
      </div>

      {/* A-la-carte Credit Packs */}
      <div className="credit-packs-section">
        <h3>Need More Credits?</h3>
        <p className="credit-packs-subtitle">Top-up anytime with one-time credit packs</p>

        <div className="credit-packs-grid">
          <div className="credit-pack-card">
            <div className="pack-name">Small Pack</div>
            <div className="pack-credits">20 credits</div>
            <div className="pack-price">$7.99</div>
            <div className="pack-translation">~1 Full Report + extras</div>
          </div>

          <div className="credit-pack-card highlight">
            <div className="pack-badge">Best Value</div>
            <div className="pack-name">Medium Pack</div>
            <div className="pack-credits">100 credits</div>
            <div className="pack-price">$24.99</div>
            <div className="pack-translation">~6 Full Reports</div>
          </div>

          <div className="credit-pack-card">
            <div className="pack-name">Large Pack</div>
            <div className="pack-credits">300 credits</div>
            <div className="pack-price">$49.99</div>
            <div className="pack-translation">~20 Full Reports</div>
          </div>
        </div>

        <div className="credit-packs-benefits">
          Credits never expire • Stack with your plan • No subscription required
        </div>
      </div>

      {/* Microcopy */}
      <div className="pricing-microcopy">
        Cancel anytime • Credits never expire • Works without a birth time
      </div>
    </section>
  );
} 