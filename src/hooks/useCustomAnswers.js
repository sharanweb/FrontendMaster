import { useState, useEffect, useCallback } from 'react'
import { db } from '../utils/db'

export function useCustomAnswers() {
  const [customAnswers, setCustomAnswers] = useState({})

  useEffect(() => {
    db.getAllCustomAnswers().then(setCustomAnswers)
  }, [])

  const saveCustomAnswer = useCallback(async (id, text) => {
    await db.setCustomAnswer(id, text)
    setCustomAnswers(prev => ({ ...prev, [id]: text }))
  }, [])

  const deleteCustomAnswer = useCallback(async (id) => {
    await db.deleteCustomAnswer(id)
    setCustomAnswers(prev => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }, [])

  const bulkLoad = useCallback(async (answers) => {
    await db.bulkSetCustomAnswers(answers)
    const updated = await db.getAllCustomAnswers()
    setCustomAnswers(updated)
  }, [])

  return { customAnswers, saveCustomAnswer, deleteCustomAnswer, bulkLoad }
}
