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
  const { tasks, setTasks, loading: tasksLoading } = useTasks(workspace?.id)
  const [view, setView] = useState('active') // 'active' or 'completed'
  const [currentView, setCurrentView] = useState('dashboard') // 'dashboard', 'calendar', etc.
  const [isMenuOpen, setIsMenuOpen] = useState(false)

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

  const filteredTasks = useMemo(() => {
    if (view === 'completed') {
      return tasks.filter(t => t.status === 'completed')
    }
    return tasks.filter(t => t.status !== 'completed')
  }, [tasks, view])

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
        return <CalendarView tasks={tasks} setTasks={setTasks} workspace={workspace} />
      case 'dashboard':
      default:
        return view === 'active' ? (
          <PriorityBoard tasks={filteredTasks} setTasks={setTasks} workspace={workspace} />
        ) : (
          <CompletedTasksView tasks={filteredTasks} setTasks={setTasks} />
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
        tasks={tasks} 
        view={view} 
        setView={setView}
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
