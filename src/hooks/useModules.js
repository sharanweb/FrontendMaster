import { useState, useEffect } from 'react'
import { api } from '../services/api'

export function useModules(enabled = true) {
  const [modules, setModules] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!enabled) { setLoading(false); return }
    setLoading(true)
    api.getModules()
      .then(d => setModules(d.modules))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [enabled])

  return { modules, loading, setModules }
}
