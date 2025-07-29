#!/usr/bin/env bash
set -euo pipefail

echo "=== Complete GitHub Setup for Streaks Dashboard ==="
echo ""
echo "⚠️  IMPORTANT: This script requires you to:"
echo "1. Have a GitHub account"
echo "2. Be ready to authenticate in your browser"
echo ""
echo "Press Enter to continue or Ctrl+C to cancel..."
read

# Function to handle GitHub authentication
auth_github() {
    echo "📝 Checking GitHub authentication..."
    if ! gh auth status &>/dev/null; then
        echo ""
        echo "You need to authenticate with GitHub."
        echo "When prompted:"
        echo "  1. Select 'GitHub.com'"
        echo "  2. Select 'HTTPS' for protocol"
        echo "  3. Authenticate with browser"
        echo ""
        echo "Opening browser for authentication..."
        gh auth login
    else
        echo "✅ Already authenticated with GitHub"
    fi
}

# Function to create and push repository
create_repo() {
    echo ""
    echo "📦 Creating GitHub repository..."
    
    # Try to create the repo
    if gh repo create lucaschatham/streaks-dashboard \
        --private \
        --description="Personal habit tracking dashboard for Streaks app" \
        --source=. \
        --push 2>/dev/null; then
        echo "✅ Repository created successfully!"
    else
        # Repo might already exist, try to set remote and push
        echo "Repository might already exist. Setting up remote..."
        
        # Remove existing remote if any
        git remote remove origin 2>/dev/null || true
        
        # Add new remote
        git remote add origin https://github.com/lucaschatham/streaks-dashboard.git
        
        # Push to GitHub
        echo "Pushing code to GitHub..."
        if git push -u origin main 2>/dev/null; then
            echo "✅ Code pushed successfully!"
        else
            # Try with master branch
            git push -u origin master 2>/dev/null || {
                echo "❌ Failed to push. You may need to:"
                echo "   1. Check if the repository exists at https://github.com/lucaschatham/streaks-dashboard"
                echo "   2. Delete it if it exists and run this script again"
                echo "   3. Or manually push with: git push -u origin main --force"
                return 1
            }
        fi
    fi
}

# Function to enable GitHub Pages
enable_pages() {
    echo ""
    echo "🌐 Enabling GitHub Pages..."
    
    # Try to enable pages via API
    if gh api \
        --method POST \
        -H "Accept: application/vnd.github+json" \
        /repos/lucaschatham/streaks-dashboard/pages \
        -f source='{"build_type":"workflow"}' 2>/dev/null; then
        echo "✅ GitHub Pages enabled!"
    else
        echo "GitHub Pages might already be enabled or requires manual setup."
    fi
}

# Function to trigger deployment
trigger_deploy() {
    echo ""
    echo "🚀 Triggering initial deployment..."
    
    # Create a small change to trigger workflow
    echo "" >> README.md
    git add README.md
    git commit -m "Trigger initial deployment" 2>/dev/null || true
    git push 2>/dev/null || true
    
    # Try to run workflow directly
    gh workflow run deploy.yml 2>/dev/null || true
}

# Main execution
main() {
    # Step 1: Authenticate
    auth_github
    
    # Step 2: Create repository
    create_repo
    
    # Step 3: Enable GitHub Pages
    enable_pages
    
    # Step 4: Trigger deployment
    trigger_deploy
    
    # Success message
    echo ""
    echo "✨ Setup Complete!"
    echo ""
    echo "📊 Your dashboard will be available at:"
    echo "   https://lucaschatham.github.io/streaks-dashboard/"
    echo "   (It may take 5-10 minutes for the first deployment)"
    echo ""
    echo "📍 Important links:"
    echo "   Repository: https://github.com/lucaschatham/streaks-dashboard"
    echo "   Actions: https://github.com/lucaschatham/streaks-dashboard/actions"
    echo "   Pages Settings: https://github.com/lucaschatham/streaks-dashboard/settings/pages"
    echo ""
    echo "⏰ To enable automatic daily updates:"
    echo "   cp com.user.streaks-sync.plist ~/Library/LaunchAgents/"
    echo "   launchctl load ~/Library/LaunchAgents/com.user.streaks-sync.plist"
    echo ""
    echo "🎉 You're all set! Check the Actions tab for deployment progress."
}

# Run main function
main