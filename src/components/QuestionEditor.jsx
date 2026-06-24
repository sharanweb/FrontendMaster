import { useState } from 'react'

const TYPES = ['theory', 'output', 'implementation', 'quiz']
const LEVELS = [1, 2, 3, 4]
const LEVEL_NAMES = { 1: 'Beginner', 2: 'Intermediate', 3: 'Advanced', 4: 'Expert' }
const DIFFS = ['easy', 'medium', 'hard', 'tricky']

export default function QuestionEditor({ question: q, topicSlug, moduleSlug, onSave, onClose }) {
  const isQuiz = q?.type === 'quiz'
  const [type, setType] = useState(q?.type || 'theory')
  const [level, setLevel] = useState(q?.level || 1)
  const [difficulty, setDifficulty] = useState(q?.difficulty || 'medium')
  const [questionText, setQuestionText] = useState(q?.question || '')
  const [title, setTitle] = useState(q?.title || '')
  const [answer, setAnswer] = useState(q?.answer || '')
  const [explanation, setExplanation] = useState(q?.explanation || '')
  const [code, setCode] = useState(q?.code || '')
  const [tip, setTip] = useState(q?.tip || '')
  const [followUps, setFollowUps] = useState((q?.followUps || []).join('\n'))
  const [companies, setCompanies] = useState((q?.companies || []).join(', '))
  const [options, setOptions] = useState((q?.options || ['', '', '', '']).join('\n'))
  const [answerIndex, setAnswerIndex] = useState(q?.answerIndex ?? 0)
  const [concept, setConcept] = useState(q?.concept || '')
  const [saving, setSaving] = useState(false)

  const quizMode = type === 'quiz'

  const handleSave = async () => {
    setSaving(true)
    const data = quizMode ? {
      type, difficulty, title, code,
      options: options.split('\n').map(s => s.trim()).filter(Boolean),
      answerIndex: Number(answerIndex),
      explanation, concept
    } : {
      type, level: Number(level),
      question: questionText, answer, code, tip,
      followUps: followUps.split('\n').map(s => s.trim()).filter(Boolean),
      companies: companies.split(',').map(s => s.trim()).filter(Boolean)
    }
    await onSave(data)
    setSaving(false)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box qe-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{q ? 'Edit Question' : 'Add Question'}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="qe-body">
          {/* Type */}
          <div className="qe-row">
            <label className="qe-label">Type</label>
            <div className="qe-pills">
              {TYPES.map(t => (
                <button key={t} className={`filter-pill ${type === t ? 'active' : ''}`} onClick={() => setType(t)}>{t}</button>
              ))}
            </div>
          </div>

          {quizMode ? <>
            <div className="qe-row">
              <label className="qe-label">Difficulty</label>
              <div className="qe-pills">
                {DIFFS.map(d => <button key={d} className={`filter-pill ${difficulty === d ? 'active' : ''}`} onClick={() => setDifficulty(d)}>{d}</button>)}
              </div>
            </div>
            <div className="qe-row">
              <label className="qe-label">Title</label>
              <input className="field-input" value={title} onChange={e => setTitle(e.target.value)} placeholder="Short description" />
            </div>
            <div className="qe-row">
              <label className="qe-label">Code</label>
              <textarea className="qe-textarea qe-code" value={code} onChange={e => setCode(e.target.value)} rows={6} placeholder="Code snippet..." />
            </div>
            <div className="qe-row">
              <label className="qe-label">Options (one per line)</label>
              <textarea className="qe-textarea" value={options} onChange={e => setOptions(e.target.value)} rows={4} />
            </div>
            <div className="qe-row">
              <label className="qe-label">Correct Answer (0-indexed)</label>
              <input className="field-input" type="number" min={0} max={3} value={answerIndex} onChange={e => setAnswerIndex(e.target.value)} style={{ width: 80 }} />
            </div>
            <div className="qe-row">
              <label className="qe-label">Explanation (HTML ok)</label>
              <textarea className="qe-textarea" value={explanation} onChange={e => setExplanation(e.target.value)} rows={4} />
            </div>
            <div className="qe-row">
              <label className="qe-label">Concept</label>
              <input className="field-input" value={concept} onChange={e => setConcept(e.target.value)} />
            </div>
          </> : <>
            <div className="qe-row">
              <label className="qe-label">Level</label>
              <div className="qe-pills">
                {LEVELS.map(l => <button key={l} className={`filter-pill ${level === l ? 'active' : ''}`} onClick={() => setLevel(l)}>{LEVEL_NAMES[l]}</button>)}
              </div>
            </div>
            <div className="qe-row">
              <label className="qe-label">Question</label>
              <textarea className="qe-textarea" value={questionText} onChange={e => setQuestionText(e.target.value)} rows={3} />
            </div>
            <div className="qe-row">
              <label className="qe-label">Answer (HTML ok)</label>
              <textarea className="qe-textarea" value={answer} onChange={e => setAnswer(e.target.value)} rows={5} />
            </div>
            <div className="qe-row">
              <label className="qe-label">Code</label>
              <textarea className="qe-textarea qe-code" value={code} onChange={e => setCode(e.target.value)} rows={5} />
            </div>
            <div className="qe-row">
              <label className="qe-label">Tip</label>
              <input className="field-input" value={tip} onChange={e => setTip(e.target.value)} />
            </div>
            <div className="qe-row">
              <label className="qe-label">Follow-up questions (one per line)</label>
              <textarea className="qe-textarea" value={followUps} onChange={e => setFollowUps(e.target.value)} rows={3} />
            </div>
            <div className="qe-row">
              <label className="qe-label">Companies (comma separated)</label>
              <input className="field-input" value={companies} onChange={e => setCompanies(e.target.value)} placeholder="Google, Meta, Amazon" />
            </div>
          </>}

          <div className="qe-footer">
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save Question'}</button>
            <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  )
}
