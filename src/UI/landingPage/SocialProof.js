import React from 'react';

export default function SocialProof() {
  return (
    <section className="social-proof-section">
      <h2 className="section-title">Loved by Cosmic Seekers Everywhere</h2>
      <div className="testimonials-grid">
        <div className="testimonial">
          <div className="stars">⭐⭐⭐⭐⭐</div>
          <p className="quote">
            "Finally, astrology that actually makes sense! The AI explanations are 
            mind-blowing and spot-on. I check my daily transit report every morning."
          </p>
          <p className="author">- Sarah M., Verified User</p>
        </div>

        <div className="testimonial featured">
          <div className="stars">⭐⭐⭐⭐⭐</div>
          <p className="quote">
            "I've been studying astrology for years, and Stellium's AI insights still 
            surprise me. It's like having a master astrologer in your pocket 24/7."
          </p>
          <p className="author">- @AstroInfluencer, 50K followers</p>
        </div>

        <div className="testimonial">
          <div className="stars">⭐⭐⭐⭐⭐</div>
          <p className="quote">
            "The celebrity matching is addictive! Found out I share the same Moon-Venus 
            aspect as my favorite artist. The compatibility reports are incredibly detailed."
          </p>
          <p className="author">- Marcus T., Beta Tester</p>
        </div>
      </div>
    </section>
  );
} 