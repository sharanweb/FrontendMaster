import { useState, useMemo, useEffect, useRef } from 'react'
import QuestionCard from './QuestionCard'
import QuizCard from './QuizCard'
import QuestionEditor from './QuestionEditor'
import ConfirmModal from './ConfirmModal'
import { api } from '../services/api'

const LEVELS = [
  { value: 'all', label: 'All Levels' },
  { value: '1', label: 'Beginner' },
  { value: '2', label: 'Intermediate' },
  { value: '3', label: 'Advanced' },
  { value: '4', label: 'Expert' },
]
const TYPES = [
  { value: 'all', label: 'All Types' },
  { value: 'theory', label: 'Theory' },
  { value: 'output', label: 'Output' },
  { value: 'implementation', label: 'Implement' },
  { value: 'quiz', label: 'Quiz' },
]

// Reusable inline dropdown menu
function CtxMenu({ items, btnLabel = '•••', btnClass = 'section-menu-btn', dropClass = 'section-menu-dropdown' }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const close = (e) => { if (!ref.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])

  return (
    <div className="section-menu" ref={ref}>
      <button className={btnClass} onClick={() => setOpen(v => !v)}>{btnLabel}</button>
      {open && (
        <div className={dropClass}>
          {items.map((item, i) =>
            item === 'divider'
              ? <div key={i} className="section-menu-divider" />
              : (
                <button
                  key={i}
                  className={`section-menu-item ${item.danger ? 'section-menu-item--danger' : ''}`}
                  onClick={() => { setOpen(false); item.onClick() }}
                >
                  <span>{item.icon}</span>{item.label}
                </button>
              )
          )}
        </div>
      )}
    </div>
  )
}


export default function TopicView({
  topic,
  questions: allTopicQuestions,
  progressMap,
  onToggleComplete,
  onMarkSeen,
  customAnswers,
  onSaveCustomAnswer,
  onDeleteCustomAnswer,
  isAdmin,
  onTopicDeleted
}) {
  const [search, setSearch] = useState('')
  const [levelFilter, setLevelFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [questions, setQuestions] = useState(allTopicQuestions)
  const [showEditor, setShowEditor] = useState(false)
  const [editingQ, setEditingQ] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null) // { message, onConfirm }

  useEffect(() => { setQuestions(allTopicQuestions) }, [allTopicQuestions])

  const nonQuiz = useMemo(() => questions.filter(q => q.type !== 'quiz'), [questions])
  const quizzes = useMemo(() => questions.filter(q => q.type === 'quiz'), [questions])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return nonQuiz.filter(item => {
      if (typeFilter !== 'all' && item.type !== typeFilter) return false
      if (levelFilter !== 'all' && String(item.level) !== levelFilter) return false
      if (q && !item.question?.toLowerCase().includes(q) && !item.answer?.toLowerCase().includes(q)) return false
      return true
    })
  }, [nonQuiz, typeFilter, levelFilter, search])

  const showQuiz = typeFilter === 'all' || typeFilter === 'quiz'
  const completed = nonQuiz.filter(q => progressMap[q._id]?.completed).length
  const total = nonQuiz.length
  const pct = total ? Math.round(completed / total * 100) : 0

  const openEditor = (q = null) => { setEditingQ(q); setShowEditor(true) }

  const handleSaveQuestion = async (data) => {
    try {
      if (editingQ) {
        const { question } = await api.updateQuestion(editingQ._id, data)
        setQuestions(prev => prev.map(q => q._id === question._id ? question : q))
      } else {
        const { question } = await api.addQuestion({ ...data, topicSlug: topic.slug, moduleSlug: topic.moduleSlug })
        setQuestions(prev => [...prev, question])
      }
      setShowEditor(false); setEditingQ(null)
    } catch (err) { alert(err.message) }
  }

  const handleDeleteQuestion = (id) => {
    setConfirmDelete({
      message: 'Delete this question? This cannot be undone.',
      onConfirm: async () => {
        setConfirmDelete(null)
        await api.deleteQuestion(id).catch(err => alert(err.message))
        setQuestions(prev => prev.filter(q => q._id !== id))
      }
    })
  }

  const handleDeleteTopic = () => {
    setConfirmDelete({
      message: `Delete the "${topic.name}" topic and all its questions? This cannot be undone.`,
      onConfirm: async () => {
        setConfirmDelete(null)
        try {
          await api.deleteTopic(topic.moduleSlug, topic.slug)
          onTopicDeleted?.(topic.slug)
        } catch (err) { alert(err.message) }
      }
    })
  }

  const topicHeaderMenu = isAdmin ? [
    { icon: '＋', label: 'Add Question', onClick: () => openEditor(null) },
    'divider',
    { icon: '🗑', label: 'Delete Topic', danger: true, onClick: handleDeleteTopic }
  ] : []

  const sectionEndItems = [
    { icon: '＋', label: 'Add Question', onClick: () => openEditor(null) }
  ]

  return (
    <div className="topic-view">
      {/* Topic header */}
      <div className="topic-view-header">
        <div className="topic-view-title-row">
          <span className="topic-view-icon">{topic?.icon}</span>
          <h1 className="topic-view-title">{topic?.name}</h1>
          {total > 0 && completed === total && <span className="topic-complete-badge">🏆 Completed!</span>}
          <div style={{ flex: 1 }} />
          {isAdmin && (
            <div className="topic-header-actions">
              <button className="btn btn-ghost btn-sm" onClick={() => openEditor(null)}>＋ Add Question</button>
              <button className="btn btn-sm topic-delete-btn" onClick={handleDeleteTopic}>🗑 Delete Topic</button>
            </div>
          )}
        </div>
        <div className="topic-progress-bar-wrap">
          <div className="topic-progress-bar">
            <div className="topic-progress-fill" style={{ width: pct + '%' }} />
          </div>
          <span className="topic-progress-text">{completed}/{total} completed ({pct}%)</span>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-row">
        <input className="search-input" placeholder="Search questions..." value={search} onChange={e => setSearch(e.target.value)} />
        <div className="filter-pills">
          {LEVELS.map(l => <button key={l.value} className={`filter-pill ${levelFilter === l.value ? 'active' : ''}`} onClick={() => setLevelFilter(l.value)}>{l.label}</button>)}
        </div>
        <div className="filter-pills">
          {TYPES.map(t => <button key={t.value} className={`filter-pill ${typeFilter === t.value ? 'active' : ''}`} onClick={() => setTypeFilter(t.value)}>{t.label}</button>)}
        </div>
      </div>

      {/* Questions */}
      <div className="question-list">
        {filtered.length === 0 && typeFilter !== 'quiz' && (
          <div className="empty-state">No questions match your filters.</div>
        )}
        {filtered.map((q, i) => (
          <QuestionCard
            key={q._id}
            question={q}
            index={i}
            completed={!!progressMap[q._id]?.completed}
            onToggleComplete={onToggleComplete}
            onExpand={onMarkSeen}
            customAnswer={customAnswers[q._id]}
            onSaveCustomAnswer={onSaveCustomAnswer}
            onDeleteCustomAnswer={onDeleteCustomAnswer}
            isAdmin={isAdmin}
            onEdit={() => openEditor(q)}
            onDelete={() => handleDeleteQuestion(q._id)}
          />
        ))}

        {/* Section-end inline actions */}
        {isAdmin && typeFilter !== 'quiz' && (
          <div className="section-end">
            <button className="section-action-btn" onClick={() => openEditor(null)}>＋ Add Question</button>
          </div>
        )}

        {/* Quiz section */}
        {showQuiz && quizzes.length > 0 && (
          <div className="quiz-section">
            <div className="quiz-section-header">
              <span className="quiz-section-icon">🧪</span>
              <h2 className="quiz-section-title">Output Quiz</h2>
              <span className="quiz-section-sub">Predict the output before revealing</span>
            </div>
            {quizzes.map((q, i) => (
              <QuizCard
                key={q._id}
                q={q}
                index={i}
                completed={!!progressMap[q._id]?.completed}
                onToggleComplete={onToggleComplete}
                isAdmin={isAdmin}
                onEdit={() => openEditor(q)}
                onDelete={() => handleDeleteQuestion(q._id)}
              />
            ))}
            {isAdmin && (
              <div className="section-end">
                <button className="section-action-btn" onClick={() => openEditor(null)}>＋ Add Question</button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Question editor modal */}
      {showEditor && (
        <QuestionEditor
          question={editingQ}
          topicSlug={topic?.slug}
          moduleSlug={topic?.moduleSlug}
          onSave={handleSaveQuestion}
          onClose={() => { setShowEditor(false); setEditingQ(null) }}
        />
      )}

      {/* Confirmation popup */}
      {confirmDelete && (
        <ConfirmModal
          message={confirmDelete.message}
          onConfirm={confirmDelete.onConfirm}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  )
}
