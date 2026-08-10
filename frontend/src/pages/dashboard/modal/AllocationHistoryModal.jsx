import { createPortal } from 'react-dom'
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isToday, addMonths, subMonths } from 'date-fns'
import { useEffect, useState, useMemo, useRef, memo } from 'react'
import { ChevronLeft, ChevronRight, Timer, Target, CheckCircle, TrendingUp } from 'lucide-react'

// Moved outside component — no deps on props/state
// Uses UTC to match backend's UTC-based day boundary
const formatUTCDate = (date) => {
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const formatMinutes = (min) => {
  const h = Math.floor(min / 60)
  const m = min % 60
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

const getBarColor = (percentage) => {
  if (percentage >= 100) return '#7bed9f'
  if (percentage >= 50) return '#ffa502'
  if (percentage > 0) return '#ff6b6b'
  return 'rgba(200, 80, 80, 0.2)'
}

// Memoized day cell component
const DayCell = memo(({ day, currentDate, activeTab, dayData }) => {
  const isCurrentMonth = isSameMonth(day, currentDate)
  const today = isToday(day)
  const dateStr = formatUTCDate(day)
  const dayCats = dayData[dateStr] || {}

  let displayBars = []
  let hasAnyWork = false

  if (activeTab === 'all') {
    Object.values(dayCats).forEach(cat => {
      if (cat.allocatedMinutes > 0 || cat.actualMinutes > 0) {
        displayBars.push(cat)
        if (cat.actualMinutes > 0) hasAnyWork = true
      }
    })
  } else {
    const cat = dayCats[activeTab]
    if (cat && (cat.allocatedMinutes > 0 || cat.actualMinutes > 0)) {
      displayBars.push(cat)
      if (cat.actualMinutes > 0) hasAnyWork = true
    }
  }

  const totalActual = displayBars.reduce((sum, c) => sum + c.actualMinutes, 0)
  const totalAllocated = displayBars.reduce((sum, c) => sum + c.allocatedMinutes, 0)
  const combinedPct = totalAllocated > 0 ? Math.min(100, Math.round((totalActual / totalAllocated) * 100)) : 0

  return (
    <div
      className="min-h-[120px] p-2.5"
      style={{
        background: today
          ? 'linear-gradient(135deg, #8b2942 0%, #c85050 100%)'
          : hasAnyWork
          ? 'rgba(45, 20, 25, 0.8)'
          : 'rgba(45, 20, 25, 0.6)',
        opacity: isCurrentMonth ? 1 : 0.4,
        border: today ? '2px solid #c85050' : 'none',
        boxShadow: today ? '0 0 15px rgba(200, 80, 80, 0.4)' : 'none'
      }}
    >
      <div
        className="text-base font-bold mb-1.5"
        style={{
          fontFamily: "'Cinzel', serif",
          color: today ? '#fff' : '#f5e6d3'
        }}
      >
        {format(day, 'd')}
      </div>

      {/* "All" tab — compact dots + combined bar */}
      {isCurrentMonth && activeTab === 'all' && displayBars.length > 0 && (
        <div className="mt-1">
          <div className="flex flex-wrap gap-1 mb-1.5">
            {displayBars.slice(0, 5).map((cat, i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full"
                style={{ background: cat.color }}
                title={cat.name}
              />
            ))}
            {displayBars.length > 5 && (
              <span className="text-[9px]" style={{ color: '#a89080' }}>+{displayBars.length - 5}</span>
            )}
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.4)' }}>
            <div
              className="h-full rounded-full"
              style={{ width: `${combinedPct}%`, background: getBarColor(combinedPct) }}
            />
          </div>
          <div className="flex justify-between text-[10px] mt-1">
            <span style={{ color: getBarColor(combinedPct) }}>{formatMinutes(totalActual)}</span>
            <span style={{ color: '#a89080' }}>{formatMinutes(totalAllocated)}</span>
          </div>
        </div>
      )}

      {/* Specific category — detailed bar */}
      {isCurrentMonth && activeTab !== 'all' && displayBars.length > 0 && (
        <div className="mt-1">
          <div className="flex items-center gap-1.5 mb-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: displayBars[0].color }} />
            <span className="text-[10px] font-semibold truncate" style={{ color: displayBars[0].color }}>
              {displayBars[0].name}
            </span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.4)' }}>
            <div
              className="h-full rounded-full"
              style={{ width: `${displayBars[0].percentage}%`, background: getBarColor(displayBars[0].percentage) }}
            />
          </div>
          <div className="flex justify-between text-[10px] mt-1">
            <span style={{ color: getBarColor(displayBars[0].percentage) }}>
              {formatMinutes(displayBars[0].actualMinutes)}
            </span>
            <span style={{ color: '#a89080' }}>
              / {formatMinutes(displayBars[0].allocatedMinutes)}
            </span>
          </div>
        </div>
      )}
    </div>
  )
})

const AllocationHistoryModal = ({ isOpen, onClose, categories, tasks, initialCategory }) => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [activeTab, setActiveTab] = useState('all')
  const tabsScrollRef = useRef(null)

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) onClose()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [isOpen, onClose])

  useEffect(() => {
    if (isOpen) {
      setCurrentDate(new Date())
      setActiveTab(initialCategory?.id || 'all')
    }
  }, [isOpen, initialCategory])

  // Pre-compute tasks grouped by category + date (O(n) once, not O(days×cats×tasks))
  const tasksByCategoryDate = useMemo(() => {
    if (!tasks) return {}
    const map = {}
    tasks.forEach(t => {
      if (!t.completed_at) return
      const catId = t.category_id
      const dateStr = formatUTCDate(new Date(t.completed_at))
      if (!map[catId]) map[catId] = {}
      if (!map[catId][dateStr]) map[catId][dateStr] = { totalMinutes: 0, count: 0 }
      map[catId][dateStr].totalMinutes += (t.actual_time_minutes || 0)
      map[catId][dateStr].count++
    })
    return map
  }, [tasks])

  // Compute per-day data using the pre-computed map
  const allCategoryDayData = useMemo(() => {
    if (!categories?.length) return {}

    const monthStart = startOfMonth(currentDate)
    const calStart = startOfWeek(monthStart)
    const calEnd = endOfWeek(endOfMonth(currentDate))
    const days = eachDayOfInterval({ start: calStart, end: calEnd })

    const data = {}
    days.forEach(day => {
      const dateStr = formatUTCDate(day)
      const catData = {}

      categories.forEach(cat => {
        const dayData = tasksByCategoryDate[cat.id]?.[dateStr]
        const actualMinutes = dayData?.totalMinutes || 0
        const allocatedMinutes = cat.daily_allocation_minutes || 0
        const percentage = allocatedMinutes > 0 ? Math.min(100, Math.round((actualMinutes / allocatedMinutes) * 100)) : 0

        catData[cat.id] = { actualMinutes, allocatedMinutes, percentage, taskCount: dayData?.count || 0, color: cat.color, name: cat.name }
      })

      data[dateStr] = catData
    })

    return data
  }, [categories, tasksByCategoryDate, currentDate])

  // Memoized stats
  const stats = useMemo(() => {
    const values = Object.values(allCategoryDayData)

    if (activeTab === 'all') {
      let totalActual = 0, totalAllocated = 0, daysWithData = 0, daysMet = 0
      values.forEach(dayCats => {
        const cats = Object.values(dayCats)
        const dayActual = cats.reduce((sum, c) => sum + c.actualMinutes, 0)
        const dayAllocated = cats.reduce((sum, c) => sum + c.allocatedMinutes, 0)
        totalActual += dayActual
        totalAllocated += dayAllocated
        if (dayActual > 0) daysWithData++
        if (dayAllocated > 0 && dayActual >= dayAllocated) daysMet++
      })
      return { totalActual, totalAllocated, daysWithData, daysMet, avgPerDay: daysWithData > 0 ? Math.round(totalActual / daysWithData) : 0 }
    }

    let totalActual = 0, totalAllocated = 0, daysWithData = 0, daysMet = 0
    values.forEach(dayCats => {
      const cat = dayCats[activeTab]
      if (!cat) return
      totalActual += cat.actualMinutes
      totalAllocated += cat.allocatedMinutes
      if (cat.actualMinutes > 0) daysWithData++
      if (cat.allocatedMinutes > 0 && cat.actualMinutes >= cat.allocatedMinutes) daysMet++
    })
    const cat = categories?.find(c => c.id === activeTab)
    return { totalActual, totalAllocated: cat?.daily_allocation_minutes || 0, daysWithData, daysMet, avgPerDay: daysWithData > 0 ? Math.round(totalActual / daysWithData) : 0 }
  }, [activeTab, allCategoryDayData, categories])

  // Memoize calendar days
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate)
    const calStart = startOfWeek(monthStart)
    const calEnd = endOfWeek(endOfMonth(currentDate))
    return eachDayOfInterval({ start: calStart, end: calEnd })
  }, [currentDate])

  if (!isOpen || !categories?.length) return null

  const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const tabs = [{ id: 'all', name: 'All', color: '#d4a574' }, ...categories]

  return createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{
        background: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(8px)',
        zIndex: 10000
      }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-5xl rounded-2xl p-8 max-h-[90vh] overflow-y-auto"
        style={{
          background: 'linear-gradient(145deg, rgba(45, 20, 25, 0.95) 0%, rgba(26, 10, 10, 0.98) 100%)',
          border: '2px solid rgba(200, 80, 80, 0.3)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2
            className="text-2xl font-bold"
            style={{
              fontFamily: "'Cinzel', serif",
              color: '#f5e6d3',
              textShadow: '0 2px 10px rgba(200, 80, 80, 0.3)'
            }}
          >
            Allocation History
          </h2>
          <button
            onClick={onClose}
            className="text-2xl transition-all duration-200"
            style={{ color: '#c85050' }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'rotate(90deg)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'rotate(0deg)'}
          >
            ✕
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => {
              const el = tabsScrollRef.current
              if (el) el.scrollBy({ left: -150, behavior: 'smooth' })
            }}
            className="flex-shrink-0 p-1.5 rounded-lg transition-all duration-200"
            style={{ color: '#c85050' }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(200, 80, 80, 0.2)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div
            ref={tabsScrollRef}
            className="flex-1 flex gap-2 overflow-x-auto pb-1"
          >
            {tabs.map(tab => {
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 whitespace-nowrap flex items-center gap-2"
                  style={{
                    background: isActive
                      ? 'linear-gradient(135deg, #8b2942 0%, #c85050 100%)'
                      : 'rgba(0,0,0,0.3)',
                    color: isActive ? '#f5e6d3' : '#a89080',
                    border: isActive
                      ? '1px solid rgba(200, 80, 80, 0.5)'
                      : '1px solid rgba(200, 80, 80, 0.2)'
                  }}
                >
                  {tab.id !== 'all' && (
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: tab.color }} />
                  )}
                  {tab.name}
                </button>
              )
            })}
          </div>
          <button
            onClick={() => {
              const el = tabsScrollRef.current
              if (el) el.scrollBy({ left: 150, behavior: 'smooth' })
            }}
            className="flex-shrink-0 p-1.5 rounded-lg transition-all duration-200"
            style={{ color: '#c85050' }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(200, 80, 80, 0.2)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Monthly Summary */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Total Worked', value: formatMinutes(stats.totalActual), color: '#ffa502', icon: Timer },
            { label: 'Daily Target', value: formatMinutes(stats.totalAllocated), color: '#70a1ff', icon: Target },
            { label: 'Days Met Target', value: `${stats.daysMet}`, color: '#7bed9f', icon: CheckCircle },
            { label: 'Avg / Day', value: formatMinutes(stats.avgPerDay), color: '#d4a574', icon: TrendingUp }
          ].map((stat, i) => (
            <div
              key={i}
              className="p-4 rounded-xl text-center relative overflow-hidden"
              style={{
                background: 'rgba(0, 0, 0, 0.3)',
                border: `1px solid ${stat.color}30`
              }}
            >
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  background: `radial-gradient(circle at 50% 120%, ${stat.color}, transparent 70%)`
                }}
              />
              <stat.icon size={16} className="mx-auto mb-1.5" style={{ color: stat.color, opacity: 0.7 }} />
              <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: '#a89080' }}>
                {stat.label}
              </div>
              <div className="text-lg font-bold" style={{ color: stat.color, fontFamily: "'Cinzel', serif" }}>
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setCurrentDate(prev => subMonths(prev, 1))}
            className="p-2 rounded-lg transition-all duration-200"
            style={{ color: '#c85050' }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(200, 80, 80, 0.2)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h3
            className="text-lg font-bold"
            style={{ fontFamily: "'Cinzel', serif", color: '#f5e6d3' }}
          >
            {format(currentDate, 'MMMM yyyy')}
          </h3>
          <button
            onClick={() => setCurrentDate(prev => addMonths(prev, 1))}
            className="p-2 rounded-lg transition-all duration-200"
            style={{ color: '#c85050' }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(200, 80, 80, 0.2)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Calendar Grid */}
        <div
          className="rounded-xl overflow-hidden mb-6"
          style={{
            background: 'rgba(45, 20, 25, 0.4)',
            border: '1px solid rgba(200, 80, 80, 0.2)'
          }}
        >
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-px" style={{ background: 'rgba(200, 80, 80, 0.1)' }}>
            {dayHeaders.map(day => (
              <div
                key={day}
                className="p-2 text-center font-semibold"
                style={{
                  background: 'rgba(45, 20, 25, 0.8)',
                  color: '#c85050',
                  fontFamily: "'Cinzel', serif",
                  fontSize: '0.75rem',
                  letterSpacing: '0.05em'
                }}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Day Cells */}
          <div className="grid grid-cols-7 gap-px" style={{ background: 'rgba(200, 80, 80, 0.1)' }}>
            {calendarDays.map(day => (
              <DayCell
                key={day.toISOString()}
                day={day}
                currentDate={currentDate}
                activeTab={activeTab}
                dayData={allCategoryDayData}
              />
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 mb-6 justify-center">
          {[
            { color: '#7bed9f', label: '100%+' },
            { color: '#ffa502', label: '50-99%' },
            { color: '#ff6b6b', label: '<50%' },
            { color: 'rgba(200, 80, 80, 0.2)', label: 'No work' }
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded" style={{ background: item.color }} />
              <span className="text-xs" style={{ color: '#a89080' }}>{item.label}</span>
            </div>
          ))}
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full py-3 rounded-lg text-center transition-all duration-300"
          style={{
            background: 'rgba(200, 80, 80, 0.2)',
            border: '1px solid rgba(200, 80, 80, 0.3)',
            color: '#f5e6d3'
          }}
          onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(200, 80, 80, 0.3)' }}
          onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(200, 80, 80, 0.2)' }}
        >
          Close (ESC)
        </button>
      </div>
    </div>,
    document.body
  )
}

export default AllocationHistoryModal
