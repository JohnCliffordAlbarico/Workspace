import { DndContext, DragOverlay, PointerSensor, KeyboardSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import TaskColumn from './TaskColumn'
import EmptyState from './EmptyState'
import TaskModal from '../modal/TaskModal'
import TaskDetailModal from '../modal/TaskDetailModal'
import InProgressBanner from './InProgressBanner'
import QuickAddTask from './QuickAddTask'
import BreakTimeWidget from './BreakTimeWidget'
import DigitalClock from './DigitalClock'
import AllocationProgress from '../../../components/AllocationProgress'
import { useTasks } from '../hooks/useTasks'
import { useState, useMemo } from 'react'
import api from '../../../config/api'

const PriorityBoard = ({ categories, selectedCategoryId, setSelectedCategoryId, getCategoryProgress, refreshTrigger, setRefreshTrigger }) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [activeTask, setActiveTask] = useState(null)

  // Fetch all tasks for the selected category
  const { tasks: allTasks, setTasks: setAllTasks, loading: tasksLoading } = useTasks(selectedCategoryId, { refresh: refreshTrigger })

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

  // Only show main tasks (no parent_task_id)
  const mainTasks = useMemo(() => 
    allTasks.filter(t => !t.parent_task_id), 
    [allTasks]
  )

  const inProgressTask = useMemo(() => {
    const inProgress = allTasks.filter(t => t.status === 'in_progress' || t.status === 'paused')
    if (inProgress.length === 0) return null
    const subtask = inProgress.find(t => t.parent_task_id)
    return subtask || inProgress[0]
  }, [allTasks])

  const handleTaskClick = (task) => {
    setSelectedTask(task)
  }

  const onDragStart = (event) => {
    const task = allTasks.find(t => t.id === event.active.id)
    if (task?.status === 'in_progress') return
    setActiveTask(task)
  }

  const onDragEnd = (event) => {
    setActiveTask(null)
    // Handle drag end logic if needed
  }

  const onDragCancel = () => {
    setActiveTask(null)
  }

  const handleQuickAdd = async (title, goalMinutes = null) => {
    try {
      const taskData = {
        category_id: selectedCategoryId,
        title,
        priority: 'medium',
        status: 'pending',
        position: allTasks.length
      }
      
      if (goalMinutes) {
        taskData.goal_time_minutes = goalMinutes
      }
      
      const response = await api.post('/tasks', taskData)
      setAllTasks(prev => [...prev, response.data])
    } catch (error) {
      console.error('Failed to create task:', error)
      throw error
    }
  }

  const currentCategory = categories.find(c => c.id === selectedCategoryId)
  const categoryProgress = getCategoryProgress(selectedCategoryId)

  return (
    <DndContext 
      sensors={sensors}
      onDragStart={onDragStart} 
      onDragEnd={onDragEnd}
      onDragCancel={onDragCancel}
    >
      <main className="flex-1 p-8 overflow-auto z-10">
        {/* Header */}
        <header className="mb-6 flex justify-between items-center">
          <div>
            <h1 
              className="text-4xl font-bold mb-2"
              style={{
                fontFamily: "'Cinzel', serif",
                color: '#f5e6d3',
                textShadow: '0 2px 10px rgba(200, 80, 80, 0.3)'
              }}
            >
              ⚡ Focus Board
            </h1>
            <p style={{ color: '#a89080' }}>
              Manage your productivity by focus area
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

        {/* In Progress Banner */}
        {inProgressTask && (
          <InProgressBanner 
            task={inProgressTask} 
            setTasks={setAllTasks}
            onTaskClick={handleTaskClick}
            allTasks={allTasks}
          />
        )}

        {/* Break Time Widget */}
        <BreakTimeWidget />

        {/* Category Tabs */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
          {categories.map(category => {
            const progress = getCategoryProgress(category.id)
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategoryId(category.id)}
                className="flex-shrink-0 px-4 py-3 rounded-xl transition-all duration-300"
                style={{
                  background: selectedCategoryId === category.id 
                    ? 'linear-gradient(135deg, rgba(45, 20, 25, 0.9) 0%, rgba(26, 10, 10, 0.95) 100%)'
                    : 'rgba(45, 20, 25, 0.4)',
                  border: selectedCategoryId === category.id 
                    ? `2px solid ${category.color}`
                    : '2px solid transparent',
                  minWidth: '150px'
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ background: category.color }}
                  />
                  <span 
                    className="font-semibold text-sm"
                    style={{ color: '#f5e6d3' }}
                  >
                    {category.name}
                  </span>
                </div>
                <AllocationProgress 
                  actualMinutes={progress.actual_minutes}
                  dailyAllocation={progress.daily_allocation}
                  compact
                />
              </button>
            )
          })}
        </div>

        {/* Quick Add Task */}
        {selectedCategoryId && (
          <QuickAddTask 
            categoryId={selectedCategoryId}
            onTaskAdded={handleQuickAdd}
          />
        )}

        {/* Task Modal */}
        <TaskModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          categoryId={selectedCategoryId}
          categories={categories}
          setTasks={setAllTasks}
          tasks={allTasks}
        />

        {/* Task Detail Modal */}
        <TaskDetailModal
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          task={selectedTask}
          setTasks={setAllTasks}
          allTasks={allTasks}
        />

        {/* Task Content */}
        {tasksLoading ? (
          <div className="text-center py-12" style={{ color: '#a89080' }}>
            Loading tasks...
          </div>
        ) : allTasks.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-3 gap-6">
            {/* Pending Column */}
            <TaskColumn
              title="Pending"
              color="#6b7280"
              tasks={mainTasks.filter(t => t.status === 'pending')}
              setTasks={setAllTasks}
              onTaskClick={handleTaskClick}
              allTasks={allTasks}
              status="pending"
            />
            
            {/* In Progress Column */}
            <TaskColumn
              title="In Progress"
              color="#eab308"
              tasks={mainTasks.filter(t => t.status === 'in_progress' || t.status === 'paused')}
              setTasks={setAllTasks}
              onTaskClick={handleTaskClick}
              allTasks={allTasks}
              status="in_progress"
            />
            
            {/* Completed Column */}
            <TaskColumn
              title="Completed"
              color="#22c55e"
              tasks={mainTasks.filter(t => t.status === 'completed')}
              setTasks={setAllTasks}
              onTaskClick={handleTaskClick}
              allTasks={allTasks}
              status="completed"
              showCompletedCount
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
