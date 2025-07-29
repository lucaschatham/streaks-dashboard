#!/usr/bin/env python3
"""
Health check script for Streaks Dashboard.
Monitors data freshness and extraction success.
"""

import json
import sys
from datetime import datetime, timezone, timedelta
from pathlib import Path
import subprocess

# Configuration
DATA_DIR = Path.home() / "builds" / "streaks-dashboard" / "data"
LOG_DIR = Path.home() / "builds" / "streaks-dashboard" / "logs"
MAX_AGE_HOURS = 26  # Alert if data is older than 26 hours

def check_data_freshness():
    """Check if the latest data is fresh enough."""
    latest_file = DATA_DIR / "latest.json"
    
    if not latest_file.exists():
        return False, "No data file found"
    
    try:
        with open(latest_file) as f:
            data = json.load(f)
        
        extracted_at = datetime.fromisoformat(data['metadata']['extracted_at'].replace('Z', '+00:00'))
        age = datetime.now(timezone.utc) - extracted_at
        
        if age > timedelta(hours=MAX_AGE_HOURS):
            return False, f"Data is {age.total_seconds() / 3600:.1f} hours old"
        
        return True, f"Data is {age.total_seconds() / 3600:.1f} hours old"
        
    except Exception as e:
        return False, f"Failed to check data: {e}"

def check_recent_logs():
    """Check for recent errors in logs."""
    errors = []
    
    # Check today's logs
    today = datetime.now().strftime('%Y%m%d')
    log_files = [
        LOG_DIR / f"extract_{today}.log",
        LOG_DIR / f"sync_{today}.log"
    ]
    
    for log_file in log_files:
        if log_file.exists():
            with open(log_file) as f:
                for line in f:
                    if 'ERROR' in line or 'CRITICAL' in line:
                        errors.append(f"{log_file.name}: {line.strip()}")
    
    return len(errors) == 0, errors

def send_notification(title, message):
    """Send macOS notification."""
    subprocess.run([
        'osascript', '-e',
        f'display notification "{message}" with title "{title}"'
    ])

def main():
    """Run health checks."""
    issues = []
    
    # Check data freshness
    fresh_ok, fresh_msg = check_data_freshness()
    if not fresh_ok:
        issues.append(f"Data freshness: {fresh_msg}")
    
    # Check logs
    logs_ok, log_errors = check_recent_logs()
    if not logs_ok:
        issues.append(f"Found {len(log_errors)} errors in logs")
    
    if issues:
        print(f"Health check failed at {datetime.now()}")
        for issue in issues:
            print(f"  - {issue}")
        
        # Send notification
        send_notification(
            "Streaks Dashboard Alert",
            f"{len(issues)} issue(s) detected. Check logs."
        )
        
        sys.exit(1)
    else:
        print(f"Health check passed at {datetime.now()}")
        print(f"  - {fresh_msg}")
        print(f"  - No errors in logs")

if __name__ == "__main__":
    main()