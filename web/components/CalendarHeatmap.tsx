import { format, eachDayOfInterval, startOfWeek, subDays } from 'date-fns'

interface CalendarHeatmapProps {
  data?: { [date: string]: boolean }
  startDate?: Date
  endDate?: Date
  entries?: any[]
}

export default function CalendarHeatmap({ data = {}, startDate, endDate, entries }: CalendarHeatmapProps) {
  // Handle both new format (data prop) and old format (entries prop)
  const dailyCounts: Record<string, number> = {}
  
  if (entries) {
    entries.forEach(entry => {
      if (entry.entry_date) {
        const date = format(new Date(entry.entry_date), 'yyyy-MM-dd')
        dailyCounts[date] = (dailyCounts[date] || 0) + 1
      }
    })
  } else if (data) {
    Object.entries(data).forEach(([date, completed]) => {
      if (completed) {
        dailyCounts[date] = 1
      }
    })
  }

  // Generate date range
  const end = endDate || new Date()
  const start = startDate || subDays(end, 364)
  const days = eachDayOfInterval({ start, end: end })

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
    if (count === 0) return 'bg-gray-700'
    return 'bg-green-500'
  }

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

  // Get current month for display
  const currentMonth = format(new Date(), 'MMM')
  
  // Calculate which months to show labels for
  const monthLabels: { [key: number]: string } = {}
  days.forEach((day, index) => {
    if (day.getDate() === 1 || index === 0) {
      const weekIndex = Math.floor(index / 7)
      monthLabels[weekIndex] = format(day, 'MMM')
    }
  })

  return (
    <div className="overflow-x-auto">
      <div className="inline-block">
        {/* Month labels */}
        <div className="flex gap-1 mb-1">
          <div className="w-8"></div>
          {weeks.map((_, weekIndex) => (
            <div key={weekIndex} className="w-3 text-xs text-gray-500">
              {monthLabels[weekIndex] || ''}
            </div>
          ))}
        </div>

        <div className="flex gap-1">
          {/* Day labels */}
          <div className="flex flex-col gap-1 pr-1">
            {daysOfWeek.map((day, i) => (
              <div key={i} className="h-3 w-8 text-xs text-gray-500 flex items-center">
                {i % 2 === 1 ? day : ''}
              </div>
            ))}
          </div>

          {/* Weeks */}
          <div className="flex gap-1">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-1">
                {Array.from({ length: 7 }).map((_, dayIndex) => {
                  const day = week[dayIndex]
                  if (!day) {
                    return <div key={dayIndex} className="w-3 h-3" />
                  }
                  
                  const dateStr = format(day, 'yyyy-MM-dd')
                  const count = dailyCounts[dateStr] || 0
                  
                  return (
                    <div
                      key={dayIndex}
                      className={`w-3 h-3 rounded-sm ${getColor(count)} hover:ring-1 hover:ring-green-400 transition-all cursor-pointer`}
                      title={`${format(day, 'MMM d, yyyy')}: ${count > 0 ? 'Completed' : 'Not completed'}`}
                    />
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}