import { Habit } from '@/lib/types'

interface HabitGridProps {
  habits: Habit[]
}

export default function HabitGrid({ habits }: HabitGridProps) {
  const sortedHabits = [...habits].sort((a, b) => b.active_streak - a.active_streak)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {sortedHabits.map(habit => (
        <div
          key={habit.id}
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 hover:shadow-lg transition-shadow"
        >
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-medium text-gray-900 dark:text-white flex-1">
              {habit.name}
            </h3>
            {habit.is_negative && (
              <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
                Avoid
              </span>
            )}
          </div>
          
          <div className="flex items-end justify-between">
            <div>
              <p className="text-3xl font-bold text-streak-blue">
                {habit.active_streak}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                current streak
              </p>
            </div>
            
            {habit.best_streak > 0 && (
              <div className="text-right">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  {habit.best_streak}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  best
                </p>
              </div>
            )}
          </div>

          {habit.type && habit.target && (
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Target: {habit.target} {habit.unit || 'times'}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}