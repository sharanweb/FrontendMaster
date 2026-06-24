import { useState, useEffect } from 'react'
import { db } from '../utils/db'

export function useStreak() {
  const [streak, setStreak] = useState({ current: 0, longest: 0, lastDate: null })

  useEffect(() => {
    db.getStreak().then(data => {
      if (!data) {
        touchStreak()
        return
      }
      const today = todayStr()
      const yesterday = dayOffset(-1)

      if (data.lastDate === today) {
        setStreak({ current: data.current, longest: data.longest, lastDate: data.lastDate })
      } else if (data.lastDate === yesterday) {
        // Continuing streak
        const newCurrent = data.current + 1
        const newLongest = Math.max(newCurrent, data.longest)
        const updated = { current: newCurrent, longest: newLongest, lastDate: today }
        setStreak(updated)
        db.setStreak(updated)
      } else {
        // Streak broken
        const updated = { current: 1, longest: Math.max(1, data.longest), lastDate: today }
        setStreak(updated)
        db.setStreak(updated)
      }
    }).catch(() => touchStreak())
  }, [])

  function touchStreak() {
    const today = todayStr()
    const updated = { current: 1, longest: 1, lastDate: today }
    setStreak(updated)
    db.setStreak(updated)
  }

  return streak
}

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

function dayOffset(n) {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}
