import { useState } from 'react'
import Sidebar from './components/Sidebar'
import TaskBoard from './components/TaskBoard'
import FloatingButterflies from './components/FloatingButterflies'
import { useWorkspace } from '../../hooks/useWorkspace'
import { useTasks } from './hooks/useTasks'

const Dashboard = () => {
  const { workspace, loading: workspaceLoading } = useWorkspace()
  const { tasks, setTasks, loading: tasksLoading } = useTasks(workspace?.id)

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
        fontFamily: "'Crimson Text', serif"
      }}
    >
      <FloatingButterflies />
      <Sidebar tasks={tasks} />
      <TaskBoard tasks={tasks} setTasks={setTasks} workspace={workspace} />
    </div>
  )
}

export default Dashboard
