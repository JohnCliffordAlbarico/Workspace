import { useState } from 'react'
import { useTaskActions } from '../hooks/useTaskActions'
import ConfirmationModal from '../modal/ConfirmationModal'

const TaskItem = ({ task, color, setTasks }) => {
  const [showDelete, setShowDelete] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false)
  const { toggleTask, deleteTask, loading } = useTaskActions(setTasks)

  const handleToggle = async () => {
    const needsConfirmation = await toggleTask(task.id, task.status)
    if (needsConfirmation === false) {
      // Show confirmation modal for completion
      setShowCompleteConfirm(true)
    }
  }

  const handleConfirmComplete = async () => {
    await toggleTask(task.id, task.status, true)
    setShowCompleteConfirm(false)
  }

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true)
      setTimeout(() => setConfirmDelete(false), 3000)
      return
    }
    await deleteTask(task.id)
  }

  const isCompleted = task.status === 'completed'

  return (
    <div
      className="rounded-xl p-4 transition-all duration-300"
      style={{
        background: `${color}26`,
        border: `1px solid ${color}66`,
        animation: 'slideIn 0.3s ease-out forwards'
      }}
      onMouseEnter={() => setShowDelete(true)}
      onMouseLeave={() => setShowDelete(false)}
    >
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>

      <div className="flex items-start gap-3">
        <button
          onClick={handleToggle}
          disabled={loading}
          className="w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all duration-200 mt-0.5"
          style={{
            borderColor: color,
            background: isCompleted ? color : 'transparent',
            color: isCompleted ? '#1a0a0a' : 'transparent'
          }}
        >
          {isCompleted ? '✓' : ''}
        </button>

        <span
          className={`flex-1 text-base leading-relaxed ${isCompleted ? 'line-through opacity-50' : ''}`}
          style={{ color: '#f5e6d3' }}
        >
          {task.title}
        </span>

        <button
          onClick={handleDelete}
          disabled={loading}
          className="text-lg transition-opacity duration-200"
          style={{
            color,
            opacity: showDelete || confirmDelete ? 1 : 0
          }}
          title={confirmDelete ? 'Click again to confirm' : 'Delete task'}
        >
          {confirmDelete ? '🗑️' : '✕'}
        </button>
      </div>

      {/* Completion Confirmation Modal */}
      <ConfirmationModal
        isOpen={showCompleteConfirm}
        onConfirm={handleConfirmComplete}
        onCancel={() => setShowCompleteConfirm(false)}
        title="✅ Complete Task?"
        message={`Are you sure you want to mark "${task.title}" as completed?`}
        confirmText="Yes, Complete"
        cancelText="Not Yet"
      />
    </div>
  )
}

export default TaskItem
