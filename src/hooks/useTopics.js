import { useState, useEffect } from 'react'
import { api } from '../services/api'

export function useTopics(moduleSlug) {
  const [topics, setTopics] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!moduleSlug) return
    setLoading(true)
    api.getTopics(moduleSlug)
      .then(d => setTopics(d.topics))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [moduleSlug])

  return { topics, loading }
}
