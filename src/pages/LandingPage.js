import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';
import lightLogo from '../assets/Light logo.png';
import whiteLine from '../assets/whiteline.png';
import FeaturesSection from '../UI/landingPage/FeatureCards';
import SocialProof from '../UI/landingPage/SocialProof';
import PricingSection from '../UI/landingPage/PricingSection';
import DemoSection from '../UI/landingPage/DemoSection';

const LandingPage = () => {
  const navigate = useNavigate();
  const [horoscopeFlipped, setHoroscopeFlipped] = useState(false);
  const [currentReply, setCurrentReply] = useState(0);
  const [email, setEmail] = useState('');
  const [showThankYou, setShowThankYou] = useState(false);

  // AI chat animation replies
  const aiReplies = [
    "Your Mercury in Gemini suggests exceptional communication skills and a quick, versatile mind...",
    "With Venus in your 7th house, relationships take center stage in your life journey...",
    "Your rising sign in Leo gives you a natural charisma that draws others to you...",
    "The current Jupiter transit through your career house signals major opportunities ahead..."
  ];

  // Rotate through AI replies
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentReply((prev) => (prev + 1) % aiReplies.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Flip horoscope card periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setHoroscopeFlipped((prev) => !prev);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleDiscoverMe = () => {
    navigate('/signUp');
  };

  const handleCelebMatch = () => {
    navigate('/celebs');
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
                <h3 className="logosubtxt">your personal AI-powered astrologer</h3>
                <h2 className="soon">coming soon</h2>
          </div>
          <div className="hero-buttons">
            <button className="cta-button primary" onClick={handleDiscoverMe}>
              Discover Me
            </button>
            <button className="cta-button secondary" onClick={handleCelebMatch}>
              Celeb Match
            </button>
          </div>
        </div>
      </section>

      {/* Instant Demo Row */}
      {/* <DemoSection /> */}

      {/* Feature Grid */}
      <section className="features-section">

        <FeaturesSection />
      </section>

      <SocialProof />

      <PricingSection />

      {/* SEO Footer with Email Capture */}
      <footer className="footer-section">
        <div className="footer-content">
          <div className="footer-main">
            <h3>Get Weekly Transit Tips</h3>
            <p>Join thousands getting personalized astrological insights every week</p>
            <form className="email-form" onSubmit={handleEmailSubmit}>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button type="submit" className="email-submit-btn">
                Subscribe
              </button>
            </form>
            {showThankYou && (
              <p className="thank-you-message">Thank you for subscribing!</p>
            )}
          </div>

          <div className="footer-links">
            <div className="link-column">
              <h4>Product</h4>
              <ul>
                <li><a href="#features">Features</a></li>
                <li><a href="#pricing">Pricing</a></li>
                <li><a href="#how-it-works">How It Works</a></li>
              </ul>
            </div>
            <div className="link-column">
              <h4>Company</h4>
              <ul>
                <li><a href="#about">About</a></li>
                <li><a href="#blog">Blog</a></li>
                <li><a href="#contact">Contact</a></li>
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