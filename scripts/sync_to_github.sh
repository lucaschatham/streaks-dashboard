#!/usr/bin/env bash
# Sync Streaks data to GitHub repository
set -euo pipefail

# Configuration
REPO_DIR="/Users/HQ/builds/streaks-dashboard"
LOG_DIR="${REPO_DIR}/logs"
TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")

# Ensure we're in the repo directory
cd "$REPO_DIR"

# Log function
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "${LOG_DIR}/sync_$(date +%Y%m%d).log"
}

# Initialize git repo if needed
if [ ! -d ".git" ]; then
    log "Initializing git repository..."
    git init
    git config user.email "streaks-bot@localhost"
    git config user.name "Streaks Bot"
fi

# Check if remote exists
if ! git remote | grep -q origin; then
    log "Please set up GitHub remote first:"
    log "  git remote add origin https://github.com/YOUR_USERNAME/streaks-dashboard.git"
    exit 1
fi

# Extract fresh data
log "Running data extraction..."
python3 scripts/extract_streaks.py

# Check for changes
if git diff --quiet data/; then
    log "No changes detected in data files"
    exit 0
fi

# Stage changes
log "Staging data changes..."
git add data/latest.json data/daily_summary.json

# Only add archive files if they're new
git add data/streaks_*.json 2>/dev/null || true

# Commit changes
log "Committing changes..."
git commit -m "Update Streaks data - ${TIMESTAMP}

Automated update from Streaks app
- Updated habits and completion data
- Generated at: ${TIMESTAMP}"

# Push to GitHub
log "Pushing to GitHub..."
if git push origin main 2>&1 | tee -a "${LOG_DIR}/sync_$(date +%Y%m%d).log"; then
    log "Successfully pushed to GitHub"
else
    log "Failed to push to GitHub. Will retry on next run."
    exit 1
fi

log "Sync completed successfully"