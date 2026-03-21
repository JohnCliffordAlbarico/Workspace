import Sidebar from './components/Sidebar'
import PriorityBoard from './components/PriorityBoard'
import CompletedTasksView from './components/CompletedTasksView'
import CalendarView from './components/CalendarView'
import MainMenuOverlay from './components/MainMenuOverlay'
import FloatingButterflies from './components/FloatingButterflies'
import { useWorkspace } from '../../hooks/useWorkspace'
import { useTasks } from './hooks/useTasks'
import { useState, useMemo, useEffect } from 'react'

const Dashboard = () => {
  const { workspace, loading: workspaceLoading } = useWorkspace()
  const [view, setView] = useState('active') // 'active' or 'completed'
  const [currentView, setCurrentView] = useState('dashboard') // 'dashboard', 'calendar', etc.
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [completedPage, setCompletedPage] = useState(1)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // Fetch all tasks for sidebar stats and calendar (no pagination)
  const { tasks: allTasks, setTasks: setAllTasks, loading: allTasksLoading } = useTasks(workspace?.id, { refresh: refreshTrigger })
  
  // Fetch paginated completed tasks only when in completed view
  const { 
    tasks: paginatedCompletedTasks, 
    setTasks: setPaginatedCompletedTasks, 
    loading: paginatedLoading,
    pagination: completedPagination 
  } = useTasks(workspace?.id, { 
    status: 'completed', 
    page: completedPage, 
    limit: 20,
    refresh: refreshTrigger
  })

  // Separate active and completed from all tasks
  const activeTasks = useMemo(() => 
    allTasks.filter(t => t.status !== 'completed'), 
    [allTasks]
  )
  
  const allCompletedTasks = useMemo(() => 
    allTasks.filter(t => t.status === 'completed'), 
    [allTasks]
  )

  const tasksLoading = view === 'completed' ? paginatedLoading : allTasksLoading

  // Close menu on ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isMenuOpen) {
        setIsMenuOpen(false)
      }
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [isMenuOpen])

  const handlePageChange = (newPage) => {
    setCompletedPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Update handler that syncs both allTasks and paginated tasks
  const handleTaskUpdate = (updatedTasks) => {
    if (Array.isArray(updatedTasks)) {
      // Direct array update
      if (view === 'completed') {
        setPaginatedCompletedTasks(updatedTasks)
      }
      setAllTasks(updatedTasks)
    } else if (typeof updatedTasks === 'function') {
      // Function update (prev => ...)
      setAllTasks(prevAll => {
        const newTasks = updatedTasks(prevAll)
        
        // Check if any task changed status
        const statusChanged = newTasks.some((newTask, idx) => {
          const oldTask = prevAll[idx]
          return oldTask && newTask.status !== oldTask.status
        })
        
        // If status changed, trigger a refresh of both lists
        if (statusChanged) {
          setRefreshTrigger(prev => prev + 1)
        }
        
        return newTasks
      })
      
      if (view === 'completed') {
        setPaginatedCompletedTasks(updatedTasks)
      }
    }
  }

  if (workspaceLoading || tasksLoading) {
    return (
      <div 
        className="h-screen w-full flex items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, #2d0f0f 0%, #4a1a1a 25%, #6b2828 50%, #8b3a3a 75%, #a85050 100%)',
          fontFamily: "'Crimson Text', serif"
        }}
      >
        <div style={{ color: '#f5e6d3', fontSize: '1.5rem' }}>Loading...</div>
      </div>
    )
  }

  if (!workspace) {
    return (
      <div 
        className="h-screen w-full flex items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, #2d0f0f 0%, #4a1a1a 25%, #6b2828 50%, #8b3a3a 75%, #a85050 100%)',
          fontFamily: "'Crimson Text', serif"
        }}
      >
        <div style={{ color: '#f5e6d3', fontSize: '1.5rem' }}>Failed to load workspace</div>
      </div>
    )
  }

  // Render main content based on currentView
  const renderMainContent = () => {
    switch (currentView) {
      case 'calendar':
        return <CalendarView tasks={allTasks} setTasks={setAllTasks} workspace={workspace} />
      case 'dashboard':
      default:
        return view === 'active' ? (
          <PriorityBoard tasks={activeTasks} setTasks={setAllTasks} workspace={workspace} />
        ) : (
          <CompletedTasksView 
            tasks={paginatedCompletedTasks} 
            setTasks={handleTaskUpdate}
            pagination={completedPagination}
            onPageChange={handlePageChange}
          />
        )
    }
  }

  return (
    <div 
      className="h-screen w-full flex overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #2d0f0f 0%, #4a1a1a 25%, #6b2828 50%, #8b3a3a 75%, #a85050 100%)',
        fontFamily: "'Crimson Text', serif",
        position: 'relative'
      }}
    >
      <FloatingButterflies />
      
      <Sidebar 
        tasks={allTasks} 
        view={view} 
        setView={(newView) => {
          setView(newView)
          if (newView === 'completed') {
            setCompletedPage(1) // Reset to first page when switching to completed view
          }
        }}
        onMenuClick={() => setIsMenuOpen(true)}
        isMenuOpen={isMenuOpen}
      />
      
      {renderMainContent()}

      <MainMenuOverlay
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onSelectView={setCurrentView}
        currentView={currentView}
      />
    </div>
  )
}

export default Dashboard
