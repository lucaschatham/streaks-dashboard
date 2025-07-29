# Streaks Dashboard

Automated data extraction and visualization for Streaks habit tracking app.

## Architecture

```
macOS Streaks app ──► Python extractor ──► JSON files ──► GitHub ──► Next.js dashboard
                           │                    │
                           └── launchd ─────────┘
```

## Setup

1. **Configure GitHub repository**:
   ```bash
   git remote add origin https://github.com/lucaschatham/streaks-dashboard.git
   ```

2. **Install launchd job** (runs nightly at 2:05 AM):
   ```bash
   cp com.user.streaks-sync.plist ~/Library/LaunchAgents/
   launchctl load ~/Library/LaunchAgents/com.user.streaks-sync.plist
   ```

3. **Manual run**:
   ```bash
   ./scripts/extract_streaks.py
   ./scripts/sync_to_github.sh
   ```

## Data Structure

- `data/latest.json` - Complete data dump (habits, entries, metadata)
- `data/daily_summary.json` - Lightweight summary for web display
- `logs/` - Extraction and sync logs

## Privacy

- Habit names are sanitized before publishing
- No personal identifiers are included
- Data is aggregated at the daily level

## Development

See `web/` directory for the Next.js dashboard implementation.