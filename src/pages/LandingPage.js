import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';
import stelliumIcon from '../assets/StelliumIcon.svg';
import whiteLine from '../assets/whiteline.png';
import FourPillarsSection from '../UI/landingPage/FeatureCards';
import ObjectionBusterSection from '../UI/landingPage/ObjectionBusterSection';
import HowItWorksSection from '../UI/landingPage/HowItWorksSection';
import FeatureGridSection from '../UI/landingPage/FeatureGridSection';
import CTABand from '../UI/landingPage/CTABand';
import CelebrityChartsSection from '../UI/landingPage/CelebrityChartsSection';
import PricingSection from '../UI/landingPage/PricingSection';
import { useAuth } from '../context/AuthContext';
import { useCheckout } from '../hooks/useCheckout';

const LandingPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [showThankYou, setShowThankYou] = useState(false);
  
  const { stelliumUser } = useAuth();
  const checkout = useCheckout(stelliumUser);

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

  const handleStartPlus = () => {
    if (stelliumUser) {
      // Logged in - go directly to Stripe checkout
      checkout.startSubscription();
    } else {
      // Not logged in - go to signup with upgrade intent
      navigate('/birthChartEntry?intent=plus');
    }
  };

  const handleGetStarted = () => {
    if (stelliumUser) {
      navigate(`/dashboard/${stelliumUser._id}`);
    } else {
      navigate('/birthChartEntry');
    }
  };

  return (
    <div className="landing-page">
      {/* Sticky Nav */}
      <nav className="landing-nav">
        <div className="landing-nav__inner">
          <a href="/" className="landing-nav__logo">
            <img src={stelliumIcon} alt="Stellium" className="landing-nav__logo-img" />
            <span className="landing-nav__wordmark">STELLIUM</span>
          </a>
          <div className="landing-nav__actions">
            {stelliumUser ? (
              <button
                className="landing-nav__link"
                onClick={() => navigate(`/dashboard/${stelliumUser._id}`)}
              >
                Go to Dashboard
              </button>
            ) : (
              <>
                <button
                  className="landing-nav__link"
                  onClick={() => navigate('/login')}
                >
                  Sign In
                </button>
                <button
                  className="landing-nav__btn"
                  onClick={() => navigate('/birthChartEntry')}
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <img className="hero-logo" src={stelliumIcon} alt="Stellium logo" />
          <div className="maintxt mont-font">
            <h1 className="logotxt">STELLIUM</h1>
            <h3 className="logosubtxt">Personalized Astrology, Powered by AI</h3>
          </div>
          <p className="hero-subtitle">Birth chart analysis, relationship reports, custom horoscopes...<br />and your own AI astrologer to answer your most personal questions</p>
          <div className="hero-buttons">
           <CTABand onGetStarted={handleGetStarted} />
          </div>
        </div>
      </section>

      {/* 4 Pillars */}
      <FourPillarsSection />

      {/* CTA after pillars */}
      <CTABand />

      {/* Celebrity Charts Section */}
      <CelebrityChartsSection />

      {/* Objection Buster */}
      {/* <ObjectionBusterSection /> */}

      {/* How it Works */}
      <HowItWorksSection />

      {/* Feature Grid */}
      {/* <FeatureGridSection /> */}

      {/* Pricing */}
      <PricingSection onStartPlus={handleStartPlus} onGetStarted={handleGetStarted} />

      {/* CTA after pricing */}
      <CTABand showTitle={true} />

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
                <li><a href="/help">Help Center</a></li>
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
            <p className="copyright">© 2026 Stellium. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
