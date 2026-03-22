import { DndContext, DragOverlay, PointerSensor, KeyboardSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import TaskColumn from './TaskColumn'
import EmptyState from './EmptyState'
import TaskModal from '../modal/TaskModal'
import TaskDetailModal from '../modal/TaskDetailModal'
import InProgressBanner from './InProgressBanner'
import QuickAddTask from './QuickAddTask'
import DigitalClock from './DigitalClock'
import { usePriorityDrag } from '../hooks/usePriorityDrag'
import { useState, useMemo } from 'react'
import api from '../../../config/api'

const PriorityBoard = ({ tasks, setTasks, workspace }) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [activeTask, setActiveTask] = useState(null)
  const { handleDragEnd, handleDragStart, handleDragCancel, isDragging, error } = usePriorityDrag(setTasks)

  // Configure sensors for better accessibility and touch support
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const tasksByPriority = {
    critical: tasks.filter(t => t.priority === 'critical' && t.status !== 'in_progress'),
    high: tasks.filter(t => t.priority === 'high' && t.status !== 'in_progress'),
    medium: tasks.filter(t => t.priority === 'medium' && t.status !== 'in_progress'),
    low: tasks.filter(t => t.priority === 'low' && t.status !== 'in_progress')
  }

  const inProgressTask = useMemo(() => {
    return tasks.find(t => t.status === 'in_progress')
  }, [tasks])

  const handleTaskClick = (task) => {
    setSelectedTask(task)
  }

  const onDragStart = (event) => {
    const task = tasks.find(t => t.id === event.active.id)
    
    // Prevent dragging in_progress tasks
    if (task?.status === 'in_progress') {
      return
    }
    
    setActiveTask(task)
    handleDragStart()
  }

  const onDragEnd = (event) => {
    setActiveTask(null)
    handleDragEnd(event)
  }

  const onDragCancel = () => {
    setActiveTask(null)
    handleDragCancel()
  }

  const handleQuickAdd = async (title) => {
    try {
      const response = await api.post('/tasks', {
        workspace_id: workspace.id,
        title,
        priority: 'medium',
        status: 'pending',
        position: tasks.length
      })
      
      setTasks(prev => [...prev, response.data])
    } catch (error) {
      console.error('Failed to create task:', error)
      throw error
    }
  }

  return (
    <DndContext 
      sensors={sensors}
      onDragStart={onDragStart} 
      onDragEnd={onDragEnd}
      onDragCancel={onDragCancel}
    >
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
          
          <div className="flex items-center gap-6">
            <DigitalClock />
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
          </div>
        </header>

        {/* Error notification */}
        {error && (
          <div 
            className="mb-4 p-4 rounded-lg"
            style={{
              background: '#ff475740',
              border: '1px solid #ff4757',
              color: '#fff5f5'
            }}
          >
            {error}
          </div>
        )}

        {/* In Progress Banner */}
        {inProgressTask && (
          <InProgressBanner 
            task={inProgressTask} 
            setTasks={setTasks}
            onTaskClick={handleTaskClick}
          />
        )}

        {/* Quick Add Task */}
        <QuickAddTask 
          workspaceId={workspace.id}
          onTaskAdded={handleQuickAdd}
        />

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
              priority="critical"
              isDragging={isDragging}
            />
            <TaskColumn
              title="High Priority"
              color="#ffa502"
              tasks={tasksByPriority.high}
              setTasks={setTasks}
              onTaskClick={handleTaskClick}
              allTasks={tasks}
              priority="high"
              isDragging={isDragging}
            />
            <TaskColumn
              title="Medium"
              color="#ffa502"
              tasks={tasksByPriority.medium}
              setTasks={setTasks}
              onTaskClick={handleTaskClick}
              allTasks={tasks}
              priority="medium"
              isDragging={isDragging}
            />
            <TaskColumn
              title="Low Priority"
              color="#70a1ff"
              tasks={tasksByPriority.low}
              setTasks={setTasks}
              onTaskClick={handleTaskClick}
              allTasks={tasks}
              priority="low"
              isDragging={isDragging}
            />
          </div>
        )}
      </main>

      <DragOverlay>
        {activeTask ? (
          <div 
            className="rounded-xl p-4 shadow-2xl"
            style={{
              background: 'linear-gradient(135deg, #ffa502 0%, #ff6348 100%)',
              border: '2px solid #ffb733',
              color: '#1a0a0a',
              opacity: 0.95,
              cursor: 'grabbing',
              minWidth: '200px',
              fontWeight: '600'
            }}
          >
            <div className="flex items-center gap-2">
              <span>🎯</span>
              <span>{activeTask.title}</span>
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}

export default PriorityBoard
