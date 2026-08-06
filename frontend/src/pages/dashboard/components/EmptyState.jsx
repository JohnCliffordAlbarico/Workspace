const EmptyState = () => {
  return (
    <div className="text-center py-16">

      <div 
        className="text-6xl mb-4"
        style={{ animation: 'ghostFloat 3s ease-in-out infinite' }}
      >
        👻
      </div>
      <h3 
        className="text-2xl mb-2"
        style={{ fontFamily: "'Cinzel', serif", color: '#f5e6d3' }}
      >
        No Tasks Yet!
      </h3>
      <p style={{ color: '#a89080' }}>
        Start adding tasks to organize your workspace
      </p>
    </div>
  )
}

export default EmptyState
