# Deployment Guide

## Quick Start

1. **Run setup script**:
   ```bash
   ./setup.sh
   ```

2. **Create GitHub repository**:
   - Go to https://github.com/new
   - Create a new repository named `streaks-dashboard`
   - Keep it private if you prefer
   - Don't initialize with README

3. **Connect to GitHub**:
   ```bash
   git remote add origin https://github.com/lucaschatham/streaks-dashboard.git
   git push -u origin main
   ```

4. **Enable GitHub Pages**:
   - Go to repository Settings → Pages
   - Source: GitHub Actions
   - The site will be available at: `https://lucaschatham.github.io/streaks-dashboard/`

5. **Install automatic sync**:
   ```bash
   cp com.user.streaks-sync.plist ~/Library/LaunchAgents/
   launchctl load ~/Library/LaunchAgents/com.user.streaks-sync.plist
   ```

## Manual Operations

### Extract data manually:
```bash
python3 scripts/extract_streaks.py
```

### Sync to GitHub manually:
```bash
./scripts/sync_to_github.sh
```

### Check system health:
```bash
python3 scripts/health_check.py
```

### View logs:
```bash
tail -f logs/extract_$(date +%Y%m%d).log
tail -f logs/sync_$(date +%Y%m%d).log
```

### Uninstall launchd job:
```bash
launchctl unload ~/Library/LaunchAgents/com.user.streaks-sync.plist
rm ~/Library/LaunchAgents/com.user.streaks-sync.plist
```

## Troubleshooting

### Data not updating
1. Check if launchd job is running:
   ```bash
   launchctl list | grep streaks
   ```

2. Check logs for errors:
   ```bash
   cat logs/launchd_stderr.log
   ```

3. Run health check:
   ```bash
   python3 scripts/health_check.py
   ```

### Git push failures
1. Ensure you're authenticated with GitHub
2. Check network connectivity
3. Review sync logs for specific errors

### Database access issues
- Ensure Streaks app has been run at least once
- Check database path exists
- Verify no other process is locking the database

## Security Notes

- The dashboard should be kept private as it contains personal habit data
- Habit names are sanitized but still may reveal personal information
- Consider using a private GitHub repository
- The extraction script only reads data, never writes to the Streaks database