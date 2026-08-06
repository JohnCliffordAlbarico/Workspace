import Sidebar from './components/Sidebar'
import PriorityBoard from './components/PriorityBoard'
import CompletedTasksView from './components/CompletedTasksView'
import CalendarView from './components/CalendarView'
import AnalyticsView from './components/AnalyticsView'
import MainMenuOverlay from './components/MainMenuOverlay'
import FloatingButterflies from './components/FloatingButterflies'
import DiaryModal from '../../components/DiaryModal'
import FocusCategoryManager from '../../components/FocusCategoryManager'
import { useFocusCategories } from '../../hooks/useFocusCategories'
import { useAllocationProgress } from '../../hooks/useAllocationProgress'
import { useState, useEffect } from 'react'
import api from '../../config/api'

const Dashboard = () => {
  const { categories, loading: categoriesLoading } = useFocusCategories()
  const { getCategoryProgress, totalAllocated, totalActual, totalPercentage, refreshStats } = useAllocationProgress(categories)
  
  const [view, setView] = useState('active')
  const [currentView, setCurrentView] = useState('dashboard')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [completedPage, setCompletedPage] = useState(1)
  const [refreshTrigger] = useState(0)
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false)
  const [allTasks, setAllTasks] = useState([])
  const [allCategories, setAllCategories] = useState([])

  // Fetch all tasks for calendar/analytics/completed view
  useEffect(() => {
    const fetchAllTasks = async () => {
      try {
        const response = await api.get('/tasks')
        setAllTasks(response.data)
      } catch (err) {
        console.error('Failed to fetch tasks:', err)
      }
    }
    fetchAllTasks()
  }, [refreshTrigger, view])

  // Fetch all categories (active + completed) for completed view
  useEffect(() => {
    if (view !== 'completed') {
      setAllCategories([])
      return
    }
    const fetchAllCategories = async () => {
      try {
        const [activeRes, completedRes] = await Promise.all([
          api.get('/categories'),
          api.get('/categories/completed')
        ])
        setAllCategories([...activeRes.data, ...completedRes.data])
      } catch (err) {
        console.error('Failed to fetch categories:', err)
      }
    }
    fetchAllCategories()
  }, [view])

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

  if (categoriesLoading) {
    return (
      <div 
        className="h-screen w-full flex items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, #2d0f0f 0%, #4a1a1a 25%, #6b2828 50%, #8b3a3a 75%, #a85050 100%)',
          fontFamily: "'Crimson Text', serif"
        }}
      >
        <div style={{ color: '#f5e6d3', fontSize: '1.5rem' }}>Loading categories...</div>
      </div>
    )
  }

  if (categories.length === 0) {
    return (
      <div 
        className="h-screen w-full flex items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, #2d0f0f 0%, #4a1a1a 25%, #6b2828 50%, #8b3a3a 75%, #a85050 100%)',
          fontFamily: "'Crimson Text', serif"
        }}
      >
        <div className="text-center">
          <div style={{ color: '#f5e6d3', fontSize: '1.5rem', marginBottom: '1rem' }}>
            No categories yet
          </div>
          <button
            onClick={() => setIsCategoryManagerOpen(true)}
            className="px-6 py-3 rounded-xl text-base font-semibold transition-all duration-300"
            style={{
              background: 'linear-gradient(135deg, #8b2942 0%, #c85050 100%)',
              color: '#f5e6d3'
            }}
          >
            Create Your First Category
          </button>
        </div>
        <FocusCategoryManager
          isOpen={isCategoryManagerOpen}
          onClose={() => setIsCategoryManagerOpen(false)}
        />
      </div>
    )
  }

  // Render main content based on currentView
  const renderMainContent = () => {
    switch (currentView) {
      case 'calendar':
        return <CalendarView tasks={allTasks} setTasks={setAllTasks} />
      case 'analytics':
        return <AnalyticsView tasks={allTasks} />
      case 'dashboard':
      default:
        return view === 'active' ? (
          <PriorityBoard 
            categories={categories}
            getCategoryProgress={getCategoryProgress}
            refreshStats={refreshStats}
            refreshTrigger={refreshTrigger}
            onManageCategories={() => setIsCategoryManagerOpen(true)}
            allTasks={allTasks}
            setAllTasks={setAllTasks}
          />
        ) : (
          <CompletedTasksView 
            tasks={allTasks}
            setTasks={setAllTasks}
            categories={allCategories}
            pagination={{ page: completedPage, totalPages: 1, total: allTasks.length }}
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
        categories={categories}
        getCategoryProgress={getCategoryProgress}
        totalAllocated={totalAllocated}
        totalActual={totalActual}
        totalPercentage={totalPercentage}
        view={view} 
        setView={setView}
        onMenuClick={() => setIsMenuOpen(true)}
        isMenuOpen={isMenuOpen}
        allTasks={allTasks}
      />
      
      {renderMainContent()}

      <MainMenuOverlay
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onSelectView={setCurrentView}
        currentView={currentView}
        onManageCategories={() => setIsCategoryManagerOpen(true)}
      />

      <FocusCategoryManager
        isOpen={isCategoryManagerOpen}
        onClose={() => setIsCategoryManagerOpen(false)}
      />

      <DiaryModal />
    </div>
  )
}

export default Dashboard
