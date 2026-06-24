import { useState, useEffect, useCallback } from 'react'
import { api } from '../services/api'

export function useApiProgress(moduleSlug, enabled = true) {
  // progressMap: { [questionId]: { completed, seenAt, completedAt } }
  const [progressMap, setProgressMap] = useState({})
  const [streak, setStreak] = useState({ current: 0, longest: 0 })

  useEffect(() => {
    if (!moduleSlug || !enabled) return
    Promise.all([
      api.getProgress(moduleSlug),
      api.getStreak()
    ]).then(([pd, sd]) => {
      const map = {}
      pd.progress.forEach(p => { map[p.questionId] = p })
      setProgressMap(map)
      setStreak(sd.streak || { current: 0, longest: 0 })
    }).catch(() => {})
  }, [moduleSlug, enabled])

  const toggleComplete = useCallback(async (questionId) => {
    try {
      const { progress } = await api.toggleComplete(questionId)
      setProgressMap(prev => ({ ...prev, [questionId]: progress }))
      const { streak: s } = await api.getStreak()
      setStreak(s || { current: 0, longest: 0 })
    } catch {}
  }, [])

  const markSeen = useCallback(async (questionId) => {
    try {
      const { progress } = await api.markSeen(questionId)
      setProgressMap(prev => ({ ...prev, [questionId]: progress }))
    } catch {}
  }, [])

  const getTopicStats = useCallback((topicSlug, questions) => {
    const total = questions.length
    const completed = questions.filter(q => progressMap[q._id]?.completed).length
    return { total, completed, pct: total ? Math.round(completed / total * 100) : 0 }
  }, [progressMap])

  return { progressMap, streak, toggleComplete, markSeen, getTopicStats }
}
