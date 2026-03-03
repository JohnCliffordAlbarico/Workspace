import { DndContext, DragOverlay, PointerSensor, KeyboardSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import PriorityDropZone from './PriorityDropZone'
import TaskDetailModal from '../modal/TaskDetailModal'
import { usePriorityDrag } from '../hooks/usePriorityDrag'
import { useState } from 'react'

const PriorityBoard = ({ tasks, setTasks, workspace }) => {
  const [selectedTask, setSelectedTask] = useState(null)
  const [activeTask, setActiveTask] = useState(null)
  const { handleDragEnd, handleDragStart, handleDragCancel, isDragging, error } = usePriorityDrag(setTasks)

  // Configure sensors for better accessibility and touch support
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required before drag starts
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

  const priorities = ['critical', 'high', 'medium', 'low']

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

  return (
    <>
      <DndContext 
        sensors={sensors}
        onDragStart={onDragStart} 
        onDragEnd={onDragEnd}
        onDragCancel={onDragCancel}
      >
        <div 
          className="flex-1 overflow-y-auto p-8"
          style={{
            cursor: isDragging ? 'grabbing' : 'default'
          }}
        >
          {/* Error notification */}
          {error && (
            <div 
              className="max-w-6xl mx-auto mb-4 p-4 rounded-lg"
              style={{
                background: '#ff475740',
                border: '1px solid #ff4757',
                color: '#fff5f5'
              }}
            >
              {error}
            </div>
          )}

          <div className="max-w-6xl mx-auto space-y-4">
            {priorities.map(priority => (
              <PriorityDropZone
                key={priority}
                priority={priority}
                tasks={tasks}
                setTasks={setTasks}
                onTaskClick={setSelectedTask}
                allTasks={tasks}
              />
            ))}
          </div>
        </div>

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

      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          setTasks={setTasks}
          workspace={workspace}
        />
      )}
    </>
  )
}

export default PriorityBoard
