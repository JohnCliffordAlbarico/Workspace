import { format } from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const CalendarHeader = ({ currentDate, onPrevMonth, onNextMonth, onToday }) => {
  return (
    <div 
      className="flex items-center justify-between mb-6 p-4 rounded-xl"
      style={{
        background: 'rgba(45, 20, 25, 0.6)',
        border: '1px solid rgba(200, 80, 80, 0.2)'
      }}
    >
      {/* Month/Year Display */}
      <h2 
        className="text-3xl font-bold"
        style={{
          fontFamily: "'Cinzel', serif",
          color: '#f5e6d3'
        }}
      >
        {format(currentDate, 'MMMM yyyy')}
      </h2>

      {/* Navigation Controls */}
      <div className="flex items-center gap-3">
        {/* Today Button */}
        <button
          onClick={onToday}
          className="px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300"
          style={{
            background: 'rgba(200, 80, 80, 0.2)',
            border: '1px solid rgba(200, 80, 80, 0.3)',
            color: '#f5e6d3'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = 'rgba(200, 80, 80, 0.3)'
            e.currentTarget.style.transform = 'translateY(-2px)'
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'rgba(200, 80, 80, 0.2)'
            e.currentTarget.style.transform = 'translateY(0)'
          }}
        >
          Today
        </button>

        {/* Previous Month */}
        <button
          onClick={onPrevMonth}
          className="p-2 rounded-lg transition-all duration-300"
          style={{
            background: 'rgba(45, 20, 25, 0.6)',
            border: '1px solid rgba(200, 80, 80, 0.3)',
            color: '#f5e6d3'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, #8b2942 0%, #c85050 100%)'
            e.currentTarget.style.transform = 'scale(1.1)'
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'rgba(45, 20, 25, 0.6)'
            e.currentTarget.style.transform = 'scale(1)'
          }}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Next Month */}
        <button
          onClick={onNextMonth}
          className="p-2 rounded-lg transition-all duration-300"
          style={{
            background: 'rgba(45, 20, 25, 0.6)',
            border: '1px solid rgba(200, 80, 80, 0.3)',
            color: '#f5e6d3'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, #8b2942 0%, #c85050 100%)'
            e.currentTarget.style.transform = 'scale(1.1)'
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'rgba(45, 20, 25, 0.6)'
            e.currentTarget.style.transform = 'scale(1)'
          }}
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}

export default CalendarHeader
