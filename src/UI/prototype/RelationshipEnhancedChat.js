import React, { useState, useEffect, useRef } from 'react';
import { enhancedChatForRelationship, fetchRelationshipEnhancedChatHistory } from '../../Utilities/api';
import './RelationshipEnhancedChat.css';

// Helper functions for relationship element formatting (kept for future expansion)

const getOrdinal = (n) => {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

// Format synastry aspects for API
const formatSynastryAspect = (aspect, userAName, userBName) => {
  
  // Based on the actual data structure: planet1, planet1Sign, planet2, planet2Sign, etc.
  const aspectType = (aspect.aspectType || aspect.aspect || aspect.type || 'unknown').toLowerCase();
  const orb = aspect.orb || aspect.orbDistance || 0;
  
  // Direct property access based on the logged structure
  const planet1 = aspect.planet1 || 'Unknown';
  const planet2 = aspect.planet2 || 'Unknown';
  const planet1Sign = aspect.planet1Sign || 'Unknown';
  const planet2Sign = aspect.planet2Sign || 'Unknown';
  const planet1House = aspect.planet1House || null;
  const planet2House = aspect.planet2House || null;
  
  // Also check for house placements in synastry data
  const planet1InHouse = aspect.planet1InHouse || planet1House;
  const planet2InHouse = aspect.planet2InHouse || planet2House;
  
  return {
    source: 'synastry',
    type: 'aspect',
    reason: `${orb < 3 ? 'Strong' : orb < 6 ? 'Moderate' : 'Weak'} synastry aspect (${orb.toFixed(1)}° orb)`,
    description: `${userAName}'s ${planet1} in ${planet1Sign}${planet1InHouse ? ` in ${getOrdinal(planet1InHouse)} house` : ''} ${aspectType} ${userBName}'s ${planet2} in ${planet2Sign}${planet2InHouse ? ` in ${getOrdinal(planet2InHouse)} house` : ''}`,
    aspect: aspectType,
    orb: orb,
    planet1Sign: planet1Sign,
    planet2Sign: planet2Sign,
    planet1House: planet1InHouse,
    planet2House: planet2InHouse,
    planet1: planet1,
    planet2: planet2
  };
};

// Format composite aspects for API  
const formatCompositeAspect = (aspect) => {
  
  const aspectType = aspect.aspectType?.toLowerCase() || aspect.aspect?.toLowerCase() || aspect.type?.toLowerCase() || 'unknown';
  const orb = aspect.orb || aspect.orbDistance || 0;
  const planet1 = aspect.planet1 || aspect.aspectedPlanet || 'Unknown';
  const planet2 = aspect.planet2 || aspect.aspectingPlanet || 'Unknown';
  const pairKey = aspect.pairKey || `${planet1.toLowerCase()}_${planet2.toLowerCase()}`;
  
  return {
    source: 'composite',
    type: 'aspect',
    reason: `${orb < 3 ? 'Strong' : orb < 6 ? 'Moderate' : 'Weak'} composite aspect (${orb.toFixed(1)}° orb)`,
    description: `${planet1} ${aspectType} ${planet2}`,
    aspect: aspectType,
    orb: orb,
    pairKey: pairKey,
    planet1: planet1,
    planet2: planet2
  };
};

// Format synastry house placements for API
const formatSynastryHousePlacement = (placement, userAName, userBName) => {
  // The placement already has all the data we need
  const planet = placement.planet || 'Unknown';
  const house = placement.house || null;
  const planetSign = placement.planetSign || '';
  const direction = placement.direction || 'A->B';
  
  // Determine which user's planet is in which user's house
  const planetOwner = direction === 'A->B' ? userAName : userBName;
  const houseOwner = direction === 'A->B' ? userBName : userAName;
  
  return {
    source: 'synastryHousePlacement',
    type: 'housePlacement',
    reason: `${planetOwner}'s ${planet} in ${houseOwner}'s house ${house}`,
    description: `${planetOwner}'s ${planet} in ${planetSign} falls in ${houseOwner}'s house ${house}`,
    planet: planet,
    house: house,
    direction: direction,
    planetSign: planetSign
  };
};

// Format composite house placements for API
const formatCompositeHousePlacement = (placement) => {
  const planet = placement.planet || placement.name || 'Unknown';
  const house = placement.house || placement.houseNumber || null;
  const sign = placement.sign || 'Unknown';
  
  return {
    source: 'compositeHousePlacement',
    type: 'housePlacement',
    reason: `Composite ${planet} placement`,
    description: `${planet} in house ${house} and ${sign}`,
    planet: planet,
    house: house,
    direction: 'composite'
  };
};

const RelationshipEnhancedChat = ({ 
  compositeChartId, 
  synastryAspects = [], 
  compositeChart = {},
  userAName = 'Partner A',
  userBName = 'Partner B',
  chatMessages, 
  setChatMessages 
}) => {
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
      if (!compositeChartId || chatMessages.length > 0) return;
      
      setIsHistoryLoading(true);
      try {
        const response = await fetchRelationshipEnhancedChatHistory(compositeChartId, 50);
        
        if (response.success && response.chatHistory) {
          const transformedMessages = response.chatHistory.map((msg, index) => ({
            id: `history-${index}-${Date.now()}`,
            type: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.content,
            timestamp: new Date(msg.timestamp),
            mode: msg.metadata?.mode || null,
            selectedElements: msg.metadata?.selectedElements || null,
            elementCount: msg.metadata?.elementCount || null
          }));
          
          setChatMessages(transformedMessages);
        }
      } catch (err) {
        console.error('Failed to load relationship chat history:', err);
      } finally {
        setIsHistoryLoading(false);
      }
    };

    loadChatHistory();
  }, [compositeChartId, setChatMessages, chatMessages.length]);

  // Handle selection of an element
  const handleSelectElement = (element) => {
    setError(null);
    
    if (selectedElements.some(el => el === element)) {
      setSelectedElements(selectedElements.filter(el => el !== element));
    } else if (selectedElements.length < 4) {
      setSelectedElements([...selectedElements, element]);
    } else {
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
      setError('Please enter a query or select at least one relationship element');
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
        timestamp: new Date(),
        selectedElements: selectedElements.length > 0 ? [...selectedElements] : null
      };
      setChatMessages(prev => [...prev, userMessage]);
    }

    try {
      const response = await enhancedChatForRelationship(compositeChartId, requestBody);
      
      if (response.success) {
        const assistantMessage = {
          id: Date.now() + 1,
          type: 'assistant',
          content: response.answer,
          timestamp: new Date(),
          mode: response.mode,
          analysisId: response.analysisId
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

  // Prepare relationship elements data
  
  const synastryAspectsData = synastryAspects.map(aspect => 
    formatSynastryAspect(aspect, userAName, userBName)
  );

  const compositeAspectsData = (compositeChart.aspects || compositeChart.compositeChart?.aspects || [])
    .map(aspect => formatCompositeAspect(aspect));

  // Extract synastry house placements 
  // Try different possible locations for the data
  const synastryHousePlacementsRaw = compositeChart?.synastryHousePlacements || 
                                     compositeChart?.housePlacements || 
                                     compositeChart?.synastry?.housePlacements ||
                                     [];
  
  // Check if it's an object with userA/userB properties
  let synastryHousePlacementsArray = [];
  
  if (Array.isArray(synastryHousePlacementsRaw)) {
    synastryHousePlacementsArray = synastryHousePlacementsRaw;
  } else if (typeof synastryHousePlacementsRaw === 'object' && synastryHousePlacementsRaw !== null) {
    // It's an object with AinB/BinA arrays
    if (synastryHousePlacementsRaw.AinB && Array.isArray(synastryHousePlacementsRaw.AinB)) {
      synastryHousePlacementsRaw.AinB.forEach(placement => {
        synastryHousePlacementsArray.push({
          ...placement,
          direction: 'A->B'
        });
      });
    }
    
    if (synastryHousePlacementsRaw.BinA && Array.isArray(synastryHousePlacementsRaw.BinA)) {
      synastryHousePlacementsRaw.BinA.forEach(placement => {
        synastryHousePlacementsArray.push({
          ...placement,
          direction: 'B->A'
        });
      });
    }
  }
  
  const synastryHousePlacementsData = synastryHousePlacementsArray.map(placement => 
    formatSynastryHousePlacement(placement, userAName, userBName)
  );
  

  // Extract composite house placements from planets
  const compositeHousePlacementsData = (compositeChart.planets || compositeChart.compositeChart?.planets || [])
    .filter(planet => !['South Node', 'Part of Fortune'].includes(planet.name))
    .map(planet => formatCompositeHousePlacement(planet));

  // Check if element is selected
  const isSelected = (element) => selectedElements.includes(element);

  const currentMode = getMode();

  return (
    <div className="relationship-enhanced-chat-container">
      <div className="enhanced-chat-header">
        <h3>Relationship Enhanced Chat</h3>
        <p className="description">
          Select relationship elements and/or ask questions to get personalized astrological insights about your compatibility.
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
            {/* Synastry Aspects */}
            <div className="elements-section">
              <h4>Synastry Aspects</h4>
              <div className="elements-list">
                {synastryAspectsData.map((aspect, index) => (
                  <div
                    key={`synastry-aspect-${index}`}
                    className={`element-card synastry-aspect-card ${isSelected(aspect) ? 'selected' : ''}`}
                    onClick={() => handleSelectElement(aspect)}
                  >
                    <div className="element-header">
                      <span className="element-type">Synastry</span>
                      {isSelected(aspect) && <span className="selected-badge">✓</span>}
                    </div>
                    <div className="element-content">
                      <div className="element-main">
                        {aspect.planet1} {aspect.aspect} {aspect.planet2}
                      </div>
                      <div className="element-details">
                        {userAName}: {aspect.planet1} in {aspect.planet1Sign}
                        {aspect.planet1House && ` H${aspect.planet1House}`}
                        <br />
                        {userBName}: {aspect.planet2} in {aspect.planet2Sign}
                        {aspect.planet2House && ` H${aspect.planet2House}`}
                      </div>
                      <div className="element-orb">Orb: {aspect.orb.toFixed(2)}°</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Synastry House Placements */}
            <div className="elements-section">
              <h4>Synastry House Placements</h4>
              <div className="elements-list">
                {synastryHousePlacementsData.map((placement, index) => (
                  <div
                    key={`synastry-placement-${index}`}
                    className={`element-card synastry-placement-card ${isSelected(placement) ? 'selected' : ''}`}
                    onClick={() => handleSelectElement(placement)}
                  >
                    <div className="element-header">
                      <span className="element-type">House Placement</span>
                      {isSelected(placement) && <span className="selected-badge">✓</span>}
                    </div>
                    <div className="element-content">
                      <div className="element-main">
                        {placement.planet} → House {placement.house}
                      </div>
                      <div className="element-details">
                        {placement.description}
                      </div>
                    </div>
                  </div>
                ))}
                {synastryHousePlacementsData.length === 0 && (
                  <div style={{ color: '#9ca3af', fontSize: '12px', fontStyle: 'italic', padding: '20px', textAlign: 'center' }}>
                    No synastry house placement data available
                  </div>
                )}
              </div>
            </div>

            {/* Composite Aspects */}
            <div className="elements-section">
              <h4>Composite Aspects</h4>
              <div className="elements-list">
                {compositeAspectsData.map((aspect, index) => (
                  <div
                    key={`composite-aspect-${index}`}
                    className={`element-card composite-aspect-card ${isSelected(aspect) ? 'selected' : ''}`}
                    onClick={() => handleSelectElement(aspect)}
                  >
                    <div className="element-header">
                      <span className="element-type">Composite</span>
                      {isSelected(aspect) && <span className="selected-badge">✓</span>}
                    </div>
                    <div className="element-content">
                      <div className="element-main">
                        {aspect.planet1} {aspect.aspect} {aspect.planet2}
                      </div>
                      <div className="element-orb">Orb: {aspect.orb.toFixed(2)}°</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Composite House Placements */}
            <div className="elements-section">
              <h4>Composite House Placements</h4>
              <div className="elements-list">
                {compositeHousePlacementsData.map((placement, index) => (
                  <div
                    key={`composite-placement-${index}`}
                    className={`element-card composite-placement-card ${isSelected(placement) ? 'selected' : ''}`}
                    onClick={() => handleSelectElement(placement)}
                  >
                    <div className="element-header">
                      <span className="element-type">Placement</span>
                      {isSelected(placement) && <span className="selected-badge">✓</span>}
                    </div>
                    <div className="element-content">
                      <div className="element-main">{placement.planet}</div>
                      <div className="element-details">
                        House {placement.house}
                      </div>
                    </div>
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
              <p className="chat-placeholder">Start a conversation by selecting relationship elements and/or asking a question...</p>
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
                              {element.source === 'synastry' && element.type === 'aspect'
                                ? `${element.planet1} ${element.aspect} ${element.planet2}`
                                : element.source === 'composite' && element.type === 'aspect'
                                ? `${element.planet1} ${element.aspect} ${element.planet2}`
                                : element.source === 'synastryHousePlacement'
                                ? `${element.planet} → House ${element.house}`
                                : `${element.planet} in H${element.house}`
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
                      : 'Relationship Assistant'}
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
                  Relationship Assistant
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
                placeholder="Ask a question about your relationship compatibility..."
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

export default RelationshipEnhancedChat;