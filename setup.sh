#!/usr/bin/env bash
# Setup script for Streaks Dashboard
set -euo pipefail

echo "Setting up Streaks Dashboard..."

# Check dependencies
echo "Checking dependencies..."
command -v python3 >/dev/null 2>&1 || { echo "Python 3 is required but not installed."; exit 1; }
command -v git >/dev/null 2>&1 || { echo "Git is required but not installed."; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "Node.js/npm is required but not installed."; exit 1; }

# Initialize git repo if needed
if [ ! -d ".git" ]; then
    echo "Initializing git repository..."
    git init
    git config user.email "streaks-bot@localhost"
    git config user.name "Streaks Bot"
    git add .
    git commit -m "Initial commit"
fi

# Create initial data extraction
echo "Running initial data extraction..."
python3 scripts/extract_streaks.py

# Install web dependencies
echo "Installing web dependencies..."
cd web
npm install
cd ..

# Create initial git commit with data
echo "Committing initial data..."
git add data/
git commit -m "Initial data extraction" || true

# Install launchd agent
echo ""
echo "To enable automatic syncing, run:"
echo "  cp com.user.streaks-sync.plist ~/Library/LaunchAgents/"
echo "  launchctl load ~/Library/LaunchAgents/com.user.streaks-sync.plist"
echo ""
echo "To set up GitHub remote:"
echo "  git remote add origin https://github.com/YOUR_USERNAME/streaks-dashboard.git"
echo "  git push -u origin main"
echo ""
echo "To test the dashboard locally:"
echo "  cd web && npm run dev"
echo ""
echo "Setup complete!"