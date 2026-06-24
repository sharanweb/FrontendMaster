import { useState, useEffect } from 'react'
import { api } from '../services/api'

export function useModules() {
  const [modules, setModules] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getModules()
      .then(d => setModules(d.modules))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return { modules, loading, setModules }
}
