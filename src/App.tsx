import { useMemo, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import {
  ArrowLeft, ArrowUpRight, BookHeart, CalendarDays,
  Check, ChevronDown, ChevronLeft, ChevronRight, CircleHelp, Clock3, Flower2,
  Heart, House, Menu, MoreHorizontal, PenLine, Plus, Search, Settings2, Sparkles,
  Tag, Trash2, X, Download, RotateCcw,
} from 'lucide-react'
import { formatDate, getInitialEntries, persistEntries, wordCount } from './data'
import type { JournalEntry, Page } from './types'

const navItems: { id: Page; label: string; icon: typeof House }[] = [
  { id: 'today', label: 'Today', icon: House },
  { id: 'journal', label: 'Journal', icon: BookHeart },
  { id: 'calendar', label: 'Calendar', icon: CalendarDays },
]

const accentClasses = ['rose', 'peach', 'lilac', 'butter'] as const

const todayIso = () => {
  const d = new Date()
  const offset = d.getTimezoneOffset()
  return new Date(d.getTime() - offset * 60000).toISOString().slice(0, 10)
}

const makeId = () => `entry-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

function App() {
  const [entries, setEntries] = useState<JournalEntry[]>(getInitialEntries)
  const [page, setPage] = useState<Page>('today')
  const [editing, setEditing] = useState<JournalEntry | null | undefined>(undefined)
  const [viewing, setViewing] = useState<JournalEntry | null>(null)
  const [query, setQuery] = useState('')
  const [activeTag, setActiveTag] = useState('all')
  const [calendarMonth, setCalendarMonth] = useState(new Date(2026, 10, 1))
  const [selectedDate, setSelectedDate] = useState(todayIso())
  const [toast, setToast] = useState('')
  const [mobileMenu, setMobileMenu] = useState(false)
  const [weekStartsMonday, setWeekStartsMonday] = useState(() => localStorage.getItem('serena.weekStartsMonday') !== 'false')
  const [showTime, setShowTime] = useState(() => localStorage.getItem('serena.showTime') !== 'false')

  const sorted = useMemo(() => [...entries].sort((a, b) => b.entryDate.localeCompare(a.entryDate) || b.updatedAt.localeCompare(a.updatedAt)), [entries])
  const tags = useMemo(() => [...new Set(entries.flatMap((entry) => entry.tags))].sort(), [entries])
  const matching = useMemo(() => sorted.filter((entry) => {
    const q = query.trim().toLowerCase()
    const matchesQuery = !q || `${entry.title} ${entry.content} ${entry.tags.join(' ')}`.toLowerCase().includes(q)
    const matchesTag = activeTag === 'all' || entry.tags.includes(activeTag)
    return matchesQuery && matchesTag
  }), [sorted, query, activeTag])

  const notify = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 2400)
  }

  const updateEntries = (next: JournalEntry[]) => {
    setEntries(next)
    persistEntries(next)
  }

  const saveEntry = (data: { title: string; content: string; entryDate: string; tags: string[] }, existing?: JournalEntry) => {
    const now = new Date().toISOString()
    if (existing) {
      const updated = { ...existing, ...data, updatedAt: now }
      updateEntries(entries.map((entry) => entry.id === existing.id ? updated : entry))
      setViewing(updated)
      notify('Your page has been updated')
    } else {
      const fresh: JournalEntry = {
        id: makeId(), ...data, createdAt: now, updatedAt: now,
        accent: accentClasses[entries.length % accentClasses.length],
      }
      updateEntries([fresh, ...entries])
      setPage('today')
      notify('A little moment, kept')
    }
    setEditing(undefined)
  }

  const removeEntry = (entry: JournalEntry) => {
    if (!window.confirm('Delete this entry? This cannot be undone.')) return
    updateEntries(entries.filter((item) => item.id !== entry.id))
    setViewing(null)
    notify('Entry deleted')
  }

  const exportEntries = () => {
    const blob = new Blob([JSON.stringify(entries, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `serena-journal-${todayIso()}.json`
    anchor.click()
    URL.revokeObjectURL(url)
    notify('Your journal export is ready')
  }

  const resetEntries = () => {
    if (!window.confirm('Restore the example entries? Your current local entries will be replaced.')) return
    updateEntries((awaitSeed()).map((entry) => ({ ...entry })))
    notify('Example journal restored')
  }

  const startNew = () => setEditing(null)

  const goTo = (next: Page) => {
    setPage(next)
    setQuery('')
    setActiveTag('all')
    setViewing(null)
    setEditing(undefined)
    setMobileMenu(false)
  }

  const selectedEntries = sorted.filter((entry) => entry.entryDate === selectedDate)
  const updateWeekStartsMonday = (value: boolean) => { localStorage.setItem('serena.weekStartsMonday', String(value)); setWeekStartsMonday(value) }
  const updateShowTime = (value: boolean) => { localStorage.setItem('serena.showTime', String(value)); setShowTime(value) }

  return (
    <div className="app-frame">
      <aside className={`sidebar ${mobileMenu ? 'sidebar-open' : ''}`}>
        <div className="brand-lockup">
          <div className="brand-mark"><Flower2 size={19} strokeWidth={1.9} /></div>
          <div className="brand-name">serena<span>.</span><small>a little place for you</small></div>
        </div>
        <div className="side-label">YOUR SPACE</div>
        <nav className="side-nav" aria-label="Main navigation">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button key={id} className={`nav-link ${page === id ? 'active' : ''}`} onClick={() => goTo(id)}>
              <Icon size={18} strokeWidth={1.8} /><span>{label}</span>{page === id && <span className="nav-dot" />}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-note">
            <Sparkles size={16} />
            <p>There is no right way to remember.</p>
            <span>JUST YOUR WAY</span>
          </div>
          <button className={`nav-link settings-link ${page === 'settings' ? 'active' : ''}`} onClick={() => goTo('settings')}>
            <Settings2 size={18} strokeWidth={1.8} /><span>Settings</span>
          </button>
          <div className="profile-row">
            <div className="profile-avatar">S</div>
            <div><b>your space</b><small>personal journal</small></div>
            <MoreHorizontal size={18} className="profile-more" />
          </div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <button className="mobile-menu-button" onClick={() => setMobileMenu(!mobileMenu)} aria-label="Toggle navigation"><Menu size={20}/></button>
          <div className="breadcrumb">YOUR JOURNAL <span>/</span> <b>{page.toUpperCase()}</b></div>
          <div className="topbar-right">
            <span className="topbar-date">{new Intl.DateTimeFormat('en', { weekday: 'short', month: 'short', day: 'numeric' }).format(new Date())}</span>
            <button className="round-icon" aria-label="Help" onClick={() => notify('A gentle reminder: this space is yours.')}><CircleHelp size={17}/></button>
            <div className="mini-avatar">S</div>
          </div>
        </header>

        {viewing ? (
          <EntryDetail entry={viewing} onBack={() => setViewing(null)} onEdit={() => setEditing(viewing)} onDelete={() => removeEntry(viewing)} />
        ) : (
          <div className="page-content">
            {page === 'today' && <TodayPage entries={sorted} showTime={showTime} onWrite={startNew} onOpen={setViewing} onAll={() => goTo('journal')} />}
            {page === 'journal' && <JournalPage entries={matching} allTags={tags} query={query} setQuery={setQuery} activeTag={activeTag} setActiveTag={setActiveTag} showTime={showTime} onOpen={setViewing} onWrite={startNew} />}
            {page === 'calendar' && <CalendarPage entries={sorted} month={calendarMonth} setMonth={setCalendarMonth} selectedDate={selectedDate} setSelectedDate={setSelectedDate} selectedEntries={selectedEntries} weekStartsMonday={weekStartsMonday} showTime={showTime} onOpen={setViewing} />}
            {page === 'settings' && <SettingsPage count={entries.length} weekStartsMonday={weekStartsMonday} setWeekStartsMonday={updateWeekStartsMonday} showTime={showTime} setShowTime={updateShowTime} onExport={exportEntries} onReset={resetEntries} />}
            <footer className="page-footer"><span>made for the moments in between</span><Heart size={12} fill="currentColor" strokeWidth={0}/><span>SERENA · 2026</span></footer>
          </div>
        )}
      </main>

      {editing !== undefined && <EntryEditor entry={editing ?? undefined} onClose={() => setEditing(undefined)} onSave={saveEntry} />}
      {toast && <div className="toast"><span className="toast-check"><Check size={14}/></span>{toast}</div>}
      {mobileMenu && <button className="mobile-scrim" aria-label="Close navigation" onClick={() => setMobileMenu(false)} />}
    </div>
  )
}

function TodayPage({ entries, showTime, onWrite, onOpen, onAll }: { entries: JournalEntry[]; showTime: boolean; onWrite: () => void; onOpen: (entry: JournalEntry) => void; onAll: () => void }) {
  const recent = entries.slice(0, 3)
  const todayLabel = new Date().toLocaleDateString('en', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase()
  const countThisMonth = entries.filter((entry) => entry.entryDate.startsWith(todayIso().slice(0, 7))).length
  return (
    <>
      <div className="page-heading today-heading">
        <div>
          <div className="eyebrow"><span className="eyebrow-flower">✿</span> {todayLabel}</div>
          <h1>Hey, lovely <span className="heading-sparkle">✳</span></h1>
          <p>Take a breath. You're right where you need to be.</p>
        </div>
        <div className="heading-decoration"><span className="deco-orbit orbit-one"/><span className="deco-orbit orbit-two"/><span className="deco-center">✿</span></div>
      </div>

      <section className="hero-card">
        <div className="hero-orb hero-orb-one"/><div className="hero-orb hero-orb-two"/><div className="hero-star star-a">✳</div><div className="hero-star star-b">✧</div>
        <div className="hero-copy">
          <span className="hero-kicker">A NEW PAGE, WHENEVER YOU'RE READY</span>
          <h2>What's on<br/>your <em>mind</em> lately?</h2>
          <p>Little thoughts, big feelings, the in-between bits. They all belong here.</p>
          <button className="button-dark" onClick={onWrite}><PenLine size={16}/> Write a little</button>
        </div>
        <div className="hero-illustration" aria-hidden="true"><div className="illustration-disc"><span className="disc-face">☺</span><span className="disc-flower">✿</span></div><span className="illustration-caption">a moment<br/>to yourself</span></div>
        <span className="hero-index">01 / YOUR SPACE</span>
      </section>

      <div className="content-columns">
        <section className="recent-section">
          <div className="section-heading"><div><span className="eyebrow">A FEW OF YOUR MOMENTS</span><h2>Recently written</h2></div><button className="text-link" onClick={onAll}>See journal <ArrowUpRight size={15}/></button></div>
          {recent.length === 0 ? <EmptyState title="Your pages are waiting." body="Start with a word, a sentence, or whatever comes first." action="Write your first entry" onAction={onWrite}/> : <div className="entry-stack">{recent.map((entry, index) => <EntryRow key={entry.id} entry={entry} index={index} showTime={showTime} onClick={() => onOpen(entry)}/>)}</div>}
        </section>
        <aside className="right-rail">
          <div className="little-note-card"><div className="note-scribble">✳</div><span className="eyebrow">A LITTLE REMINDER</span><p>You don't have to make sense of it all, all at once.</p><span className="note-signoff">be gentle with yourself ♡</span></div>
          <div className="month-peek"><div className="peek-header"><span className="eyebrow">YOUR NOVEMBER</span><span className="peek-sparkle">✿</span></div><div className="peek-number">{String(countThisMonth).padStart(2, '0')}<small>pages<br/>kept</small></div><div className="peek-progress"><span style={{ width: `${Math.min(countThisMonth / 12 * 100, 100)}%` }}/></div><p>No goals, no streaks. Just your own little timeline.</p></div>
        </aside>
      </div>
    </>
  )
}

function JournalPage({ entries, allTags, query, setQuery, activeTag, setActiveTag, showTime, onOpen, onWrite }: {
  entries: JournalEntry[]; allTags: string[]; query: string; setQuery: (value: string) => void; activeTag: string; setActiveTag: (value: string) => void; showTime: boolean; onOpen: (entry: JournalEntry) => void; onWrite: () => void
}) {
  return <>
    <div className="page-heading simple-heading"><div><div className="eyebrow"><span className="eyebrow-flower">✿</span> ALL YOUR LITTLE MOMENTS</div><h1>Your journal<span className="heading-dot">.</span></h1><p>A collection of things you chose to keep.</p></div><button className="button-coral" onClick={onWrite}><Plus size={17}/> New entry</button></div>
    <div className="journal-toolbar"><label className="search-box"><Search size={17}/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find a thought, a word, a feeling..."/><kbd>⌘ K</kbd></label><div className="filter-label"><Tag size={14}/> Filter</div></div>
    <div className="tag-filters"><button className={`tag-pill ${activeTag === 'all' ? 'selected' : ''}`} onClick={() => setActiveTag('all')}>Everything <span>{entries.length}</span></button>{allTags.map((tag) => <button key={tag} className={`tag-pill ${activeTag === tag ? 'selected' : ''}`} onClick={() => setActiveTag(activeTag === tag ? 'all' : tag)}>#{tag}</button>)}</div>
    <div className="journal-results-heading"><span>{entries.length} {entries.length === 1 ? 'entry' : 'entries'}</span><span>NEWEST FIRST <ChevronDown size={13}/></span></div>
    {entries.length ? <div className="journal-list">{entries.map((entry, index) => <EntryRow key={entry.id} entry={entry} index={index} showTime={showTime} onClick={() => onOpen(entry)} expanded/>)}</div> : <EmptyState title="Nothing here just yet." body="Try another search, or start a fresh page." action="Write an entry" onAction={onWrite}/>}
  </>
}

function CalendarPage({ entries, month, setMonth, selectedDate, setSelectedDate, selectedEntries, weekStartsMonday, showTime, onOpen }: {
  entries: JournalEntry[]; month: Date; setMonth: (value: Date) => void; selectedDate: string; setSelectedDate: (value: string) => void; selectedEntries: JournalEntry[]; weekStartsMonday: boolean; showTime: boolean; onOpen: (entry: JournalEntry) => void
}) {
  const year = month.getFullYear()
  const monthIndex = month.getMonth()
  const firstDay = new Date(year, monthIndex, 1).getDay()
  const offset = weekStartsMonday ? (firstDay + 6) % 7 : firstDay
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()
  const entryDates = new Set(entries.map((entry) => entry.entryDate))
  const cells = [...Array(offset).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]
  while (cells.length % 7) cells.push(null)
  const prev = () => setMonth(new Date(year, monthIndex - 1, 1))
  const next = () => setMonth(new Date(year, monthIndex + 1, 1))
  return <>
    <div className="page-heading simple-heading"><div><div className="eyebrow"><span className="eyebrow-flower">✿</span> A SOFTER WAY TO LOOK BACK</div><h1>Your timeline<span className="heading-dot">.</span></h1><p>Every date holds a little possibility.</p></div><div className="calendar-total"><strong>{entries.length}</strong><span>moments<br/>collected</span></div></div>
    <div className="calendar-layout">
      <section className="calendar-card">
        <div className="calendar-month-head"><div><span className="eyebrow">LOOKING BACK</span><h2>{month.toLocaleDateString('en', { month: 'long', year: 'numeric' })}</h2></div><div className="calendar-controls"><button onClick={prev} aria-label="Previous month"><ChevronLeft size={18}/></button><button onClick={next} aria-label="Next month"><ChevronRight size={18}/></button></div></div>
        <div className="calendar-grid">{(weekStartsMonday ? ['M', 'T', 'W', 'T', 'F', 'S', 'S'] : ['S', 'M', 'T', 'W', 'T', 'F', 'S']).map((day, i) => <div className="calendar-weekday" key={`${day}-${i}`}>{day}</div>)}{cells.map((day, index) => {
          if (!day) return <div className="calendar-empty" key={`empty-${index}`}/>;
          const date = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const hasEntry = entryDates.has(date)
          return <button key={date} className={`calendar-day ${hasEntry ? 'has-entry' : ''} ${selectedDate === date ? 'is-selected' : ''}`} onClick={() => setSelectedDate(date)}><span>{day}</span>{hasEntry && <i/>}</button>
        })}</div>
        <div className="calendar-legend"><span><i className="legend-dot"/> A page lives here</span><span>Choose a date to explore</span></div>
      </section>
      <aside className="selected-day-panel"><span className="eyebrow">YOUR SELECTED DAY</span><h3>{formatDate(selectedDate, { weekday: 'long', month: 'long', day: 'numeric' })}</h3>{selectedEntries.length ? <div className="selected-entry-list">{selectedEntries.map((entry) => <button key={entry.id} className="selected-entry" onClick={() => onOpen(entry)}>{showTime && <span className="selected-entry-time">{new Date(entry.createdAt).toLocaleTimeString('en', { hour: 'numeric', minute: '2-digit' })}</span>}<b>{entry.title}</b><ArrowUpRight size={15}/></button>)}</div> : <div className="day-empty"><div className="empty-sun">☼</div><p>No pages for this date.</p><span>That's okay. Not every day needs to be documented.</span></div>}</aside>
    </div>
  </>
}

function SettingsPage({ count, weekStartsMonday, setWeekStartsMonday, showTime, setShowTime, onExport, onReset }: {
  count: number; weekStartsMonday: boolean; setWeekStartsMonday: (value: boolean) => void; showTime: boolean; setShowTime: (value: boolean) => void; onExport: () => void; onReset: () => void
}) {
  return <>
    <div className="page-heading simple-heading"><div><div className="eyebrow"><span className="eyebrow-flower">✿</span> YOUR SPACE, YOUR WAY</div><h1>A few details<span className="heading-dot">.</span></h1><p>Little preferences to make Serena feel like yours.</p></div><div className="settings-bloom">✿</div></div>
    <div className="settings-layout">
      <section className="settings-group"><span className="eyebrow">PREFERENCES</span><div className="settings-card"><SettingToggle icon={<CalendarDays size={18}/>} title="Week starts on Monday" description="A familiar start to your week." enabled={weekStartsMonday} onChange={setWeekStartsMonday}/><div className="settings-separator"/><SettingToggle icon={<Clock3 size={18}/>} title="Show entry times" description="See when each moment was written." enabled={showTime} onChange={setShowTime}/></div></section>
      <section className="settings-group"><span className="eyebrow">YOUR JOURNAL</span><div className="settings-card"><div className="setting-row"><div className="setting-icon pink"><Download size={18}/></div><div className="setting-copy"><b>Export your entries</b><span>Keep a copy of all {count} entries as a JSON file.</span></div><button className="setting-action" onClick={onExport}>Export <ArrowUpRight size={14}/></button></div><div className="settings-separator"/><div className="setting-row"><div className="setting-icon lilac"><RotateCcw size={18}/></div><div className="setting-copy"><b>Restore example journal</b><span>Replace local entries with the original sample collection.</span></div><button className="setting-action" onClick={onReset}>Restore <ArrowUpRight size={14}/></button></div></div></section>
      <div className="privacy-note"><Heart size={16}/><p><b>A small note about privacy</b><span>Your entries are stored in this browser on this device. This demo doesn't sync to an account or a server.</span></p></div>
    </div>
    <div className="about-strip"><div className="about-brand">serena<span>.</span></div><div>made with a little care <span>♡</span></div><small>VERSION 1.0.0 · FRONTEND DEMO</small></div>
  </>
}

function SettingToggle({ icon, title, description, enabled, onChange }: { icon: ReactNode; title: string; description: string; enabled: boolean; onChange: (value: boolean) => void }) {
  return <div className="setting-row"><div className="setting-icon peach">{icon}</div><div className="setting-copy"><b>{title}</b><span>{description}</span></div><button className={`switch ${enabled ? 'on' : ''}`} role="switch" aria-checked={enabled} onClick={() => onChange(!enabled)}><i/></button></div>
}

function EntryRow({ entry, index, onClick, expanded = false, showTime = true }: { entry: JournalEntry; index: number; onClick: () => void; expanded?: boolean; showTime?: boolean }) {
  const date = new Date(`${entry.entryDate}T12:00:00`)
  const excerpt = entry.content.length > 112 ? `${entry.content.slice(0, 112).trim()}…` : entry.content
  return <button className={`entry-row ${expanded ? 'entry-row-expanded' : ''}`} onClick={onClick}>
    <div className={`entry-date-tile ${entry.accent}`}><b>{date.getDate()}</b><span>{date.toLocaleDateString('en', { month: 'short' }).toUpperCase()}</span></div>
    <div className="entry-row-copy"><div className="entry-row-meta"><span>{date.toLocaleDateString('en', { weekday: 'long' })}</span><i/> {showTime && <><i/> <span>{new Date(entry.createdAt).toLocaleTimeString('en', { hour: 'numeric', minute: '2-digit' })}</span></>}{index === 0 && !expanded && <em>JUST ADDED</em>}</div><h3>{entry.title || 'untitled moment'}</h3><p>{excerpt}</p><div className="entry-tags">{entry.tags.map((tag) => <span key={tag}>#{tag}</span>)}</div></div>
    <span className="entry-open"><ArrowUpRight size={18}/></span>
  </button>
}

function EmptyState({ title, body, action, onAction }: { title: string; body: string; action: string; onAction: () => void }) {
  return <div className="empty-state"><div className="empty-flower">✿</div><h3>{title}</h3><p>{body}</p><button className="button-coral" onClick={onAction}><Plus size={16}/>{action}</button></div>
}

function EntryDetail({ entry, onBack, onEdit, onDelete }: { entry: JournalEntry; onBack: () => void; onEdit: () => void; onDelete: () => void }) {
  return <div className="detail-page"><button className="back-link" onClick={onBack}><ArrowLeft size={16}/> Back to your pages</button><div className="detail-paper"><div className={`detail-top-mark ${entry.accent}`}>✿</div><div className="eyebrow">{formatDate(entry.entryDate, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase()}</div><h1>{entry.title || 'untitled moment'}</h1><div className="detail-time">WRITTEN {new Date(entry.createdAt).toLocaleTimeString('en', { hour: 'numeric', minute: '2-digit' })} · {wordCount(entry.content)} WORDS</div><div className="detail-content">{entry.content}</div><div className="entry-tags detail-tags">{entry.tags.map((tag) => <span key={tag}>#{tag}</span>)}</div><div className="detail-actions"><button className="button-outline" onClick={onEdit}><PenLine size={15}/> Edit this page</button><button className="delete-button" onClick={onDelete}><Trash2 size={15}/> Delete</button></div></div></div>
}

function EntryEditor({ entry, onClose, onSave }: { entry?: JournalEntry; onClose: () => void; onSave: (data: { title: string; content: string; entryDate: string; tags: string[] }, existing?: JournalEntry) => void }) {
  const [title, setTitle] = useState(entry?.title ?? '')
  const [content, setContent] = useState(entry?.content ?? '')
  const [entryDate, setEntryDate] = useState(entry?.entryDate ?? todayIso())
  const [tags, setTags] = useState(entry?.tags.join(', ') ?? '')
  const [error, setError] = useState('')
  const words = wordCount(content)
  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!content.trim()) { setError('Give this moment a few words first.'); return }
    onSave({ title: title.trim(), content: content.trim(), entryDate, tags: [...new Set(tags.split(',').map((tag) => tag.trim().replace(/^#/, '').toLowerCase()).filter(Boolean))] }, entry)
  }
  return <div className="editor-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><form className="editor-modal" onSubmit={submit}>
    <div className="editor-top"><button type="button" className="back-link" onClick={onClose}><X size={17}/> Close</button><span className="editor-save-label"><span/> YOUR SPACE, YOUR PACE</span><div className="editor-top-spacer"/></div>
    <div className="editor-body"><div className="editor-date-row"><span className="eyebrow">A MOMENT TO KEEP</span><label className="date-input-label"><CalendarDays size={14}/><input type="date" value={entryDate} onChange={(event) => setEntryDate(event.target.value)}/></label></div><input className="editor-title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Give it a little title..." aria-label="Entry title"/><textarea className="editor-content" value={content} onChange={(event) => { setContent(event.target.value); setError('') }} placeholder="Start wherever you are. It doesn't have to be perfect, it just has to be yours." aria-label="Entry content" autoFocus/><div className="editor-tags-field"><Tag size={15}/><input value={tags} onChange={(event) => setTags(event.target.value)} placeholder="Add a few tags, separated by commas" aria-label="Tags"/></div>{error && <div className="editor-error">{error}</div>}</div>
    <div className="editor-bottom"><span>{words} WORDS <i/> SAVED ON THIS DEVICE</span><div><button type="button" className="button-ghost" onClick={onClose}>Cancel</button><button type="submit" className="button-coral"><Check size={16}/>{entry ? 'Save changes' : 'Keep this moment'}</button></div></div>
  </form></div>
}

// A copy is kept here so restoring the sample journal doesn't depend on network access.
function awaitSeed(): JournalEntry[] {
  return [
    { id: 'entry-1', title: 'the sky looked like a peach', content: 'I took the longer way home today. The light was doing that thing where everything looks softer than it really is. I wish I could keep a little of that feeling in my pocket.', entryDate: '2026-11-24', createdAt: '2026-11-24T16:42:00.000Z', updatedAt: '2026-11-24T16:42:00.000Z', tags: ['little things', 'outside'], accent: 'peach' },
    { id: 'entry-2', title: 'a song for the ride home', content: 'There are songs that make an ordinary street feel like a scene from a film. Played it twice. Maybe three times. I lost count, but I did not mind.', entryDate: '2026-11-21', createdAt: '2026-11-21T13:16:00.000Z', updatedAt: '2026-11-21T13:16:00.000Z', tags: ['music', 'little things'], accent: 'lilac' },
    { id: 'entry-3', title: 'things I am learning to leave unfinished', content: 'Not every thought needs a conclusion. Not every day needs to turn into a lesson. Some things can simply happen, and then be over.', entryDate: '2026-11-17', createdAt: '2026-11-17T16:04:00.000Z', updatedAt: '2026-11-17T16:04:00.000Z', tags: ['thoughts', 'growing'], accent: 'butter' },
    { id: 'entry-4', title: 'a page from the weekend', content: 'Coffee that went cold, a book with too many folded corners, and a conversation I keep replaying. A very ordinary Saturday. I think I needed one.', entryDate: '2026-11-08', createdAt: '2026-11-08T08:30:00.000Z', updatedAt: '2026-11-08T08:30:00.000Z', tags: ['weekend', 'reading'], accent: 'rose' },
  ]
}

export default App
