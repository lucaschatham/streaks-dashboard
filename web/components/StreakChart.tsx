'use client'

import { Habit, LogEntry } from '@/lib/types'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { format, subDays, startOfDay } from 'date-fns'

interface StreakChartProps {
  habits: Habit[]
  entries: LogEntry[]
}

export default function StreakChart({ habits, entries }: StreakChartProps) {
  // Calculate daily streak values for the last 30 days
  const days = 30
  const endDate = startOfDay(new Date())
  const data = []

  // Get top 5 habits by current streak
  const topHabits = [...habits]
    .sort((a, b) => b.active_streak - a.active_streak)
    .slice(0, 5)

  for (let i = days - 1; i >= 0; i--) {
    const date = subDays(endDate, i)
    const dateStr = format(date, 'yyyy-MM-dd')
    
    const dayData: any = {
      date: format(date, 'MMM d'),
      fullDate: dateStr,
    }

    // Count completions for each habit on this day
    topHabits.forEach(habit => {
      const completions = entries.filter(entry => {
        if (!entry.entry_date) return false
        const entryDate = format(new Date(entry.entry_date), 'yyyy-MM-dd')
        return entryDate === dateStr && entry.task_id === habit.id
      })
      
      // Simple streak calculation (1 if completed, 0 if not)
      dayData[habit.name] = completions.length > 0 ? 1 : 0
    })

    data.push(dayData)
  }

  // Calculate cumulative streaks
  const streakData = data.map((day, index) => {
    const newDay = { ...day }
    
    topHabits.forEach(habit => {
      let streak = 0
      // Look backwards to calculate streak
      for (let j = index; j >= 0; j--) {
        if (data[j][habit.name] === 1) {
          streak++
        } else {
          break
        }
      }
      newDay[`${habit.name}_streak`] = streak
    })
    
    return newDay
  })

  const colors = ['#007AFF', '#34C759', '#FF9500', '#AF52DE', '#FF3B30']

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={streakData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="date" 
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
            label={{ value: 'Streak Days', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #e5e7eb',
              borderRadius: '6px'
            }}
          />
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="line"
          />
          
          {topHabits.map((habit, index) => (
            <Line
              key={habit.id}
              type="monotone"
              dataKey={`${habit.name}_streak`}
              name={habit.name}
              stroke={colors[index % colors.length]}
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
      
      <div className="mt-4 text-xs text-gray-600 dark:text-gray-400">
        Showing streak progression for top 5 habits over the last 30 days
      </div>
    </div>
  )
}