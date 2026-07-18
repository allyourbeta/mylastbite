import { create } from 'zustand'
import { fetchMeals } from '../api/supabaseRead'
import { logMeal as logMealApi } from '../api/logMeal'
import type { MealEntry, RangeOption } from '../services/stats'

const SLUG_STORAGE_KEY = 'mylastbite_slug'

interface AppState {
  entries: MealEntry[]
  entriesLoading: boolean
  entriesError: string | null
  range: RangeOption
  storedSlug: string | null

  loadEntries: () => Promise<void>
  setRange: (range: RangeOption) => void
  logEntry: (day: string, minutes: number | null, isFast: boolean) => Promise<void>
  rememberSlug: (slug: string) => void
}

export const useAppStore = create<AppState>((set, get) => ({
  entries: [],
  entriesLoading: false,
  entriesError: null,
  range: '90d',
  storedSlug: window.localStorage.getItem(SLUG_STORAGE_KEY),

  loadEntries: async () => {
    set({ entriesLoading: true, entriesError: null })
    try {
      const entries = await fetchMeals()
      set({ entries, entriesLoading: false })
    } catch (err) {
      set({ entriesError: (err as Error).message, entriesLoading: false })
    }
  },

  setRange: (range) => set({ range }),

  logEntry: async (day, minutes, isFast) => {
    const result = await logMealApi(day, minutes, isFast)
    const existing = get().entries.filter((e) => e.day !== result.day)
    set({ entries: [...existing, result].sort((a, b) => a.day.localeCompare(b.day)) })
  },

  rememberSlug: (slug) => {
    window.localStorage.setItem(SLUG_STORAGE_KEY, slug)
    set({ storedSlug: slug })
  },
}))
