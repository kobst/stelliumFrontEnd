import React, { useEffect, useRef, useState } from 'react';
import './ChatInterface.css';

const ChatInterface = ({
  messages = [],
  currentMessage = '',
  setCurrentMessage,
  onSendMessage,
  isLoading = false,
  isHistoryLoading = false,
  placeholder = 'Type your message...',
  title = 'Chat',
  botName = 'Assistant',
  disabled = false,
  maxLength = 1000,
  showTypingIndicator = true,
  showTimestamps = true,
  autoFocus = false,
  className = ''
}) => {
  const messagesRef = useRef(null);
  const inputRef = useRef(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  // Auto-scroll to bottom when new messages arrive (only if user was at bottom)
  useEffect(() => {
    if (messagesRef.current && isAtBottom) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages, isLoading, isAtBottom]);

  // Auto-focus input if specified
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // Handle scroll events to detect if user is at bottom
  const handleScroll = () => {
    if (messagesRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesRef.current;
      const atBottom = scrollTop + clientHeight >= scrollHeight - 5; // 5px tolerance
      setIsAtBottom(atBottom);
    }
  };

  // Handle key press events
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !disabled && !isLoading) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Handle send message
  const handleSendMessage = () => {
    if (!currentMessage.trim() || disabled || isLoading) return;
    
    if (onSendMessage) {
      onSendMessage(currentMessage.trim());
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Get message type class
  const getMessageTypeClass = (type) => {
    switch (type) {
      case 'user':
        return 'user-message';
      case 'error':
        return 'error-message';
      case 'system':
        return 'system-message';
      case 'bot':
      case 'assistant':
      default:
        return 'bot-message';
    }
  };

  // Get sender name
  const getSenderName = (message) => {
    if (message.sender) return message.sender;
    
    switch (message.type) {
      case 'user':
        return 'You';
      case 'error':
        return 'Error';
      case 'system':
        return 'System';
      case 'bot':
      case 'assistant':
      default:
        return botName;
    }
  };

  // Scroll to bottom button
  const scrollToBottom = () => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
      setIsAtBottom(true);
    }
  };

  return (
    <div className={`chat-interface ${className}`}>
      {title && <div className="chat-header">{title}</div>}
      
      {/* Messages Container */}
      <div 
        className="chat-messages" 
        ref={messagesRef}
        onScroll={handleScroll}
      >
        {isHistoryLoading && messages.length === 0 && (
          <div className="loading-indicator">Loading conversation history...</div>
        )}
        
        {messages.length === 0 && !isHistoryLoading && (
          <div className="empty-state">
            <div className="empty-icon">💬</div>
            <p>Start a conversation...</p>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={message.id || index}
            className={`chat-message ${getMessageTypeClass(message.type)}`}
          >
            <div className="message-bubble">
              <div className="message-header">
                <span className="sender-name">
                  {getSenderName(message)}
                </span>
                {showTimestamps && message.timestamp && (
                  <span className="timestamp">
                    {formatTimestamp(message.timestamp)}
                  </span>
                )}
              </div>
              <div className="message-content">
                {message.content || message.text}
              </div>
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isLoading && showTypingIndicator && (
          <div className="chat-message bot-message typing">
            <div className="message-bubble">
              <div className="message-header">
                <span className="sender-name">{botName}</span>
              </div>
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Scroll to bottom button */}
      {!isAtBottom && (
        <button 
          className="scroll-to-bottom"
          onClick={scrollToBottom}
          aria-label="Scroll to bottom"
        >
          ↓
        </button>
      )}

      {/* Input Area */}
      <div className="chat-input-container">
        <div className="chat-input-wrapper">
          <textarea
            ref={inputRef}
            className="chat-input"
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={disabled ? 'Chat is disabled' : placeholder}
            disabled={disabled || isLoading}
            maxLength={maxLength}
            rows={1}
          />
          <button
            className="send-button"
            onClick={handleSendMessage}
            disabled={!currentMessage.trim() || disabled || isLoading}
            aria-label="Send message"
          >
            {isLoading ? (
              <div className="loading-spinner"></div>
            ) : (
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path fill="currentColor" d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
              </svg>
            )}
          </button>
        </div>
        
        {maxLength && (
          <div className="character-count">
            {currentMessage.length}/{maxLength}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface; 