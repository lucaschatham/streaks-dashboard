#!/usr/bin/env python3
"""
Extract Streaks habit data from Core Data SQLite database.
Handles completions, progress tracking, and error recovery.
"""

import sqlite3
import json
import os
import sys
import logging
from datetime import datetime, timezone
from pathlib import Path
import tempfile
import shutil
from typing import Dict, List, Any

# Configure logging
LOG_DIR = Path.home() / "builds" / "streaks-dashboard" / "logs"
LOG_DIR.mkdir(exist_ok=True)
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(LOG_DIR / f"extract_{datetime.now().strftime('%Y%m%d')}.log"),
        logging.StreamHandler()
    ]
)

# Database paths
DB_PATH = Path.home() / "Library" / "Group Containers" / "group.com.streaksapp.streak.today" / "Streaks-Production.sqlite"
OUTPUT_DIR = Path.home() / "builds" / "streaks-dashboard" / "data"
OUTPUT_DIR.mkdir(exist_ok=True)

# Core Data epoch: Jan 1, 2001 00:00:00 GMT
COREDATA_EPOCH = datetime(2001, 1, 1, tzinfo=timezone.utc).timestamp()

def convert_coredata_timestamp(cd_timestamp: float) -> str:
    """Convert Core Data timestamp to ISO format."""
    if cd_timestamp is None:
        return None
    unix_timestamp = cd_timestamp + COREDATA_EPOCH
    return datetime.fromtimestamp(unix_timestamp, tz=timezone.utc).isoformat()

def sanitize_habit_name(name: str) -> str:
    """Sanitize habit names for privacy."""
    # Add custom sanitization rules here if needed
    # For now, just ensure it's a string
    return str(name) if name else "Unnamed Habit"

def create_safe_copy(source_db: Path) -> Path:
    """Create atomic copy of database to avoid locks."""
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.sqlite')
    temp_path = Path(temp_file.name)
    temp_file.close()
    
    try:
        # Use SQLite's backup API for safe copying
        source_conn = sqlite3.connect(f"file:{source_db}?mode=ro", uri=True)
        dest_conn = sqlite3.connect(temp_path)
        source_conn.backup(dest_conn)
        source_conn.close()
        dest_conn.close()
        logging.info(f"Created safe copy at {temp_path}")
        return temp_path
    except Exception as e:
        logging.error(f"Failed to create database copy: {e}")
        if temp_path.exists():
            temp_path.unlink()
        raise

def extract_habits(db_path: Path) -> List[Dict[str, Any]]:
    """Extract habit definitions."""
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    query = """
    SELECT 
        Z_PK as id,
        ZTITLE as name,
        ZISNEGATIVE as is_negative,
        ZACTIVESTREAK as active_streak,
        ZBESTSTREAK as best_streak,
        ZCREATED as created_date,
        ZLASTCOMPLETED as last_completed,
        ZTYPENAME as type_name,
        ZTYPETARGET as target_value,
        ZTYPEUNIT as unit
    FROM ZTASK
    WHERE ZTITLE IS NOT NULL
    ORDER BY ZDISPLAYORDER, Z_PK
    """
    
    habits = []
    for row in cursor.execute(query):
        habit = {
            'id': row['id'],
            'name': sanitize_habit_name(row['name']),
            'is_negative': bool(row['is_negative']),
            'active_streak': row['active_streak'] or 0,
            'best_streak': row['best_streak'] or 0,
            'created': convert_coredata_timestamp(row['created_date']),
            'last_completed': convert_coredata_timestamp(row['last_completed']),
            'type': row['type_name'],
            'target': row['target_value'],
            'unit': row['unit']
        }
        habits.append(habit)
    
    conn.close()
    return habits

def extract_log_entries(db_path: Path) -> List[Dict[str, Any]]:
    """Extract all log entries (completions, progress, etc)."""
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    query = """
    SELECT 
        l.Z_PK as id,
        l.ZTASK as task_id,
        t.ZTITLE as task_name,
        l.ZENTRYDATE as entry_date,
        l.ZENTRYTYPE as entry_type,
        l.ZPROGRESS as progress,
        l.ZPROGRESSTOTAL as progress_total,
        l.ZENTRYPERIODFROM as period_from,
        l.ZENTRYPERIODTO as period_to,
        l.ZENTRYPERIODTYPE as period_type,
        l.ZCREATEDTIMESTAMP as created_timestamp
    FROM ZTASKLOGENTRY l
    JOIN ZTASK t ON l.ZTASK = t.Z_PK
    WHERE t.ZTITLE IS NOT NULL
    ORDER BY l.ZENTRYDATE DESC
    """
    
    entries = []
    for row in cursor.execute(query):
        entry = {
            'id': row['id'],
            'task_id': row['task_id'],
            'task_name': sanitize_habit_name(row['task_name']),
            'entry_date': convert_coredata_timestamp(row['entry_date']),
            'entry_type': row['entry_type'],
            'progress': row['progress'],
            'progress_total': row['progress_total'],
            'period_from': convert_coredata_timestamp(row['period_from']),
            'period_to': convert_coredata_timestamp(row['period_to']),
            'period_type': row['period_type'],
            'created': convert_coredata_timestamp(row['created_timestamp'])
        }
        entries.append(entry)
    
    conn.close()
    return entries

def generate_summary_stats(habits: List[Dict], entries: List[Dict]) -> Dict[str, Any]:
    """Generate summary statistics."""
    # Group entries by date and habit
    from collections import defaultdict
    daily_completions = defaultdict(lambda: defaultdict(int))
    
    for entry in entries:
        if entry['entry_date']:
            date = entry['entry_date'][:10]  # YYYY-MM-DD
            daily_completions[date][entry['task_name']] += 1
    
    # Calculate streaks and other stats
    total_completions = len(entries)
    active_habits = len([h for h in habits if h['active_streak'] > 0])
    
    return {
        'generated_at': datetime.now(timezone.utc).isoformat(),
        'total_habits': len(habits),
        'active_habits': active_habits,
        'total_completions': total_completions,
        'daily_summary': dict(daily_completions)
    }

def main():
    """Main extraction workflow."""
    logging.info("Starting Streaks data extraction")
    
    if not DB_PATH.exists():
        logging.error(f"Database not found at {DB_PATH}")
        sys.exit(1)
    
    temp_db = None
    try:
        # Create safe copy
        temp_db = create_safe_copy(DB_PATH)
        
        # Extract data
        logging.info("Extracting habits...")
        habits = extract_habits(temp_db)
        logging.info(f"Found {len(habits)} habits")
        
        logging.info("Extracting log entries...")
        entries = extract_log_entries(temp_db)
        logging.info(f"Found {len(entries)} log entries")
        
        # Generate summary
        summary = generate_summary_stats(habits, entries)
        
        # Prepare output
        output_data = {
            'metadata': {
                'version': '1.0',
                'extracted_at': datetime.now(timezone.utc).isoformat(),
                'source': 'Streaks iOS/macOS App'
            },
            'habits': habits,
            'entries': entries,
            'summary': summary
        }
        
        # Write outputs
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        
        # Latest version (for quick access)
        latest_file = OUTPUT_DIR / 'latest.json'
        with open(latest_file, 'w') as f:
            json.dump(output_data, f, indent=2, ensure_ascii=False)
        logging.info(f"Wrote latest data to {latest_file}")
        
        # Timestamped archive
        archive_file = OUTPUT_DIR / f'streaks_{timestamp}.json'
        with open(archive_file, 'w') as f:
            json.dump(output_data, f, indent=2, ensure_ascii=False)
        logging.info(f"Wrote archive to {archive_file}")
        
        # Compact daily summary for web display
        summary_file = OUTPUT_DIR / 'daily_summary.json'
        with open(summary_file, 'w') as f:
            json.dump({
                'habits': [{'name': h['name'], 'streak': h['active_streak']} for h in habits],
                'recent_completions': entries[:100],  # Last 100 entries
                'summary': summary
            }, f, indent=2, ensure_ascii=False)
        logging.info(f"Wrote summary to {summary_file}")
        
        logging.info("Extraction completed successfully")
        
    except Exception as e:
        logging.error(f"Extraction failed: {e}", exc_info=True)
        sys.exit(1)
    finally:
        # Clean up temp file
        if temp_db and temp_db.exists():
            temp_db.unlink()
            logging.info("Cleaned up temporary files")

if __name__ == "__main__":
    main()