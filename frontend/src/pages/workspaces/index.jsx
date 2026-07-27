import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, LogOut } from 'lucide-react'
import WorkspaceCard from './components/WorkspaceCard'
import { useWorkspaces } from './hooks/useWorkspaces'

const Workspaces = () => {
  const navigate = useNavigate()
  const {
    workspaces,
    loading,
    error,
    createWorkspace,
    deleteWorkspace,
    updateWorkspace,
    selectWorkspace
  } = useWorkspaces()

  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newWorkspaceName, setNewWorkspaceName] = useState('')
  const [creating, setCreating] = useState(false)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  const handleSelectWorkspace = (workspace) => {
    selectWorkspace(workspace)
    navigate('/dashboard')
  }

  const handleCreateWorkspace = async (e) => {
    e.preventDefault()
    if (!newWorkspaceName.trim() || creating) return

    setCreating(true)
    try {
      const newWorkspace = await createWorkspace(newWorkspaceName.trim())
      setNewWorkspaceName('')
      setShowCreateForm(false)
      handleSelectWorkspace(newWorkspace)
    } catch (err) {
      console.error('Failed to create workspace:', err)
    } finally {
      setCreating(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('selectedWorkspace')
    navigate('/')
  }

  return (
    <div
      className="min-h-screen p-8"
      style={{
        background: 'linear-gradient(135deg, #2d0f0f 0%, #4a1a1a 25%, #6b2828 50%, #8b3a3a 75%, #a85050 100%)',
        fontFamily: "'Crimson Text', serif"
      }}
    >
      {/* Header */}
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1
              className="text-5xl font-bold mb-3"
              style={{
                fontFamily: "'Cinzel', serif",
                color: '#f5e6d3',
                textShadow: '0 2px 15px rgba(200, 80, 80, 0.5)'
              }}
            >
              👻 {user?.email?.split('@')[0] || 'User'}'s Workspaces
            </h1>
            <p className="text-lg" style={{ color: '#a89080' }}>
              Select a workspace to begin, or create a new one
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-5 py-3 rounded-xl text-base font-semibold transition-all duration-300"
            style={{
              background: 'rgba(200, 80, 80, 0.2)',
              border: '1px solid rgba(200, 80, 80, 0.3)',
              color: '#f5e6d3'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(200, 80, 80, 0.4)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'rgba(200, 80, 80, 0.2)'
            }}
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div
            className="mb-6 p-4 rounded-xl"
            style={{
              background: 'rgba(255, 71, 87, 0.2)',
              border: '1px solid rgba(255, 71, 87, 0.5)',
              color: '#ff4757'
            }}
          >
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-16">
            <div
              className="text-6xl mb-4"
              style={{ animation: 'ghostFloat 3s ease-in-out infinite' }}
            >
              👻
            </div>
            <p style={{ color: '#a89080' }}>Loading workspaces...</p>
          </div>
        )}

        {/* Workspace Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Create New Workspace Card */}
            <div
              className="rounded-2xl p-6 cursor-pointer transition-all duration-300 flex flex-col items-center justify-center min-h-[280px]"
              style={{
                background: 'linear-gradient(145deg, rgba(45, 20, 25, 0.5) 0%, rgba(26, 10, 10, 0.6) 100%)',
                border: '2px dashed rgba(200, 80, 80, 0.3)',
              }}
              onClick={() => setShowCreateForm(true)}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.borderColor = 'rgba(200, 80, 80, 0.6)'
                e.currentTarget.style.boxShadow = '0 12px 40px rgba(200, 80, 80, 0.3)'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.borderColor = 'rgba(200, 80, 80, 0.3)'
                e.currentTarget.style.boxShadow = ''
              }}
            >
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center mb-4"
                style={{
                  background: 'rgba(200, 80, 80, 0.2)',
                  border: '1px solid rgba(200, 80, 80, 0.3)'
                }}
              >
                <Plus className="w-7 h-7" style={{ color: '#c85050' }} />
              </div>
              <h3
                className="text-xl font-bold mb-2"
                style={{ fontFamily: "'Cinzel', serif", color: '#f5e6d3' }}
              >
                New Workspace
              </h3>
              <p className="text-sm" style={{ color: '#a89080' }}>
                Create a fresh workspace
              </p>
            </div>

            {/* Existing Workspaces */}
            {workspaces.map(workspace => (
              <WorkspaceCard
                key={workspace.id}
                workspace={workspace}
                onSelect={handleSelectWorkspace}
                onDelete={deleteWorkspace}
                onUpdate={updateWorkspace}
                isOwned={true}
              />
            ))}

            {/* Empty State */}
            {workspaces.length === 0 && !loading && (
              <div
                className="col-span-full text-center py-12"
                style={{ gridColumn: '1 / -1' }}
              >
                <div className="text-5xl mb-4">🎯</div>
                <h3
                  className="text-2xl mb-2"
                  style={{ fontFamily: "'Cinzel', serif", color: '#f5e6d3' }}
                >
                  No Workspaces Yet
                </h3>
                <p className="text-base" style={{ color: '#a89080' }}>
                  Create your first workspace to start organizing your tasks
                </p>
              </div>
            )}
          </div>
        )}

        {/* Create Workspace Modal */}
        {showCreateForm && (
          <div
            className="fixed inset-0 flex items-center justify-center p-4"
            style={{
              background: 'rgba(0, 0, 0, 0.7)',
              zIndex: 9999
            }}
            onClick={() => {
              setShowCreateForm(false)
              setNewWorkspaceName('')
            }}
          >
            <div
              className="w-full max-w-md rounded-2xl p-8"
              style={{
                background: 'linear-gradient(145deg, rgba(45, 20, 25, 0.95) 0%, rgba(26, 10, 10, 0.98) 100%)',
                border: '2px solid rgba(200, 80, 80, 0.3)',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2
                className="text-3xl font-bold mb-6"
                style={{
                  fontFamily: "'Cinzel', serif",
                  color: '#f5e6d3',
                  textShadow: '0 2px 10px rgba(200, 80, 80, 0.3)'
                }}
              >
                ✨ Create Workspace
              </h2>

              <form onSubmit={handleCreateWorkspace} className="space-y-5">
                <div>
                  <label
                    className="block mb-2 text-sm font-semibold"
                    style={{ color: '#f5e6d3' }}
                  >
                    Workspace Name <span style={{ color: '#ff4757' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={newWorkspaceName}
                    onChange={(e) => setNewWorkspaceName(e.target.value)}
                    placeholder="Enter workspace name..."
                    required
                    autoFocus
                    className="w-full px-4 py-3 rounded-xl text-base outline-none transition-all duration-300"
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
                </div>

                <div className="flex gap-4 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false)
                      setNewWorkspaceName('')
                    }}
                    className="flex-1 px-6 py-3 rounded-xl text-base font-semibold transition-all duration-300"
                    style={{
                      background: 'rgba(0,0,0,0.4)',
                      border: '1px solid rgba(200, 80, 80, 0.3)',
                      color: '#f5e6d3'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!newWorkspaceName.trim() || creating}
                    className="flex-1 px-6 py-3 rounded-xl text-base font-semibold transition-all duration-300 disabled:opacity-50"
                    style={{
                      background: 'linear-gradient(135deg, #8b2942 0%, #c85050 100%)',
                      color: '#f5e6d3',
                      border: 'none'
                    }}
                  >
                    {creating ? 'Creating...' : '✨ Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Workspaces
