import { useMemo } from 'react'
import { useTaskActions } from '../hooks/useTaskActions'

const CompletedTaskItem = ({ task, setTasks }) => {
  const { toggleTask, deleteTask, loading } = useTaskActions(setTasks)

  const handleReopen = async () => {
    await toggleTask(task.id, task.status, true)
  }

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${task.title}"?`)) {
      await deleteTask(task.id)
    }
  }

  const priorityColors = {
    critical: '#ff4757',
    high: '#ffa502',
    medium: '#7bed9f',
    low: '#70a1ff'
  }

  const priorityLabels = {
    critical: '🔴 Critical',
    high: '🟠 High',
    medium: '🟢 Medium',
    low: '🔵 Low'
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString()
  }

  return (
    <div
      className="rounded-xl p-5 transition-all duration-300"
      style={{
        background: 'linear-gradient(145deg, rgba(45, 20, 25, 0.6) 0%, rgba(26, 10, 10, 0.8) 100%)',
        border: '1px solid rgba(200, 80, 80, 0.2)'
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">✅</span>
            <h3 
              className="text-lg font-semibold"
              style={{ color: '#f5e6d3' }}
            >
              {task.title}
            </h3>
          </div>

          {task.description && (
            <p 
              className="text-sm mb-3 ml-11"
              style={{ color: '#a89080' }}
            >
              {task.description}
            </p>
          )}

          <div className="flex items-center gap-4 ml-11 text-sm">
            <span
              className="px-3 py-1 rounded-full"
              style={{
                background: `${priorityColors[task.priority]}33`,
                color: priorityColors[task.priority],
                border: `1px solid ${priorityColors[task.priority]}66`
              }}
            >
              {priorityLabels[task.priority]}
            </span>
            <span style={{ color: '#a89080' }}>
              Completed: {formatDate(task.completed_at)}
            </span>
            {task.goal_time_minutes && (
              <span style={{ color: '#a89080' }}>
                ⏱️ Goal: {task.goal_time_minutes}m
              </span>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleReopen}
            disabled={loading}
            className="px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300"
            style={{
              background: 'rgba(200, 80, 80, 0.2)',
              border: '1px solid rgba(200, 80, 80, 0.3)',
              color: '#c85050'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(200, 80, 80, 0.3)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'rgba(200, 80, 80, 0.2)'
            }}
          >
            ↩️ Reopen
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="px-4 py-2 rounded-lg text-sm transition-all duration-300"
            style={{
              background: 'rgba(255, 71, 87, 0.2)',
              border: '1px solid rgba(255, 71, 87, 0.3)',
              color: '#ff4757'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(255, 71, 87, 0.3)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'rgba(255, 71, 87, 0.2)'
            }}
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  )
}

const CompletedTasksView = ({ tasks, setTasks }) => {
  const groupedTasks = useMemo(() => {
    const groups = {
      today: [],
      yesterday: [],
      thisWeek: [],
      older: []
    }

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const weekAgo = new Date(today)
    weekAgo.setDate(weekAgo.getDate() - 7)

    tasks.forEach(task => {
      if (!task.completed_at) {
        groups.older.push(task)
        return
      }

      const completedDate = new Date(task.completed_at)
      const completedDay = new Date(completedDate.getFullYear(), completedDate.getMonth(), completedDate.getDate())

      if (completedDay.getTime() === today.getTime()) {
        groups.today.push(task)
      } else if (completedDay.getTime() === yesterday.getTime()) {
        groups.yesterday.push(task)
      } else if (completedDate >= weekAgo) {
        groups.thisWeek.push(task)
      } else {
        groups.older.push(task)
      }
    })

    return groups
  }, [tasks])

  const totalCompleted = tasks.length

  return (
    <main className="flex-1 p-8 overflow-auto z-10">
      {/* Header */}
      <header className="mb-8">
        <h1 
          className="text-4xl font-bold mb-2"
          style={{
            fontFamily: "'Cinzel', serif",
            color: '#f5e6d3',
            textShadow: '0 2px 10px rgba(200, 80, 80, 0.3)'
          }}
        >
          ✅ Completed Tasks
        </h1>
        <p style={{ color: '#a89080' }}>
          {totalCompleted} {totalCompleted === 1 ? 'task' : 'tasks'} completed
        </p>
      </header>

      {totalCompleted === 0 ? (
        <div 
          className="rounded-2xl p-12 text-center"
          style={{
            background: 'linear-gradient(145deg, rgba(45, 20, 25, 0.6) 0%, rgba(26, 10, 10, 0.8) 100%)',
            border: '1px solid rgba(200, 80, 80, 0.2)'
          }}
        >
          <div className="text-6xl mb-4">🎯</div>
          <h3 
            className="text-2xl font-bold mb-2"
            style={{ fontFamily: "'Cinzel', serif", color: '#f5e6d3' }}
          >
            No Completed Tasks Yet
          </h3>
          <p style={{ color: '#a89080' }}>
            Complete some tasks to see them here
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Today */}
          {groupedTasks.today.length > 0 && (
            <div>
              <h2 
                className="text-xl font-bold mb-4"
                style={{ fontFamily: "'Cinzel', serif", color: '#c85050' }}
              >
                Today ({groupedTasks.today.length})
              </h2>
              <div className="space-y-3">
                {groupedTasks.today.map(task => (
                  <CompletedTaskItem key={task.id} task={task} setTasks={setTasks} />
                ))}
              </div>
            </div>
          )}

          {/* Yesterday */}
          {groupedTasks.yesterday.length > 0 && (
            <div>
              <h2 
                className="text-xl font-bold mb-4"
                style={{ fontFamily: "'Cinzel', serif", color: '#c85050' }}
              >
                Yesterday ({groupedTasks.yesterday.length})
              </h2>
              <div className="space-y-3">
                {groupedTasks.yesterday.map(task => (
                  <CompletedTaskItem key={task.id} task={task} setTasks={setTasks} />
                ))}
              </div>
            </div>
          )}

          {/* This Week */}
          {groupedTasks.thisWeek.length > 0 && (
            <div>
              <h2 
                className="text-xl font-bold mb-4"
                style={{ fontFamily: "'Cinzel', serif", color: '#c85050' }}
              >
                This Week ({groupedTasks.thisWeek.length})
              </h2>
              <div className="space-y-3">
                {groupedTasks.thisWeek.map(task => (
                  <CompletedTaskItem key={task.id} task={task} setTasks={setTasks} />
                ))}
              </div>
            </div>
          )}

          {/* Older */}
          {groupedTasks.older.length > 0 && (
            <div>
              <h2 
                className="text-xl font-bold mb-4"
                style={{ fontFamily: "'Cinzel', serif", color: '#c85050' }}
              >
                Older ({groupedTasks.older.length})
              </h2>
              <div className="space-y-3">
                {groupedTasks.older.map(task => (
                  <CompletedTaskItem key={task.id} task={task} setTasks={setTasks} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  )
}

export default CompletedTasksView
