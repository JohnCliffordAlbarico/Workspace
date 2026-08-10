import { useMemo, useState, useEffect } from 'react'
import { 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval,
  format 
} from 'date-fns'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const CalendarStats = ({ currentDate, tasks }) => {
  const [breakTimes, setBreakTimes] = useState([])
  const [loadingBreaks, setLoadingBreaks] = useState(true)

  // Fetch all break times
  useEffect(() => {
    const fetchBreakTimes = async () => {
      try {
        const token = localStorage.getItem('token')
        const response = await axios.get(`${API_URL}/api/breaktime`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setBreakTimes(response.data)
      } catch (err) {
        console.error('Error fetching break times:', err)
      } finally {
        setLoadingBreaks(false)
      }
    }

    fetchBreakTimes()
  }, [currentDate])
  const stats = useMemo(() => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const monthStr = format(currentDate, 'yyyy-MM')

    // Tasks completed this month
    const completedThisMonth = tasks.filter(t => {
      if (!t.completed_at) return false
      const completedMonth = format(new Date(t.completed_at), 'yyyy-MM')
      return completedMonth === monthStr
    })

    // Tasks due this month
    const dueThisMonth = tasks.filter(t => {
      if (!t.due_date) return false
      const dueMonth = format(new Date(t.due_date), 'yyyy-MM')
      return dueMonth === monthStr && t.status !== 'completed'
    })

    // Total time spent this month
    const totalTime = completedThisMonth.reduce((sum, task) => {
      if (!task.started_at || !task.completed_at) return sum
      const start = new Date(task.started_at)
      const end = new Date(task.completed_at)
      const minutes = Math.floor((end - start) / 60000)
      return sum + minutes
    }, 0)

    // Break time earned and used this month
    const breakTimesThisMonth = breakTimes.filter(bt => {
      if (!bt.created_at) return false
      const createdMonth = format(new Date(bt.created_at), 'yyyy-MM')
      return createdMonth === monthStr
    })

    const breakTimeEarned = breakTimesThisMonth.reduce((sum, bt) => sum + bt.earned_minutes, 0)
    const breakTimeUsed = breakTimesThisMonth
      .filter(bt => bt.status === 'used')
      .reduce((sum, bt) => sum + bt.earned_minutes, 0)

    // Most productive day
    const dayTaskCounts = {}
    completedThisMonth.forEach(task => {
      if (!task.completed_at) return
      const day = format(new Date(task.completed_at), 'yyyy-MM-dd')
      dayTaskCounts[day] = (dayTaskCounts[day] || 0) + 1
    })
    
    const mostProductiveDay = Object.entries(dayTaskCounts).reduce(
      (max, [day, count]) => count > max.count ? { day, count } : max,
      { day: null, count: 0 }
    )

    // Completion rate
    const totalTasks = tasks.filter(t => {
      const createdMonth = format(new Date(t.created_at), 'yyyy-MM')
      return createdMonth === monthStr
    }).length
    const completionRate = totalTasks > 0 
      ? Math.round((completedThisMonth.length / totalTasks) * 100) 
      : 0

    // Average tasks per day
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd }).length
    const avgPerDay = completedThisMonth.length > 0
      ? (completedThisMonth.length / daysInMonth).toFixed(1)
      : 0

    return {
      completedCount: completedThisMonth.length,
      dueCount: dueThisMonth.length,
      totalTime,
      breakTimeEarned,
      breakTimeUsed,
      mostProductiveDay,
      completionRate,
      avgPerDay
    }
  }, [currentDate, tasks, breakTimes])

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  return (
    <div 
      className="rounded-xl p-5 mb-4"
      style={{
        background: 'rgba(45, 20, 25, 0.6)',
        border: '1px solid rgba(200, 80, 80, 0.2)'
      }}
    >
      <h3 
        className="text-lg font-bold mb-4"
        style={{ 
          fontFamily: "'Cinzel', serif",
          color: '#c85050' 
        }}
      >
        📊 Monthly Statistics
      </h3>

      <div className="grid grid-cols-2 gap-4">
        {/* Completed Tasks */}
        <div>
          <div 
            className="text-xs uppercase tracking-wider mb-1"
            style={{ color: '#a89080' }}
          >
            Completed
          </div>
          <div 
            className="text-2xl font-bold"
            style={{ color: '#7bed9f' }}
          >
            {stats.completedCount}
          </div>
        </div>

        {/* Due Tasks */}
        <div>
          <div 
            className="text-xs uppercase tracking-wider mb-1"
            style={{ color: '#a89080' }}
          >
            Due
          </div>
          <div 
            className="text-2xl font-bold"
            style={{ color: '#ff4757' }}
          >
            {stats.dueCount}
          </div>
        </div>

        {/* Total Time */}
        <div>
          <div 
            className="text-xs uppercase tracking-wider mb-1"
            style={{ color: '#a89080' }}
          >
            Total Time
          </div>
          <div 
            className="text-2xl font-bold"
            style={{ color: '#ffa502' }}
          >
            {formatTime(stats.totalTime)}
          </div>
        </div>

        {/* Break Time Earned */}
        <div>
          <div 
            className="text-xs uppercase tracking-wider mb-1"
            style={{ color: '#a89080' }}
          >
            Break Time Earned
          </div>
          <div 
            className="text-2xl font-bold"
            style={{ color: '#50c878' }}
          >
            {stats.breakTimeEarned}m
          </div>
        </div>

        {/* Break Time Used */}
        <div>
          <div 
            className="text-xs uppercase tracking-wider mb-1"
            style={{ color: '#a89080' }}
          >
            Break Time Used
          </div>
          <div 
            className="text-2xl font-bold"
            style={{ color: '#50c878' }}
          >
            {stats.breakTimeUsed}m
          </div>
        </div>

        {/* Completion Rate */}
        <div>
          <div 
            className="text-xs uppercase tracking-wider mb-1"
            style={{ color: '#a89080' }}
          >
            Completion Rate
          </div>
          <div 
            className="text-2xl font-bold"
            style={{ color: '#d4a574' }}
          >
            {stats.completionRate}%
          </div>
        </div>

        {/* Average Per Day */}
        <div>
          <div 
            className="text-xs uppercase tracking-wider mb-1"
            style={{ color: '#a89080' }}
          >
            Avg Per Day
          </div>
          <div 
            className="text-2xl font-bold"
            style={{ color: '#70a1ff' }}
          >
            {stats.avgPerDay}
          </div>
        </div>

        {/* Most Productive Day */}
        <div>
          <div 
            className="text-xs uppercase tracking-wider mb-1"
            style={{ color: '#a89080' }}
          >
            Best Day
          </div>
          <div 
            className="text-lg font-bold"
            style={{ color: '#c85050' }}
          >
            {stats.mostProductiveDay.day 
              ? format(new Date(stats.mostProductiveDay.day), 'MMM d')
              : 'N/A'
            }
          </div>
          {stats.mostProductiveDay.count > 0 && (
            <div 
              className="text-xs"
              style={{ color: '#a89080' }}
            >
              {stats.mostProductiveDay.count} tasks
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CalendarStats
