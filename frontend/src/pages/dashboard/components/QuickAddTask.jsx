import { useState } from 'react'
import { Plus } from 'lucide-react'

const QuickAddTask = ({ workspaceId, onTaskAdded }) => {
  const [title, setTitle] = useState('')
  const [isAdding, setIsAdding] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!title.trim() || isAdding) return

    setIsAdding(true)
    try {
      await onTaskAdded(title.trim())
      setTitle('')
    } catch (error) {
      console.error('Failed to add task:', error)
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <form 
      onSubmit={handleSubmit}
      className="mb-6 rounded-xl p-4 transition-all duration-300"
      style={{
        background: 'linear-gradient(145deg, rgba(45, 20, 25, 0.6) 0%, rgba(26, 10, 10, 0.8) 100%)',
        border: '1px solid rgba(200, 80, 80, 0.3)',
      }}
    >
      <div className="flex gap-3 items-center">
        <div className="flex-1 relative">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Quick add: What are you working on right now?"
            disabled={isAdding}
            className="w-full px-4 py-3 rounded-lg text-base transition-all duration-200"
            style={{
              background: 'rgba(0, 0, 0, 0.3)',
              border: '1px solid rgba(200, 80, 80, 0.2)',
              color: '#f5e6d3',
              outline: 'none',
            }}
            onFocus={(e) => {
              e.target.style.border = '1px solid rgba(200, 80, 80, 0.5)'
              e.target.style.background = 'rgba(0, 0, 0, 0.4)'
            }}
            onBlur={(e) => {
              e.target.style.border = '1px solid rgba(200, 80, 80, 0.2)'
              e.target.style.background = 'rgba(0, 0, 0, 0.3)'
            }}
          />
          {title && (
            <div 
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs px-2 py-1 rounded"
              style={{
                background: 'rgba(200, 80, 80, 0.2)',
                color: '#d4a574',
              }}
            >
              Press Enter ⏎
            </div>
          )}
        </div>
        <button
          type="submit"
          disabled={!title.trim() || isAdding}
          className="px-4 py-3 rounded-lg transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
          style={{
            background: title.trim() && !isAdding
              ? 'linear-gradient(135deg, #8b2942 0%, #c85050 100%)'
              : 'rgba(45, 20, 25, 0.6)',
            border: '1px solid rgba(200, 80, 80, 0.3)',
            color: '#f5e6d3',
          }}
          onMouseOver={(e) => {
            if (title.trim() && !isAdding) {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(200, 80, 80, 0.4)'
            }
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = 'none'
          }}
        >
          <Plus className="w-5 h-5" />
          <span className="font-semibold">Add</span>
        </button>
      </div>
      <div className="mt-2 text-xs" style={{ color: '#a89080' }}>
        💡 Quick add creates a medium priority task. Use "New Task" button for more options.
      </div>
    </form>
  )
}

export default QuickAddTask
