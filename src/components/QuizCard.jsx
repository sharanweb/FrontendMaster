import { useState } from 'react'
import CodeBlock from './CodeBlock'

export default function QuizCard({ q, index, completed, onToggleComplete }) {
  const [selected, setSelected] = useState(null)
  const [revealed, setReveal] = useState(false)

  const handleSelect = (i) => {
    if (revealed) return
    setSelected(i)
    setReveal(true)
    if (i === q.answer) onToggleComplete?.(q.id)
  }

  const getOptClass = (i) => {
    if (!revealed) return 'quiz-opt'
    if (i === q.answer) return 'quiz-opt quiz-opt--correct'
    if (i === selected && i !== q.answer) return 'quiz-opt quiz-opt--wrong'
    return 'quiz-opt quiz-opt--dim'
  }

  return (
    <div className={`q-card ${completed ? 'q-card--done' : ''}`}>
      <div className="q-card-header" style={{ cursor: 'default' }}>
        <div className="q-card-left">
          <span className={`check-btn ${completed ? 'check-btn--checked' : ''}`}>
            {completed ? '✓' : ''}
          </span>
          <span className="q-index">Q{index + 1}</span>
        </div>
        <div className="q-card-middle">
          <div className="q-badges">
            <span className="badge badge-type">Output Quiz</span>
            {q.concept && <span className="badge badge-company">{q.concept}</span>}
          </div>
          <div className="q-text">{q.title}</div>
        </div>
      </div>

      <div className="q-card-body" style={{ display: 'block' }}>
        {q.code && (
          <div className="code-section" style={{ marginBottom: 12 }}>
            <CodeBlock code={q.code} />
          </div>
        )}

        <div className="quiz-opts">
          {q.options.map((opt, i) => (
            <button key={i} className={getOptClass(i)} onClick={() => handleSelect(i)}>
              <span className="quiz-opt-label">{String.fromCharCode(65 + i)}</span>
              <code>{opt}</code>
            </button>
          ))}
        </div>

        {revealed && (
          <div className={`quiz-result ${selected === q.answer ? 'quiz-result--correct' : 'quiz-result--wrong'}`}>
            <div className="quiz-result-icon">{selected === q.answer ? '✓ Correct!' : '✗ Incorrect'}</div>
            <div
              className="quiz-result-explanation"
              dangerouslySetInnerHTML={{ __html: q.explanation }}
            />
          </div>
        )}

        {!revealed && (
          <button className="reveal-btn" onClick={() => setReveal(true)}>Reveal Answer</button>
        )}
      </div>
    </div>
  )
}
