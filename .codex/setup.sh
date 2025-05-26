#!/usr/bin/env bash
set -euo pipefail

# Install Node.js and npm if they are not installed
if ! command -v node >/dev/null 2>&1; then
  echo "Node.js not found. Installing..."
  apt-get update
  apt-get install -y nodejs npm
fi

# Install project dependencies
npm install

# Create a default .env if one does not exist
if [ ! -f .env ]; then
  cat <<'EOT' > .env
REACT_APP_SERVER_URL=http://localhost:8000
REACT_APP_GOOGLE_API_KEY=REPLACE_WITH_YOUR_KEY
REACT_APP_PASSWORD=changeme
EOT
  echo "Created default .env file. Update it with your settings."
fi

