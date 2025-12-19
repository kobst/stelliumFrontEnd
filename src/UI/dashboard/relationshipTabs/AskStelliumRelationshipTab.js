import React, { useState, useEffect, useRef } from 'react';
import { enhancedChatForRelationship, fetchRelationshipEnhancedChatHistory } from '../../../Utilities/api';
import './RelationshipTabs.css';

function AskStelliumRelationshipTab({ compositeId, isAnalysisComplete }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  // Check if chat is unlocked
  const isUnlocked = isAnalysisComplete;

  // Fetch chat history on mount
  useEffect(() => {
    const loadChatHistory = async () => {
      if (!compositeId || !isUnlocked) {
        setLoadingHistory(false);
        return;
      }

      try {
        const history = await fetchRelationshipEnhancedChatHistory(compositeId, 50);
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
  }, [compositeId, isUnlocked]);

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
      const response = await enhancedChatForRelationship(compositeId, userMessage);

      if (response && response.answer) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: response.answer,
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
      setMessages(prev => prev.slice(0, -1));
      setInputMessage(userMessage);
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
      <div className="relationship-tab-content chat-tab">
        <div className="chat-locked">
          <div className="locked-icon">🔒</div>
          <h3>Ask Stellium</h3>
          <p>Complete the 360° Analysis to unlock AI chat about your relationship.</p>
          <p className="locked-note">The chat feature requires the full analysis to provide accurate, personalized insights about your relationship dynamics.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relationship-tab-content chat-tab">
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
              <h3>Ask About Your Relationship</h3>
              <p>Get personalized insights about your relationship dynamics, compatibility, and growth potential.</p>
              <div className="example-questions">
                <p className="example-label">Try asking:</p>
                <span className="example-question" onClick={() => setInputMessage("What are our relationship strengths?")}>
                  What are our relationship strengths?
                </span>
                <span className="example-question" onClick={() => setInputMessage("How can we improve our communication?")}>
                  How can we improve our communication?
                </span>
                <span className="example-question" onClick={() => setInputMessage("What challenges should we be aware of?")}>
                  What challenges should we be aware of?
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
            placeholder="Ask about your relationship..."
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

export default AskStelliumRelationshipTab;
