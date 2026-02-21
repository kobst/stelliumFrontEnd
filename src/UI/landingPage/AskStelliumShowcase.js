import React, { useState, useEffect, useRef } from 'react';
import './AskStelliumShowcase.css';

const TABS = [
  {
    id: 'horoscope',
    label: 'Horoscope',
    contextLabel: 'About your horoscope',
    suggestions: [
      'What should I focus on today?',
      'How will this transit affect me?',
      'What energy should I watch for this week?',
    ],
    selectedChips: [],
    demo: {
      question: 'What should I focus on today?',
      answer:
        'With the Sun in Pisces forming a trine to your natal Moon in Cancer, today is ideal for deepening emotional connections. Your intuition is heightened — trust the feelings that surface in conversations, especially around midday when the Moon enters your 7th house. This is not the day for rigid planning; let things flow and you\'ll find the openings.',
    },
  },
  {
    id: 'birthchart',
    label: 'Birth Chart',
    contextLabel: 'About your birth chart',
    suggestions: [
      'What does Venus in my 7th mean for relationships?',
      'What are my career strengths?',
      'How does my Moon sign affect my emotions?',
    ],
    selectedChips: ['Sun in Scorpio \u2192 10th', 'Sun trine Jupiter'],
    demo: {
      question: 'How does my Sun placement shape my career?',
      answer:
        'Your Sun in Scorpio in the 10th house gives you a powerful, magnetic presence in professional settings \u2014 you\'re drawn to roles that involve investigation, transformation, or managing complex situations. The trine to Jupiter amplifies this with natural confidence and the ability to see the bigger picture. People in authority tend to trust you quickly. This combination favours careers in research, finance, psychology, or any field where depth of understanding is rewarded over surface-level output.',
    },
  },
  {
    id: 'relationship',
    label: 'Relationship',
    contextLabel: 'About your relationship',
    suggestions: [
      'Where do we clash and how do we fix it?',
      'What makes our connection so strong?',
      'How can we improve our communication?',
    ],
    selectedChips: [],
    demo: {
      question: 'Where do we clash and how do we fix it?',
      answer:
        'The main tension point is Mars square Saturn in your synastry \u2014 you want to push forward while they instinctively slow down, which can feel like resistance. In arguments, you may feel they\'re being stubborn while they feel you\'re being impatient. The fix is timing: bring important topics up when you\'re both relaxed, not in the heat of a moment. Your Venus-Moon trine gives you a strong emotional foundation to work with, so the willingness is already there.',
    },
  },
];

function AskStelliumShowcase() {
  const [activeTab, setActiveTab] = useState('horoscope');
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const intervalRef = useRef(null);

  const tab = TABS.find((t) => t.id === activeTab);
  const hasContext = tab.selectedChips.length > 0;

  // Reset and start typing animation on tab change
  useEffect(() => {
    setShowDemo(false);
    setDisplayedText('');
    setIsTyping(false);
    if (intervalRef.current) clearInterval(intervalRef.current);

    const startTimeout = setTimeout(() => {
      setShowDemo(true);
      setIsTyping(true);
      let i = 0;
      const fullText = tab.demo.answer;
      intervalRef.current = setInterval(() => {
        i++;
        setDisplayedText(fullText.slice(0, i));
        if (i >= fullText.length) {
          clearInterval(intervalRef.current);
          setIsTyping(false);
        }
      }, 12);
    }, 400);

    return () => {
      clearTimeout(startTimeout);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <section className="ask-showcase" id="ask-stellium">
      <div className="ask-showcase__inner">
        {/* Left: Copy */}
        <div className="ask-showcase__copy">
          <span className="ask-showcase__pretitle">YOUR PERSONAL AI ASTROLOGER</span>
          <h2 className="ask-showcase__title">Ask Stellium anything about your chart</h2>
          <p className="ask-showcase__description">
            Just type a question, or pick specific placements and aspects as context for more targeted answers.
            Stellium reads your actual chart data — not generic horoscopes.
          </p>
          <p className="ask-showcase__credit-nudge">
            Just 1 credit per question — included in every plan.
          </p>
        </div>

        {/* Right: Chat Mockup */}
        <div className="ask-showcase__mockup">
          {/* Tabs */}
          <div className="ask-showcase__tabs">
            {TABS.map((t) => (
              <button
                key={t.id}
                className={`ask-showcase__tab ${activeTab === t.id ? 'ask-showcase__tab--active' : ''}`}
                onClick={() => setActiveTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Panel */}
          <div className="ask-showcase__panel">
            {/* Panel Header */}
            <div className="ask-showcase__panel-header">
              <div>
                <div className="ask-showcase__panel-title">Ask Stellium</div>
                <div className="ask-showcase__panel-context">{tab.contextLabel}</div>
              </div>
            </div>

            {/* Context Bar — only show when context is selected */}
            {hasContext && (
              <div className="ask-showcase__context-bar">
                <div className="ask-showcase__context-trigger">
                  Context ({tab.selectedChips.length})
                  <span className="ask-showcase__chevron">&#9662;</span>
                </div>
                <div className="ask-showcase__context-bar-right">
                  <span className="ask-showcase__selection-count">{tab.selectedChips.length}/3</span>
                  <span className="ask-showcase__selection-clear">Clear</span>
                </div>
              </div>
            )}

            {/* Suggestions (visible before demo starts) */}
            {!showDemo && (
              <div className="ask-showcase__suggestions">
                <div className="ask-showcase__suggestions-label">Try asking:</div>
                {tab.suggestions.map((s, i) => (
                  <div key={i} className="ask-showcase__suggestion">{s}</div>
                ))}
              </div>
            )}

            {/* Demo Conversation */}
            {showDemo && (
              <div className="ask-showcase__conversation">
                {/* User message */}
                <div className="ask-showcase__msg ask-showcase__msg--user">
                  {hasContext && (
                    <div className="ask-showcase__msg-chips">
                      {tab.selectedChips.map((chip, i) => (
                        <span key={i} className="ask-showcase__chip">{chip}</span>
                      ))}
                    </div>
                  )}
                  <div className="ask-showcase__msg-bubble ask-showcase__msg-bubble--user">
                    {tab.demo.question}
                  </div>
                </div>

                {/* Assistant message */}
                <div className="ask-showcase__msg ask-showcase__msg--assistant">
                  <div className="ask-showcase__msg-bubble ask-showcase__msg-bubble--assistant">
                    {displayedText}
                    {isTyping && <span className="ask-showcase__cursor" />}
                  </div>
                  <div className="ask-showcase__fade-overlay" />
                </div>
              </div>
            )}

            {/* Mockup Input */}
            <div className="ask-showcase__input-mock">
              <div className="ask-showcase__input-credit">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
                1 credit per message
              </div>
              <div className="ask-showcase__input-wrapper">
                {hasContext && (
                  <div className="ask-showcase__input-chips">
                    {tab.selectedChips.map((chip, i) => (
                      <span key={i} className="ask-showcase__input-chip">
                        {chip}
                        <span className="ask-showcase__chip-dismiss">&times;</span>
                      </span>
                    ))}
                  </div>
                )}
                <div className="ask-showcase__input-field">
                  <span className="ask-showcase__input-placeholder">
                    Ask about your {tab.id === 'birthchart' ? 'birth chart' : tab.id}...
                  </span>
                  <span className="ask-showcase__input-send">&rarr;</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AskStelliumShowcase;
