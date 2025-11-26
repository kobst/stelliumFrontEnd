import React from 'react';
import './HelpCenter.css';

const HelpCenter = () => {
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="help-center-page">
      <div className="help-container">
        <h1>Stellium Help Center</h1>
        <p className="welcome-text">Welcome to the Stellium Help Center. Below you'll find answers to the most common questions about charts, relationships, credits, chat, subscriptions, and your account.</p>

        {/* Navigation Menu */}
        <nav className="help-nav">
          <button onClick={() => scrollToSection('birth-charts')}>Birth Charts</button>
          <button onClick={() => scrollToSection('relationships')}>Relationships</button>
          <button onClick={() => scrollToSection('chat')}>Chat</button>
          <button onClick={() => scrollToSection('credits')}>Credits & Usage</button>
          <button onClick={() => scrollToSection('subscriptions')}>Subscriptions</button>
          <button onClick={() => scrollToSection('privacy')}>Privacy</button>
          <button onClick={() => scrollToSection('support')}>Support</button>
        </nav>

        {/* Birth Charts Section */}
        <section id="birth-charts" className="help-section">
          <h2>Birth Charts</h2>

          <div className="help-item">
            <h3>What is a Birth Chart?</h3>
            <p>A birth chart (or natal chart) maps the position of the planets at the exact moment and place you were born. Stellium uses your date, time, and location to generate:</p>
            <ul>
              <li>Your chart wheel</li>
              <li>Planetary positions</li>
              <li>House placements</li>
              <li>Aspects</li>
              <li>Sun, Moon, Rising</li>
              <li>A short overview of major astrological themes</li>
            </ul>
            <p>You can create charts for yourself or for friends, family, and partners.</p>
          </div>

          <div className="help-item">
            <h3>What is "Create Birth Chart"?</h3>
            <p>This is the first step in generating a personal astrological profile. After entering birth data, Stellium immediately provides:</p>
            <ul>
              <li>A full chart wheel</li>
              <li>Planet & house positions</li>
              <li>A quick interpretive overview of key themes</li>
              <li>Personality highlights</li>
              <li>Strengths & notable placements</li>
            </ul>
            <p>This overview is fast and lightweight, and appears instantly.</p>
          </div>

          <div className="help-item">
            <h3>Why do I need to create a chart before getting a Full Birth Chart Analysis?</h3>
            <p>Full analyses take much longer (up to several minutes) and require significantly more AI computation. Stellium first needs to:</p>
            <ul>
              <li>Generate the birth chart</li>
              <li>Lock in planetary positions</li>
              <li>Ensure the data is accurate</li>
              <li>Provide a quick overview</li>
            </ul>
            <p>Only then can we generate the deeper report.</p>
          </div>

          <div className="help-item">
            <h3>What is included in the Full Birth Chart Analysis?</h3>
            <p>The full analysis includes:</p>
            <ul>
              <li>A narrative synthesis of your personality</li>
              <li>Planet-by-planet interpretation</li>
              <li>House meanings</li>
              <li>Aspect interpretations</li>
              <li>Patterns, themes, and core dynamics</li>
              <li>360° chart analysis</li>
              <li>Emotional, psychological, and life-path insights</li>
            </ul>
            <p>It is a deep report, often several thousand words long.</p>
          </div>

          <div className="help-item">
            <h3>Can I edit a birth chart after creating it?</h3>
            <p>Not right now.</p>
            <p>Changing birth data after creation could break:</p>
            <ul>
              <li>Synastry & relationship calculations</li>
              <li>Composite charts</li>
              <li>Time-based transits</li>
              <li>Chat history accuracy</li>
              <li>House cusps & angles</li>
              <li>Stored analyses</li>
            </ul>
            <p>If you need to correct a chart: <strong>Delete it → Create a new one with the correct information.</strong></p>
            <p>Safe editing is planned for the future.</p>
          </div>
        </section>

        {/* Relationships & Synastry Section */}
        <section id="relationships" className="help-section">
          <h2>Relationships & Synastry</h2>

          <div className="help-item">
            <h3>What is "Create Relationship"?</h3>
            <p>This step allows you to pair two charts (you + partner, or any two people). Stellium instantly generates:</p>
            <ul>
              <li>Synastry overlay</li>
              <li>Initial compatibility scores</li>
              <li>A quick interpretive overview</li>
              <li>Supportive & challenging patterns</li>
              <li>Composite chart summary</li>
              <li>Top strengths & tensions</li>
            </ul>
            <p>This gives you a fast impression of the relationship dynamics.</p>
          </div>

          <div className="help-item">
            <h3>What comes after creating a relationship?</h3>
            <p>You can optionally generate a Full Relationship Analysis, which includes:</p>
            <p><strong>5 Major Categories:</strong></p>
            <ul>
              <li>Emotional Compatibility</li>
              <li>Communication</li>
              <li>Attraction & Intimacy</li>
              <li>Stability & Long-Term Potential</li>
              <li>Shared Purpose & Growth</li>
            </ul>
            <p><strong>Each Category Includes:</strong></p>
            <ul>
              <li>Synastry Support</li>
              <li>Synastry Challenges</li>
              <li>Composite Support</li>
              <li>Composite Challenges</li>
              <li>Final Synthesis</li>
            </ul>
            <p><strong>Plus:</strong></p>
            <ul>
              <li>Harmony vs challenge radar chart</li>
              <li>Detailed aspect breakdown</li>
              <li>Spark aspects (sexual, transformative, emotional, intellectual, power)</li>
              <li>Keystone aspects</li>
              <li>House overlays</li>
              <li>Weighted scores & patterns</li>
            </ul>
            <p>It's a multi-panel, deeply detailed AI interpretation.</p>
          </div>

          <div className="help-item">
            <h3>Why does the Full Relationship Analysis take several minutes?</h3>
            <p>It merges:</p>
            <ul>
              <li>Synastry analysis</li>
              <li>Composite analysis</li>
              <li>Category scoring</li>
              <li>Aspect significance weights</li>
              <li>Narrative synthesis</li>
              <li>Natural language interpretation</li>
            </ul>
            <p>The system runs dozens of internal processes to ensure the report is correct and complete.</p>
            <p>During processing, you'll see a progress screen. Future updates will also allow:</p>
            <ul>
              <li>Background processing</li>
              <li>Push notification when ready</li>
            </ul>
          </div>
        </section>

        {/* Ask Stellium (Chat) Section */}
        <section id="chat" className="help-section">
          <h2>Ask Stellium (Chat)</h2>

          <div className="help-item">
            <h3>How does the chat system work?</h3>
            <p>Stellium AI can answer questions about:</p>
            <ul>
              <li>Your birth chart</li>
              <li>A relationship</li>
              <li>Your horoscope</li>
              <li>A specific aspect or placement</li>
              <li>Life themes, guidance, emotions, career, love, etc.</li>
            </ul>
            <p>Chats are context-aware and stored per topic.</p>
          </div>

          <div className="help-item">
            <h3>What does the + button do?</h3>
            <p>In chat, the + button lets you select up to 3 astrological elements (aspects, placements, house overlays) to attach to your question.</p>
            <p>This allows deep, accurate questions like:</p>
            <p className="example-question">"What does our Venus–Mars trine mean for our emotional chemistry?"</p>
            <p>Or:</p>
            <p className="example-question">"How does my Sun square Saturn influence my career motivation?"</p>
            <p>This feature is optional — you can ask open-ended questions without selecting elements.</p>
          </div>

          <div className="help-item">
            <h3>Why are there multiple chat threads?</h3>
            <p>Each topic has its own chat:</p>
            <ul>
              <li>Your birth chart</li>
              <li>Each guest chart</li>
              <li>Each relationship</li>
              <li>Your daily horoscope</li>
            </ul>
            <p>This keeps context clean and accurate.</p>
            <p>A future "Chat Hub" will consolidate all threads in one location.</p>
          </div>
        </section>

        {/* Credits & Usage Section */}
        <section id="credits" className="help-section">
          <h2>Credits & Usage</h2>

          <div className="help-item">
            <h3>What are credits?</h3>
            <p>Credits are used for premium features, including:</p>
            <ul>
              <li>Full Birth Chart Analysis</li>
              <li>Full Relationship Analysis</li>
              <li>Ask Stellium (some queries)</li>
              <li>Horoscope deep dives</li>
              <li>Creating additional guest charts (in some subscription tiers)</li>
            </ul>
          </div>

          <div className="help-item">
            <h3>How do credits work?</h3>
            <p>Credits are used for premium features such as:</p>
            <ul>
              <li>Full natal report</li>
              <li>Full relationship report</li>
              <li>Relationship creation</li>
              <li>Asking Stellium AI personalized questions</li>
              <li>Horoscope questions</li>
              <li>Additional chart analyses</li>
            </ul>
            <p>Your credit balance appears:</p>
            <ul>
              <li>In the top-right corner of most screens</li>
              <li>Inside your Profile → Subscription & Purchases</li>
              <li>On the Buy Credits page</li>
            </ul>
          </div>

          <div className="help-item">
            <h3>Do credits expire?</h3>
            <ul>
              <li>Monthly credits auto-renew each subscription cycle and do not carry over</li>
              <li>Purchased credit packs never expire</li>
            </ul>
          </div>

          <div className="help-item">
            <h3>How do I get more credits?</h3>
            <p>You can:</p>
            <ul>
              <li>Buy a credit pack</li>
              <li>Upgrade to a subscription plan</li>
              <li>Use remaining monthly credits (Premium or Pro only)</li>
            </ul>
          </div>
        </section>

        {/* Subscriptions Section */}
        <section id="subscriptions" className="help-section">
          <h2>Subscriptions</h2>

          <div className="help-item">
            <h3>What subscription plans are available?</h3>
            <p>Stellium offers:</p>
            <ul>
              <li><strong>Premium Plan</strong> — 200 monthly credits</li>
              <li><strong>Pro Plan</strong> — 1000 monthly credits</li>
            </ul>
          </div>

          <div className="help-item">
            <h3>What's the difference between credits and subscriptions?</h3>
            <ul>
              <li>Subscriptions give you monthly credits automatically</li>
              <li>Credit packs are one-time purchases that never expire</li>
            </ul>
          </div>

          <div className="help-item">
            <h3>How do I manage my subscription?</h3>
            <p><strong>On iOS:</strong></p>
            <ul>
              <li>Open Settings → Apple ID → Subscriptions</li>
              <li>Select Stellium</li>
              <li>You can cancel or switch plans anytime</li>
            </ul>
            <p><strong>Inside the app:</strong></p>
            <ul>
              <li>Profile → Subscription & Purchases (to view details)</li>
            </ul>
          </div>

          <div className="help-item">
            <h3>What happens if I cancel?</h3>
            <p>You keep access until the current billing period ends.</p>
            <p>All purchased credit packs remain yours forever.</p>
          </div>

          <div className="help-item">
            <h3>Can I change my profile photo?</h3>
            <p>Yes. Long-press your avatar (top right), or tap the "Change Photo" option in the profile modal.</p>
          </div>
        </section>

        {/* Privacy & Security Section */}
        <section id="privacy" className="help-section">
          <h2>Privacy & Security</h2>

          <div className="help-item">
            <h3>Where can I read the Privacy Policy?</h3>
            <p>You can view the Privacy Policy at:</p>
            <p><a href="/privacy-policy" className="help-link">stellium.ai/privacy</a></p>
            <p>The app will link directly to this page.</p>
          </div>

          <div className="help-item">
            <h3>Does Stellium store my birth details?</h3>
            <p>Yes, your chart data is securely stored so that:</p>
            <ul>
              <li>Analyses are preserved</li>
              <li>Chat context remains accurate</li>
              <li>Relationships can be calculated</li>
              <li>Future features (transits, synastry updates) work automatically</li>
            </ul>
            <p><strong>We never sell or share your data.</strong></p>
          </div>

          <div className="help-item">
            <h3>Can I delete my account?</h3>
            <p>You can request account deletion via:</p>
            <p><a href="mailto:support@stellium.ai" className="help-link">support@stellium.ai</a></p>
            <p>A full in-app deletion option is coming.</p>
          </div>
        </section>

        {/* Help & Support Section */}
        <section id="support" className="help-section">
          <h2>Help & Support</h2>

          <div className="help-item">
            <h3>How do I get help?</h3>
            <p>You can contact us anytime:</p>
            <p><a href="mailto:support@stellium.ai" className="help-link">support@stellium.ai</a></p>
            <p>We typically respond within 24–48 hours.</p>
          </div>

          <div className="help-item">
            <h3>Is there a Help Center?</h3>
            <p>Yes — this page is the Help Center.</p>
            <p>You can access it:</p>
            <ul>
              <li>From the Profile modal → Help Center</li>
              <li>From stellium.ai/help</li>
              <li>From bottom navigation (if enabled)</li>
            </ul>
          </div>

          <div className="help-item">
            <h3>Can I request refunds?</h3>
            <p>Refunds for in-app purchases are handled by Apple, not Stellium.</p>
            <p>You can request one through Report a Problem:</p>
            <p><a href="https://support.apple.com/billing" target="_blank" rel="noopener noreferrer" className="help-link">https://support.apple.com/billing</a></p>
          </div>
        </section>

        {/* Still need help? Section */}
        <section className="help-section help-footer">
          <h2>Still need help?</h2>
          <p>We're here for you!</p>
          <p>Send us an email: <a href="mailto:support@stellium.ai" className="help-link">support@stellium.ai</a></p>
          <p>Or reach out through the app.</p>
        </section>
      </div>
    </div>
  );
};

export default HelpCenter;
