import { useState, useMemo, useEffect, useCallback } from 'react'
import { X, Plus, ChevronLeft, BookOpen } from 'lucide-react'
import { format, endOfMonth } from 'date-fns'
import { useDiary } from '../hooks/useDiary'
import DiaryCalendarGrid from './diary/DiaryCalendarGrid'
import DiaryEntryEditor from './diary/DiaryEntryEditor'
import DiaryEntryDetail from './diary/DiaryEntryDetail'

const formatLocalDate = (d) => {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const DiaryModal = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [view, setView] = useState('calendar')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedEntry, setSelectedEntry] = useState(null)
  const [uploading, setUploading] = useState(false)

  const {
    entries, loading, error: fetchError, fetchEntries,
    createEntry, updateEntry, deleteEntry, uploadCover, deleteCover, setCoverReference
  } = useDiary()

  // Fix #1: Only fetch diary entries when the modal is open (not on dashboard mount)
  useEffect(() => {
    if (isOpen) fetchEntries()
  }, [isOpen, fetchEntries])

  // ESC key navigation
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key !== 'Escape' || !isOpen) return
      if (selectedEntry || view === 'day') { setView('calendar'); setSelectedDate(null); setSelectedEntry(null); return }
      if (view === 'new') { setView('calendar'); return }
      setIsOpen(false)
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [isOpen, view, selectedEntry])

  // Fix #3: Stable callbacks so child components don't re-render unnecessarily
  const handlePrevMonth = useCallback(() => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1)), [])
  const handleNextMonth = useCallback(() => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1)), [])
  const handleToday = useCallback(() => setCurrentDate(new Date()), [])

  const handleDateClick = useCallback((date) => {
    setSelectedDate(date)
    setSelectedEntry(null)
    setView('day')
  }, [])

  // Fix #2: Pre-index entries by date — O(1) lookups instead of O(N) scans per day
  const entriesByDate = useMemo(() => {
    const map = new Map()
    for (const entry of entries) {
      if (!entry.created_at) continue
      const key = formatLocalDate(new Date(entry.created_at))
      if (!map.has(key)) map.set(key, [])
      map.get(key).push(entry)
    }
    return map
  }, [entries])

  // Auto-select single entry for the day
  useEffect(() => {
    if (view !== 'day' || !selectedDate) return
    const dateStr = formatLocalDate(selectedDate)
    const matching = entriesByDate.get(dateStr) || []
    if (matching.length === 1) {
      setSelectedEntry(matching[0])
    } else {
      setSelectedEntry(null)
    }
  }, [view, selectedDate, entriesByDate])

  const handleSelectEntry = (entry) => {
    setSelectedEntry(entry)
  }

  const handleBackFromEntry = () => {
    setView('calendar')
    setSelectedDate(null)
    setSelectedEntry(null)
  }

  const handleBackFromDay = () => {
    setView('calendar')
    setSelectedDate(null)
  }

  const handleUpdateEntry = async (id, data) => {
    await updateEntry(id, data)
    setView('calendar')
    setSelectedDate(null)
    setSelectedEntry(null)
    fetchEntries()
  }

  const handleDeleteEntry = async (id) => {
    await deleteEntry(id)
    setView('calendar')
    setSelectedDate(null)
    setSelectedEntry(null)
    fetchEntries()
  }

  const handleUploadCover = async (id, file) => {
    setUploading(true)
    try { await uploadCover(id, file); fetchEntries() } finally { setUploading(false) }
  }

  const handleDeleteCover = async (id) => {
    setUploading(true)
    try { await deleteCover(id); fetchEntries() } finally { setUploading(false) }
  }

  const handleSetCoverReference = async (id, url) => {
    setUploading(true)
    try { await setCoverReference(id, url); fetchEntries() } finally { setUploading(false) }
  }

  const handleCreateEntry = async ({ title, content }) => {
    const entry = await createEntry({ title, content })
    setView('calendar')
    return entry
  }

  const monthlyStats = useMemo(() => {
    const monthEnd = endOfMonth(currentDate)
    const daysInMonth = monthEnd.getDate()
    const monthPrefix = format(currentDate, 'yyyy-MM')
    let totalEntries = 0
    const daysWithEntriesSet = new Set()
    for (const [dateStr, dayEntries] of entriesByDate) {
      if (dateStr.startsWith(monthPrefix)) {
        totalEntries += dayEntries.length
        daysWithEntriesSet.add(dateStr)
      }
    }
    return {
      totalEntries,
      daysWithEntries: daysWithEntriesSet.size,
      avgPerDay: totalEntries > 0 ? (totalEntries / daysInMonth).toFixed(1) : 0
    }
  }, [currentDate, entriesByDate])

  const entriesForDate = useMemo(() => {
    if (!selectedDate) return []
    return entriesByDate.get(formatLocalDate(selectedDate)) || []
  }, [selectedDate, entriesByDate])

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed right-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110"
        style={{ bottom: '5rem', background: 'linear-gradient(135deg, #8b2942 0%, #c85050 100%)', border: '2px solid rgba(200,80,80,0.5)', zIndex: 9999, padding: '1rem' }}
        title="Open Diary"
      >
        <span className="text-2xl" role="img" aria-hidden="true">📖</span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-[10000]" style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }} onClick={() => setIsOpen(false)} />

          <div
            className="fixed z-[10001] shadow-2xl rounded-2xl overflow-hidden flex flex-col"
            style={{
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: (view === 'day' && selectedEntry) ? '1050px' : '900px',
              height: '85vh',
              maxHeight: (view === 'day' && selectedEntry) ? '780px' : '750px',
              background: 'linear-gradient(145deg, rgba(45,10,10,0.98) 0%, rgba(26,5,5,0.98) 100%)',
              border: '2px solid rgba(200,80,80,0.5)',
              backdropFilter: 'blur(10px)',
              transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1), max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            role="dialog" aria-modal="true" aria-label="Diary"
            onClick={(e) => e.stopPropagation()}
          >
            {/* ═══ CALENDAR ═══ */}
            {view === 'calendar' && (
              <div className="relative flex flex-col flex-1 overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0" style={{ borderColor: 'rgba(200,80,80,0.3)' }}>
                  <h2 className="text-2xl font-bold" style={{ fontFamily: "'Cinzel', serif", color: '#f5e6d3' }}>📖 My Diary</h2>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setView('new')} className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:opacity-90" style={{ background: 'linear-gradient(135deg, #8b2942 0%, #c85050 100%)', color: '#f5e6d3' }}>
                      <Plus size={14} /> New Entry
                    </button>
                    <button onClick={() => setIsOpen(false)} className="p-2 rounded-full transition-all" style={{ color: '#ff6b6b', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,71,87,0.3)' }}>
                      <X size={18} />
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between px-6 py-3 border-b flex-shrink-0" style={{ borderColor: 'rgba(200,80,80,0.2)' }}>
                  <h3 className="text-xl font-bold" style={{ fontFamily: "'Cinzel', serif", color: '#f5e6d3' }}>{format(currentDate, 'MMMM yyyy')}</h3>
                  <div className="flex items-center gap-2">
                    <button onClick={handleToday} className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300" style={{ background: 'rgba(200, 80, 80, 0.2)', border: '1px solid rgba(200, 80, 80, 0.3)', color: '#f5e6d3' }}>Today</button>
                    <button onClick={handlePrevMonth} className="px-3 py-1.5 rounded-lg text-sm font-bold transition-all duration-300" style={{ background: 'rgba(45, 20, 25, 0.6)', border: '1px solid rgba(200, 80, 80, 0.3)', color: '#f5e6d3' }}>&#8249;</button>
                    <button onClick={handleNextMonth} className="px-3 py-1.5 rounded-lg text-sm font-bold transition-all duration-300" style={{ background: 'rgba(45, 20, 25, 0.6)', border: '1px solid rgba(200, 80, 80, 0.3)', color: '#f5e6d3' }}>&#8250;</button>
                  </div>
                </div>
                <div className="flex items-center gap-6 px-6 py-3 border-b flex-shrink-0" style={{ borderColor: 'rgba(200,80,80,0.2)' }}>
                  <div className="flex items-center gap-2"><span className="text-xs uppercase tracking-wider" style={{ color: '#a89080' }}>Entries</span><span className="text-lg font-bold" style={{ color: '#d4a574' }}>{monthlyStats.totalEntries}</span></div>
                  <div className="flex items-center gap-2"><span className="text-xs uppercase tracking-wider" style={{ color: '#a89080' }}>Days Written</span><span className="text-lg font-bold" style={{ color: '#7bed9f' }}>{monthlyStats.daysWithEntries}</span></div>
                  <div className="flex items-center gap-2"><span className="text-xs uppercase tracking-wider" style={{ color: '#a89080' }}>Avg/Day</span><span className="text-lg font-bold" style={{ color: '#70a1ff' }}>{monthlyStats.avgPerDay}</span></div>
                </div>
                <div className="flex-1 overflow-y-auto px-6 py-4">
                  {loading ? <p className="text-center py-12 text-sm" style={{ color: '#a89080' }}>Loading entries...</p>
                    : fetchError ? <p className="text-center py-12 text-sm" style={{ color: '#ff6b6b' }}>{fetchError}</p>
                    : <DiaryCalendarGrid currentDate={currentDate} entriesByDate={entriesByDate} onDateClick={handleDateClick} />}
                </div>
              </div>
            )}

            {/* ═══ DAY DETAIL ═══ */}
            {view === 'day' && selectedDate && (
              <div className="flex flex-col h-full overflow-hidden">
                {selectedEntry ? (
                  <DiaryEntryDetail
                    entry={selectedEntry}
                    onBack={handleBackFromEntry}
                    onUpdate={handleUpdateEntry}
                    onDelete={handleDeleteEntry}
                    onUploadCover={handleUploadCover}
                    onDeleteCover={handleDeleteCover}
                    uploading={uploading}
                  />
                ) : (
                  <>
                    <div className="flex items-center justify-between px-6 py-4 flex-shrink-0" style={{ borderBottom: '1px solid rgba(200,80,80,0.12)' }}>
                      <button onClick={handleBackFromDay} className="flex items-center gap-1 text-sm transition-all hover:opacity-80" style={{ color: '#c85050' }}><ChevronLeft size={16} /> Calendar</button>
                      <h2 className="text-xl font-bold" style={{ fontFamily: "'Cinzel', serif", color: '#f5e6d3', letterSpacing: '0.03em' }}>{selectedDate && format(selectedDate, 'MMMM d, yyyy')}</h2>
                      <button onClick={handleBackFromDay} className="text-xl transition-all duration-200" style={{ color: 'rgba(200,80,80,0.6)' }}>&#10005;</button>
                    </div>
                    <div className="flex-1 overflow-y-auto px-6 py-4">
                      {entriesForDate.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full">
                          <div className="text-5xl mb-4 opacity-30">📖</div>
                          <p className="text-base" style={{ color: 'rgba(168,144,128,0.5)', fontFamily: "'Crimson Text', serif", fontStyle: 'italic' }}>No entries for this day</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {entriesForDate.map(entry => (
                            <button key={entry.id} onClick={() => handleSelectEntry(entry)} className="w-full text-left rounded-2xl overflow-hidden transition-all duration-300 flex items-stretch" style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(200,80,80,0.12)' }}
                              onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.4)'; e.currentTarget.style.borderColor = 'rgba(200,80,80,0.3)' }}
                              onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.25)'; e.currentTarget.style.borderColor = 'rgba(200,80,80,0.12)' }}
                            >
                              <div className="flex-shrink-0 w-28">
                                {entry.cover_image ? <img src={entry.cover_image} alt="" className="w-full h-full object-cover" /> : (
                                  <div className="w-full h-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(45,15,15,0.8) 0%, rgba(80,30,30,0.4) 100%)' }}><BookOpen size={20} style={{ color: 'rgba(200,80,80,0.3)' }} /></div>
                                )}
                              </div>
                              <div className="flex-1 p-4 min-w-0 flex flex-col justify-center">
                                <p className="truncate mb-1" style={{ color: '#f5e6d3', fontFamily: "'Cinzel', serif", fontSize: '0.95rem', fontWeight: 600 }}>{entry.title}</p>
                                <p className="truncate" style={{ color: 'rgba(168,144,128,0.5)', fontFamily: "'Crimson Text', serif", fontSize: '0.9rem', fontStyle: 'italic' }}>{entry.content || 'Empty page...'}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ═══ NEW ENTRY ═══ */}
            {view === 'new' && (
              <>
                <div className="flex items-center justify-between px-4 py-3 border-b flex-shrink-0" style={{ borderColor: 'rgba(200,80,80,0.3)' }}>
                  <button onClick={() => setView('calendar')} className="text-sm transition-opacity hover:opacity-70" style={{ color: '#c85050' }}>Cancel</button>
                  <h3 className="text-sm font-bold" style={{ color: '#f5e6d3' }}>New Entry</h3>
                  <div style={{ width: 48 }} />
                </div>
                <DiaryEntryEditor onSave={handleCreateEntry} onCancel={() => setView('calendar')} onUploadCover={handleUploadCover} onSetCoverReference={handleSetCoverReference} uploading={uploading} />
              </>
            )}
            {/* Floating butterflies */}
            <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 5 }}>
              <div className="diary-butterfly"><span>🦋</span></div>
              <div className="diary-butterfly"><span>🦋</span></div>
              <div className="diary-butterfly"><span>🦋</span></div>
              <div className="diary-butterfly"><span>🦋</span></div>
              <div className="diary-butterfly"><span>🦋</span></div>
              <div className="diary-butterfly"><span>🦋</span></div>
            </div>
          </div>
        </>
      )}
    </>
  )
}

export default DiaryModal
