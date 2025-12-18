# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Start development server:**
```bash
npm start
```

**Run tests:**
```bash
npm test
```

**Build for production:**
```bash
npm run build
```

**Environment setup:**
Create a `.env` file with:
```
REACT_APP_SERVER_URL=<backend API URL>
REACT_APP_GOOGLE_API_KEY=<Google Maps API key>
REACT_APP_PASSWORD=<optional development password>
```

## Architecture Overview

**Core Technology Stack:**
- React 18 with functional components and hooks
- React Router for navigation
- Zustand for global state management
- Create React App configuration

**Key State Management:**
- Central store (`src/Utilities/store.js`) manages user data, birth chart analysis, and UI states
- Multiple analysis workflows with vectorization tracking
- Chat functionality with message history persistence

**Main Data Flow:**
1. User sign-up captures birth details via Google Places API
2. Backend API generates astrological charts and interpretations
3. Analysis workflow: Basic → Vectorization → Topic Analysis → Vectorization
4. Chat interface allows querying vectorized analysis data
5. Transit calculations provide ongoing horoscope data

**Core Pages:**
- `/signUp` - User registration with birth data collection
- `/userDashboard` - Main analysis dashboard with tabbed interface
- `/synastry` - Relationship compatibility analysis
- `/compositeDashboard` - Composite chart analysis
- `/prototype` - Development testing interface

**Authentication:**
- Simple password protection (`passwordProtection.js`) wraps all routes
- Development mode uses `REACT_APP_PASSWORD` environment variable
- Session-based authentication with `sessionStorage`

**API Integration:**
- All backend communication through `src/Utilities/api.js`
- RESTful endpoints for chart generation, analysis, and chat
- Google Maps API for timezone and location services
- Progressive analysis with resumable workflows

**Component Organization:**
- `src/UI/` - Reusable components (birth charts, tables, forms)
- `src/pages/` - Route-level page components
- `src/Utilities/` - API functions, state management, constants
- `src/MiscUtilities/` - Helper functions for data processing

**Key Features:**
- Multi-step birth chart analysis with progress tracking
- Vectorized analysis storage for chat functionality
- Transit window calculations for horoscope data
- Relationship analysis (synastry and composite charts)
- Tabbed dashboard interface with conditional rendering

**Constants & Configuration:**
- Extensive astrological constants in `src/Utilities/constants.js`
- Planet, sign, aspect, and topic enumerations
- Analysis workflow state definitions
- API endpoint constants and error handling

**Development Notes:**
- Components use modern React patterns (hooks, functional components)
- State updates follow immutable patterns with Zustand
- Error boundaries and loading states implemented throughout
- Progressive enhancement approach for analysis features