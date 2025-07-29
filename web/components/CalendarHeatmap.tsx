import { LogEntry } from '@/lib/types'
import { format, startOfDay, eachDayOfInterval, subDays } from 'date-fns'

interface CalendarHeatmapProps {
  entries: LogEntry[]
}

export default function CalendarHeatmap({ entries }: CalendarHeatmapProps) {
  // Calculate daily completion counts
  const dailyCounts: Record<string, number> = {}
  
  entries.forEach(entry => {
    if (entry.entry_date) {
      const date = format(new Date(entry.entry_date), 'yyyy-MM-dd')
      dailyCounts[date] = (dailyCounts[date] || 0) + 1
    }
  })

  // Generate last 365 days
  const endDate = new Date()
  const startDate = subDays(endDate, 364)
  const days = eachDayOfInterval({ start: startDate, end: endDate })

  // Get max count for scaling
  const maxCount = Math.max(...Object.values(dailyCounts), 1)

  // Group by weeks
  const weeks: Date[][] = []
  let currentWeek: Date[] = []
  
  days.forEach((day, index) => {
    currentWeek.push(day)
    if (day.getDay() === 6 || index === days.length - 1) {
      weeks.push(currentWeek)
      currentWeek = []
    }
  })

  const getColor = (count: number) => {
    if (count === 0) return 'bg-gray-100 dark:bg-gray-800'
    const intensity = count / maxCount
    if (intensity > 0.75) return 'bg-streak-green'
    if (intensity > 0.5) return 'bg-green-400'
    if (intensity > 0.25) return 'bg-green-300'
    return 'bg-green-200'
  }

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 overflow-x-auto">
      <div className="inline-block">
        {/* Day labels */}
        <div className="flex gap-1 mb-2">
          <div className="w-12"></div>
          {daysOfWeek.map((day, i) => (
            <div key={i} className="w-3 h-3 text-xs text-gray-500 flex items-center justify-center">
              {i % 2 === 1 ? day : ''}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="flex gap-1">
          {/* Month labels */}
          <div className="flex flex-col gap-1">
            {months.map((month, i) => (
              <div key={i} className="h-12 text-xs text-gray-500 flex items-center pr-2">
                {i % 3 === 0 ? month : ''}
              </div>
            ))}
          </div>

          {/* Weeks */}
          <div className="flex gap-1">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-1">
                {week.map((day, dayIndex) => {
                  const dateStr = format(day, 'yyyy-MM-dd')
                  const count = dailyCounts[dateStr] || 0
                  
                  return (
                    <div
                      key={dayIndex}
                      className={`w-3 h-3 rounded-sm ${getColor(count)} hover:ring-2 hover:ring-streak-blue transition-all`}
                      title={`${format(day, 'MMM d, yyyy')}: ${count} completions`}
                    />
                  )
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 mt-4 text-xs text-gray-600 dark:text-gray-400">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 bg-gray-100 dark:bg-gray-800 rounded-sm"></div>
            <div className="w-3 h-3 bg-green-200 rounded-sm"></div>
            <div className="w-3 h-3 bg-green-300 rounded-sm"></div>
            <div className="w-3 h-3 bg-green-400 rounded-sm"></div>
            <div className="w-3 h-3 bg-streak-green rounded-sm"></div>
          </div>
          <span>More</span>
        </div>
      </div>
    </div>
  )
}