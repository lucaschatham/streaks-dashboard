# Manual GitHub Setup Guide

Since GitHub CLI requires interactive authentication, here's the manual setup process:

## Step 1: Create GitHub Repository

1. Open your browser and go to: https://github.com/new
2. Fill in:
   - Repository name: `streaks-dashboard`
   - Description: `Personal habit tracking dashboard for Streaks app`
   - Set to **Private** (recommended)
   - **DO NOT** initialize with README, .gitignore, or license
3. Click "Create repository"

## Step 2: Push Your Code

Run these commands in Terminal:

```bash
cd /Users/HQ/builds/streaks-dashboard

# Add GitHub remote
git remote add origin https://github.com/lucaschatham/streaks-dashboard.git

# Push your code
git push -u origin main
```

When prompted, enter your GitHub username and password (or personal access token).

## Step 3: Enable GitHub Pages

1. Go to: https://github.com/lucaschatham/streaks-dashboard/settings/pages
2. Under "Source", select "GitHub Actions"
3. Click "Save"

## Step 4: Wait for Deployment

1. Check deployment progress at: https://github.com/lucaschatham/streaks-dashboard/actions
2. Your dashboard will be live at: https://lucaschatham.github.io/streaks-dashboard/
   (First deployment takes 5-10 minutes)

## Step 5: Enable Automatic Updates

```bash
# Install the scheduled job
cp com.user.streaks-sync.plist ~/Library/LaunchAgents/
launchctl load ~/Library/LaunchAgents/com.user.streaks-sync.plist

# Verify it's running
launchctl list | grep streaks
```

## That's it! 🎉

Your Streaks dashboard is now set up and will update automatically twice daily.