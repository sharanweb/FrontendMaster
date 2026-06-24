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
