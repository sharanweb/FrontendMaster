const DB_NAME = 'JSMasteryDB'
const DB_VERSION = 2

let dbPromise = null

function openDB() {
  if (dbPromise) return dbPromise
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = (e) => {
      const db = e.target.result
      if (!db.objectStoreNames.contains('progress')) {
        db.createObjectStore('progress', { keyPath: 'id' })
      }
      if (!db.objectStoreNames.contains('streak')) {
        db.createObjectStore('streak', { keyPath: 'key' })
      }
      if (!db.objectStoreNames.contains('sessions')) {
        const s = db.createObjectStore('sessions', { keyPath: 'id', autoIncrement: true })
        s.createIndex('date', 'date')
      }
      if (!db.objectStoreNames.contains('customAnswers')) {
        db.createObjectStore('customAnswers', { keyPath: 'id' })
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
  return dbPromise
}

async function tx(storeName, mode, fn) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, mode)
    const store = transaction.objectStore(storeName)
    const req = fn(store)
    if (req) {
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => reject(req.error)
    } else {
      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error)
    }
  })
}

export const db = {
  async getProgress() {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const t = db.transaction('progress', 'readonly')
      const store = t.objectStore('progress')
      const req = store.getAll()
      req.onsuccess = () => {
        const map = {}
        req.result.forEach(item => { map[item.id] = item })
        resolve(map)
      }
      req.onerror = () => reject(req.error)
    })
  },

  async setProgress(id, data) {
    return tx('progress', 'readwrite', store => store.put({ id, ...data }))
  },

  async getStreak() {
    return tx('streak', 'readonly', store => store.get('main'))
  },

  async setStreak(data) {
    return tx('streak', 'readwrite', store => store.put({ key: 'main', ...data }))
  },

  async addSession(session) {
    return tx('sessions', 'readwrite', store => store.add(session))
  },

  async getRecentSessions(days = 30) {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const t = db.transaction('sessions', 'readonly')
      const store = t.objectStore('sessions')
      const req = store.getAll()
      req.onsuccess = () => {
        const cutoff = Date.now() - days * 86400000
        resolve(req.result.filter(s => s.date > cutoff))
      }
      req.onerror = () => reject(req.error)
    })
  },

  // Custom answers
  async getAllCustomAnswers() {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const t = db.transaction('customAnswers', 'readonly')
      const store = t.objectStore('customAnswers')
      const req = store.getAll()
      req.onsuccess = () => {
        const map = {}
        req.result.forEach(item => { map[item.id] = item.text })
        resolve(map)
      }
      req.onerror = () => reject(req.error)
    })
  },

  async setCustomAnswer(id, text) {
    return tx('customAnswers', 'readwrite', store =>
      store.put({ id, text, updatedAt: Date.now() })
    )
  },

  async deleteCustomAnswer(id) {
    return tx('customAnswers', 'readwrite', store => store.delete(id))
  },

  async bulkSetCustomAnswers(answers) {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const t = db.transaction('customAnswers', 'readwrite')
      const store = t.objectStore('customAnswers')
      answers.forEach(({ id, text, updatedAt }) => {
        store.put({ id, text, updatedAt: updatedAt || Date.now() })
      })
      t.oncomplete = () => resolve()
      t.onerror = () => reject(t.error)
    })
  }
}
