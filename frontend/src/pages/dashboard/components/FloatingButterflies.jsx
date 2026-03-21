import { memo } from 'react'

const butterflies = [
  { top: '15%', left: '10%', size: '28px', opacity: 0.5, delay: '0s' },
  { top: '25%', right: '15%', size: '24px', opacity: 0.4, delay: '-1s' },
  { top: '60%', left: '85%', size: '22px', opacity: 0.45, delay: '-1.5s' },
  { top: '70%', right: '75%', size: '26px', opacity: 0.35, delay: '-2s' },
  { top: '80%', left: '20%', size: '20px', opacity: 0.4, delay: '-2.5s' },
  { top: '40%', left: '50%', size: '24px', opacity: 0.3, delay: '-3s' }
]

const FloatingButterflies = memo(() => {
  return (
    <>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(5deg); }
        }
      `}</style>
      
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {butterflies.map((butterfly, index) => (
          <div
            key={index}
            className="absolute"
            style={{
              top: butterfly.top,
              left: butterfly.left,
              right: butterfly.right,
              fontSize: butterfly.size,
              opacity: butterfly.opacity,
              animation: `float ${4 + index * 0.5}s ease-in-out infinite`,
              animationDelay: butterfly.delay,
              willChange: 'transform'
            }}
          >
            🦋
          </div>
        ))}
      </div>
    </>
  )
})

FloatingButterflies.displayName = 'FloatingButterflies'

export default FloatingButterflies
