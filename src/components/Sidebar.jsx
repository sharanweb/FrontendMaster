import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'

function ModuleMenu({ onAddTopic, onDeleteModule }) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0 })
  const btnRef = useRef(null)
  const dropRef = useRef(null)

  const handleOpen = (e) => {
    e.stopPropagation()
    if (open) { setOpen(false); return }
    const rect = btnRef.current.getBoundingClientRect()
    setPos({ top: rect.bottom + 4, left: rect.left })
    setOpen(true)
  }

  useEffect(() => {
    if (!open) return
    const close = (e) => {
      if (!dropRef.current?.contains(e.target) && !btnRef.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])

  return (
    <div className="module-ctx-menu" onClick={e => e.stopPropagation()}>
      <button ref={btnRef} className="module-ctx-btn" onClick={handleOpen} title="Module options">⋯</button>
      {open && createPortal(
        <div
          ref={dropRef}
          className="module-ctx-dropdown"
          style={{ position: 'fixed', top: pos.top, left: pos.left, zIndex: 9999 }}
        >
          <button className="module-ctx-item" onClick={() => { setOpen(false); onAddTopic() }}>
            <span className="mci-icon">＋</span>Add Topic
          </button>
          <div className="module-ctx-divider" />
          <button className="module-ctx-item module-ctx-item--danger" onClick={() => { setOpen(false); onDeleteModule() }}>
            <span className="mci-icon">🗑</span>Delete Module
          </button>
        </div>,
        document.body
      )}
    </div>
  )
}

export default function Sidebar({
  modules, activeModule, onModuleChange,
  topics, activeTopic, onTopicChange,
  progressMap, questions,
  activeView, onViewChange,
  isAdmin,
  onAddModule, onDeleteModule, onAddTopic
}) {
  const [expanded, setExpanded] = useState(() => ({ [activeModule]: true }))

  function toggle(slug) {
    setExpanded(prev => ({ ...prev, [slug]: !prev[slug] }))
  }

  function topicStats(topicSlug) {
    const qs = questions.filter(q => q.topicSlug === topicSlug && q.type !== 'quiz')
    const total = qs.length
    const completed = qs.filter(q => progressMap[q._id]?.completed).length
    return { total, completed }
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <span className="logo-icon">⚡</span>
          <span className="logo-text">FrontendMaster</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <button className={`sidebar-nav-item ${activeView === 'dashboard' ? 'active' : ''}`} onClick={() => onViewChange('dashboard')}>
          <span className="nav-icon">📊</span><span className="nav-label">Dashboard</span>
        </button>
        <button className={`sidebar-nav-item ${activeView === 'leaderboard' ? 'active' : ''}`} onClick={() => onViewChange('leaderboard')}>
          <span className="nav-icon">🏆</span><span className="nav-label">Leaderboard</span>
        </button>
        {isAdmin && (
          <button className={`sidebar-nav-item ${activeView === 'admin' ? 'active' : ''}`} onClick={() => onViewChange('admin')}>
            <span className="nav-icon">🛠️</span><span className="nav-label">Admin Panel</span>
          </button>
        )}

        <div className="sidebar-divider" />

        {modules.map(m => {
          const isOpen = !!expanded[m.slug]
          const moduleTopics = topics.filter(t => t.moduleSlug === m.slug)
          const isActiveModule = activeModule === m.slug

          return (
            <div key={m.slug} className="module-group">
              <div
                className={`module-group-header ${isActiveModule ? 'module-group-header--active' : ''}`}
                onClick={() => { toggle(m.slug); onModuleChange(m.slug) }}
              >
                <span className="module-group-icon">{m.icon}</span>
                <span className="module-group-name">{m.name}</span>
                {isAdmin && (
                  <ModuleMenu
                    module={m}
                    onAddTopic={() => onAddTopic(m.slug)}
                    onDeleteModule={() => onDeleteModule(m.slug, m.name)}
                  />
                )}
                <span className={`module-chevron ${isOpen ? 'module-chevron--open' : ''}`}>›</span>
              </div>

              {isOpen && (
                <div className="module-topics">
                  {moduleTopics.length === 0 && (
                    <div className="module-empty-topics">No topics yet</div>
                  )}
                  {moduleTopics.map(topic => {
                    const { total, completed } = topicStats(topic.slug)
                    const allDone = total > 0 && completed === total
                    return (
                      <button
                        key={topic.slug}
                        className={`sidebar-nav-item sidebar-topic-item ${activeTopic === topic.slug && activeView === 'topic' ? 'active' : ''} ${allDone ? 'all-done' : ''}`}
                        onClick={() => onTopicChange(topic.slug)}
                      >
                        <span className="nav-icon">{topic.icon}</span>
                        <span className="nav-label">{topic.name}</span>
                        <span className="nav-progress">
                          {total > 0 && <span className="nav-progress-text">{completed}/{total}</span>}
                          {allDone && <span className="nav-check">✓</span>}
                        </span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}

        {isAdmin && (
          <button className="add-module-btn" onClick={onAddModule}>
            <span>＋</span> Add Module
          </button>
        )}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-footer-text">Frontend Interview Prep</div>
      </div>
    </aside>
  )
}
