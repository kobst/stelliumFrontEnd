import React, { useState, useEffect } from 'react';
import stelliumIcon from '../../assets/StelliumIcon.svg';
import '../../pages/LandingPage.css';

const aiReplies = [
  "Your Mercury in Gemini suggests exceptional communication skills and a quick, versatile mind...",
  "With Venus in your 7th house, relationships take center stage in your life journey...",
  "Your rising sign in Leo gives you a natural charisma that draws others to you...",
  "The current Jupiter transit through your career house signals major opportunities ahead..."
];

export default function DemoSection() {
  const [currentReply, setCurrentReply] = useState(0);
  const [horoscopeFlipped, setHoroscopeFlipped] = useState(false);

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

  return (
    <section className="demo-section">
      <div className="demo-container">
        <div className="demo-item">
          <h3>Ask Anything About Your Chart</h3>
          <div className="chat-demo">
            <div className="chat-bubble user">
              What does my Venus placement say about love?
            </div>
            <div className="chat-bubble ai typing">
              <span className="typing-text">{aiReplies[currentReply]}</span>
              <span className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </span>
            </div>
          </div>
        </div>

        <div className="demo-item">
          <h3>Your Daily Cosmic Guidance</h3>
          <div className={`horoscope-card ${horoscopeFlipped ? 'flipped' : ''}`}>
            <div className="card-face card-front">
              <div className="card-header">Today's Energy</div>
              <div className="card-content">
                <div className="transit-info">☽ Moon in Pisces</div>
                <p>Intuition runs high today. Trust your gut feelings in creative projects.</p>
              </div>
            </div>
            <div className="card-face card-back">
              <div className="card-header">Tomorrow's Focus</div>
              <div className="card-content">
                <div className="transit-info">☿ Mercury trine Mars</div>
                <p>Perfect for important conversations. Your words carry extra power.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 