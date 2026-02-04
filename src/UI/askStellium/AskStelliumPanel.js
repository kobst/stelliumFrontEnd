import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  enhancedChatForUserBirthChart,
  fetchEnhancedChatHistory,
  enhancedChatForRelationship,
  fetchRelationshipEnhancedChatHistory,
  fetchHoroscopeChatHistory,
  enhancedChatForHoroscope
} from '../../Utilities/api';
import useEntitlementsStore from '../../Utilities/entitlementsStore';
import './AskStelliumPanel.css';

const API_CONFIG = {
  birthchart: {
    fetchHistory: (id, limit) => fetchEnhancedChatHistory(id, limit),
    sendMessage: (id, message) => enhancedChatForUserBirthChart(id, { message }),
    responseField: 'response',
  },
  analysis: {
    fetchHistory: (id, limit) => fetchEnhancedChatHistory(id, limit),
    sendMessage: (id, message) => enhancedChatForUserBirthChart(id, { message }),
    responseField: 'response',
  },
  relationship: {
    fetchHistory: (id, limit) => fetchRelationshipEnhancedChatHistory(id, limit),
    sendMessage: (id, message) => enhancedChatForRelationship(id, message),
    responseField: 'answer',
  },
  horoscope: {
    fetchHistory: (id, limit) => fetchHoroscopeChatHistory(id, limit),
    sendMessage: (id, message) => enhancedChatForHoroscope(id, { message }),
    responseField: 'response',
  },
};

function AskStelliumPanel({
  isOpen,
  onClose,
  contentType,
  contentId,
  contextLabel,
  placeholderText,
  suggestedQuestions,
}) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [error, setError] = useState(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const messagesEndRef = useRef(null);
  const panelRef = useRef(null);
  const textareaRef = useRef(null);
  const hasLoadedRef = useRef(null);

  const navigate = useNavigate();
  const hasEnoughCredits = useEntitlementsStore(state => state.hasEnoughCredits);
  const credits = useEntitlementsStore(state => state.credits);

  const config = API_CONFIG[contentType];

  // Load chat history when panel opens
  useEffect(() => {
    if (!isOpen || !contentId || !config) return;

    // Avoid reloading if we already loaded for this contentId
    if (hasLoadedRef.current === contentId) return;

    const loadHistory = async () => {
      setLoadingHistory(true);
      try {
        const history = await config.fetchHistory(contentId, 50);
        if (history && Array.isArray(history)) {
          setMessages(history.map(msg => ({
            role: msg.role,
            content: msg.content,
            timestamp: msg.timestamp,
          })));
        }
      } catch (err) {
        console.error('Error loading chat history:', err);
      } finally {
        setLoadingHistory(false);
        hasLoadedRef.current = contentId;
      }
    };

    loadHistory();
  }, [isOpen, contentId, config]);

  // Reset loaded ref when contentId changes
  useEffect(() => {
    hasLoadedRef.current = null;
    setMessages([]);
  }, [contentId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus textarea when panel opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => textareaRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // Escape key handler
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent body scroll when panel is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleSendMessage = useCallback(async () => {
    if (!inputMessage.trim() || loading || !config) return;

    // Check credits (1 credit per question)
    if (!hasEnoughCredits(1)) {
      setShowPaywall(true);
      return;
    }

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setError(null);
    setShowPaywall(false);

    // Optimistic add
    setMessages(prev => [...prev, {
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString(),
    }]);

    setLoading(true);

    try {
      const response = await config.sendMessage(contentId, userMessage);
      const responseField = config.responseField;

      if (response && response[responseField]) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: response[responseField],
          timestamp: new Date().toISOString(),
        }]);
      } else if (response?.error) {
        throw new Error(response.error);
      } else {
        throw new Error('No response received');
      }
    } catch (err) {
      console.error('Error sending message:', err);

      if (err.status === 403 || err.message?.includes('403')) {
        setShowPaywall(true);
      }

      setError(err.message || 'Failed to send message');
      // Remove optimistic user message
      setMessages(prev => prev.slice(0, -1));
      setInputMessage(userMessage);
    } finally {
      setLoading(false);
    }
  }, [inputMessage, loading, config, contentId, hasEnoughCredits]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestedClick = (question) => {
    setInputMessage(question);
    textareaRef.current?.focus();
  };

  if (!isOpen) return null;

  return (
    <div className="ask-panel-backdrop" onClick={onClose}>
      <div
        ref={panelRef}
        className={`ask-panel ${isOpen ? 'ask-panel--open' : ''}`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="ask-panel__header">
          <div className="ask-panel__header-text">
            <div className="ask-panel__title">Ask Stellium</div>
            {contextLabel && (
              <div className="ask-panel__context">{contextLabel}</div>
            )}
          </div>
          <button className="ask-panel__close" onClick={onClose} aria-label="Close panel">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="ask-panel__messages">
          {loadingHistory ? (
            <div className="ask-panel__loading">
              <div className="loading-spinner"></div>
              <p>Loading chat history...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="ask-panel__welcome">
              <div className="ask-panel__welcome-icon">&#10024;</div>
              <h3>Ask Stellium</h3>
              <p>{placeholderText || 'Ask questions and get personalized insights.'}</p>
              {suggestedQuestions && suggestedQuestions.length > 0 && (
                <div className="ask-panel__suggestions">
                  <p className="ask-panel__suggestions-label">Try asking:</p>
                  {suggestedQuestions.map((q, i) => (
                    <span
                      key={i}
                      className="ask-panel__suggestion"
                      onClick={() => handleSuggestedClick(q)}
                    >
                      {q}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <>
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`ask-panel__message ${msg.role === 'user' ? 'ask-panel__message--user' : 'ask-panel__message--assistant'}`}
                >
                  <div className="ask-panel__message-content">
                    {msg.content.split('\n').map((paragraph, pIndex) => (
                      paragraph.trim() && <p key={pIndex}>{paragraph}</p>
                    ))}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="ask-panel__message ask-panel__message--assistant">
                  <div className="ask-panel__message-content ask-panel__typing">
                    <span className="typing-dot"></span>
                    <span className="typing-dot"></span>
                    <span className="typing-dot"></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="ask-panel__error">{error}</div>
        )}

        {/* Paywall CTA */}
        {showPaywall && (
          <div className="ask-panel__paywall">
            <p>You need 1 credit to ask a question. You have {credits.total} credits remaining.</p>
            <div className="ask-panel__paywall-actions">
              <button className="ask-panel__paywall-cta" onClick={() => navigate('/pricingTable')}>
                Upgrade to Plus (200 credits/mo)
              </button>
              <button className="ask-panel__paywall-cta ask-panel__paywall-cta--secondary" onClick={() => navigate('/pricingTable')}>
                Buy Credit Pack (100 for $10)
              </button>
            </div>
          </div>
        )}

        {/* Input */}
        <div className="ask-panel__input">
          <textarea
            ref={textareaRef}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholderText || 'Ask a question...'}
            rows={2}
            disabled={loading}
          />
          <button
            className="ask-panel__send"
            onClick={handleSendMessage}
            disabled={loading || !inputMessage.trim()}
          >
            {loading ? '...' : '\u2192'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AskStelliumPanel;
