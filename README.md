# Stellium Frontend

Stellium Frontend is a React based interface for exploring astrological insights. The app provides tools to cast birth charts, view daily transits and analyze relationships. Pages are protected with a simple password gate during development.

## Features

- User sign up flow for capturing birth details
- Dashboard showing horoscope data and transit tables
- Relationship analysis with scoring and aspect details
- Protected routes requiring a password
- Integration with a backend API for chart calculations

## Requirements

- Node.js 16 or later
- npm

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file in the project root and define the following variables:

```
REACT_APP_SERVER_URL=<URL of your backend>
REACT_APP_GOOGLE_API_KEY=<Google Maps API key>
REACT_APP_PASSWORD=<optional password>
```

3. Start the development server:

```bash
npm start
```

The app will be available at `http://localhost:3000`.

### Testing

Run the test suite with:

```bash
npm test
```

### Building

Create an optimized production build with:

```bash
npm run build
```

The compiled output will be placed in the `build/` directory.

## Project Structure

```
src/
  UI/          # Reusable UI components
  Utilities/   # API helpers and state management
  pages/       # Route components
```

This project was bootstrapped with Create React App. You can customize its configuration by running `npm run eject` if necessary.

## License

MIT
