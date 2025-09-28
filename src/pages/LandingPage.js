import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';
import lightLogo from '../assets/Light logo.png';
import whiteLine from '../assets/whiteline.png';
import ThreePillarsSection from '../UI/landingPage/FeatureCards';
import ObjectionBusterSection from '../UI/landingPage/ObjectionBusterSection';
import HowItWorksSection from '../UI/landingPage/HowItWorksSection';
import FeatureGridSection from '../UI/landingPage/FeatureGridSection';
import PricingSection from '../UI/landingPage/PricingSection';
import CTABand from '../UI/landingPage/CTABand';

const LandingPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [showThankYou, setShowThankYou] = useState(false);

  const handleDiscoverMe = () => {
    navigate('/birthChartEntry');
  };

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    if (email) {
      console.log('Email submitted:', email);
      setShowThankYou(true);
      setTimeout(() => setShowThankYou(false), 3000);
      setEmail('');
    }
  };

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <img className="hero-logo" src={lightLogo} alt="Stellium logo" />
          <div className="maintxt mont-font">
            <h1 className="logotxt">STELLIUM</h1>
            <h3 className="logosubtxt">Personalized Astrology, Powered by AI</h3>
          </div>
          <p className="hero-subtitle">Birth chart insights, relationship reports, custom horoscopes...<br />and your own AI astrologer to answer your most personal questions</p>
          <div className="hero-buttons">
            <button className="cta-button primary" onClick={handleDiscoverMe}>
              Get My Short Personality Overview
            </button>
          </div>
        </div>
      </section>

      {/* 3 Pillars */}
      <ThreePillarsSection />

      {/* CTA after pillars */}
      <CTABand />

      {/* Objection Buster */}
      {/* <ObjectionBusterSection /> */}

      {/* How it Works */}
      <HowItWorksSection />

      {/* Feature Grid */}
      <FeatureGridSection />

      {/* Pricing */}
      <PricingSection />

      {/* CTA after pricing */}
      <CTABand />

      {/* SEO Footer with Email Capture */}
      <footer className="footer-section">
        <div className="footer-content">

          <div className="footer-links">
            <div className="link-column">
              <h4>Contact</h4>
              <ul>
                <li><a href="mailto:hello@stellium.ai">hello@stellium.ai</a></li>
              </ul>
            </div>
            <div className="link-column">
              <h4>Legal</h4>
              <ul>
                <li><a href="/privacy-policy">Privacy Policy</a></li>
                <li><a href="/terms-of-service">Terms of Service</a></li>
              </ul>
            </div>
            {/* <div className="link-column">
              <h4>Resources</h4>
              <ul>
                <li><a href="#astrology-guide">Astrology Guide</a></li>
                <li><a href="#birth-chart-101">Birth Chart 101</a></li>
                <li><a href="#celebrity-charts">Celebrity Charts</a></li>
              </ul>
            </div> */}
          </div>

          <div className="footer-bottom">
            <img src={whiteLine} alt="" className="footer-line" />
            <p className="copyright">© 2024 Stellium. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
