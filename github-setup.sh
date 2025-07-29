#!/usr/bin/env bash
set -euo pipefail

echo "=== GitHub Setup for Streaks Dashboard ==="
echo ""
echo "This script will:"
echo "1. Authenticate with GitHub"
echo "2. Create your repository"
echo "3. Push your code"
echo "4. Set up GitHub Pages"
echo ""

# Check if already authenticated
if ! gh auth status &>/dev/null; then
    echo "📝 First, let's authenticate with GitHub..."
    echo "Choose 'GitHub.com', then 'HTTPS', and follow the prompts."
    echo ""
    gh auth login
else
    echo "✅ Already authenticated with GitHub"
fi

echo ""
echo "📦 Creating repository..."

# Create the repository
if gh repo create lucaschatham/streaks-dashboard \
    --private \
    --source=. \
    --remote=origin \
    --description="Personal habit tracking dashboard for Streaks app" \
    --push 2>/dev/null; then
    echo "✅ Repository created and code pushed!"
else
    echo "Repository might already exist. Trying to push..."
    git remote add origin https://github.com/lucaschatham/streaks-dashboard.git 2>/dev/null || true
    git push -u origin master || git push -u origin main
fi

echo ""
echo "🌐 Configuring GitHub Pages..."

# Enable GitHub Pages via API
gh api \
  --method POST \
  -H "Accept: application/vnd.github+json" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  /repos/lucaschatham/streaks-dashboard/pages \
  -f source='{"workflow": "deploy"}' 2>/dev/null || {
    echo "GitHub Pages might already be enabled or needs manual setup."
    echo "Visit: https://github.com/lucaschatham/streaks-dashboard/settings/pages"
}

echo ""
echo "🚀 Triggering initial deployment..."

# Trigger workflow
gh workflow run deploy.yml 2>/dev/null || echo "Workflow will run on next push"

echo ""
echo "✨ Setup Complete!"
echo ""
echo "📊 Your dashboard will be available at:"
echo "   https://lucaschatham.github.io/streaks-dashboard/"
echo ""
echo "⏰ Next steps:"
echo "1. Wait 2-3 minutes for the initial deployment"
echo "2. Install automatic updates:"
echo "   cp com.user.streaks-sync.plist ~/Library/LaunchAgents/"
echo "   launchctl load ~/Library/LaunchAgents/com.user.streaks-sync.plist"
echo ""
echo "📍 Useful links:"
echo "   Repository: https://github.com/lucaschatham/streaks-dashboard"
echo "   Actions: https://github.com/lucaschatham/streaks-dashboard/actions"
echo "   Settings: https://github.com/lucaschatham/streaks-dashboard/settings"