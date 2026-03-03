import { useState } from 'react'
import CalendarHeader from '../calendar/components/CalendarHeader'
import CalendarGrid from '../calendar/components/CalendarGrid'
import CalendarStats from '../calendar/components/CalendarStats'
import CalendarFilters from '../calendar/components/CalendarFilters'
import DayDetailModal from '../calendar/components/DayDetailModal'

const CalendarView = ({ tasks, setTasks, workspace }) => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [filter, setFilter] = useState('all') // 'all', 'completed', 'due', 'created'

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const handleToday = () => {
    setCurrentDate(new Date())
  }

  const handleDateClick = (date) => {
    setSelectedDate(date)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedDate(null)
  }

  return (
    <main 
      className="flex-1 p-8 overflow-y-auto"
      style={{
        background: 'rgba(0, 0, 0, 0.2)'
      }}
    >
      <div className="max-w-7xl mx-auto">
        <CalendarHeader
          currentDate={currentDate}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
          onToday={handleToday}
        />

        <CalendarStats
          currentDate={currentDate}
          tasks={tasks}
        />

        <CalendarFilters
          activeFilter={filter}
          onFilterChange={setFilter}
        />
        
        <CalendarGrid
          currentDate={currentDate}
          tasks={tasks}
          onDateClick={handleDateClick}
          filter={filter}
        />
      </div>

      <DayDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        date={selectedDate}
        tasks={tasks}
      />
    </main>
  )
}

export default CalendarView
