const WarningModal = ({ isOpen, onClose, title, message, items }) => {
  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ 
        background: 'rgba(0, 0, 0, 0.7)',
        zIndex: 9999
      }}
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md rounded-2xl p-6"
        style={{
          background: 'linear-gradient(145deg, rgba(45, 20, 25, 0.95) 0%, rgba(26, 10, 10, 0.98) 100%)',
          border: '2px solid rgba(255, 165, 2, 0.4)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 
          className="text-2xl font-bold mb-4"
          style={{
            fontFamily: "'Cinzel', serif",
            color: '#ffa502',
            textShadow: '0 2px 10px rgba(255, 165, 2, 0.3)'
          }}
        >
          {title}
        </h3>

        {message && (
          <p 
            className="mb-4 text-sm leading-relaxed"
            style={{ color: '#a89080' }}
          >
            {message}
          </p>
        )}

        {items && items.length > 0 && (
          <div 
            className="mb-6 max-h-48 overflow-y-auto rounded-lg p-3"
            style={{
              background: 'rgba(0, 0, 0, 0.3)',
              border: '1px solid rgba(255, 165, 2, 0.2)'
            }}
          >
            <ul className="space-y-2">
              {items.map((item, index) => (
                <li 
                  key={index}
                  className="flex items-center gap-2 text-sm"
                  style={{ color: '#d4b896' }}
                >
                  <span style={{ color: '#ff4757' }}>•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-xl text-base font-semibold transition-all duration-300"
            style={{
              background: 'linear-gradient(135deg, #ffa502 0%, #ff6348 100%)',
              color: '#1a0a0a',
              border: 'none'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 165, 2, 0.4)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  )
}

export default WarningModal
