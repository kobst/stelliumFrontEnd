# Stellium Mobile App - API Integration Guide

## Overview

This guide provides comprehensive documentation of all APIs used in the Stellium web application that should be implemented in the mobile app. Each API is organized by functional area with complete request/response specifications, error handling patterns, and usage examples.

**Base Configuration:**
```javascript
const API_BASE_URL = process.env.REACT_APP_SERVER_URL;
const GOOGLE_API_KEY = process.env.REACT_APP_GOOGLE_API_KEY;

// All API requests use these headers
const defaultHeaders = {
  'Content-Type': 'application/json'
};
```

---

## 1. User Creation and Management APIs

### 1.1 Create User (Known Birth Time)

**Endpoint:** `POST /createUser`

**Description:** Creates a new user with known birth time and generates immediate overview analysis.

**Request Body:**
```javascript
{
  name: "John Doe",
  email: "john@example.com",
  birthYear: 1990,
  birthMonth: 5,          // 1-12
  birthDay: 15,
  birthHour: 14,          // 0-23
  birthMinute: 30,        // 0-59
  birthLocation: "New York, NY, USA",
  timezone: "America/New_York"
}
```

**Response:**
```javascript
{
  success: true,
  user: {
    _id: "user_id_123",
    name: "John Doe",
    email: "john@example.com",
    birthChart: {
      planets: [...],
      houses: [...],
      aspects: [...]
    },
    createdAt: "2024-01-15T10:30:00Z"
  },
  workflowId: "workflow_456",
  overview: {
    content: "Your sun in Taurus suggests...",
    interpretation: "Brief personality overview text"
  }
}
```

**Error Responses:**
```javascript
{
  success: false,
  error: "Invalid birth location",
  status: 400
}
```

**Used By:** Sign-up flow, user onboarding
**State Management:** Updates `userData`, `userId`, `userBirthChart`, `overviewContent`

### 1.2 Create User (Unknown Birth Time)

**Endpoint:** `POST /createUserUnknownTime`

**Description:** Creates user without specific birth time (uses noon as default).

**Request Body:**
```javascript
{
  name: "Jane Doe",
  email: "jane@example.com", 
  birthYear: 1985,
  birthMonth: 8,
  birthDay: 22,
  birthLocation: "Los Angeles, CA, USA",
  timezone: "America/Los_Angeles"
}
```

**Response:** Same structure as `/createUser` but with limited accuracy note.

### 1.3 Get User

**Endpoint:** `POST /getUser`

**Description:** Retrieves user data by ID.

**Request Body:**
```javascript
{
  userId: "user_id_123"
}
```

**Response:**
```javascript
{
  success: true,
  user: {
    _id: "user_id_123",
    name: "John Doe",
    email: "john@example.com",
    birthChart: {
      planets: [...],
      houses: [...], 
      aspects: [...]
    },
    analysis: {
      overview: "...",
      hasFullAnalysis: false,
      vectorizationStatus: {...}
    }
  }
}
```

**Used By:** App initialization, user profile loading

### 1.4 Delete User/Subject

**Endpoint:** `DELETE /subjects/{subjectId}`

**Description:** Deletes a user account and all associated data.

**Request Body (Optional):**
```javascript
{
  ownerUserId: "owner_id_123"  // Required for guest subjects
}
```

**Response:**
```javascript
{
  success: true,
  message: "Subject deleted successfully",
  deletionResults: {
    subjectDeleted: true,
    relatedRelationshipsDeleted: 3,
    chatHistoryDeleted: true
  }
}
```

**Used By:** Account deletion, guest profile management

---

## 2. Guest Subject Management APIs

### 2.1 Create Guest Subject (Known Time)

**Endpoint:** `POST /createGuestSubject`

**Description:** Creates a guest birth chart owned by a user.

**Request Body:**
```javascript
{
  name: "Friend Name",
  birthYear: 1992,
  birthMonth: 3,
  birthDay: 10,
  birthHour: 8,
  birthMinute: 45,
  birthLocation: "Chicago, IL, USA",
  timezone: "America/Chicago",
  ownerUserId: "user_id_123"  // Required
}
```

**Response:**
```javascript
{
  success: true,
  guestSubject: {
    _id: "guest_id_456",
    name: "Friend Name",
    ownerUserId: "user_id_123",
    birthChart: {...},
    isGuest: true
  },
  workflowId: "workflow_789",
  overview: "Guest chart overview text"
}
```

### 2.2 Create Guest Subject (Unknown Time)

**Endpoint:** `POST /createGuestSubjectUnknownTime`

**Description:** Creates guest subject without specific birth time.

**Request Body:** Same as above minus time fields.

### 2.3 Get User Subjects

**Endpoint:** `POST /getUserSubjects`

**Description:** Retrieves all guest subjects owned by a user.

**Request Body:**
```javascript
{
  ownerUserId: "user_id_123"
}
```

**Response:**
```javascript
{
  success: true,
  subjects: [
    {
      _id: "guest_id_456",
      name: "Friend Name",
      ownerUserId: "user_id_123",
      birthChart: {...},
      isGuest: true,
      createdAt: "2024-01-15T10:30:00Z"
    }
  ]
}
```

**Used By:** Profile management screen, relationship creation

### 2.4 Guest Creation Status

**Endpoint:** `POST /guest/creation-status`

**Description:** Checks status of guest creation workflow.

**Request Body:**
```javascript
{
  workflowId: "workflow_789"
}
```

**Response:**
```javascript
{
  success: true,
  status: "completed",
  progress: 100,
  currentPhase: "overview_complete",
  guestSubject: {...}
}
```

---

## 3. Birth Chart Analysis Workflow APIs

### 3.1 Fetch Analysis

**Endpoint:** `POST /fetchAnalysis`

**Description:** Retrieves existing analysis data for a subject.

**Request Body:**
```javascript
{
  userId: "user_id_123"
}
```

**Response:**
```javascript
{
  success: true,
  analysis: {
    birthChartAnalysisId: "analysis_id_456",
    interpretation: {
      overview: "Your birth chart reveals...",
      planets: {...},
      patterns: {...},
      topics: {...}
    },
    vectorizationStatus: {
      basicAnalysis: true,
      topicAnalysis: false,
      chatEnabled: false
    },
    hasFullAnalysis: false,
    stage: 1
  }
}
```

### 3.2 Start Full Analysis (Stage 2)

**Endpoint:** `POST /analysis/start-full`

**Description:** Initiates comprehensive analysis workflow after initial overview.

**Request Body:**
```javascript
{
  userId: "user_id_123"
}
```

**Response:**
```javascript
{
  success: true,
  workflowId: "full_analysis_workflow_789",
  message: "Full analysis started",
  estimatedDuration: "5-10 minutes"
}
```

### 3.3 Check Full Analysis Status

**Endpoint:** `POST /analysis/full-status`

**Description:** Polls progress of full analysis with detailed tracking.

**Request Body:**
```javascript
{
  userId: "user_id_123",
  workflowId: "full_analysis_workflow_789"  // Optional
}
```

**Response:**
```javascript
{
  success: true,
  isCompleted: false,
  progress: {
    percentage: 45,
    currentPhase: "topic_analysis",
    completedTasks: 18,
    totalTasks: 40,
    currentTask: "Analyzing communication patterns"
  },
  stages: {
    planets: "completed",
    patterns: "completed", 
    topics: "in_progress",
    vectorization: "pending",
    chat_preparation: "pending"
  }
}
```

**When Complete:**
```javascript
{
  success: true,
  isCompleted: true,
  progress: {
    percentage: 100,
    currentPhase: "complete"
  },
  message: "Full analysis completed successfully"
}
```

**Used By:** Analysis progress tracking, UI state management
**Polling Pattern:** Check every 3-5 seconds until `isCompleted: true`

### 3.4 Get Complete Analysis Data

**Endpoint:** `POST /analysis/complete-data`

**Description:** Retrieves full analysis results after completion.

**Request Body:**
```javascript
{
  userId: "user_id_123",
  workflowId: "full_analysis_workflow_789"  // Optional
}
```

**Response:**
```javascript
{
  success: true,
  completeAnalysis: {
    birthChartAnalysisId: "analysis_id_456",
    interpretation: {
      overview: "...",
      planets: {
        SUN: "Detailed sun analysis...",
        MOON: "Detailed moon analysis...",
        // ... all planets
      },
      patterns: {
        dominantElements: {...},
        aspects: {...},
        tensionFlow: {...}
      },
      topics: {
        PERSONALITY_IDENTITY: {
          PERSONAL_IDENTITY: "Deep identity analysis...",
          // ... all subtopics
        }
        // ... all topic areas
      }
    },
    vectorizationStatus: {
      basicAnalysis: true,
      topicAnalysis: true,
      chatEnabled: true
    },
    hasFullAnalysis: true,
    stage: 2
  }
}
```

### 3.5 Legacy Workflow APIs (Backward Compatibility)

#### Start Legacy Workflow
**Endpoint:** `POST /workflow/individual/start`

#### Get Legacy Workflow Status  
**Endpoint:** `POST /workflow/individual/status`

#### Resume Legacy Workflow
**Endpoint:** `POST /workflow/individual/resume`

#### Get Legacy Complete Data
**Endpoint:** `POST /workflow/get-complete-data`

**Note:** These are maintained for backward compatibility but new mobile implementations should use the new analysis workflow system.

---

## 4. Relationship Analysis APIs

### 4.1 Create Relationship (Enhanced)

**Endpoint:** `POST /enhanced-relationship-analysis`

**Description:** Creates relationship analysis with immediate scores and overview.

**Request Body:**
```javascript
{
  userIdA: "user_id_123",
  userIdB: "user_id_456",
  ownerUserId: "user_id_123",      // Optional: owner of relationship
  celebRelationship: false          // Optional: celebrity relationship flag
}
```

**Response:**
```javascript
{
  success: true,
  compositeChartId: "composite_789",
  scores: {
    OVERALL_ATTRACTION_CHEMISTRY: 85,
    EMOTIONAL_SECURITY_CONNECTION: 78,
    COMMUNICATION_LEARNING: 92,
    VALUES_GOALS_DIRECTION: 71,
    INTIMACY_SEXUALITY: 88,
    LONG_TERM_STABILITY: 79,
    SPIRITUAL_GROWTH: 83
  },
  scoreAnalysis: {
    OVERALL_ATTRACTION_CHEMISTRY: "Strong physical and energetic connection...",
    EMOTIONAL_SECURITY_CONNECTION: "Good emotional compatibility...",
    // ... analysis for each category
  },
  holisticOverview: "This relationship shows strong potential...",
  synastryAspects: [...],
  compositeBirthChart: {...}
}
```

**Fallback Endpoint:** `POST /experimental/relationship-analysis-enhanced`

### 4.2 Fetch Relationship Analysis

**Endpoint:** `POST /fetchRelationshipAnalysis`

**Description:** Retrieves existing relationship analysis data.

**Request Body:**
```javascript
{
  compositeChartId: "composite_789"
}
```

**Response:**
```javascript
{
  success: true,
  relationshipAnalysis: {
    compositeChartId: "composite_789",
    userA: {...},
    userB: {...},
    scores: {...},
    scoreAnalysis: {...},
    holisticOverview: "...",
    synastryAspects: [...],
    compositeBirthChart: {...},
    hasFullAnalysis: false,
    vectorizationStatus: {...}
  }
}
```

### 4.3 Get User Composite Charts

**Endpoint:** `POST /getUserCompositeCharts`

**Description:** Retrieves all relationships owned by a user.

**Request Body:**
```javascript
{
  ownerUserId: "user_id_123"
}
```

**Response:**
```javascript
{
  success: true,
  compositeCharts: [
    {
      _id: "composite_789",
      userA: {
        _id: "user_id_123",
        name: "John Doe"
      },
      userB: {
        _id: "user_id_456", 
        name: "Jane Smith"
      },
      scores: {...},
      createdAt: "2024-01-15T10:30:00Z",
      hasFullAnalysis: false
    }
  ]
}
```

### 4.4 Delete Relationship

**Endpoint:** `DELETE /relationships/{compositeChartId}`

**Description:** Deletes a relationship analysis.

**Request Body (Optional):**
```javascript
{
  ownerUserId: "user_id_123"  // Optional ownership verification
}
```

**Response:**
```javascript
{
  success: true,
  message: "Relationship deleted successfully"
}
```

### 4.5 Relationship Workflow APIs

#### Start Relationship Workflow
**Endpoint:** `POST /workflow/relationship/start`

**Request Body:**
```javascript
{
  userIdA: "user_id_123",
  userIdB: "user_id_456", 
  compositeChartId: "composite_789",  // For existing relationships
  immediate: true
}
```

#### Get Relationship Workflow Status
**Endpoint:** `POST /workflow/relationship/status`

#### Resume Relationship Workflow
**Endpoint:** `POST /workflow/relationship/resume`

---

## 5. Chat Functionality APIs

### 5.1 Birth Chart Chat

**Endpoint:** `POST /userChatBirthChartAnalysis`

**Description:** Send chat message about user's birth chart analysis.

**Request Body:**
```javascript
{
  userId: "user_id_123",
  birthChartAnalysisId: "analysis_id_456",
  query: "What does my Mars in Leo mean for my career?"
}
```

**Response:**
```javascript
{
  success: true,
  answer: "Your Mars in Leo placement suggests strong leadership qualities in your career. You likely approach professional challenges with confidence and creativity...",
  timestamp: "2024-01-15T10:30:00Z"
}
```

### 5.2 Fetch Birth Chart Chat History

**Endpoint:** `POST /fetchUserChatBirthChartAnalysis`

**Description:** Retrieves chat history for birth chart analysis.

**Request Body:**
```javascript
{
  userId: "user_id_123",
  birthChartAnalysisId: "analysis_id_456"
}
```

**Response:**
```javascript
{
  success: true,
  chatHistory: [
    {
      query: "What does my sun sign mean?",
      answer: "Your sun in Taurus represents...",
      timestamp: "2024-01-15T09:30:00Z"
    },
    {
      query: "Tell me about my moon sign",
      answer: "Your moon in Pisces indicates...",
      timestamp: "2024-01-15T10:15:00Z"
    }
  ]
}
```

### 5.3 Relationship Chat

**Endpoint:** `POST /userChatRelationshipAnalysis`

**Description:** Send chat message about relationship analysis.

**Request Body:**
```javascript
{
  userId: "user_id_123",
  compositeChartId: "composite_789",
  query: "How compatible are we in terms of communication?"
}
```

**Response:**
```javascript
{
  success: true,
  answer: "Based on your synastry analysis, your communication compatibility scores 92/100. Your Mercury aspects suggest...",
  timestamp: "2024-01-15T10:30:00Z"
}
```

### 5.4 Fetch Relationship Chat History

**Endpoint:** `POST /fetchUserChatRelationshipAnalysis`

**Description:** Retrieves chat history for relationship analysis.

### 5.5 General User Query

**Endpoint:** `POST /handleUserQuery`

**Description:** Handles general astrological queries.

**Request Body:**
```javascript
{
  userId: "user_id_123",
  query: "What is a birth chart?"
}
```

**Prerequisites:** Chat functionality requires completed vectorization of analysis data (`vectorizationStatus.chatEnabled: true`).

---

## 6. Horoscope APIs

### 6.1 Generate Daily Horoscope

**Endpoint:** `POST /users/{userId}/horoscope/daily`

**Description:** Generates daily horoscope for specific date.

**Request Body:**
```javascript
{
  startDate: "2024-01-15"  // ISO date string
}
```

**Response:**
```javascript
{
  success: true,
  horoscope: {
    id: "horoscope_123",
    type: "daily",
    text: "Today brings powerful energy for new beginnings...",
    startDate: "2024-01-15",
    endDate: "2024-01-15",
    keyTransits: [
      {
        planet: "Mars",
        aspect: "trine",
        targetPlanet: "Jupiter",
        influence: "positive energy for action"
      }
    ],
    analysis: {
      keyThemes: ["new beginnings", "communication", "relationships"],
      overallTone: "optimistic"
    },
    createdAt: "2024-01-15T06:00:00Z"
  }
}
```

### 6.2 Generate Weekly Horoscope

**Endpoint:** `POST /users/{userId}/horoscope/weekly`

**Request Body:**
```javascript
{
  startDate: "2024-01-15"  // Monday of the week
}
```

### 6.3 Generate Monthly Horoscope

**Endpoint:** `POST /users/{userId}/horoscope/monthly`

**Request Body:**
```javascript
{
  startDate: "2024-01-01"  // First day of month
}
```

### 6.4 Generate Custom Horoscope

**Endpoint:** `POST /users/{userId}/horoscope/custom`

**Description:** Generates personalized horoscope from selected transits.

**Request Body:**
```javascript
{
  transitEvents: [
    {
      id: "transit_123",
      description: "Mars trine Jupiter",
      startDate: "2024-01-15",
      endDate: "2024-01-18",
      exactDate: "2024-01-16",
      planetA: "Mars",
      planetB: "Jupiter",
      aspect: "trine",
      orb: 2.5
    }
  ]
}
```

**Response:**
```javascript
{
  success: true,
  customHoroscope: {
    content: "Based on your selected transits, this period brings exceptional opportunities for growth and expansion...",
    selectedTransits: [...],
    createdAt: "2024-01-15T10:30:00Z",
    duration: "3 days"
  }
}
```

### 6.5 Get Horoscope History

**Endpoint:** `GET /users/{userId}/horoscopes`

**Query Parameters:**
- `type`: "daily", "weekly", "monthly", "custom" (optional)
- `limit`: Number of horoscopes to return (default 10)

**Response:**
```javascript
{
  success: true,
  horoscopes: [
    {
      id: "horoscope_123",
      type: "daily",
      text: "...",
      startDate: "2024-01-15",
      createdAt: "2024-01-15T06:00:00Z"
    }
  ],
  total: 25
}
```

### 6.6 Get Latest Horoscope

**Endpoint:** `GET /users/{userId}/horoscope/latest`

**Query Parameters:**
- `type`: Horoscope type filter (optional)

### 6.7 Delete Horoscope

**Endpoint:** `DELETE /users/{userId}/horoscopes/{horoscopeId}`

---

## 7. Transit Calculation APIs

### 7.1 Get Transit Windows

**Endpoint:** `POST /getTransitWindows`

**Description:** Calculates astrological transits for date range.

**Request Body:**
```javascript
{
  userId: "user_id_123",
  from: "2024-01-15",     // ISO date string
  to: "2024-02-15"        // ISO date string  
}
```

**Response:**
```javascript
{
  success: true,
  transitEvents: [
    {
      id: "transit_123",
      description: "Mars trine Jupiter",
      startDate: "2024-01-15",
      endDate: "2024-01-18", 
      exactDate: "2024-01-16",
      planetA: "Mars",
      planetB: "Jupiter",
      aspect: "trine",
      orb: 2.5,
      interpretation: "This transit brings optimistic energy...",
      influence: "positive"
    }
  ]
}
```

**Used By:** Custom horoscope creation, transit filtering
**Date Range:** Typically 1-3 months for optimal performance

---

## 8. Celebrity APIs

### 8.1 Fetch Celebrities

**Endpoint:** `POST /getCelebs`

**Description:** Retrieves celebrity birth chart database.

**Request Body:** `{}` (empty)

**Response:**
```javascript
{
  success: true,
  celebrities: [
    {
      _id: "celeb_123",
      name: "Celebrity Name",
      birthChart: {...},
      profession: "Actor",
      birthDate: "1980-05-15",
      birthLocation: "Los Angeles, CA",
      isCelebrity: true
    }
  ]
}
```

### 8.2 Get Celebrity Relationships

**Endpoint:** `POST /getCelebrityRelationships`

**Description:** Retrieves pre-analyzed celebrity relationships.

**Request Body:**
```javascript
{
  limit: 50  // Optional, default 50
}
```

**Response:**
```javascript
{
  success: true,
  relationships: [
    {
      _id: "celeb_rel_123",
      userA: {
        name: "Celebrity A",
        profession: "Actor"
      },
      userB: {
        name: "Celebrity B", 
        profession: "Singer"
      },
      scores: {...},
      relationshipType: "celebrity"
    }
  ]
}
```

**Note:** Celebrity creation APIs (`/createCeleb`, `/createCelebUnknownTime`) are admin-only and excluded from mobile app.

---

## 9. Utility APIs

### 9.1 Google Maps Timezone API (External)

**Function:** `fetchTimeZone(lat, lon, epochTimeSeconds)`

**Description:** Retrieves timezone information for birth location.

**URL:** `https://maps.googleapis.com/maps/api/timezone/json`

**Parameters:**
- `location`: "{lat},{lon}"
- `timestamp`: Unix timestamp
- `key`: Google API key

**Response:**
```javascript
{
  status: "OK",
  rawOffset: -28800,     // Seconds from UTC
  dstOffset: 3600,       // Daylight saving offset
  timeZoneId: "America/Los_Angeles",
  timeZoneName: "Pacific Standard Time"
}
```

**Used By:** Birth chart creation, timezone validation

### 9.2 Get Short Overview

**Endpoint:** `POST /getShortOverview`

**Description:** Generates brief personality overview from birth data.

**Request Body:**
```javascript
{
  birthData: {
    birthYear: 1990,
    birthMonth: 5,
    birthDay: 15,
    birthHour: 14,
    birthMinute: 30,
    birthLocation: "New York, NY, USA",
    timezone: "America/New_York"
  }
}
```

**Response:**
```javascript
{
  success: true,
  overview: "With your Sun in Taurus and Moon in Pisces, you combine practical earth energy with intuitive water wisdom..."
}
```

### 9.3 Get Planet Overview

**Endpoint:** `POST /getShortOverviewPlanet`

**Description:** Generates overview for specific planet placement.

**Request Body:**
```javascript
{
  planetName: "Mars",
  birthData: {...}
}
```

**Response:**
```javascript
{
  success: true,
  planetOverview: "Your Mars in Leo placement gives you a bold, dramatic approach to pursuing your goals..."
}
```

---

## Error Handling Patterns

### Standard Error Response
```javascript
{
  success: false,
  error: "Descriptive error message",
  status: 400,
  details: "Additional error context"
}
```

### Common Error Codes
- `400`: Invalid request parameters
- `404`: Resource not found  
- `500`: Server error
- `503`: Service temporarily unavailable

### Error Handling Strategy
```javascript
try {
  const response = await fetch(endpoint, options);
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || `HTTP ${response.status}`);
  }
  
  return await response.json();
} catch (error) {
  // Handle network errors
  if (error.name === 'TypeError') {
    throw new Error('Network connection failed');
  }
  throw error;
}
```

---

## Mobile Implementation Notes

### 1. **Background Processing**
- Use background tasks for long-running analysis workflows
- Implement push notifications for completion alerts
- Store progress locally for app restart recovery

### 2. **Offline Support**
- Cache completed analysis data locally
- Queue API requests when offline
- Sync when connection restored

### 3. **Performance Optimization**
- Implement request batching where possible
- Use pagination for large datasets (celebrities, horoscope history)
- Compress request/response data

### 4. **State Management**
- Store workflow IDs for resuming processes
- Cache user data and analysis results
- Implement optimistic updates for better UX

### 5. **Security**
- Use secure storage for user tokens
- Validate all input data before API calls
- Implement request rate limiting

This comprehensive API guide provides all the endpoints and patterns needed to implement the full Stellium functionality in a React Native mobile application.