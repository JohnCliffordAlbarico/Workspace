import Sidebar from './components/Sidebar'
import TaskBoard from './components/TaskBoard'
import CompletedTasksView from './components/CompletedTasksView'
import FloatingButterflies from './components/FloatingButterflies'
import { useWorkspace } from '../../hooks/useWorkspace'
import { useTasks } from './hooks/useTasks'
import { useState, useMemo } from 'react'

const Dashboard = () => {
  const { workspace, loading: workspaceLoading } = useWorkspace()
  const { tasks, setTasks, loading: tasksLoading } = useTasks(workspace?.id)
  const [view, setView] = useState('active') // 'active' or 'completed'

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
      <Sidebar tasks={tasks} view={view} setView={setView} />
      {view === 'active' ? (
        <TaskBoard tasks={filteredTasks} setTasks={setTasks} workspace={workspace} />
      ) : (
        <CompletedTasksView tasks={filteredTasks} setTasks={setTasks} />
      )}
    </div>
  )
}

export default Dashboard
