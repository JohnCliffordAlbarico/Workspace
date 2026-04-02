import { useState } from 'react'
import { Plus, Clock } from 'lucide-react'

const QuickAddTask = ({ workspaceId, onTaskAdded }) => {
  const [title, setTitle] = useState('')
  const [minutes, setMinutes] = useState('')
  const [isAdding, setIsAdding] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!title.trim() || isAdding) return

    setIsAdding(true)
    try {
      await onTaskAdded(title.trim(), minutes ? parseInt(minutes) : null)
      setTitle('')
      setMinutes('')
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
      <div className="flex gap-3 items-center mb-3">
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
      
      {/* Minutes Input */}
      <div className="flex items-center gap-2">
        <Clock className="w-4 h-4" style={{ color: '#ffa502' }} />
        <input
          type="number"
          value={minutes}
          onChange={(e) => setMinutes(e.target.value)}
          placeholder="Goal time (minutes)"
          min="1"
          disabled={isAdding}
          className="flex-1 px-3 py-2 rounded-lg text-sm transition-all duration-200"
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
        <span className="text-xs" style={{ color: '#a89080' }}>
          Optional - Set goal time to earn break time
        </span>
      </div>
    </form>
  )
}

export default QuickAddTask
