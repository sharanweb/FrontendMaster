const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

function getToken() {
  return localStorage.getItem('jm_token')
}

async function request(path, options = {}) {
  const token = getToken()
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Request failed')
  return data
}

export const api = {
  // Auth
  login: (email, password) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  me: () => request('/auth/me'),

  // Users (admin)
  getUsers: () => request('/users'),
  addUser: (email, password, name) =>
    request('/users', { method: 'POST', body: JSON.stringify({ email, password, name }) }),
  deleteUser: (id) => request(`/users/${id}`, { method: 'DELETE' }),

  // Modules & topics
  getModules: () => request('/modules'),
  getTopics: (moduleSlug) => request(`/modules/${moduleSlug}/topics`),
  addModule: (data) => request('/modules', { method: 'POST', body: JSON.stringify(data) }),
  deleteModule: (slug) => request(`/modules/${slug}`, { method: 'DELETE' }),
  addTopic: (moduleSlug, data) => request(`/modules/${moduleSlug}/topics`, { method: 'POST', body: JSON.stringify(data) }),
  deleteTopic: (moduleSlug, topicSlug) => request(`/modules/${moduleSlug}/topics/${topicSlug}`, { method: 'DELETE' }),

  // Questions
  getQuestions: (topicSlug) => request(`/questions/topic/${topicSlug}`),
  addQuestion: (data) => request('/questions', { method: 'POST', body: JSON.stringify(data) }),
  updateQuestion: (id, data) => request(`/questions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteQuestion: (id) => request(`/questions/${id}`, { method: 'DELETE' }),

  // Progress
  getProgress: (moduleSlug) => request(`/progress${moduleSlug ? `?module=${moduleSlug}` : ''}`),
  markSeen: (questionId) => request(`/progress/${questionId}/seen`, { method: 'POST' }),
  toggleComplete: (questionId) => request(`/progress/${questionId}/complete`, { method: 'POST' }),
  getStreak: () => request('/progress/streak'),

  // Custom answers
  getAnswers: () => request('/answers'),
  saveAnswer: (questionId, text) =>
    request('/answers', { method: 'POST', body: JSON.stringify({ questionId, text }) }),
  deleteAnswer: (questionId) => request(`/answers/${questionId}`, { method: 'DELETE' }),

  // Leaderboard
  getLeaderboard: () => request('/leaderboard'),

  // Admin
  getAllUsersProgress: () => request('/admin/progress')
}
