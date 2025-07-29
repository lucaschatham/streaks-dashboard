# Quick Start Guide

## 🚀 Immediate Actions Required

### 1. Create GitHub Repository
Run this script and follow the prompts:
```bash
./create-github-repo.sh
```

### 2. Install Dependencies (while waiting for GitHub)
```bash
cd web && npm install && cd ..
```

### 3. Test Locally
```bash
# Extract current data
python3 scripts/extract_streaks.py

# View dashboard locally
cd web && npm run dev
# Open http://localhost:3000 in your browser
```

### 4. Enable Automatic Updates
```bash
# Install the scheduled job
cp com.user.streaks-sync.plist ~/Library/LaunchAgents/
launchctl load ~/Library/LaunchAgents/com.user.streaks-sync.plist

# Verify it's loaded
launchctl list | grep streaks
```

## 📍 Important URLs

- **GitHub Repo**: https://github.com/lucaschatham/streaks-dashboard
- **Live Dashboard**: https://lucaschatham.github.io/streaks-dashboard/
- **GitHub Pages Settings**: https://github.com/lucaschatham/streaks-dashboard/settings/pages

## 🔧 Common Commands

```bash
# Manual data update
python3 scripts/extract_streaks.py

# Manual sync to GitHub
./scripts/sync_to_github.sh

# Check system health
python3 scripts/health_check.py

# View today's logs
tail -f logs/extract_$(date +%Y%m%d).log
```

## ⏰ Update Schedule

- Automatic updates run at 2:05 AM and 2:05 PM daily
- Manual updates can be triggered anytime with the sync script

## 🔒 Privacy

- Your GitHub repo is set to private
- Only you can see your habit data
- Consider keeping it private since it contains personal information