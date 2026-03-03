const CalendarFilters = ({ activeFilter, onFilterChange }) => {
  const filters = [
    { id: 'all', label: 'All Tasks', icon: '📋', color: '#d4a574' },
    { id: 'completed', label: 'Completed', icon: '✓', color: '#7bed9f' },
    { id: 'due', label: 'Due', icon: '📅', color: '#ff4757' },
    { id: 'created', label: 'Created', icon: '🎯', color: '#70a1ff' }
  ]

  return (
    <div 
      className="flex gap-2 p-3 rounded-xl mb-4"
      style={{
        background: 'rgba(45, 20, 25, 0.6)',
        border: '1px solid rgba(200, 80, 80, 0.2)'
      }}
    >
      {filters.map(filter => (
        <button
          key={filter.id}
          onClick={() => onFilterChange(filter.id)}
          className="flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300"
          style={{
            background: activeFilter === filter.id
              ? 'linear-gradient(135deg, #8b2942 0%, #c85050 100%)'
              : 'rgba(0, 0, 0, 0.3)',
            color: activeFilter === filter.id ? '#f5e6d3' : '#a89080',
            border: activeFilter === filter.id
              ? '1px solid rgba(200, 80, 80, 0.5)'
              : '1px solid rgba(200, 80, 80, 0.2)'
          }}
          onMouseOver={(e) => {
            if (activeFilter !== filter.id) {
              e.currentTarget.style.background = 'rgba(0, 0, 0, 0.5)'
              e.currentTarget.style.color = filter.color
            }
          }}
          onMouseOut={(e) => {
            if (activeFilter !== filter.id) {
              e.currentTarget.style.background = 'rgba(0, 0, 0, 0.3)'
              e.currentTarget.style.color = '#a89080'
            }
          }}
        >
          <span className="mr-2">{filter.icon}</span>
          {filter.label}
        </button>
      ))}
    </div>
  )
}

export default CalendarFilters
