import { useState, useEffect, useCallback } from 'react'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import TopicView from './components/TopicView'
import Leaderboard from './components/Leaderboard'
import AdminPanel from './components/AdminPanel'
import Login from './components/Login'
import AddModuleModal from './components/AddModuleModal'
import AddTopicModal from './components/AddTopicModal'
import ConfirmModal from './components/ConfirmModal'
import { useAuth } from './contexts/AuthContext'
import { useModules } from './hooks/useModules'
import { useApiProgress } from './hooks/useApiProgress'
import { useCustomAnswers } from './hooks/useCustomAnswers'
import { api } from './services/api'

export default function App() {
  const { user, loading: authLoading, logout } = useAuth()

  const [activeModule, setActiveModule] = useState('js')
  const [activeTopic, setActiveTopic] = useState(null)
  const [activeView, setActiveView] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [showAddModule, setShowAddModule] = useState(false)
  const [addTopicForModule, setAddTopicForModule] = useState(null) // moduleSlug
  const [confirmModal, setConfirmModal] = useState(null) // { message, onConfirm }

  const { modules, loading: modulesLoading } = useModules(!!user)
  const [allModules, setAllModules] = useState([])
  // topics keyed by moduleSlug
  const [topicsMap, setTopicsMap] = useState({})
  // questions keyed by topicSlug
  const [questionsMap, setQuestionsMap] = useState({})

  const { progressMap, streak, toggleComplete, markSeen } = useApiProgress(activeModule, !!user)
  const { customAnswers, saveCustomAnswer, deleteCustomAnswer, bulkLoad } = useCustomAnswers()

  const isAdmin = user?.role === 'admin'

  // Sync modules from hook into local state so we can mutate
  useEffect(() => { if (modules.length) setAllModules(modules) }, [modules])

  // Sync custom answers from MongoDB on login
  useEffect(() => {
    if (!user) return
    api.getAnswers()
      .then(data => {
        if (data.answers?.length) {
          bulkLoad(data.answers.map(a => ({ id: a.questionId, text: a.text, updatedAt: new Date(a.updatedAt).getTime() })))
        }
      })
      .catch(() => {})
  }, [user])

  // Load topics for all modules
  useEffect(() => {
    if (!allModules.length) return
    allModules.forEach(m => {
      if (topicsMap[m.slug]) return
      api.getTopics(m.slug)
        .then(d => setTopicsMap(prev => ({ ...prev, [m.slug]: d.topics })))
        .catch(() => {})
    })
  }, [allModules])

  // Load questions for all topics of the active module
  const activeTopics = topicsMap[activeModule] || []
  useEffect(() => {
    activeTopics.forEach(t => {
      if (questionsMap[t.slug]) return
      api.getQuestions(t.slug)
        .then(d => setQuestionsMap(prev => ({ ...prev, [t.slug]: d.questions })))
        .catch(() => {})
    })
  }, [activeTopics])

  // Flat list of all questions for current module (for sidebar counts + dashboard)
  const allModuleQuestions = activeTopics.flatMap(t => questionsMap[t.slug] || [])
  // Questions for active topic
  const topicQuestions = activeTopic ? (questionsMap[activeTopic] || []) : []
  const currentTopic = activeTopics.find(t => t.slug === activeTopic)

  const handleTopicChange = (slug) => { setActiveTopic(slug); setActiveView('topic') }
  const handleModuleChange = (slug) => {
    setActiveModule(slug)
    if (activeTopic && !(topicsMap[slug] || []).find(t => t.slug === activeTopic)) {
      setActiveTopic(null)
      setActiveView('dashboard')
    }
  }
  const handleViewChange = (view) => { setActiveView(view); if (view !== 'topic') setActiveTopic(null) }

  const handleSaveCustomAnswer = async (id, text) => {
    await saveCustomAnswer(id, text)
    api.saveAnswer(id, text).catch(() => {})
  }
  const handleDeleteCustomAnswer = async (id) => {
    await deleteCustomAnswer(id)
    api.deleteAnswer(id).catch(() => {})
  }

  // Module add/delete
  const handleAddModule = async (data) => {
    const { module } = await api.addModule(data)
    setAllModules(prev => [...prev, module])
    setTopicsMap(prev => ({ ...prev, [module.slug]: [] }))
    setShowAddModule(false)
  }
  const handleDeleteModule = (slug, name) => {
    setConfirmModal({
      message: `Delete the "${name}" module and ALL its topics and questions? This cannot be undone.`,
      onConfirm: async () => {
        setConfirmModal(null)
        await api.deleteModule(slug).catch(err => alert(err.message))
        setAllModules(prev => prev.filter(m => m.slug !== slug))
        setTopicsMap(prev => { const n = { ...prev }; delete n[slug]; return n })
        if (activeModule === slug) {
          const fallback = allModules.find(m => m.slug !== slug)?.slug || 'js'
          setActiveModule(fallback)
          setActiveView('dashboard')
        }
      }
    })
  }

  const handleAddTopic = async (data) => {
    const moduleSlug = addTopicForModule
    const { topic } = await api.addTopic(moduleSlug, data)
    setTopicsMap(prev => ({ ...prev, [moduleSlug]: [...(prev[moduleSlug] || []), topic] }))
    setAddTopicForModule(null)
  }

  // Topic deleted from within TopicView
  const handleTopicDeleted = (topicSlug) => {
    setTopicsMap(prev => ({
      ...prev,
      [activeModule]: (prev[activeModule] || []).filter(t => t.slug !== topicSlug)
    }))
    setQuestionsMap(prev => { const n = { ...prev }; delete n[topicSlug]; return n })
    setActiveTopic(null)
    setActiveView('dashboard')
  }

  const overall = (() => {
    const nq = allModuleQuestions.filter(q => q.type !== 'quiz')
    const total = nq.length
    const completed = nq.filter(q => progressMap[q._id]?.completed).length
    return { completed, total, pct: total ? Math.round(completed / total * 100) : 0 }
  })()

  if (authLoading || modulesLoading) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#858585', fontSize: 14 }}>Loading…</div>
  }
  if (!user) return <Login />

  return (
    <div className={`app ${sidebarOpen ? '' : 'sidebar-collapsed'}`}>
      <button className="sidebar-toggle" onClick={() => setSidebarOpen(o => !o)} title="Toggle Sidebar">
        {sidebarOpen ? '‹' : '›'}
      </button>

      <Sidebar
        modules={allModules}
        activeModule={activeModule}
        onModuleChange={handleModuleChange}
        topics={activeTopics}
        activeTopic={activeTopic}
        onTopicChange={handleTopicChange}
        progressMap={progressMap}
        questions={allModuleQuestions}
        activeView={activeView}
        onViewChange={handleViewChange}
        isAdmin={isAdmin}
        onAddModule={() => setShowAddModule(true)}
        onDeleteModule={handleDeleteModule}
        onAddTopic={(moduleSlug) => setAddTopicForModule(moduleSlug)}
      />

      <main className="main-content">
        <div className="topbar">
          <div className="topbar-breadcrumb" />
          <div className="topbar-right">
            <div className="streak-badge">🔥 {streak.current} day streak</div>
            <div className="progress-summary">{overall.completed}/{overall.total} done</div>
            <div className="overall-mini-bar">
              <div className="overall-mini-fill" style={{ width: overall.pct + '%' }} />
            </div>
            <div className="user-menu">
              <span className="user-email-pill">{user.name || user.email}</span>
              <button className="btn btn-ghost btn-sm" onClick={logout}>Sign out</button>
            </div>
          </div>
        </div>

        <div className="content-area">
          {activeView === 'dashboard' && (
            <Dashboard
              questions={allModuleQuestions}
              progressMap={progressMap}
              streak={streak}
              topics={activeTopics}
              onTopicClick={handleTopicChange}
            />
          )}
          {activeView === 'leaderboard' && <Leaderboard />}
          {activeView === 'admin' && isAdmin && <AdminPanel modules={allModules} />}
          {activeView === 'topic' && currentTopic && (
            topicQuestions.length === 0 && !questionsMap[activeTopic]
              ? <div className="topic-loading">Loading questions…</div>
              : <TopicView
                  topic={currentTopic}
                  questions={topicQuestions}
                  progressMap={progressMap}
                  onToggleComplete={toggleComplete}
                  onMarkSeen={markSeen}
                  customAnswers={customAnswers}
                  onSaveCustomAnswer={handleSaveCustomAnswer}
                  onDeleteCustomAnswer={handleDeleteCustomAnswer}
                  isAdmin={isAdmin}
                  onTopicDeleted={handleTopicDeleted}
                />
          )}
        </div>

        <footer className="app-footer">
          <span className="footer-made">Made with <span className="footer-heart">♥</span> by Sharan</span>
          <div className="footer-links">
            <a href="https://www.linkedin.com/in/sharandooganavar/" target="_blank" rel="noopener noreferrer" title="LinkedIn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            </a>
            <a href="https://github.com/sharanweb/" target="_blank" rel="noopener noreferrer" title="GitHub">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
            </a>
            <a href="mailto:sharan.d1997@gmail.com" title="Email">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z"/></svg>
            </a>
            <a href="tel:+918217349829" title="+91 82173 49829">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
            </a>
          </div>
        </footer>
      </main>

      {showAddModule && (
        <AddModuleModal onSave={handleAddModule} onClose={() => setShowAddModule(false)} />
      )}
      {addTopicForModule && (
        <AddTopicModal
          moduleSlug={addTopicForModule}
          moduleName={allModules.find(m => m.slug === addTopicForModule)?.name || ''}
          onSave={handleAddTopic}
          onClose={() => setAddTopicForModule(null)}
        />
      )}
      {confirmModal && (
        <ConfirmModal
          message={confirmModal.message}
          onConfirm={confirmModal.onConfirm}
          onCancel={() => setConfirmModal(null)}
        />
      )}
    </div>
  )
}
