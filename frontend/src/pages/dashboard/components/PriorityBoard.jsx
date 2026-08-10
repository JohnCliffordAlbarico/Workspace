import { DndContext, DragOverlay, PointerSensor, KeyboardSensor, TouchSensor, useSensor, useSensors, closestCenter } from '@dnd-kit/core'
import { SortableContext, useSortable, sortableKeyboardCoordinates, arrayMove } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import TaskItem from './TaskItem'
import TaskModal from '../modal/TaskModal'
import TaskDetailModal from '../modal/TaskDetailModal'
import InProgressBanner from './InProgressBanner'
import QuickAddTask from './QuickAddTask'
import DigitalClock from './DigitalClock'
import AllocationProgress from '../../../components/AllocationProgress'
import { useState, useMemo, useCallback, useEffect, memo } from 'react'
import { ChevronDown, ChevronUp, GripVertical } from 'lucide-react'
import api from '../../../config/api'
import { useRealtime } from '../../../hooks/useRealtime'

const COMPLETED_TASKS_PER_PAGE = 5

// ─── Sortable Category Column ────────────────────────────────────────────
const SortableCategory = memo(({
  id, category, categoryTasks, completedTasks, progress,
  allTasks, setAllTasks, onTaskClick, refreshStats,
  showCompleted, setShowCompleted, completedPage, setCompletedPage,
  onQuickAdd
}) => {
  const {
    attributes, listeners, setNodeRef, transform, transition, isDragging
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : 'auto'
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="rounded-2xl p-4 flex flex-col flex-shrink-0"
      {...attributes}
    >
      {/* Category Header */}
      <div className="flex items-center gap-2 mb-3">
        {/* Drag Handle */}
        <div
          {...listeners}
          className="flex-shrink-0 cursor-grab active:cursor-grabbing rounded p-0.5 transition-colors"
          style={{ color: 'rgba(200, 180, 160, 0.4)' }}
          onMouseOver={(e) => { e.currentTarget.style.color = 'rgba(200, 180, 160, 0.8)' }}
          onMouseOut={(e) => { e.currentTarget.style.color = 'rgba(200, 180, 160, 0.4)' }}
        >
          <GripVertical size={16} />
        </div>
        <div
          className="w-3 h-3 rounded-full flex-shrink-0"
          style={{ background: category.color }}
        />
        <span
          className="font-semibold text-base truncate"
          style={{ fontFamily: "'Cinzel', serif", color: '#f5e6d3' }}
        >
          {category.name}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <AllocationProgress
          actualMinutes={progress.actual_minutes}
          dailyAllocation={progress.daily_allocation}
        />
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-3">
        {categoryTasks.length === 0 && (!completedTasks?.length || !showCompleted[category.id]) ? (
          <div
            className="text-center py-8 rounded-xl"
            style={{
              background: 'rgba(0,0,0,0.2)',
              border: '1px dashed rgba(200, 80, 80, 0.2)'
            }}
          >
            <p className="text-sm" style={{ color: '#a89080' }}>
              No tasks yet
            </p>
          </div>
        ) : (
          categoryTasks.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              subtasks={allTasks.filter(t => t.parent_task_id === task.id)}
              color={category.color}
              setTasks={setAllTasks}
              onTaskClick={onTaskClick}
              refreshStats={refreshStats}
            />
          ))
        )}

        {/* Completed Tasks Toggle */}
        {completedTasks?.length > 0 && (
          <div className="mt-2">
            <button
              onClick={() => setShowCompleted(prev => ({ ...prev, [category.id]: !prev[category.id] }))}
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all duration-200"
              style={{
                background: 'rgba(200, 180, 160, 0.08)',
                border: '1px solid rgba(200, 180, 160, 0.2)',
                color: 'rgba(200, 180, 160, 0.6)'
              }}
            >
              {showCompleted[category.id] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              {showCompleted[category.id] ? 'Hide' : 'Show'} Completed ({completedTasks.length})
            </button>

            {showCompleted[category.id] && (
              <div className="mt-2 space-y-2">
                {completedTasks
                  .slice(0, (completedPage[category.id] || 0) + COMPLETED_TASKS_PER_PAGE)
                  .map(task => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      subtasks={allTasks.filter(t => t.parent_task_id === task.id)}
                      color={category.color}
                      setTasks={setAllTasks}
                      onTaskClick={onTaskClick}
                      refreshStats={refreshStats}
                    />
                  ))}

                {completedTasks.length > (completedPage[category.id] || 0) + COMPLETED_TASKS_PER_PAGE && (
                  <button
                    onClick={() => setCompletedPage(prev => ({
                      ...prev,
                      [category.id]: (prev[category.id] || 0) + COMPLETED_TASKS_PER_PAGE
                    }))}
                    className="w-full py-2 rounded-lg text-xs font-semibold transition-all duration-200"
                    style={{
                      background: 'rgba(168, 144, 128, 0.1)',
                      border: '1px dashed rgba(168, 144, 128, 0.3)',
                      color: '#a89080'
                    }}
                  >
                    Load more...
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick Add */}
      <QuickAddTask
        onTaskAdded={(title) => onQuickAdd(category.id, title)}
      />
    </div>
  )
})

SortableCategory.displayName = 'SortableCategory'

// ─── PriorityBoard ───────────────────────────────────────────────────────
const PriorityBoard = memo(({ categories, getCategoryProgress, refreshStats, refreshTrigger, allTasks, setAllTasks }) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [activeTask, setActiveTask] = useState(null)
  const [activeCategory, setActiveCategory] = useState(null)
  const [localCategories, setLocalCategories] = useState(categories)
  const [loading, setLoading] = useState(false)
  const [showCompleted, setShowCompleted] = useState({})
  const [completedPage, setCompletedPage] = useState({})

  // Sync local categories when props change (e.g. after refetch)
  useEffect(() => {
    setLocalCategories(categories)
  }, [categories])

  // Real-time updates: when a task changes in Supabase, update local state
  useRealtime((eventType, newTask, oldTask) => {
    setAllTasks(prev => {
      if (eventType === 'INSERT') {
        // Avoid duplicates
        if (prev.some(t => t.id === newTask.id)) return prev
        return [...prev, newTask]
      }
      if (eventType === 'UPDATE') {
        return prev.map(t => t.id === newTask.id ? { ...t, ...newTask } : t)
      }
      if (eventType === 'DELETE') {
        return prev.filter(t => t.id !== oldTask.id)
      }
      return prev
    })
  })

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

  // Group tasks by category (active only by default)
  const tasksByCategory = useMemo(() => {
    const grouped = {}
    categories.forEach(cat => {
      grouped[cat.id] = mainTasks.filter(t => t.category_id === cat.id && t.status !== 'completed')
    })
    return grouped
  }, [categories, mainTasks])

  // Group completed tasks by category
  const completedTasksByCategory = useMemo(() => {
    const grouped = {}
    categories.forEach(cat => {
      grouped[cat.id] = mainTasks.filter(t => t.category_id === cat.id && t.status === 'completed')
    })
    return grouped
  }, [categories, mainTasks])

  // Find in-progress task across all tasks
  const inProgressTask = useMemo(() => {
    const inProgress = allTasks.filter(t => t.status === 'in_progress' || t.status === 'paused')
    if (inProgress.length === 0) return null
    const subtask = inProgress.find(t => t.parent_task_id)
    return subtask || inProgress[0]
  }, [allTasks])

  const handleTaskClick = (task) => {
    setSelectedTask(task)
  }

  const isCategoryId = (id) => typeof id === 'string' && id.startsWith('category-')
  const getCategoryId = (sortableId) => sortableId.replace('category-', '')

  const onDragStart = (event) => {
    const { active } = event
    if (isCategoryId(active.id)) {
      const catId = getCategoryId(active.id)
      setActiveCategory(localCategories.find(c => c.id === catId))
      return
    }
    const task = allTasks.find(t => t.id === active.id)
    if (task?.status === 'in_progress') return
    setActiveTask(task)
  }

  const handleCategoryReorder = useCallback(async (oldIndex, newIndex) => {
    const reordered = arrayMove(localCategories, oldIndex, newIndex)
    setLocalCategories(reordered)

    // Persist to backend
    const order = reordered.map((cat, i) => ({ id: cat.id, position: i }))
    try {
      await api.put('/categories/reorder', { order })
    } catch (err) {
      console.error('Failed to save category order:', err)
      // Revert on failure
      setLocalCategories(categories)
    }
  }, [localCategories, categories])

  const onDragEnd = (event) => {
    const { active, over } = event
    setActiveTask(null)
    setActiveCategory(null)

    if (!over) return

    // Category reorder
    if (isCategoryId(active.id) && isCategoryId(over.id)) {
      const oldIndex = localCategories.findIndex(c => c.id === getCategoryId(active.id))
      const newIndex = localCategories.findIndex(c => c.id === getCategoryId(over.id))
      if (oldIndex !== newIndex) {
        handleCategoryReorder(oldIndex, newIndex)
      }
      return
    }
  }

  const onDragCancel = () => {
    setActiveTask(null)
    setActiveCategory(null)
  }

  const handleQuickAdd = async (categoryId, title) => {
    try {
      const taskData = {
        category_id: categoryId,
        title,
        priority: 'medium',
        status: 'pending',
        position: mainTasks.filter(t => t.category_id === categoryId).length
      }
      
      const response = await api.post('/tasks', taskData)
      setAllTasks(prev => [...prev, response.data])
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
              👻 Spirit Board
            </h1>
            <p style={{ color: '#a89080', fontFamily: "'Cinzel', serif" }}>
              Track your time before time tracks you~
            </p>
          </div>
          
          <div className="flex items-center gap-6">
            <DigitalClock />
          </div>
        </header>

        {/* In Progress Banner */}
        {inProgressTask && (
          <InProgressBanner 
            task={inProgressTask} 
            setTasks={setAllTasks}
            onTaskClick={handleTaskClick}
            allTasks={allTasks}
            refreshStats={refreshStats}
          />
        )}

        {/* Task Modal */}
        <TaskModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
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
        {loading ? (
          <div className="text-center py-12" style={{ color: '#a89080' }}>
            Loading tasks...
          </div>
        ) : categories.length === 0 ? (
          <div 
            className="rounded-2xl p-12 text-center"
            style={{
              background: 'linear-gradient(145deg, rgba(45, 20, 25, 0.6) 0%, rgba(26, 10, 10, 0.8) 100%)',
              border: '1px solid rgba(200, 80, 80, 0.2)'
            }}
          >
            <div className="text-6xl mb-4">📂</div>
            <h3 
              className="text-2xl font-bold mb-2"
              style={{ fontFamily: "'Cinzel', serif", color: '#f5e6d3' }}
            >
              No Categories Yet
            </h3>
            <p style={{ color: '#a89080' }}>
              Create a focus category to start organizing your tasks
            </p>
          </div>
        ) : (
          /* Category Columns */
          <div className="grid grid-cols-3 gap-6 pb-4 max-lg:grid-cols-2 max-md:grid-cols-1">
            <SortableContext
              items={localCategories.map(c => `category-${c.id}`)}
            >
              {localCategories.map(category => {
                const categoryTasks = tasksByCategory[category.id] || []
                const progress = getCategoryProgress(category.id)

                return (
                  <div
                    key={category.id}
                    className="rounded-2xl flex flex-col"
                    style={{
                      background: 'linear-gradient(145deg, rgba(45, 20, 25, 0.6) 0%, rgba(26, 10, 10, 0.8) 100%)',
                      border: `1px solid ${category.color}40`,
                      minHeight: '400px'
                    }}
                  >
                    <SortableCategory
                      id={`category-${category.id}`}
                      category={category}
                      categoryTasks={categoryTasks}
                      completedTasks={completedTasksByCategory[category.id]}
                      progress={progress}
                      allTasks={allTasks}
                      setAllTasks={setAllTasks}
                      onTaskClick={handleTaskClick}
                      refreshStats={refreshStats}
                      showCompleted={showCompleted}
                      setShowCompleted={setShowCompleted}
                      completedPage={completedPage}
                      setCompletedPage={setCompletedPage}
                      onQuickAdd={handleQuickAdd}
                    />
                  </div>
                )
              })}
            </SortableContext>
          </div>
        )}
      </main>

      <DragOverlay dropAnimation={null}>
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
        ) : activeCategory ? (
          <div
            className="rounded-2xl p-4 shadow-2xl"
            style={{
              background: 'linear-gradient(145deg, rgba(45, 20, 25, 0.95) 0%, rgba(26, 10, 10, 0.98) 100%)',
              border: `2px solid ${activeCategory.color}80`,
              opacity: 0.95,
              cursor: 'grabbing',
              minWidth: '280px',
              minHeight: '120px',
              boxShadow: `0 20px 60px rgba(0,0,0,0.5), 0 0 30px ${activeCategory.color}30`
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <GripVertical size={16} style={{ color: activeCategory.color }} />
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ background: activeCategory.color }}
              />
              <span
                className="font-semibold text-base"
                style={{ fontFamily: "'Cinzel', serif", color: '#f5e6d3' }}
              >
                {activeCategory.name}
              </span>
            </div>
            <p className="text-xs" style={{ color: '#a89080', paddingLeft: '28px' }}>
              Drop to reorder
            </p>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
})

export default memo(PriorityBoard)
