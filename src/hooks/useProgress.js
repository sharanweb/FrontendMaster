import { useState, useEffect, useCallback } from 'react'
import { db } from '../utils/db'

export function useProgress() {
  const [progress, setProgress] = useState({})
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    db.getProgress().then(data => {
      setProgress(data)
      setLoaded(true)
    }).catch(() => setLoaded(true))
  }, [])

  const toggleComplete = useCallback(async (id) => {
    const current = progress[id]
    const completed = !current?.completed
    const updated = {
      ...progress,
      [id]: { completed, lastSeen: Date.now(), seenCount: (current?.seenCount || 0) + 1 }
    }
    setProgress(updated)
    await db.setProgress(id, updated[id])
  }, [progress])

  const markSeen = useCallback(async (id) => {
    if (progress[id]?.lastSeen) return // already seen this session
    const current = progress[id] || {}
    const updated = {
      ...progress,
      [id]: { ...current, lastSeen: Date.now(), seenCount: (current.seenCount || 0) + 1 }
    }
    setProgress(updated)
    await db.setProgress(id, updated[id])
  }, [progress])

  const getTopicStats = useCallback((questions, topicId) => {
    const topicQs = questions.filter(q => q.topic === topicId)
    const completed = topicQs.filter(q => progress[q.id]?.completed).length
    return { total: topicQs.length, completed, pct: topicQs.length ? Math.round(completed / topicQs.length * 100) : 0 }
  }, [progress])

  const getOverallStats = useCallback((questions) => {
    const total = questions.length
    const completed = questions.filter(q => progress[q.id]?.completed).length
    const seen = questions.filter(q => progress[q.id]?.lastSeen).length
    return { total, completed, seen, pct: total ? Math.round(completed / total * 100) : 0 }
  }, [progress])

  return { progress, loaded, toggleComplete, markSeen, getTopicStats, getOverallStats }
}
