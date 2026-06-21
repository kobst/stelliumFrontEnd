/**
 * @deprecated 2026-05-13 — Replaced by the Stellium home redesign.
 *   New equivalent: the Pricing section in `src/pages/LandingPage.js`
 *   (`.lp-plans` 3-plan grid + `.lp-compare` table with Free / Plus / One-credit
 *   columns). CTAs still wire to `useCheckout` the same way.
 *   No longer imported anywhere. Safe to delete.
 */
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
      navigate('/birthChartEntry?intent=plus');
    }
  };

  const handleBuyCredits = () => {
    navigate('/birthChartEntry?intent=creditPack');
  };

  return (
    <section className="pricing-section">
      <div className="pricing-header">
        <h2 className="section-title">Choose Your Plan</h2>
        <p className="pricing-subtitle">
          Start with 25 welcome credits, subscribe for included monthly reports,<br />
          or purchase additional credits whenever you need them.
        </p>
      </div>

      {/* Main Plans */}
      <div className="pricing-grid three-col">
        <div className="pricing-card free">
          <h3>Free</h3>
          <div className="price">$0</div>
          <p className="description">Explore your chart and sample features.</p>

          <ul className="features-list">
            <li>Weekly & Monthly horoscopes</li>
            <li>Daily horoscopes available for 1 credit</li>
            <li>Unlimited chart & relationship creation</li>
            <li>25 welcome credits on signup</li>
            <li>Buy credits anytime</li>
            <li>No credit card required</li>
          </ul>

          <button className="pricing-cta" onClick={handleGetStarted}>Get Started Free</button>
        </div>

        <div className="pricing-card premium">
          <div className="popular-badge">Most Popular</div>
          <h3>Plus</h3>
          <div className="price">$20<span>/mo</span></div>
          <p className="description">Everyday guidance + included reports.</p>

          <ul className="features-list">
            <li>Daily, Weekly & Monthly horoscopes</li>
            <li>Everything in Free</li>
            <li>3 full reports per billing period</li>
            <li>Ask Stellium included under fair use</li>
          </ul>

          <button className="pricing-cta primary" onClick={handleStartPlus}>Start Plus</button>
        </div>

        <div className="pricing-card credit-pack">
          <h3>Credit Pack</h3>
          <div className="price">$10</div>
          <p className="description">One-time credits. No subscription.</p>

          <ul className="features-list">
            <li>100 credits</li>
            <li>Never expire</li>
            <li>Use for any analysis or question</li>
          </ul>

          <button className="pricing-cta" onClick={handleBuyCredits}>Buy Credits</button>
        </div>
      </div>

      {/* Horoscope Comparison */}
      <div className="horoscope-comparison">
        <h4>Horoscope Access</h4>
        <table className="comparison-table compact">
          <thead>
            <tr>
              <th></th>
              <th>Free</th>
              <th className="highlight-col">Plus</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Daily Horoscope</td>
              <td>1 credit</td>
              <td className="check">✓</td>
            </tr>
            <tr>
              <td>Weekly Horoscope</td>
              <td className="check">✓</td>
              <td className="check">✓</td>
            </tr>
            <tr>
              <td>Monthly Horoscope</td>
              <td className="check">✓</td>
              <td className="check">✓</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* How Credits Work */}
      <div className="credits-card">
        <h4>How Credits Work</h4>
        <div className="credits-table">
          <div className="credits-row">
            <span>Full Birth Chart Analysis</span>
            <span className="credit-amount">75 credits</span>
          </div>
          <div className="credits-row">
            <span>Relationship Analysis</span>
            <span className="credit-amount">60 credits</span>
          </div>
          <div className="credits-row">
            <span>Ask Stellium (1 question)</span>
            <span className="credit-amount">1 credit</span>
          </div>
        </div>
      </div>
    </section>
  );
}
