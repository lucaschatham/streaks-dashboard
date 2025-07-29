export interface Habit {
  id: number
  name: string
  is_negative: boolean
  active_streak: number
  best_streak: number
  created: string | null
  last_completed: string | null
  type: string | null
  target: number | null
  unit: string | null
}

export interface LogEntry {
  id: number
  task_id: number
  task_name: string
  entry_date: string | null
  entry_type: number
  progress: number | null
  progress_total: number | null
  period_from: string | null
  period_to: string | null
  period_type: string | null
  created: string | null
}

export interface Summary {
  generated_at: string
  total_habits: number
  active_habits: number
  total_completions: number
  daily_summary: Record<string, Record<string, number>>
}

export interface StreaksData {
  metadata: {
    version: string
    extracted_at: string
    source: string
  }
  habits: Habit[]
  entries: LogEntry[]
  summary: Summary
}