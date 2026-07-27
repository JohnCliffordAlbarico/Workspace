import { useState } from 'react'

const WorkspaceCard = ({ workspace, onSelect, onDelete, isOwned }) => {
  const [showConfirm, setShowConfirm] = useState(false)

  const handleDelete = async (e) => {
    e.stopPropagation()
    try {
      await onDelete(workspace.id)
      setShowConfirm(false)
    } catch (err) {
      console.error('Failed to delete workspace:', err)
    }
  }

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(w => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const createdDate = new Date(workspace.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })

  return (
    <div
      className="relative rounded-2xl p-6 cursor-pointer transition-all duration-300 group"
      style={{
        background: 'linear-gradient(145deg, rgba(45, 20, 25, 0.8) 0%, rgba(26, 10, 10, 0.9) 100%)',
        border: '1px solid rgba(200, 80, 80, 0.3)',
      }}
      onClick={() => onSelect(workspace)}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)'
        e.currentTarget.style.boxShadow = '0 12px 40px rgba(200, 80, 80, 0.4)'
        e.currentTarget.style.borderColor = 'rgba(200, 80, 80, 0.6)'
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = ''
        e.currentTarget.style.borderColor = 'rgba(200, 80, 80, 0.3)'
      }}
    >
      {/* Workspace Icon */}
      <div
        className="w-14 h-14 rounded-xl flex items-center justify-center mb-4"
        style={{
          background: 'linear-gradient(135deg, #c85050 0%, #ff6b6b 100%)',
          boxShadow: '0 4px 15px rgba(200, 80, 80, 0.4)'
        }}
      >
        <span
          className="text-xl font-bold"
          style={{ color: '#f5e6d3', fontFamily: "'Cinzel', serif" }}
        >
          {getInitials(workspace.name)}
        </span>
      </div>

      {/* Workspace Name */}
      <h3
        className="text-xl font-bold mb-2"
        style={{ fontFamily: "'Cinzel', serif", color: '#f5e6d3' }}
      >
        {workspace.name}
      </h3>

      {/* Created Date */}
      <p className="text-sm mb-4" style={{ color: '#a89080' }}>
        Created {createdDate}
      </p>

      {/* Enter Button */}
      <div
        className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300"
        style={{
          background: 'linear-gradient(135deg, #8b2942 0%, #c85050 100%)',
          color: '#f5e6d3'
        }}
      >
        <span>Enter Workspace</span>
        <span>→</span>
      </div>

      {/* Delete Button (only for owned workspaces) */}
      {isOwned && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            setShowConfirm(true)
          }}
          className="absolute top-4 right-4 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200"
          style={{
            background: 'rgba(255, 71, 87, 0.2)',
            color: '#ff4757'
          }}
          title="Delete workspace"
        >
          🗑️
        </button>
      )}

      {/* Delete Confirmation */}
      {showConfirm && (
        <div
          className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center p-6"
          style={{
            background: 'rgba(0, 0, 0, 0.9)',
            zIndex: 10
          }}
          onClick={(e) => {
            e.stopPropagation()
            setShowConfirm(false)
          }}
        >
          <p className="text-center mb-4" style={{ color: '#f5e6d3' }}>
            Delete "{workspace.name}"?
          </p>
          <div className="flex gap-3">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowConfirm(false)
              }}
              className="px-4 py-2 rounded-lg text-sm font-semibold"
              style={{
                background: 'rgba(200, 80, 80, 0.2)',
                border: '1px solid rgba(200, 80, 80, 0.3)',
                color: '#f5e6d3'
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 rounded-lg text-sm font-semibold"
              style={{
                background: 'rgba(255, 71, 87, 0.3)',
                border: '1px solid rgba(255, 71, 87, 0.5)',
                color: '#ff4757'
              }}
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default WorkspaceCard
