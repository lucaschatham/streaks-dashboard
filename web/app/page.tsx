'use client'

import { useEffect, useState } from 'react'
import HabitGrid from '@/components/HabitGrid'
import StreakChart from '@/components/StreakChart'
import CalendarHeatmap from '@/components/CalendarHeatmap'
import { StreaksData } from '@/lib/types'

export default function Home() {
  const [data, setData] = useState<StreaksData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('./data/latest.json')
      .then(res => res.json())
      .then(data => {
        setData(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to load data:', err)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-streak-blue mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading habits...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">Failed to load data</p>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Streaks Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Last updated: {new Date(data.metadata.extracted_at).toLocaleString()}
          </p>
        </header>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Habits</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
              {data.summary.total_habits}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Habits</h3>
            <p className="text-2xl font-bold text-streak-green mt-2">
              {data.summary.active_habits}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Completions</h3>
            <p className="text-2xl font-bold text-streak-blue mt-2">
              {data.summary.total_completions}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Completion Rate</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
              {data.habits.length > 0 
                ? Math.round((data.summary.active_habits / data.summary.total_habits) * 100)
                : 0}%
            </p>
          </div>
        </div>

        {/* Habit Grid */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Current Streaks
          </h2>
          <HabitGrid habits={data.habits} />
        </section>

        {/* Activity Heatmap */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Activity Overview
          </h2>
          <CalendarHeatmap entries={data.entries} />
        </section>

        {/* Streak Progress Chart */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Streak Progress
          </h2>
          <StreakChart habits={data.habits} entries={data.entries} />
        </section>
      </div>
    </main>
  )
}