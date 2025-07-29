#!/usr/bin/env bash
# Simple script to push to GitHub

echo "📦 Pushing Streaks Dashboard to GitHub..."
echo ""
echo "Make sure you've created the repository at:"
echo "https://github.com/new"
echo ""
echo "Repository name should be: streaks-dashboard"
echo ""

# Check if remote exists
if ! git remote | grep -q origin; then
    echo "Adding GitHub remote..."
    git remote add origin https://github.com/lucaschatham/streaks-dashboard.git
fi

echo "Pushing to GitHub..."
echo "(You'll be prompted for your GitHub username and password/token)"
echo ""

# Push to GitHub
if git push -u origin main; then
    echo ""
    echo "✅ Success! Your code is now on GitHub."
    echo ""
    echo "Next steps:"
    echo "1. Enable GitHub Pages at:"
    echo "   https://github.com/lucaschatham/streaks-dashboard/settings/pages"
    echo "   (Select 'GitHub Actions' as the source)"
    echo ""
    echo "2. Your dashboard will be available at:"
    echo "   https://lucaschatham.github.io/streaks-dashboard/"
    echo ""
    echo "3. Check deployment status at:"
    echo "   https://github.com/lucaschatham/streaks-dashboard/actions"
else
    echo ""
    echo "❌ Push failed. Please check:"
    echo "1. You've created the repository on GitHub"
    echo "2. Your GitHub credentials are correct"
    echo "3. Try using a Personal Access Token instead of password"
    echo "   (Create one at: https://github.com/settings/tokens)"
fi