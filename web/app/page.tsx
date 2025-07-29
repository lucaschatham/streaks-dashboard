'use client'

import { useEffect, useState } from 'react'
import CalendarHeatmap from '@/components/CalendarHeatmap'

interface HabitInfo {
  name: string;
  emoji: string;
  order: number;
}

interface CompletionData {
  [date: string]: boolean;
}

interface HabitWithCompletions extends HabitInfo {
  completions: CompletionData;
}

const HABIT_ORDER: HabitInfo[] = [
  { name: "SLEEP >7 HRS", emoji: "🛏️", order: 1 },
  { name: "10MIN WAKE UP SUN", emoji: "☀️", order: 2 },
  { name: "BURN 500+ KCAL", emoji: "🏋️", order: 3 },
  { name: "LOG WEIGHT", emoji: "⚖️", order: 4 },
  { name: "READ 20+ PAGES", emoji: "📚", order: 5 },
  { name: "REVIEW 50 FLASHCARDS", emoji: "🗂️", order: 6 },
  { name: "MEDITATE 20MIN", emoji: "🧘", order: 7 },
  { name: "DEEP WORK 3HRS", emoji: "🎧", order: 8 },
  { name: "COMPLETE 3 MITS", emoji: "🎯", order: 9 },
  { name: "DRINK 1 GAL WATER", emoji: "💧", order: 10 },
  { name: "EAT <2850 CALORIES", emoji: "🍽️", order: 11 },
  { name: "POST PROOF ON SOCIAL MEDIA", emoji: "📱", order: 12 },
  { name: "JOURNAL: REFLECT & PLAN", emoji: "📝", order: 13 },
  { name: "NO PHONE IN BED", emoji: "📵", order: 14 },
  { name: "BRUSH TEETH", emoji: "🪥", order: 15 },
  { name: "FLOSS + RETAINERS", emoji: "🦷", order: 16 },
  { name: "WASH FACE", emoji: "🧖", order: 17 },
  { name: "INBOXES ZERO", emoji: "📥", order: 18 },
  { name: "EAT 240G PROTEIN", emoji: "🥩", order: 19 },
  { name: "NO ON-SCREEN DISTRACTIONS", emoji: "🛑", order: 20 },
  { name: "10MIN VOICE WORK", emoji: "🎤", order: 21 },
  { name: "TAKE NIGHT SUPPS", emoji: "💊", order: 22 },
  { name: "LOG EXPENSES & REVIEW BUDGET", emoji: "💰", order: 23 },
  { name: "PLAN WEEK/WEEKLY", emoji: "📅", order: 24 }
];

export default function Home() {
  const [habitsData, setHabitsData] = useState<HabitWithCompletions[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<string>('')

  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch('./data/daily_summary.json');
        const data = await response.json();
        
        setLastUpdated(data.metadata?.last_updated || new Date().toISOString());
        
        // Create habit data with completions
        const habitsWithCompletions = HABIT_ORDER.map(habitInfo => {
          const habitData = data.habits?.find((h: any) => {
            const habitName = h.name.toUpperCase();
            const targetName = habitInfo.name.replace(/[^A-Z0-9\s]/g, '').trim();
            return habitName.includes(targetName) || targetName.includes(habitName);
          });
          
          return {
            ...habitInfo,
            completions: habitData?.completions || {}
          };
        });
        
        setHabitsData(habitsWithCompletions);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading habits...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-2">
            Streaks Dashboard
          </h1>
          {lastUpdated && (
            <p className="text-gray-400 text-sm">
              Last updated: {new Date(lastUpdated).toLocaleString()}
            </p>
          )}
        </header>

        <div className="space-y-6">
          {habitsData.map(habit => (
            <div key={habit.order} className="bg-gray-800 rounded-lg p-6 shadow-lg">
              <div className="flex items-center mb-4">
                <span className="text-4xl mr-4">{habit.emoji}</span>
                <h2 className="text-xl font-semibold text-white">{habit.name}</h2>
              </div>
              
              <div className="overflow-x-auto">
                <CalendarHeatmap 
                  data={habit.completions}
                  startDate={new Date(new Date().getFullYear(), 0, 1)}
                  endDate={new Date()}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}