import { useState } from 'react'
import TaskColumn from './TaskColumn'
import EmptyState from './EmptyState'
import TaskDetailModal from '../modal/TaskDetailModal'

const CompletedTasksView = ({ tasks, setTasks }) => {
  const [selectedTask, setSelectedTask] = useState(null)

  const tasksByPriority = {
    critical: tasks.filter(t => t.priority === 'critical'),
    high: tasks.filter(t => t.priority === 'high'),
    medium: tasks.filter(t => t.priority === 'medium'),
    low: tasks.filter(t => t.priority === 'low')
  }

  const handleTaskClick = (task) => {
    setSelectedTask(task)
  }

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

      {/* Task Detail Modal */}
      <TaskDetailModal
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        task={selectedTask}
        setTasks={setTasks}
        allTasks={tasks}
      />

      {/* Task Columns */}
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
        <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
          <TaskColumn
            title="Critical"
            color="#ff4757"
            tasks={tasksByPriority.critical}
            setTasks={setTasks}
            onTaskClick={handleTaskClick}
          />
          <TaskColumn
            title="High Priority"
            color="#ffa502"
            tasks={tasksByPriority.high}
            setTasks={setTasks}
            onTaskClick={handleTaskClick}
          />
          <TaskColumn
            title="Medium"
            color="#7bed9f"
            tasks={tasksByPriority.medium}
            setTasks={setTasks}
            onTaskClick={handleTaskClick}
          />
          <TaskColumn
            title="Low Priority"
            color="#70a1ff"
            tasks={tasksByPriority.low}
            setTasks={setTasks}
            onTaskClick={handleTaskClick}
          />
        </div>
      )}
    </main>
  )
}

export default CompletedTasksView
