import { useMemo, useState } from 'react'
import { 
  format, 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth,
  eachDayOfInterval,
  subDays,
  subMonths,
  isWithinInterval
} from 'date-fns'

const AnalyticsView = ({ tasks }) => {
  const [timeRange, setTimeRange] = useState('month') // 'week', 'month', 'quarter', 'year'

  const analytics = useMemo(() => {
    const now = new Date()
    let startDate, endDate

    // Determine date range
    switch (timeRange) {
      case 'week':
        startDate = startOfWeek(now)
        endDate = endOfWeek(now)
        break
      case 'month':
        startDate = startOfMonth(now)
        endDate = endOfMonth(now)
        break
      case 'quarter':
        startDate = subMonths(now, 3)
        endDate = now
        break
      case 'year':
        startDate = subMonths(now, 12)
        endDate = now
        break
      default:
        startDate = startOfMonth(now)
        endDate = endOfMonth(now)
    }

    const tasksInRange = tasks.filter(t => {
      const taskDate = new Date(t.completed_at || t.created_at)
      return isWithinInterval(taskDate, { start: startDate, end: endDate })
    })

    const completedTasks = tasksInRange.filter(t => t.status === 'completed')

    // Total tasks completed
    const totalCompleted = completedTasks.length

    // Total time spent
    const totalTimeMinutes = completedTasks.reduce((sum, task) => {
      if (!task.started_at || !task.completed_at) return sum
      const start = new Date(task.started_at)
      const end = new Date(task.completed_at)
      return sum + Math.floor((end - start) / 60000)
    }, 0)

    // On-time vs overtime
    const tasksWithGoals = completedTasks.filter(t => t.goal_time_minutes && t.started_at && t.completed_at)
    const onTimeCount = tasksWithGoals.filter(t => {
      const actual = Math.floor((new Date(t.completed_at) - new Date(t.started_at)) / 60000)
      return actual <= t.goal_time_minutes
    }).length
    const overtimeCount = tasksWithGoals.length - onTimeCount

    // Priority breakdown
    const priorityStats = {
      critical: completedTasks.filter(t => t.priority === 'critical').length,
      high: completedTasks.filter(t => t.priority === 'high').length,
      medium: completedTasks.filter(t => t.priority === 'medium').length,
      low: completedTasks.filter(t => t.priority === 'low').length
    }

    // Average completion time
    const avgCompletionTime = tasksWithGoals.length > 0
      ? Math.floor(tasksWithGoals.reduce((sum, t) => {
          return sum + Math.floor((new Date(t.completed_at) - new Date(t.started_at)) / 60000)
        }, 0) / tasksWithGoals.length)
      : 0

    // Completion streak (consecutive days with completed tasks)
    const last30Days = eachDayOfInterval({ start: subDays(now, 30), end: now })
    let currentStreak = 0
    for (let i = last30Days.length - 1; i >= 0; i--) {
      const day = format(last30Days[i], 'yyyy-MM-dd')
      const hasCompletion = tasks.some(t => 
        t.completed_at && format(new Date(t.completed_at), 'yyyy-MM-dd') === day
      )
      if (hasCompletion) {
        currentStreak++
      } else {
        break
      }
    }

    // Daily average
    const daysInRange = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))
    const dailyAverage = daysInRange > 0 ? (totalCompleted / daysInRange).toFixed(1) : 0

    // Productivity score (0-100)
    const productivityScore = Math.min(100, Math.round(
      (totalCompleted * 10) + 
      (onTimeCount * 5) + 
      (currentStreak * 3) +
      (priorityStats.critical * 2) +
      (priorityStats.high * 1.5)
    ))

    return {
      totalCompleted,
      totalTimeMinutes,
      onTimeCount,
      overtimeCount,
      priorityStats,
      avgCompletionTime,
      currentStreak,
      dailyAverage,
      productivityScore,
      tasksWithGoals: tasksWithGoals.length
    }
  }, [tasks, timeRange])

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  const getScoreColor = (score) => {
    if (score >= 80) return '#7bed9f'
    if (score >= 60) return '#ffa502'
    if (score >= 40) return '#ff6348'
    return '#ff4757'
  }

  return (
    <div className="flex-1 overflow-y-auto p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 
          className="text-4xl font-bold mb-2"
          style={{ fontFamily: "'Cinzel', serif", color: '#f5e6d3' }}
        >
          📊 Analytics Dashboard
        </h1>
        <p style={{ color: '#a89080' }}>
          Track your productivity and performance insights
        </p>
      </div>

      {/* Time Range Selector */}
      <div className="flex gap-3 mb-6">
        {['week', 'month', 'quarter', 'year'].map(range => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className="px-4 py-2 rounded-lg transition-all duration-300"
            style={{
              background: timeRange === range
                ? 'linear-gradient(135deg, #8b2942 0%, #c85050 100%)'
                : 'rgba(45, 20, 25, 0.6)',
              border: timeRange === range
                ? '2px solid rgba(200, 80, 80, 0.6)'
                : '1px solid rgba(200, 80, 80, 0.2)',
              color: '#f5e6d3',
              fontFamily: "'Cinzel', serif"
            }}
          >
            {range.charAt(0).toUpperCase() + range.slice(1)}
          </button>
        ))}
      </div>

      {/* Productivity Score - Hero Card */}
      <div 
        className="rounded-2xl p-8 mb-6 text-center"
        style={{
          background: 'linear-gradient(145deg, #2d1418 0%, #1a0d0d 100%)',
          border: '2px solid rgba(200, 80, 80, 0.4)',
          boxShadow: '0 8px 30px rgba(200, 80, 80, 0.3)'
        }}
      >
        <div 
          className="text-sm uppercase tracking-wider mb-2"
          style={{ color: '#a89080' }}
        >
          Productivity Score
        </div>
        <div 
          className="text-7xl font-bold mb-4"
          style={{ 
            color: getScoreColor(analytics.productivityScore),
            fontFamily: "'Cinzel', serif"
          }}
        >
          {analytics.productivityScore}
        </div>
        <div 
          className="w-full h-4 rounded-full overflow-hidden mb-2"
          style={{ background: 'rgba(0,0,0,0.3)' }}
        >
          <div
            className="h-full transition-all duration-1000"
            style={{
              width: `${analytics.productivityScore}%`,
              background: `linear-gradient(90deg, ${getScoreColor(analytics.productivityScore)} 0%, ${getScoreColor(analytics.productivityScore)}dd 100%)`
            }}
          />
        </div>
        <p className="text-sm" style={{ color: '#a89080' }}>
          Based on completion rate, time management, and consistency
        </p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {/* Total Completed */}
        <div 
          className="rounded-xl p-5"
          style={{
            background: 'rgba(45, 20, 25, 0.6)',
            border: '1px solid rgba(200, 80, 80, 0.2)'
          }}
        >
          <div 
            className="text-xs uppercase tracking-wider mb-2"
            style={{ color: '#a89080' }}
          >
            Tasks Completed
          </div>
          <div 
            className="text-4xl font-bold"
            style={{ color: '#7bed9f', fontFamily: "'Cinzel', serif" }}
          >
            {analytics.totalCompleted}
          </div>
          <div className="text-sm mt-2" style={{ color: '#a89080' }}>
            {analytics.dailyAverage} per day avg
          </div>
        </div>

        {/* Total Time */}
        <div 
          className="rounded-xl p-5"
          style={{
            background: 'rgba(45, 20, 25, 0.6)',
            border: '1px solid rgba(200, 80, 80, 0.2)'
          }}
        >
          <div 
            className="text-xs uppercase tracking-wider mb-2"
            style={{ color: '#a89080' }}
          >
            Time Invested
          </div>
          <div 
            className="text-4xl font-bold"
            style={{ color: '#ffa502', fontFamily: "'Cinzel', serif" }}
          >
            {formatTime(analytics.totalTimeMinutes)}
          </div>
          <div className="text-sm mt-2" style={{ color: '#a89080' }}>
            {analytics.avgCompletionTime > 0 ? `${formatTime(analytics.avgCompletionTime)} avg` : 'No data'}
          </div>
        </div>

        {/* Current Streak */}
        <div 
          className="rounded-xl p-5"
          style={{
            background: 'rgba(45, 20, 25, 0.6)',
            border: '1px solid rgba(200, 80, 80, 0.2)'
          }}
        >
          <div 
            className="text-xs uppercase tracking-wider mb-2"
            style={{ color: '#a89080' }}
          >
            Current Streak
          </div>
          <div 
            className="text-4xl font-bold"
            style={{ color: '#ff6348', fontFamily: "'Cinzel', serif" }}
          >
            {analytics.currentStreak} 🔥
          </div>
          <div className="text-sm mt-2" style={{ color: '#a89080' }}>
            consecutive days
          </div>
        </div>

        {/* On-Time Rate */}
        <div 
          className="rounded-xl p-5"
          style={{
            background: 'rgba(45, 20, 25, 0.6)',
            border: '1px solid rgba(200, 80, 80, 0.2)'
          }}
        >
          <div 
            className="text-xs uppercase tracking-wider mb-2"
            style={{ color: '#a89080' }}
          >
            On-Time Rate
          </div>
          <div 
            className="text-4xl font-bold"
            style={{ color: '#70a1ff', fontFamily: "'Cinzel', serif" }}
          >
            {analytics.tasksWithGoals > 0 
              ? Math.round((analytics.onTimeCount / analytics.tasksWithGoals) * 100)
              : 0}%
          </div>
          <div className="text-sm mt-2" style={{ color: '#a89080' }}>
            {analytics.onTimeCount} on time, {analytics.overtimeCount} over
          </div>
        </div>
      </div>

      {/* Priority Distribution */}
      <div 
        className="rounded-xl p-6 mb-6"
        style={{
          background: 'rgba(45, 20, 25, 0.6)',
          border: '1px solid rgba(200, 80, 80, 0.2)'
        }}
      >
        <h3 
          className="text-xl font-bold mb-4"
          style={{ fontFamily: "'Cinzel', serif", color: '#c85050' }}
        >
          Priority Distribution
        </h3>
        <div className="space-y-3">
          {Object.entries(analytics.priorityStats).map(([priority, count]) => {
            const total = analytics.totalCompleted
            const percentage = total > 0 ? (count / total) * 100 : 0
            const colors = {
              critical: '#ff4757',
              high: '#ff6348',
              medium: '#ffa502',
              low: '#70a1ff'
            }
            
            return (
              <div key={priority}>
                <div className="flex justify-between mb-1">
                  <span 
                    className="text-sm capitalize"
                    style={{ color: '#f5e6d3' }}
                  >
                    {priority === 'critical' ? '🔴' : priority === 'high' ? '🟠' : priority === 'medium' ? '🟡' : '🔵'} {priority}
                  </span>
                  <span style={{ color: '#a89080' }}>
                    {count} tasks ({percentage.toFixed(0)}%)
                  </span>
                </div>
                <div 
                  className="w-full h-2 rounded-full overflow-hidden"
                  style={{ background: 'rgba(0,0,0,0.3)' }}
                >
                  <div
                    className="h-full transition-all duration-500"
                    style={{
                      width: `${percentage}%`,
                      background: colors[priority]
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Insights Cards */}
      <div className="grid grid-cols-2 gap-4">
        {/* Time Management Insight */}
        <div 
          className="rounded-xl p-5"
          style={{
            background: 'rgba(45, 20, 25, 0.6)',
            border: '1px solid rgba(200, 80, 80, 0.2)'
          }}
        >
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">⏱️</span>
            <h4 
              className="text-lg font-bold"
              style={{ fontFamily: "'Cinzel', serif", color: '#f5e6d3' }}
            >
              Time Management
            </h4>
          </div>
          <p className="text-sm mb-2" style={{ color: '#a89080' }}>
            {analytics.tasksWithGoals > 0 ? (
              analytics.onTimeCount > analytics.overtimeCount ? (
                <>You're doing great! <span style={{ color: '#7bed9f' }}>{Math.round((analytics.onTimeCount / analytics.tasksWithGoals) * 100)}%</span> of your tasks are completed on time.</>
              ) : (
                <>Consider adjusting your time estimates. <span style={{ color: '#ff4757' }}>{Math.round((analytics.overtimeCount / analytics.tasksWithGoals) * 100)}%</span> of tasks went overtime.</>
              )
            ) : (
              'Start setting goal times to track your time management.'
            )}
          </p>
        </div>

        {/* Consistency Insight */}
        <div 
          className="rounded-xl p-5"
          style={{
            background: 'rgba(45, 20, 25, 0.6)',
            border: '1px solid rgba(200, 80, 80, 0.2)'
          }}
        >
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">📈</span>
            <h4 
              className="text-lg font-bold"
              style={{ fontFamily: "'Cinzel', serif", color: '#f5e6d3' }}
            >
              Consistency
            </h4>
          </div>
          <p className="text-sm mb-2" style={{ color: '#a89080' }}>
            {analytics.currentStreak > 0 ? (
              analytics.currentStreak >= 7 ? (
                <>Amazing! You've maintained a <span style={{ color: '#7bed9f' }}>{analytics.currentStreak}-day streak</span>. Keep it up!</>
              ) : (
                <>You're on a <span style={{ color: '#ffa502' }}>{analytics.currentStreak}-day streak</span>. Try to reach 7 days!</>
              )
            ) : (
              'Complete a task today to start your streak!'
            )}
          </p>
        </div>
      </div>
    </div>
  )
}

export default AnalyticsView
