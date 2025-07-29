#!/usr/bin/env bash
# Script to help create GitHub repository

echo "=== GitHub Repository Setup for Streaks Dashboard ==="
echo ""
echo "Since GitHub CLI is not installed, please follow these steps:"
echo ""
echo "1. Open your browser and go to: https://github.com/new"
echo ""
echo "2. Create a new repository with these settings:"
echo "   - Repository name: streaks-dashboard"
echo "   - Description: Personal habit tracking dashboard for Streaks app"
echo "   - Set to Private (recommended for personal data)"
echo "   - DO NOT initialize with README, .gitignore, or license"
echo ""
echo "3. After creating the repo, come back here and press Enter"
read -p "Press Enter when you've created the repository..."

echo ""
echo "4. Now let's connect and push your code:"
echo ""

# Add remote
echo "Adding GitHub remote..."
git remote add origin https://github.com/lucaschatham/streaks-dashboard.git 2>/dev/null || {
    echo "Remote already exists, updating URL..."
    git remote set-url origin https://github.com/lucaschatham/streaks-dashboard.git
}

# Push to GitHub
echo "Pushing code to GitHub..."
echo "(You may be prompted for your GitHub credentials)"
echo ""

git push -u origin master

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Success! Your code is now on GitHub."
    echo ""
    echo "5. Final step - Enable GitHub Pages:"
    echo "   - Go to: https://github.com/lucaschatham/streaks-dashboard/settings/pages"
    echo "   - Under 'Source', select 'GitHub Actions'"
    echo "   - Click Save"
    echo ""
    echo "6. Your dashboard will be available at:"
    echo "   https://lucaschatham.github.io/streaks-dashboard/"
    echo "   (It may take a few minutes for the first deployment)"
    echo ""
    echo "7. To enable automatic daily updates, run:"
    echo "   cp com.user.streaks-sync.plist ~/Library/LaunchAgents/"
    echo "   launchctl load ~/Library/LaunchAgents/com.user.streaks-sync.plist"
else
    echo ""
    echo "❌ Push failed. Please check your GitHub credentials and try again:"
    echo "   git push -u origin master"
fi