const EmptyState = () => {
  return (
    <div className="text-center py-16">
      <style>{`
        @keyframes ghostFloat {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.7; }
          50% { transform: translateY(-8px) scale(1.05); opacity: 0.9; }
        }
      `}</style>
      
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
