import React from 'react';
import './PrivacyPolicy.css';

const PrivacyPolicy = () => {
  return (
    <div className="privacy-policy-page">
      <div className="policy-container">
        <h1>Privacy Policy</h1>
        <p className="last-updated">Last updated: {new Date().toLocaleDateString()}</p>
        
        <section className="policy-section">
          <h2>1. Information We Collect</h2>
          <h3>Personal Information</h3>
          <ul>
            <li>Birth date, time, and location for astrological chart generation</li>
            <li>Email address for account creation and communication</li>
            <li>Name (optional) for personalized experience</li>
            <li>Profile information you choose to provide</li>
          </ul>
          
          <h3>Usage Information</h3>
          <ul>
            <li>Chat interactions with our AI astrologer</li>
            <li>Features used and time spent on the platform</li>
            <li>Device information and browser type</li>
            <li>IP address and general location data</li>
          </ul>
        </section>

        <section className="policy-section">
          <h2>2. How We Use Your Information</h2>
          <ul>
            <li>Generate personalized astrological charts and interpretations</li>
            <li>Provide AI-powered astrological insights and guidance</li>
            <li>Improve our services and develop new features</li>
            <li>Send important updates about your account and our services</li>
            <li>Respond to your questions and provide customer support</li>
            <li>Protect against fraud and ensure platform security</li>
          </ul>
        </section>

        <section className="policy-section">
          <h2>3. Information Sharing</h2>
          <p>We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:</p>
          <ul>
            <li>With your explicit consent</li>
            <li>To comply with legal obligations or court orders</li>
            <li>To protect our rights, property, or safety, or that of our users</li>
            <li>With service providers who help us operate our platform (under strict confidentiality agreements)</li>
          </ul>
        </section>

        <section className="policy-section">
          <h2>4. Data Security</h2>
          <p>We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no internet transmission is 100% secure, and we cannot guarantee absolute security.</p>
        </section>

        <section className="policy-section">
          <h2>5. Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access the personal information we hold about you</li>
            <li>Request correction of inaccurate or incomplete information</li>
            <li>Request deletion of your account and associated data</li>
            <li>Object to processing of your personal information</li>
            <li>Request data portability</li>
            <li>Withdraw consent at any time</li>
          </ul>
        </section>

        <section className="policy-section">
          <h2>6. Cookies and Tracking</h2>
          <p>We use cookies and similar tracking technologies to:</p>
          <ul>
            <li>Remember your preferences and settings</li>
            <li>Analyze site usage and improve our services</li>
            <li>Provide personalized content and advertisements</li>
          </ul>
          <p>You can control cookie settings through your browser preferences.</p>
        </section>

        <section className="policy-section">
          <h2>7. Children's Privacy</h2>
          <p>Our service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.</p>
        </section>

        <section className="policy-section">
          <h2>8. International Data Transfers</h2>
          <p>Your information may be processed and stored in countries other than your own. We ensure appropriate safeguards are in place to protect your data in accordance with applicable privacy laws.</p>
        </section>

        <section className="policy-section">
          <h2>9. Changes to This Policy</h2>
          <p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.</p>
        </section>

        <section className="policy-section">
          <h2>10. Contact Us</h2>
          <p>If you have any questions about this Privacy Policy, please contact us at:</p>
          <p>Email: admin@stellium.app</p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;