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
          All users use credits for in-depth analyses.<br />
          Free and Plus determine how much guidance you get by default — and how many credits you receive each month.
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
            <li>Unlimited chart & relationship creation</li>
            <li>10 credits per month</li>
            <li>Buy credits anytime</li>
            <li>No credit card required</li>
          </ul>

          <button className="pricing-cta" onClick={handleGetStarted}>Get Started Free</button>
        </div>

        <div className="pricing-card premium">
          <div className="popular-badge">Most Popular</div>
          <h3>Plus</h3>
          <div className="price">$20<span>/mo</span></div>
          <p className="description">Daily guidance + monthly credits.</p>

          <ul className="features-list">
            <li>Daily, Weekly & Monthly horoscopes</li>
            <li>Everything in Free</li>
            <li>200 credits per month</li>
            <li>Best value for ongoing insight</li>
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
              <td>—</td>
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
