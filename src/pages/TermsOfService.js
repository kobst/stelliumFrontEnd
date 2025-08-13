import React from 'react';
import './TermsOfService.css';

const TermsOfService = () => {
  return (
    <div className="terms-of-service-page">
      <div className="terms-container">
        <h1>Terms of Service</h1>
        <p className="last-updated">Last updated: {new Date().toLocaleDateString()}</p>
        
        <section className="terms-section">
          <h2>1. Acceptance of Terms</h2>
          <p>By accessing and using Stellium ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.</p>
        </section>

        <section className="terms-section">
          <h2>2. Description of Service</h2>
          <p>Stellium is an AI-powered astrology platform that provides:</p>
          <ul>
            <li>Personalized birth chart generation and analysis</li>
            <li>AI-powered astrological interpretations and insights</li>
            <li>Relationship compatibility analysis</li>
            <li>Transit and horoscope information</li>
            <li>Celebrity chart comparisons</li>
          </ul>
          <p>Our service is for entertainment and self-reflection purposes only and should not replace professional advice.</p>
        </section>

        <section className="terms-section">
          <h2>3. User Accounts and Registration</h2>
          <ul>
            <li>You must provide accurate and complete birth information for chart generation</li>
            <li>You are responsible for maintaining the confidentiality of your account</li>
            <li>You must be at least 13 years old to use this service</li>
            <li>One person may not maintain multiple accounts</li>
            <li>We reserve the right to terminate accounts that violate these terms</li>
          </ul>
        </section>

        <section className="terms-section">
          <h2>4. Acceptable Use</h2>
          <p>You agree not to:</p>
          <ul>
            <li>Use the service for any unlawful purpose or to solicit others to perform unlawful acts</li>
            <li>Violate any local, state, national, or international laws or regulations</li>
            <li>Transmit, or procure the sending of, any advertising or promotional material without our prior written consent</li>
            <li>Impersonate or attempt to impersonate the company, our employees, another user, or any other person or entity</li>
            <li>Use the service in any manner that could disable, overburden, damage, or impair the site</li>
            <li>Use any automated system to access the service</li>
          </ul>
        </section>

        <section className="terms-section">
          <h2>5. Intellectual Property</h2>
          <p>The Service and its original content, features, and functionality are and will remain the exclusive property of Stellium and its licensors. The service is protected by copyright, trademark, and other laws. Our trademarks and trade dress may not be used without our prior written consent.</p>
        </section>

        <section className="terms-section">
          <h2>6. User Content</h2>
          <ul>
            <li>You retain ownership of content you submit to the service</li>
            <li>By submitting content, you grant us a worldwide, royalty-free license to use, modify, and display your content in connection with the service</li>
            <li>You represent that you own or have the necessary rights to submit your content</li>
            <li>We reserve the right to remove content that violates these terms</li>
          </ul>
        </section>

        <section className="terms-section">
          <h2>7. Privacy</h2>
          <p>Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the Service, to understand our practices.</p>
        </section>

        <section className="terms-section">
          <h2>8. Disclaimers</h2>
          <p><strong>Entertainment Purpose:</strong> Astrological interpretations and insights provided by Stellium are for entertainment and self-reflection purposes only. They should not be considered as professional advice for medical, legal, financial, or other important life decisions.</p>
          <p><strong>No Warranties:</strong> The service is provided "as is" without any representations or warranties, express or implied. We make no representations or warranties in relation to this website or the information and materials provided.</p>
        </section>

        <section className="terms-section">
          <h2>9. Limitation of Liability</h2>
          <p>In no event shall Stellium, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of the service.</p>
        </section>

        <section className="terms-section">
          <h2>10. Termination</h2>
          <p>We may terminate or suspend your account and bar access to the service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever, including without limitation if you breach the Terms.</p>
        </section>

        <section className="terms-section">
          <h2>11. Governing Law</h2>
          <p>These Terms shall be interpreted and governed by the laws of the jurisdiction in which Stellium operates, without regard to its conflict of law provisions.</p>
        </section>

        <section className="terms-section">
          <h2>12. Changes to Terms</h2>
          <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days notice prior to any new terms taking effect.</p>
        </section>

        <section className="terms-section">
          <h2>13. Contact Information</h2>
          <p>If you have any questions about these Terms of Service, please contact us at:</p>
          <p>Email: support@stellium.app</p>
        </section>
      </div>
    </div>
  );
};

export default TermsOfService;