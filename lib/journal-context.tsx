'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import type { Journal } from '@/lib/types'

const LS_KEY = 'kove_active_journal'

interface JournalContextValue {
  journals: Journal[]
  activeJournalId: string | null   // null = "All journals"
  activeJournal: Journal | null
  setActiveJournalId: (id: string | null) => void
  reload: () => Promise<void>
  creating: boolean
  createJournal: (name: string, color?: string) => Promise<Journal | null>
  deleteJournal: (id: string) => Promise<void>
  renameJournal: (id: string, name: string) => Promise<void>
}

const JournalContext = createContext<JournalContextValue | null>(null)

export function JournalProvider({ children }: { children: ReactNode }) {
  const [journals,         setJournals]         = useState<Journal[]>([])
  const [activeJournalId,  setActiveJournalIdRaw] = useState<string | null>(null)
  const [creating,         setCreating]          = useState(false)

  // Persist active journal to localStorage
  const setActiveJournalId = useCallback((id: string | null) => {
    setActiveJournalIdRaw(id)
    if (id) localStorage.setItem(LS_KEY, id)
    else localStorage.removeItem(LS_KEY)
  }, [])

  const reload = useCallback(async () => {
    try {
      const res = await fetch('/api/journals')
      if (!res.ok) return
      const { journals: data } = await res.json() as { journals: Journal[] }
      setJournals(data)

      // Restore saved selection, or default to first journal
      const saved = localStorage.getItem(LS_KEY)
      if (saved && data.some((j) => j.id === saved)) {
        setActiveJournalIdRaw(saved)
      } else if (data.length > 0) {
        setActiveJournalIdRaw(data[0].id)
        localStorage.setItem(LS_KEY, data[0].id)
      } else {
        setActiveJournalIdRaw(null)
        localStorage.removeItem(LS_KEY)
      }
    } catch { /* noop */ }
  }, [])

  useEffect(() => { reload() }, [reload])

  const createJournal = useCallback(async (name: string, color = '#1E6EFF') => {
    setCreating(true)
    try {
      const res = await fetch('/api/journals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, color }),
      })
      if (!res.ok) return null
      const { journal } = await res.json() as { journal: Journal }
      setJournals((prev) => [...prev, journal])
      setActiveJournalId(journal.id)
      return journal
    } finally {
      setCreating(false)
    }
  }, [setActiveJournalId])

  const deleteJournal = useCallback(async (id: string) => {
    await fetch(`/api/journals/${id}`, { method: 'DELETE' })
    setJournals((prev) => {
      const next = prev.filter((j) => j.id !== id)
      if (activeJournalId === id) {
        const newId = next[0]?.id ?? null
        setActiveJournalId(newId)
      }
      return next
    })
  }, [activeJournalId, setActiveJournalId])

  const renameJournal = useCallback(async (id: string, name: string) => {
    await fetch(`/api/journals/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })
    setJournals((prev) => prev.map((j) => j.id === id ? { ...j, name } : j))
  }, [])

  const activeJournal = journals.find((j) => j.id === activeJournalId) ?? null

  return (
    <JournalContext.Provider value={{
      journals,
      activeJournalId,
      activeJournal,
      setActiveJournalId,
      reload,
      creating,
      createJournal,
      deleteJournal,
      renameJournal,
    }}>
      {children}
    </JournalContext.Provider>
  )
}

export function useJournal() {
  const ctx = useContext(JournalContext)
  if (!ctx) throw new Error('useJournal must be used within JournalProvider')
  return ctx
}
