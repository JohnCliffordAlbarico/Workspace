import { useState, useEffect, useCallback } from 'react'

const huTaoQuotes = [
  "You're doing better than you think.",
  "The deadline isn't getting nervous—you are.",
  "Your tasks filed a missing person report.",
  "Feelings change. Habits don't.",
  "+50 XP for finishing this task.",
  "That overdue task has lingered long enough. Time to send it off~ Ehe!",
  "One thing at a time. That's all today asks.",
  "Every task finished is another brick in your future.",
  "Imagine getting outworked by the version of you from yesterday.",
  "The clock keeps moving. Make sure your progress does too."
]

export const useTypewriter = ({
  typeSpeed = 80,
  deleteSpeed = 40,
  pauseAfterType = 2500,
  pauseAfterDelete = 500
} = {}) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [displayText, setDisplayText] = useState('')
  const [isTyping, setIsTyping] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)

  const currentQuote = huTaoQuotes[currentIndex]

  useEffect(() => {
    let timeout

    if (isTyping && !isDeleting) {
      // Typing phase
      if (displayText.length < currentQuote.length) {
        timeout = setTimeout(() => {
          setDisplayText(currentQuote.slice(0, displayText.length + 1))
        }, typeSpeed + Math.random() * 40) // Slight randomness for natural feel
      } else {
        // Finished typing, pause then start deleting
        timeout = setTimeout(() => {
          setIsTyping(false)
          setIsDeleting(true)
        }, pauseAfterType)
      }
    } else if (isDeleting) {
      // Deleting phase
      if (displayText.length > 0) {
        timeout = setTimeout(() => {
          setDisplayText(displayText.slice(0, -1))
        }, deleteSpeed)
      } else {
        // Finished deleting, move to next quote
        timeout = setTimeout(() => {
          setCurrentIndex((prev) => (prev + 1) % huTaoQuotes.length)
          setIsDeleting(false)
          setIsTyping(true)
        }, pauseAfterDelete)
      }
    }

    return () => clearTimeout(timeout)
  }, [displayText, isTyping, isDeleting, currentQuote, typeSpeed, deleteSpeed, pauseAfterType, pauseAfterDelete])

  const skipToEnd = useCallback(() => {
    setDisplayText(currentQuote)
    setIsTyping(false)
    setIsDeleting(true)
  }, [currentQuote])

  return {
    displayText,
    isTyping,
    isDeleting,
    currentIndex,
    totalQuotes: huTaoQuotes.length,
    skipToEnd
  }
}
