import { create } from 'zustand'
import { fetchMeals } from '../api/meals'
import {
  logMeal as logMealApi,
  verifySlug as verifySlugApi,
  UnauthorizedError,
} from '../api/logMeal'
import type { MealEntry, RangeOption } from '../services/stats'

const SLUG_STORAGE_KEY = 'mylastbite_slug'

interface AppState {
  entries: MealEntry[]
  entriesLoading: boolean
  entriesError: string | null
  range: RangeOption
  storedSlug: string | null
  authorized: boolean | null

  loadEntries: () => Promise<void>
  setRange: (range: RangeOption) => void
  logEntry: (slug: string, day: string, minutes: number | null, isFast: boolean) => Promise<void>
  rememberSlug: (slug: string) => void
  clearSlug: () => void
  verifySlug: (slug: string) => Promise<void>
}

export const useAppStore = create<AppState>((set, get) => ({
  entries: [],
  entriesLoading: false,
  entriesError: null,
  range: '90d',
  storedSlug: window.localStorage.getItem(SLUG_STORAGE_KEY),
  authorized: null,

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

  logEntry: async (slug, day, minutes, isFast) => {
    try {
      const result = await logMealApi(slug, day, minutes, isFast)
      const existing = get().entries.filter((e) => e.day !== result.day)
      set({ entries: [...existing, result].sort((a, b) => a.day.localeCompare(b.day)) })
    } catch (err) {
      if (err instanceof UnauthorizedError) {
        get().clearSlug()
        set({ authorized: false })
        return
      }
      throw err
    }
  },

  rememberSlug: (slug) => {
    window.localStorage.setItem(SLUG_STORAGE_KEY, slug)
    set({ storedSlug: slug })
  },

  clearSlug: () => {
    window.localStorage.removeItem(SLUG_STORAGE_KEY)
    set({ storedSlug: null })
  },

  verifySlug: async (slug) => {
    try {
      await verifySlugApi(slug)
      set({ authorized: true })
    } catch (err) {
      if (err instanceof UnauthorizedError) {
        get().clearSlug()
        set({ authorized: false })
        return
      }
      throw err
    }
  },
}))
