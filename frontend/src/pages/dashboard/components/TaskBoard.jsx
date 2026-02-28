import AddTaskForm from './AddTaskForm'
import TaskColumn from './TaskColumn'
import EmptyState from './EmptyState'

const TaskBoard = ({ tasks, setTasks, workspace }) => {

  const tasksByPriority = {
    critical: tasks.filter(t => t.priority === 'critical'),
    high: tasks.filter(t => t.priority === 'high'),
    medium: tasks.filter(t => t.priority === 'medium'),
    low: tasks.filter(t => t.priority === 'low')
  }

  return (
    <main className="flex-1 p-8 overflow-auto z-10">
      {/* Header */}
      <header className="mb-8">
        <h1 
          className="text-4xl font-bold mb-2"
          style={{
            fontFamily: "'Cinzel', serif",
            color: '#f5e6d3',
            textShadow: '0 2px 10px rgba(200, 80, 80, 0.3)'
          }}
        >
          🔥 Yuuko's Task Board
        </h1>
        <p style={{ color: '#a89080' }}>
          Managing productivity with elegance
        </p>
      </header>

      {/* Add Task Form */}
      <AddTaskForm workspaceId={workspace.id} setTasks={setTasks} />

      {/* Task Columns */}
      {tasks.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
          <TaskColumn
            title="Critical"
            color="#ff4757"
            tasks={tasksByPriority.critical}
            setTasks={setTasks}
          />
          <TaskColumn
            title="High Priority"
            color="#ffa502"
            tasks={tasksByPriority.high}
            setTasks={setTasks}
          />
          <TaskColumn
            title="Medium"
            color="#7bed9f"
            tasks={tasksByPriority.medium}
            setTasks={setTasks}
          />
          <TaskColumn
            title="Low Priority"
            color="#70a1ff"
            tasks={tasksByPriority.low}
            setTasks={setTasks}
          />
        </div>
      )}
    </main>
  )
}

export default TaskBoard
