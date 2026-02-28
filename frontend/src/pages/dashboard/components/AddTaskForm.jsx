import { useState } from 'react'
import { useAddTask } from '../hooks/useAddTask'

const AddTaskForm = ({ workspaceId, setTasks }) => {
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState('medium')
  const { addTask, loading } = useAddTask(setTasks)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim()) return

    await addTask({ workspace_id: workspaceId, title, priority })
    setTitle('')
    setPriority('medium')
  }

  return (
    <form 
      onSubmit={handleSubmit}
      className="mb-8 p-6 rounded-2xl"
      style={{
        background: 'linear-gradient(145deg, rgba(45, 20, 25, 0.8) 0%, rgba(26, 10, 10, 0.9) 100%)',
        border: '1px solid rgba(200, 80, 80, 0.2)'
      }}
    >
      <div className="flex gap-4 flex-wrap">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter a new task..."
          className="flex-1 min-w-64 px-5 py-3 rounded-xl text-base outline-none transition-all duration-300"
          style={{
            background: 'rgba(0,0,0,0.4)',
            border: '1px solid rgba(200, 80, 80, 0.3)',
            color: '#f5e6d3'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#c85050'
            e.target.style.boxShadow = '0 0 15px rgba(200, 80, 80, 0.3)'
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'rgba(200, 80, 80, 0.3)'
            e.target.style.boxShadow = 'none'
          }}
        />
        
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="px-5 py-3 rounded-xl text-base outline-none cursor-pointer"
          style={{
            background: 'rgba(0,0,0,0.4)',
            border: '1px solid rgba(200, 80, 80, 0.3)',
            color: '#f5e6d3'
          }}
        >
          <option value="critical">🔴 Critical</option>
          <option value="high">🟠 High</option>
          <option value="medium">🟢 Medium</option>
          <option value="low">🔵 Low</option>
        </select>

        <button
          type="submit"
          disabled={loading}
          className="px-8 py-3 rounded-xl text-base font-semibold transition-all duration-300 disabled:opacity-50"
          style={{
            background: 'linear-gradient(135deg, #8b2942 0%, #c85050 100%)',
            color: '#f5e6d3',
            border: 'none'
          }}
          onMouseOver={(e) => {
            if (!loading) {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(200, 80, 80, 0.4)'
            }
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = 'none'
          }}
        >
          {loading ? 'Adding...' : '+ Add Task'}
        </button>
      </div>
    </form>
  )
}

export default AddTaskForm
