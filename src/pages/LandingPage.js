import React, { useState, useEffect, useRef, useCallback } from 'react';
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
import AskStelliumShowcase from '../UI/landingPage/AskStelliumShowcase';
import CelebrityRelationshipsSection from '../UI/landingPage/CelebrityRelationshipsSection';
import PricingSection from '../UI/landingPage/PricingSection';
import { useAuth } from '../context/AuthContext';
import { useCheckout } from '../hooks/useCheckout';
import { ZODIAC_SIGNS } from '../Utilities/zodiac';
import { trackLandingCTAClicked } from '../Utilities/analytics';

const LandingPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [showThankYou, setShowThankYou] = useState(false);
  
  const { stelliumUser } = useAuth();
  const checkout = useCheckout(stelliumUser);

  const handleDiscoverMe = () => {
    trackLandingCTAClicked('discover_me');
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
    trackLandingCTAClicked('start_plus');
    if (stelliumUser) {
      checkout.startSubscription();
    } else {
      navigate('/birthChartEntry?intent=plus');
    }
  };

  // Scroll fade-in observer
  const fadeRef = useRef([]);
  const addFadeRef = useCallback((el) => {
    if (el && !fadeRef.current.includes(el)) fadeRef.current.push(el);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    fadeRef.current.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const handleGetStarted = () => {
    trackLandingCTAClicked('get_started');
    if (stelliumUser) {
      navigate(`/dashboard/${stelliumUser._id}`);
    } else {
      navigate('/birthChartEntry');
    }
  };

  const handleSignPick = (sign) => {
    navigate(`/horoscopes/weekly/${sign}`);
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
          <p className="hero-subtitle">Birth chart analysis, relationship reports, custom horoscopes...<br />and <a href="#ask-stellium" className="hero-subtitle__link">your own AI astrologer</a> to answer your most personal questions</p>
          <div className="hero-buttons">
            <CTABand onGetStarted={handleGetStarted} />
            <div className="hero-sign-picker">
              <p className="hero-sign-picker__label">Read This Week&apos;s Horoscope — Pick Your Sign</p>
              <div className="hero-sign-picker__grid">
                {ZODIAC_SIGNS.map((sign) => (
                  <button
                    key={sign.value}
                    type="button"
                    className="hero-sign-picker__pill"
                    onClick={() => handleSignPick(sign.value)}
                    aria-label={sign.label}
                    aria-pressed="false"
                  >
                    <img
                      src={`/assets/signs/${sign.value}.svg`}
                      alt=""
                      aria-hidden="true"
                      className="hero-sign-picker__icon"
                    />
                    <span>{sign.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Pillars */}
      <div ref={addFadeRef} className="fade-in-section">
        <FourPillarsSection />
      </div>

      {/* Ask Stellium Showcase */}
      <div ref={addFadeRef} className="fade-in-section">
        <AskStelliumShowcase />
      </div>

      {/* CTA after pillars */}
      <CTABand />

      {/* Celebrity Charts Section */}
      <div ref={addFadeRef} className="fade-in-section">
        <CelebrityChartsSection />
      </div>

      {/* Celebrity Relationships Section */}
      <div ref={addFadeRef} className="fade-in-section">
        <CelebrityRelationshipsSection />
      </div>

      {/* How it Works */}
      <div ref={addFadeRef} className="fade-in-section">
        <HowItWorksSection />
      </div>

      {/* Pricing */}
      <div ref={addFadeRef} className="fade-in-section">
        <PricingSection onStartPlus={handleStartPlus} onGetStarted={handleGetStarted} />
      </div>

      {/* CTA after pricing */}
      <CTABand showTitle={true} />

      {/* SEO Footer with Email Capture */}
      <footer className="footer-section">
        <div className="footer-content">

          <div className="footer-brand">
            <img src={stelliumIcon} alt="Stellium" className="footer-brand__logo" />
            <span className="footer-brand__name">STELLIUM</span>
            <p className="footer-brand__tagline">Personalized Astrology, Powered by AI</p>
          </div>

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
