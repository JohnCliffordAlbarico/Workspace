import { useState } from 'react'
import Sidebar from './components/Sidebar'
import TaskBoard from './components/TaskBoard'
import FloatingButterflies from './components/FloatingButterflies'

const Dashboard = () => {
  const [tasks, setTasks] = useState([])

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
      <TaskBoard tasks={tasks} setTasks={setTasks} />
    </div>
  )
}

export default Dashboard
