import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import api from '../../../config/api'

const QuickAddSubtask = ({ parentTaskId, categoryId, onSubtaskAdded, onCancel, color }) => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [isAdding, setIsAdding] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!title.trim() || isAdding) return

    setIsAdding(true)
    try {
      const taskData = {
        category_id: categoryId,
        parent_task_id: parentTaskId,
        title: title.trim(),
        description: description.trim() || null,
        priority: 'medium',
        status: 'pending',
        position: 0
      }
      
      const response = await api.post('/tasks', taskData)
      
      onSubtaskAdded(response.data)
      setTitle('')
      setDescription('')
    } catch (error) {
      console.error('Failed to add subtask:', error)
    } finally {
      setIsAdding(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onCancel()
    }
  }

  return (
    <form 
      onSubmit={handleSubmit}
      onKeyDown={handleKeyDown}
      className="ml-6 mt-2 rounded-lg p-3 transition-all duration-300"
      style={{
        background: `${color}10`,
        border: `1px solid ${color}30`,
      }}
    >
      <div className="flex gap-2 items-center mb-2">
        <div className="flex-1 relative">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Add subtask..."
            disabled={isAdding}
            autoFocus
            className="w-full px-3 py-2 rounded-lg text-sm transition-all duration-200"
            style={{
              background: 'rgba(0, 0, 0, 0.3)',
              border: `1px solid ${color}30`,
              color: '#f5e6d3',
              outline: 'none',
            }}
            onFocus={(e) => {
              e.target.style.border = `1px solid ${color}60`
              e.target.style.background = 'rgba(0, 0, 0, 0.4)'
            }}
            onBlur={(e) => {
              e.target.style.border = `1px solid ${color}30`
              e.target.style.background = 'rgba(0, 0, 0, 0.3)'
            }}
          />
        </div>
        <button
          type="submit"
          disabled={!title.trim() || isAdding}
          className="px-3 py-2 rounded-lg transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
          style={{
            background: title.trim() && !isAdding
              ? `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)`
              : `${color}30`,
            border: `1px solid ${color}50`,
            color: '#f5e6d3',
          }}
        >
          <Plus className="w-4 h-4" />
          <span className="text-xs font-semibold">Add</span>
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-2 py-2 rounded-lg transition-all duration-300"
          style={{
            background: 'rgba(255, 71, 87, 0.2)',
            border: '1px solid rgba(255, 71, 87, 0.3)',
            color: '#ff4757',
          }}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Description input */}
      <div className="mt-2">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add a description..."
          disabled={isAdding}
          rows={2}
          className="w-full px-3 py-2 rounded-lg text-xs transition-all duration-200 resize-none"
          style={{
            background: 'rgba(0, 0, 0, 0.3)',
            border: `1px solid ${color}30`,
            color: '#f5e6d3',
            outline: 'none',
          }}
          onFocus={(e) => {
            e.target.style.border = `1px solid ${color}60`
            e.target.style.background = 'rgba(0, 0, 0, 0.4)'
          }}
          onBlur={(e) => {
            e.target.style.border = `1px solid ${color}30`
            e.target.style.background = 'rgba(0, 0, 0, 0.3)'
          }}
        />
      </div>
    </form>
  )
}

export default QuickAddSubtask