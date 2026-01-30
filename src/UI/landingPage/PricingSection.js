import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function PricingSection({ onStartPlus, onGetStarted }) {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (onGetStarted) {
      onGetStarted();
    } else {
      navigate('/birthChartEntry');
    }
  };

  const handleStartPlus = () => {
    if (onStartPlus) {
      onStartPlus();
    } else {
      // Default: navigate to signup with upgrade intent
      navigate('/birthChartEntry?intent=plus');
    }
  };

  return (
    <section className="pricing-section">
      <div className="pricing-header">
        <h2 className="section-title">Choose Your Plan</h2>
        <p className="pricing-subtitle">Unlock deeper self-knowledge with the plan that fits your journey.</p>
      </div>

      {/* Main Subscription Plans */}
      <div className="pricing-grid">
        <div className="pricing-card free">
          <h3>Free</h3>
          <div className="price">$0</div>
          <p className="description">Dip your toes in the stars — no credit card required.</p>

          <ul className="features-list">
            <li>Weekly &amp; Monthly horoscopes</li>
            <li>Unlimited birth chart creation &amp; overviews</li>
            <li>Unlimited relationship creation &amp; scores</li>
            <li>No credit card required</li>
          </ul>

          <button className="pricing-cta" onClick={handleGetStarted}>Get Started Free</button>
        </div>

        <div className="pricing-card premium">
          <div className="popular-badge">Most Popular</div>
          <h3>Plus</h3>
          <div className="price">$20<span>/mo</span></div>
          <p className="description">Everything in Free, plus:</p>

          <ul className="features-list">
            <li className="feature-highlight">Your complete Birth Chart 360° Analysis — generated on signup</li>
            <li>Daily personalized horoscope</li>
            <li>3 deep readings per month (birth chart or relationship)</li>
            <li>50 Ask Stellium AI questions per month</li>
            <li>40% off additional readings</li>
          </ul>

          <button className="pricing-cta primary" onClick={handleStartPlus}>Start Plus</button>
          <p className="pricing-small-print">Cancel anytime. Keep everything you've generated.</p>
        </div>
      </div>

      {/* A La Carte Section */}
      <div className="credit-packs-section">
        <h3>Individual Readings</h3>
        <p className="credit-packs-subtitle">Available to all users. Plus members save 40%.</p>

        <div className="credit-packs-grid">
          <div className="credit-pack-card">
            <div className="pack-name">Birth Chart 360°</div>
            <div className="pack-pricing-row">
              <span className="pack-tier">Free: <strong>$20</strong></span>
              <span className="pack-divider">•</span>
              <span className="pack-tier">Plus: <strong className="plus-price">$12</strong></span>
            </div>
            <div className="pack-description">Complete natal analysis</div>
            <ul className="pack-details">
              <li>Includes 5 AI questions</li>
              <li>Yours forever</li>
            </ul>
          </div>

          <div className="credit-pack-card">
            <div className="pack-name">Relationship 360°</div>
            <div className="pack-pricing-row">
              <span className="pack-tier">Free: <strong>$10</strong></span>
              <span className="pack-divider">•</span>
              <span className="pack-tier">Plus: <strong className="plus-price">$6</strong></span>
            </div>
            <div className="pack-description">Synastry &amp; composite insights</div>
            <ul className="pack-details">
              <li>Includes 5 AI questions</li>
              <li>Yours forever</li>
            </ul>
          </div>

          <div className="credit-pack-card">
            <div className="pack-name">Question Pack</div>
            <div className="pack-pricing-row">
              <span className="pack-tier"><strong>$10</strong> for 10</span>
            </div>
            <div className="pack-description">Ask Stellium questions</div>
            <ul className="pack-details">
              <li>Use on any unlocked content</li>
              <li>Never expires</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Microcopy */}
      <div className="pricing-microcopy">
        All unlocked analyses are yours forever — even if you cancel.
      </div>

      {/* Comparison Table */}
      <div className="comparison-table-section">
        <table className="comparison-table">
          <thead>
            <tr>
              <th>Feature</th>
              <th>Free</th>
              <th className="highlight-col">Plus</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Horoscopes</td>
              <td>Weekly &amp; Monthly</td>
              <td>Daily, Weekly &amp; Monthly</td>
            </tr>
            <tr>
              <td>Birth chart creation &amp; overviews</td>
              <td>Unlimited</td>
              <td>Unlimited</td>
            </tr>
            <tr>
              <td>Relationship creation &amp; scores</td>
              <td>Unlimited</td>
              <td>Unlimited</td>
            </tr>
            <tr>
              <td>Welcome Birth Chart 360° Analysis</td>
              <td>—</td>
              <td>Included</td>
            </tr>
            <tr>
              <td>Deep readings per month</td>
              <td>—</td>
              <td>3</td>
            </tr>
            <tr>
              <td>Ask Stellium AI questions</td>
              <td>—</td>
              <td>50 / month</td>
            </tr>
            <tr>
              <td>A la carte discount</td>
              <td>—</td>
              <td>40% off</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
