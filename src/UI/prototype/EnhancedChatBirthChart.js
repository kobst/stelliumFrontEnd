import React, { useState, useEffect, useRef } from 'react';
import { enhancedChatForUserBirthChart, fetchEnhancedChatHistory } from '../../Utilities/api';
import { 
  formatAspectData, 
  formatPositionData, 
  findPlanetData 
} from '../../Utilities/aspectExplorerHelpers';
import './EnhancedChatBirthChart.css';

const EnhancedChatBirthChart = ({ userId, userPlanets, userAspects, chatMessages, setChatMessages }) => {
  const [selectedElements, setSelectedElements] = useState([]);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [chatMessages, isLoading]);

  // Load chat history when component mounts
  useEffect(() => {
    const loadChatHistory = async () => {
      if (!userId || chatMessages.length > 0) return; // Don't reload if messages already exist
      
      setIsHistoryLoading(true);
      try {
        const response = await fetchEnhancedChatHistory(userId, 50); // Load last 50 messages
        
        if (response.success && response.chatHistory) {
          // Transform API response to our message format
          const transformedMessages = response.chatHistory.map((msg, index) => ({
            id: `history-${index}-${Date.now()}`,
            type: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.content,
            timestamp: new Date(msg.timestamp),
            mode: msg.metadata?.mode || null,
            selectedElements: msg.metadata?.selectedAspects || null,
            elementCount: msg.metadata?.elementCount || null
          }));
          
          setChatMessages(transformedMessages);
        }
      } catch (err) {
        console.error('Failed to load chat history:', err);
        // Don't show error to user for history loading - just log it
      } finally {
        setIsHistoryLoading(false);
      }
    };

    loadChatHistory();
  }, [userId, setChatMessages, chatMessages.length]);

  // Handle selection of an element
  const handleSelectElement = (element) => {
    setError(null);
    
    if (selectedElements.some(el => el.code === element.code)) {
      // Deselect if already selected
      setSelectedElements(selectedElements.filter(el => el.code !== element.code));
    } else if (selectedElements.length < 4) {
      // Add if under limit
      setSelectedElements([...selectedElements, element]);
    } else {
      // Show error if at limit
      setError('Maximum 4 selections allowed. Please deselect an item first.');
    }
  };

  // Clear all selections
  const handleClearSelection = () => {
    setSelectedElements([]);
    setError(null);
  };

  // Determine which mode will be used
  const getMode = () => {
    const hasQuery = query.trim().length > 0;
    const hasElements = selectedElements.length > 0;
    
    if (hasQuery && hasElements) return 'hybrid';
    if (hasQuery) return 'chat';
    if (hasElements) return 'custom';
    return null;
  };

  // Handle form submission
  const handleSubmit = async () => {
    const currentMode = getMode();
    
    if (!currentMode) {
      setError('Please enter a query or select at least one aspect/position');
      return;
    }

    setIsLoading(true);
    setError(null);

    // Create request body based on mode
    const requestBody = {};
    if (query.trim()) {
      requestBody.query = query.trim();
    }
    if (selectedElements.length > 0) {
      requestBody.selectedAspects = selectedElements;
    }

    // Add user message to chat if there's a query
    if (query.trim()) {
      const userMessage = {
        id: Date.now(),
        type: 'user',
        content: query.trim(),
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, userMessage]);
    }

    try {
      const response = await enhancedChatForUserBirthChart(userId, requestBody);
      
      if (response.success) {
        // Add assistant response to chat
        const assistantMessage = {
          id: Date.now() + 1,
          type: 'assistant',
          content: response.answer,
          timestamp: new Date(),
          mode: response.mode,
          analysisId: response.analysisId,
          selectedElements: selectedElements.length > 0 ? [...selectedElements] : null
        };
        setChatMessages(prev => [...prev, assistantMessage]);

        // Clear form after successful submission
        setQuery('');
        setSelectedElements([]);
      } else {
        throw new Error(response.error || 'Failed to get response');
      }
    } catch (err) {
      const errorMessage = {
        id: Date.now() + 1,
        type: 'error',
        content: err.message || 'An error occurred while processing your request',
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Prepare aspects data
  const aspectsData = userAspects.map(aspect => {
    const planet1Data = findPlanetData(aspect.aspectedPlanet, userPlanets);
    const planet2Data = findPlanetData(aspect.aspectingPlanet, userPlanets);
    
    if (planet1Data && planet2Data) {
      return formatAspectData(aspect, planet1Data, planet2Data);
    }
    return null;
  }).filter(Boolean);

  // Prepare positions data
  const positionsData = userPlanets
    .filter(planet => !['South Node', 'Part of Fortune'].includes(planet.name))
    .map(planet => formatPositionData(planet));

  // Check if element is selected
  const isSelected = (code) => selectedElements.some(el => el.code === code);

  const currentMode = getMode();

  return (
    <div className="enhanced-chat-container">
      <div className="enhanced-chat-header">
        <h3>Enhanced Chat</h3>
        <p className="description">
          Select aspects/positions and/or ask questions to get personalized astrological insights.
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Main Content Layout */}
      <div className="enhanced-chat-layout">
        {/* Left Panel - Selection Tables */}
        <div className="selection-panel">
          <div className="selection-controls">
            <div className="selection-info">
              <span className="selection-count">
                {selectedElements.length} of 4 selected
              </span>
              {selectedElements.length > 0 && (
                <button 
                  onClick={handleClearSelection}
                  className="clear-button"
                >
                  Clear Selection
                </button>
              )}
            </div>
          </div>

          <div className="tables-container">
            <div className="positions-section">
              <h4>Planetary Positions</h4>
              <div className="elements-list">
                {positionsData.map(position => (
                  <div
                    key={position.code}
                    className={`element-card position-card ${isSelected(position.code) ? 'selected' : ''}`}
                    onClick={() => handleSelectElement(position)}
                  >
                    <div className="element-header">
                      <span className="element-type">Position</span>
                      {isSelected(position.code) && <span className="selected-badge">✓</span>}
                    </div>
                    <div className="element-content">
                      <div className="element-main">{position.planet}</div>
                      <div className="element-details">
                        in {position.sign}
                        {position.house && ` • House ${position.house}`}
                        {position.isRetrograde && ' ℞'}
                      </div>
                    </div>
                    <div className="element-code">{position.code}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="aspects-section">
              <h4>Aspects</h4>
              <div className="elements-list">
                {aspectsData.map(aspect => (
                  <div
                    key={aspect.code}
                    className={`element-card aspect-card ${isSelected(aspect.code) ? 'selected' : ''}`}
                    onClick={() => handleSelectElement(aspect)}
                  >
                    <div className="element-header">
                      <span className="element-type">Aspect</span>
                      {isSelected(aspect.code) && <span className="selected-badge">✓</span>}
                    </div>
                    <div className="element-content">
                      <div className="element-main">
                        {aspect.planet1} {aspect.aspectType} {aspect.planet2}
                      </div>
                      <div className="element-details">
                        {aspect.planet1} in {aspect.planet1Sign}
                        {aspect.planet1House && ` H${aspect.planet1House}`}
                        {' → '}
                        {aspect.planet2} in {aspect.planet2Sign}
                        {aspect.planet2House && ` H${aspect.planet2House}`}
                      </div>
                      <div className="element-orb">Orb: {aspect.orb.toFixed(2)}°</div>
                    </div>
                    <div className="element-code">{aspect.code}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Chat Interface */}
        <div className="chat-panel">
          {/* Chat Messages */}
          <div className="chat-messages" ref={messagesRef}>
        {isHistoryLoading && chatMessages.length === 0 && (
          <div className="loading-indicator">Loading chat history...</div>
        )}
        {chatMessages.length === 0 && !isHistoryLoading ? (
          <p className="chat-placeholder">Start a conversation by selecting aspects/positions and/or asking a question...</p>
        ) : (
          chatMessages.map((message) => (
            <div
              key={message.id}
              className={`chat-message ${
                message.type === 'user'
                  ? 'user-message'
                  : message.type === 'error'
                  ? 'error-message'
                  : 'assistant-message'
              }`}
            >
              {/* Show selected elements above user messages */}
              {message.type === 'user' && (message.selectedElements || message.elementCount) && (
                <div className="selected-elements-header">
                  <div className="elements-header-title">
                    <strong>Selected Elements:</strong> 
                    {message.elementCount 
                      ? ` ${message.elementCount} item(s)`
                      : ` ${message.selectedElements.length} item(s)`
                    }
                  </div>
                  {message.selectedElements && message.selectedElements.length > 0 && (
                    <div className="elements-preview">
                      {message.selectedElements.slice(0, 3).map((element, idx) => (
                        <span key={idx} className="element-preview-item">
                          {element.type === 'aspect' 
                            ? `${element.planet1} ${element.aspectType} ${element.planet2}`
                            : `${element.planet} in ${element.sign}`
                          }
                        </span>
                      ))}
                      {message.selectedElements.length > 3 && (
                        <span className="element-preview-more">
                          +{message.selectedElements.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}
              
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
              <div className="message-content">
                {message.content}
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="chat-message assistant-message loading">
            <div className="message-meta">
              Birth Chart Assistant
              <span className="timestamp">{new Date().toLocaleTimeString()}</span>
            </div>
            <div className="message-content">
              <div className="loading-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
          </div>

          {/* Query Input Section */}
          <div className="query-input-section">
            <div className="query-input-wrapper">
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask a question about your birth chart..."
                className="query-input"
                rows={3}
              />
              <div className="input-controls">
                <button
                  onClick={handleSubmit}
                  disabled={!currentMode || isLoading}
                  className="submit-button"
                >
                  {isLoading ? 'Processing...' : 'Send'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedChatBirthChart;