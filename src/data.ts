import type { JournalEntry } from './types'

export const seedEntries: JournalEntry[] = [
  {
    id: 'entry-1',
    title: 'the sky looked like a peach',
    content: 'I took the longer way home today. The light was doing that thing where everything looks softer than it really is. I wish I could keep a little of that feeling in my pocket.',
    entryDate: '2026-11-24',
    createdAt: '2026-11-24T16:42:00.000Z',
    updatedAt: '2026-11-24T16:42:00.000Z',
    tags: ['little things', 'outside'],
    accent: 'peach',
  },
  {
    id: 'entry-2',
    title: 'a song for the ride home',
    content: 'There are songs that make an ordinary street feel like a scene from a film. Played it twice. Maybe three times. I lost count, but I did not mind.',
    entryDate: '2026-11-21',
    createdAt: '2026-11-21T13:16:00.000Z',
    updatedAt: '2026-11-21T13:16:00.000Z',
    tags: ['music', 'little things'],
    accent: 'lilac',
  },
  {
    id: 'entry-3',
    title: 'things I am learning to leave unfinished',
    content: 'Not every thought needs a conclusion. Not every day needs to turn into a lesson. Some things can simply happen, and then be over.',
    entryDate: '2026-11-17',
    createdAt: '2026-11-17T16:04:00.000Z',
    updatedAt: '2026-11-17T16:04:00.000Z',
    tags: ['thoughts', 'growing'],
    accent: 'butter',
  },
  {
    id: 'entry-4',
    title: 'a page from the weekend',
    content: 'Coffee that went cold, a book with too many folded corners, and a conversation I keep replaying. A very ordinary Saturday. I think I needed one.',
    entryDate: '2026-11-08',
    createdAt: '2026-11-08T08:30:00.000Z',
    updatedAt: '2026-11-08T08:30:00.000Z',
    tags: ['weekend', 'reading'],
    accent: 'rose',
  },
]

export const getInitialEntries = (): JournalEntry[] => {
  try {
    const stored = localStorage.getItem('serena.entries.v1')
    if (stored) return JSON.parse(stored) as JournalEntry[]
  } catch {
    // Recover with the example collection if local data cannot be parsed.
  }
  return seedEntries
}

export const persistEntries = (entries: JournalEntry[]) => {
  localStorage.setItem('serena.entries.v1', JSON.stringify(entries))
}

export const formatDate = (date: string, options?: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat('en', options ?? { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(`${date}T12:00:00`))

export const wordCount = (text: string) => text.trim() ? text.trim().split(/\s+/).length : 0
