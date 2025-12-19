import React, { useState, useEffect, useRef } from 'react';
import { enhancedChatForUserBirthChart, fetchEnhancedChatHistory } from '../../../Utilities/api';
import './ChartTabs.css';

function AskStelliumChartTab({ chartId, isAnalysisComplete, vectorizationComplete }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  // Check if chat is unlocked (requires 360° analysis to be complete)
  const isUnlocked = isAnalysisComplete && vectorizationComplete !== false;

  // Fetch chat history on mount
  useEffect(() => {
    const loadChatHistory = async () => {
      if (!chartId || !isUnlocked) {
        setLoadingHistory(false);
        return;
      }

      try {
        const history = await fetchEnhancedChatHistory(chartId, 50);
        if (history && Array.isArray(history)) {
          setMessages(history.map(msg => ({
            role: msg.role,
            content: msg.content,
            timestamp: msg.timestamp
          })));
        }
      } catch (err) {
        console.error('Error loading chat history:', err);
      } finally {
        setLoadingHistory(false);
      }
    };

    loadChatHistory();
  }, [chartId, isUnlocked]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || loading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setError(null);

    // Add user message to chat
    setMessages(prev => [...prev, {
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString()
    }]);

    setLoading(true);

    try {
      const response = await enhancedChatForUserBirthChart(chartId, {
        message: userMessage
      });

      if (response && response.response) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: response.response,
          timestamp: new Date().toISOString()
        }]);
      } else if (response?.error) {
        throw new Error(response.error);
      } else {
        throw new Error('No response received');
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err.message || 'Failed to send message');
      // Remove the user message if we couldn't get a response
      setMessages(prev => prev.slice(0, -1));
      setInputMessage(userMessage); // Restore the message for retry
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Render locked state
  if (!isUnlocked) {
    return (
      <div className="chart-tab-content chat-tab">
        <div className="chat-locked">
          <div className="locked-icon">🔒</div>
          <h3>Ask Stellium</h3>
          <p>Complete the 360° Analysis to unlock AI chat about your birth chart.</p>
          <p className="locked-note">The chat feature requires the full analysis to provide accurate, personalized insights.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chart-tab-content chat-tab">
      <div className="chat-container">
        {/* Chat Messages */}
        <div className="chat-messages">
          {loadingHistory ? (
            <div className="chat-loading">
              <div className="loading-spinner"></div>
              <p>Loading chat history...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="chat-welcome">
              <div className="welcome-icon">✨</div>
              <h3>Ask Stellium</h3>
              <p>Ask questions about your birth chart. Get personalized insights based on your complete astrological profile.</p>
              <div className="example-questions">
                <p className="example-label">Try asking:</p>
                <span className="example-question" onClick={() => setInputMessage("What are my greatest strengths?")}>
                  What are my greatest strengths?
                </span>
                <span className="example-question" onClick={() => setInputMessage("How does my Moon sign affect my emotions?")}>
                  How does my Moon sign affect my emotions?
                </span>
                <span className="example-question" onClick={() => setInputMessage("What should I focus on for personal growth?")}>
                  What should I focus on for personal growth?
                </span>
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`chat-message ${msg.role === 'user' ? 'user' : 'assistant'}`}
                >
                  <div className="message-content">
                    {msg.content.split('\n').map((paragraph, pIndex) => (
                      paragraph.trim() && <p key={pIndex}>{paragraph}</p>
                    ))}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="chat-message assistant">
                  <div className="message-content typing">
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

        {/* Error Message */}
        {error && (
          <div className="chat-error">
            {error}
          </div>
        )}

        {/* Input Area */}
        <div className="chat-input-container">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about your birth chart..."
            rows={2}
            disabled={loading}
          />
          <button
            className="send-button"
            onClick={handleSendMessage}
            disabled={loading || !inputMessage.trim()}
          >
            {loading ? '...' : '→'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AskStelliumChartTab;
