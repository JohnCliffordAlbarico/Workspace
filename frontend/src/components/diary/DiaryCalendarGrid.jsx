import React, { useMemo } from 'react'
import {
  startOfMonth, endOfMonth,
  startOfWeek, endOfWeek,
  eachDayOfInterval,
  isSameMonth, isToday
} from 'date-fns'
import DiaryCalendarDay from './DiaryCalendarDay'

const formatLocalDate = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const DiaryCalendarGrid = ({ currentDate, entriesByDate, onDateClick }) => {
  const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  // Memoize everything together — days array + entry lookups, recomputes only when currentDate or entriesByDate change
  const dayInfos = useMemo(() => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const calendarStart = startOfWeek(monthStart)
    const calendarEnd = endOfWeek(monthEnd)
    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })
    return days.map(day => {
      const dateStr = formatLocalDate(day)
      const dayEntries = entriesByDate.get(dateStr)
      return {
        day,
        dateStr,
        hasEntries: !!dayEntries,
        entriesCount: dayEntries ? dayEntries.length : 0,
        isCurrentMonth: isSameMonth(day, currentDate),
        isToday: isToday(day)
      }
    })
  }, [entriesByDate, currentDate])

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        background: 'rgba(45, 20, 25, 0.4)',
        border: '1px solid rgba(200, 80, 80, 0.2)'
      }}
    >
      {/* Day Headers */}
      <div
        className="grid grid-cols-7 gap-px"
        style={{ background: 'rgba(200, 80, 80, 0.1)' }}
      >
        {dayHeaders.map(day => (
          <div
            key={day}
            className="p-3 text-center font-semibold"
            style={{
              background: 'rgba(45, 20, 25, 0.8)',
              color: '#c85050',
              fontFamily: "'Cinzel', serif",
              fontSize: '0.875rem',
              letterSpacing: '0.05em'
            }}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Days Grid */}
      <div
        className="grid grid-cols-7 gap-px"
        style={{ background: 'rgba(200, 80, 80, 0.1)' }}
      >
        {dayInfos.map(info => (
          <DiaryCalendarDay
            key={info.dateStr}
            date={info.day}
            isCurrentMonth={info.isCurrentMonth}
            isToday={info.isToday}
            hasEntries={info.hasEntries}
            entriesCount={info.entriesCount}
            onClick={onDateClick}
          />
        ))}
      </div>
    </div>
  )
}

export default React.memo(DiaryCalendarGrid)
