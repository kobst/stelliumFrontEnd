import React, { useEffect, useRef } from 'react';
import './UserChatBirthChart.css';

const UserChatBirthChart = ({
  chatMessages,
  currentMessage,
  setCurrentMessage,
  isChatLoading,
  isChatHistoryLoading,
  handleSendMessage,
  handleKeyPress,
}) => {
  const messagesRef = useRef(null);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [chatMessages, isChatLoading]);

  return (
    <div className="chat-container">
      <h3>Chat with Your Birth Chart</h3>
        
      {/* Chat Messages */}
      <div className="chat-messages" ref={messagesRef}>
        {isChatHistoryLoading && chatMessages.length === 0 && (
          <div className="loading-indicator">Loading chat history...</div>
        )}
        {chatMessages.length === 0 && !isChatHistoryLoading ? (
          <p className="loading-indicator">Start a conversation about your birth chart...</p>
        ) : (
          chatMessages.map((message) => (
            <div
              key={message.id}
              className={`chat-message ${
                message.type === 'user'
                  ? 'user-message'
                  : message.type === 'error'
                  ? 'error-message'
                  : 'bot-message'
              }`}
            >
              <div className="message-meta">
                {message.type === 'user'
                  ? 'You'
                  : message.type === 'error'
                  ? 'Error'
                  : 'Birth Chart Assistant'}
                <span className="timestamp">
                  {message.timestamp.toLocaleTimeString()}
                </span>
              </div>
              <div className="message-text">{message.content}</div>
            </div>
          ))
        )}

        {/* Loading indicator */}
        {isChatLoading && (
          <div className="loading-indicator">Birth Chart Assistant is typing...</div>
        )}
      </div>
        
      {/* Chat Input */}
      <div className="chat-input-area">
        <textarea
          className="chat-textarea"
          value={currentMessage}
          onChange={(e) => setCurrentMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask about your birth chart..."
          disabled={isChatLoading}
        />
        <button
          className="send-button"
          onClick={handleSendMessage}
          disabled={!currentMessage.trim() || isChatLoading}
        >
          {isChatLoading ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  );
};
  
export default UserChatBirthChart;
