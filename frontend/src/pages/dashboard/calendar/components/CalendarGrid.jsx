import { 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday
} from 'date-fns'
import CalendarDay from './CalendarDay'

const CalendarGrid = ({ currentDate, tasks, onDateClick, filter = 'all' }) => {
  // Get all days to display in the calendar grid
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calendarStart = startOfWeek(monthStart)
  const calendarEnd = endOfWeek(monthEnd)
  
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  // Day headers
  const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  // Helper to count tasks for a specific date
  const getTasksForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0]
    
    const completed = tasks.filter(t => {
      if (!t.completed_at) return false
      const completedDate = new Date(t.completed_at).toISOString().split('T')[0]
      return completedDate === dateStr
    })

    const due = tasks.filter(t => {
      if (!t.due_date) return false
      const dueDate = new Date(t.due_date).toISOString().split('T')[0]
      return dueDate === dateStr && t.status !== 'completed'
    })

    const created = tasks.filter(t => {
      if (!t.created_at) return false
      const createdDate = new Date(t.created_at).toISOString().split('T')[0]
      return createdDate === dateStr
    })

    return { completed, due, created }
  }

  // Apply filter to determine which tasks to show
  const getFilteredTasksCount = (tasksForDay) => {
    switch (filter) {
      case 'completed':
        return {
          completed: tasksForDay.completed,
          due: [],
          created: []
        }
      case 'due':
        return {
          completed: [],
          due: tasksForDay.due,
          created: []
        }
      case 'created':
        return {
          completed: [],
          due: [],
          created: tasksForDay.created
        }
      case 'all':
      default:
        return tasksForDay
    }
  }

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
        style={{
          background: 'rgba(200, 80, 80, 0.1)'
        }}
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
        style={{
          background: 'rgba(200, 80, 80, 0.1)'
        }}
      >
        {days.map(day => {
          const tasksForDay = getTasksForDate(day)
          const filteredTasks = getFilteredTasksCount(tasksForDay)
          const hasTasks = filteredTasks.completed.length > 0 || 
                          filteredTasks.due.length > 0 || 
                          filteredTasks.created.length > 0

          return (
            <CalendarDay
              key={day.toISOString()}
              date={day}
              isCurrentMonth={isSameMonth(day, currentDate)}
              isToday={isToday(day)}
              hasTasks={hasTasks}
              tasksCount={filteredTasks}
              onClick={() => hasTasks && onDateClick(day)}
            />
          )
        })}
      </div>
    </div>
  )
}

export default CalendarGrid
