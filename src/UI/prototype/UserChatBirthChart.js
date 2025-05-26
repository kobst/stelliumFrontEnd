import React from 'react';

const UserChatBirthChart = ({ chatMessages, currentMessage, setCurrentMessage, isChatLoading, handleSendMessage, handleKeyPress}) => {
  
    return (
    <div style={{ marginTop: '30px', border: '1px solid #ddd', borderRadius: '8px', padding: '15px' }}>
        <h3>Chat with Your Birth Chart</h3>
        
        {/* Chat Messages */}
        <div style={{ 
          height: '300px', 
          overflowY: 'auto', 
          border: '1px solid #eee', 
          borderRadius: '4px', 
          padding: '10px', 
          marginBottom: '10px',
          backgroundColor: '#fafafa'
        }}>
          {chatMessages.length === 0 ? (
            <p style={{ color: '#666', fontStyle: 'italic' }}>
              Start a conversation about your birth chart...
            </p>
          ) : (
            chatMessages.map(message => (
              <div 
                key={message.id} 
                style={{ 
                  marginBottom: '10px', 
                  padding: '8px', 
                  borderRadius: '4px',
                  backgroundColor: message.type === 'user' ? '#e3f2fd' : 
                                   message.type === 'error' ? '#ffebee' : '#f5f5f5',
                  borderLeft: `4px solid ${message.type === 'user' ? '#2196f3' : 
                                          message.type === 'error' ? '#f44336' : '#4caf50'}`
                }}
              >
                <div style={{ 
                  fontSize: '12px', 
                  color: '#666', 
                  marginBottom: '4px',
                  fontWeight: 'bold'
                }}>
                  {message.type === 'user' ? 'You' : 
                   message.type === 'error' ? 'Error' : 'Birth Chart Assistant'}
                  <span style={{ fontWeight: 'normal', marginLeft: '8px' }}>
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>
                  {message.content}
                </div>
              </div>
            ))
          )}
          
          {/* Loading indicator */}
          {isChatLoading && (
            <div style={{ 
              padding: '8px', 
              fontStyle: 'italic', 
              color: '#666',
              backgroundColor: '#f0f0f0',
              borderRadius: '4px',
              borderLeft: '4px solid #ff9800'
            }}>
              Birth Chart Assistant is typing...
            </div>
          )}
        </div>
        
        {/* Chat Input */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <textarea
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about your birth chart..."
            disabled={isChatLoading}
            style={{
              flex: 1,
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              resize: 'vertical',
              minHeight: '40px',
              maxHeight: '100px'
            }}
          />
          <button
            onClick={handleSendMessage}
            disabled={!currentMessage.trim() || isChatLoading}
            style={{
              padding: '8px 16px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {isChatLoading ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    );
  };
  
  export default UserChatBirthChart;