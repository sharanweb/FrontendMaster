import { useState, useRef } from 'react'
import CodeBlock from './CodeBlock'

const LEVEL_LABELS = { 1: 'Beginner', 2: 'Intermediate', 3: 'Advanced', 4: 'Expert' }
const LEVEL_CLASSES = { 1: 'level-beginner', 2: 'level-intermediate', 3: 'level-advanced', 4: 'level-expert' }
const TYPE_LABELS = { theory: 'Theory', output: 'Output', implementation: 'Implement', quiz: 'Quiz' }

// Parse custom answer text into segments: {type:'text'|'code', content}
function parseCustomAnswer(text) {
  const segments = []
  const regex = /```(?:\w+)?\n([\s\S]*?)```/g
  let last = 0, match
  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) segments.push({ type: 'text', content: text.slice(last, match.index) })
    segments.push({ type: 'code', content: match[1] })
    last = match.index + match[0].length
  }
  if (last < text.length) segments.push({ type: 'text', content: text.slice(last) })
  return segments
}

function CustomAnswerDisplay({ text }) {
  const segments = parseCustomAnswer(text)
  return (
    <div className="custom-answer-text">
      {segments.map((s, i) =>
        s.type === 'code'
          ? <CodeBlock key={i} code={s.content} />
          : <span key={i} style={{ whiteSpace: 'pre-wrap' }}>{s.content}</span>
      )}
    </div>
  )
}

export default function QuestionCard({
  question: q,
  index,
  completed,
  onToggleComplete,
  onExpand,
  customAnswer,
  onSaveCustomAnswer,
  onDeleteCustomAnswer,
  isAdmin,
  onEdit,
  onDelete
}) {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const [showOriginal, setShowOriginal] = useState(false)
  const textareaRef = useRef(null)
  const qId = q._id || q.id

  const handleToggle = () => {
    const next = !open
    setOpen(next)
    if (next) onExpand?.(qId)
  }

  const startEdit = () => {
    setDraft(customAnswer || '')
    setEditing(true)
    setTimeout(() => textareaRef.current?.focus(), 50)
  }

  const insertCode = () => {
    const ta = textareaRef.current
    if (!ta) return
    const start = ta.selectionStart
    const end = ta.selectionEnd
    const selected = draft.slice(start, end)
    const snippet = '```js\n' + (selected || '// your code here') + '\n```'
    const next = draft.slice(0, start) + snippet + draft.slice(end)
    setDraft(next)
    setTimeout(() => {
      ta.focus()
      const cur = start + snippet.length
      ta.setSelectionRange(cur, cur)
    }, 0)
  }

  const saveEdit = async () => {
    const trimmed = draft.trim()
    if (trimmed) {
      await onSaveCustomAnswer?.(qId, trimmed)
    } else if (customAnswer) {
      await onDeleteCustomAnswer?.(qId)
    }
    setEditing(false)
  }

  const hasCustomAnswer = Boolean(customAnswer)

  return (
    <div className={`q-card ${open ? 'q-card--open' : ''} ${completed ? 'q-card--done' : ''}`}>
      <div className="q-card-header" onClick={handleToggle}>
        <div className="q-card-left">
          <button
            className={`check-btn ${completed ? 'check-btn--checked' : ''}`}
            onClick={e => { e.stopPropagation(); onToggleComplete(qId) }}
            title={completed ? 'Mark incomplete' : 'Mark complete'}
          >
            {completed ? '✓' : ''}
          </button>
          <span className="q-index">Q{index + 1}</span>
        </div>

        <div className="q-card-middle">
          <div className="q-badges">
            <span className={`badge ${LEVEL_CLASSES[q.level]}`}>{LEVEL_LABELS[q.level]}</span>
            <span className="badge badge-type">{TYPE_LABELS[q.type] || q.type}</span>
            {hasCustomAnswer && <span className="badge badge-custom">My Answer</span>}
            {q.companies?.slice(0, 2).map(c => (
              <span key={c} className="badge badge-company">{c}</span>
            ))}
          </div>
          <div className="q-text">{q.question || q.title}</div>
        </div>

        <div className="q-card-right">
          {isAdmin && (
            <div className="q-admin-icons" onClick={e => e.stopPropagation()}>
              <button className="q-icon-btn q-icon-edit" onClick={onEdit} title="Edit question">✎</button>
              <button className="q-icon-btn q-icon-delete" onClick={onDelete} title="Delete question">🗑</button>
            </div>
          )}
          <span className={`chevron ${open ? 'chevron--open' : ''}`}>›</span>
        </div>
      </div>

      {open && (
        <div className="q-card-body">
          {/* Custom answer */}
          {hasCustomAnswer && !editing && (
            <div className="answer-section custom-answer-section">
              <div className="section-label-row">
                <div className="section-label custom-label">My Answer</div>
                <div className="custom-answer-actions">
                  <button className="link-btn" onClick={() => setShowOriginal(v => !v)}>
                    {showOriginal ? 'Hide original' : 'Show original'}
                  </button>
                  <button className="link-btn" onClick={startEdit}>Edit</button>
                  <button className="link-btn link-btn--danger" onClick={() => onDeleteCustomAnswer?.(qId)}>Remove</button>
                </div>
              </div>
              <CustomAnswerDisplay text={customAnswer} />
            </div>
          )}

          {(!hasCustomAnswer || showOriginal) && q.answer && (
            <div className="answer-section">
              <div className="section-label">{hasCustomAnswer ? 'Original Answer' : 'Answer'}</div>
              <div className="answer-text" dangerouslySetInnerHTML={{ __html: q.answer }} />
            </div>
          )}

          {editing && (
            <div className="custom-answer-editor">
              <div className="section-label-row" style={{ marginBottom: 6 }}>
                <div className="section-label">My Answer</div>
                <button className="ca-toolbar-btn" onClick={insertCode} title="Insert code block">
                  {'</>'}  Insert Code
                </button>
              </div>
              <textarea
                ref={textareaRef}
                className="custom-answer-textarea"
                value={draft}
                onChange={e => setDraft(e.target.value)}
                placeholder={'Write your explanation here…\n\nTip: click "Insert Code" to add a code block, or type:\n```js\nyour code here\n```'}
                rows={8}
              />
              <div className="editor-actions">
                <button className="btn btn-primary" onClick={saveEdit}>Save</button>
                <button className="btn btn-ghost" onClick={() => setEditing(false)}>Cancel</button>
                {customAnswer && (
                  <button className="btn btn-ghost" onClick={() => setDraft(customAnswer)}>Reset</button>
                )}
              </div>
            </div>
          )}

          {!editing && !hasCustomAnswer && (
            <div className="add-custom-answer">
              <button className="btn btn-ghost btn-sm" onClick={startEdit}>+ Add my own answer</button>
            </div>
          )}
          {!editing && hasCustomAnswer && (
            <div className="add-custom-answer">
              <button className="btn btn-ghost btn-sm" onClick={startEdit}>Edit my answer</button>
            </div>
          )}

          {q.code && (
            <div className="code-section">
              <div className="section-label">Code</div>
              <CodeBlock code={q.code} />
            </div>
          )}

          {q.tip && (
            <div className="tip-box">
              <span className="tip-icon">💡</span>
              <span dangerouslySetInnerHTML={{ __html: q.tip }} />
            </div>
          )}

          {q.followUps?.length > 0 && (
            <div className="follow-ups">
              <div className="section-label">Follow-up questions</div>
              <div className="follow-list">
                {q.followUps.map((f, i) => <span key={i} className="follow-item">{f}</span>)}
              </div>
            </div>
          )}

          <div className="q-card-footer">
            <button
              className={`complete-btn ${completed ? 'complete-btn--done' : ''}`}
              onClick={() => onToggleComplete(qId)}
            >
              {completed ? '✓ Completed' : 'Mark as Complete'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
