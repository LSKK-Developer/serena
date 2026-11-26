export type JournalEntry = {
  id: string
  title: string
  content: string
  entryDate: string
  createdAt: string
  updatedAt: string
  tags: string[]
  accent: 'rose' | 'lilac' | 'butter' | 'peach'
}

export type Page = 'today' | 'journal' | 'calendar' | 'settings'
