import { useState, useMemo } from 'react'
import TaskColumn from './TaskColumn'
import EmptyState from './EmptyState'
import TaskModal from '../modal/TaskModal'
import TaskDetailModal from '../modal/TaskDetailModal'
import InProgressBanner from './InProgressBanner'

const TaskBoard = ({ tasks, setTasks, workspace }) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)

  const tasksByPriority = {
    critical: tasks.filter(t => t.priority === 'critical'),
    high: tasks.filter(t => t.priority === 'high'),
    medium: tasks.filter(t => t.priority === 'medium'),
    low: tasks.filter(t => t.priority === 'low')
  }

  const inProgressTask = useMemo(() => {
    return tasks.find(t => t.status === 'in_progress')
  }, [tasks])

  const handleTaskClick = (task) => {
    setSelectedTask(task)
  }

  return (
    <main className="flex-1 p-8 overflow-auto z-10">
      {/* Header */}
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 
            className="text-4xl font-bold mb-2"
            style={{
              fontFamily: "'Cinzel', serif",
              color: '#f5e6d3',
              textShadow: '0 2px 10px rgba(200, 80, 80, 0.3)'
            }}
          >
            🔥 Yuuko's Task Board
          </h1>
          <p style={{ color: '#a89080' }}>
            Managing productivity with elegance
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-3 rounded-xl text-base font-semibold transition-all duration-300"
          style={{
            background: 'linear-gradient(135deg, #8b2942 0%, #c85050 100%)',
            color: '#f5e6d3',
            border: 'none'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(200, 80, 80, 0.4)'
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = 'none'
          }}
        >
          ✨ New Task
        </button>
      </header>

      {/* In Progress Banner */}
      {inProgressTask && (
        <InProgressBanner 
          task={inProgressTask} 
          setTasks={setTasks}
          onTaskClick={handleTaskClick}
        />
      )}

      {/* Task Modal */}
      <TaskModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        workspaceId={workspace.id}
        setTasks={setTasks}
        tasks={tasks}
      />

      {/* Task Detail Modal */}
      <TaskDetailModal
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        task={selectedTask}
        setTasks={setTasks}
        allTasks={tasks}
      />

      {/* Task Columns - 2x2 Grid */}
      {tasks.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-2 gap-6">
          <TaskColumn
            title="Critical"
            color="#ff4757"
            tasks={tasksByPriority.critical}
            setTasks={setTasks}
            onTaskClick={handleTaskClick}
            allTasks={tasks}
          />
          <TaskColumn
            title="High Priority"
            color="#ffa502"
            tasks={tasksByPriority.high}
            setTasks={setTasks}
            onTaskClick={handleTaskClick}
            allTasks={tasks}
          />
          <TaskColumn
            title="Medium"
            color="#ffa502"
            tasks={tasksByPriority.medium}
            setTasks={setTasks}
            onTaskClick={handleTaskClick}
            allTasks={tasks}
          />
          <TaskColumn
            title="Low Priority"
            color="#70a1ff"
            tasks={tasksByPriority.low}
            setTasks={setTasks}
            onTaskClick={handleTaskClick}
            allTasks={tasks}
          />
        </div>
      )}
    </main>
  )
}

export default TaskBoard
