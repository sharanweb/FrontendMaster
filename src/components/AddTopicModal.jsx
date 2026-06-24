import { useState } from 'react'

const ICON_OPTIONS = ['📝', '🔒', '🔄', '⏳', '👉', '🔗', '🏗️', '🌐', '🔢', '🎯', '⚠️', '⚙️', '🗑️', '🔣', '📦', '📐', '💧', '⏱️', '🍛', '🕰️', '🧬', '🧪', '🚀', '🎨', '🔷']

export default function AddTopicModal({ moduleSlug, moduleName, onSave, onClose }) {
  const [name, setName] = useState('')
  const [icon, setIcon] = useState('📝')
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  const handleSave = async (e) => {
    e.preventDefault()
    if (!name.trim()) { setErr('Topic name is required'); return }
    setSaving(true)
    try {
      await onSave({ name: name.trim(), icon })
    } catch (e) {
      setErr(e.message)
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" style={{ width: 420 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Add Topic to {moduleName}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSave} style={{ padding: '20px 24px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="field">
            <label className="field-label">Topic Name *</label>
            <input className="field-input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Closures" autoFocus />
          </div>
          <div className="field">
            <label className="field-label">Icon</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
              {ICON_OPTIONS.map(ic => (
                <button key={ic} type="button"
                  className={`icon-pick-btn ${icon === ic ? 'icon-pick-btn--active' : ''}`}
                  onClick={() => setIcon(ic)}
                >{ic}</button>
              ))}
            </div>
          </div>
          {err && <div className="login-error">{err}</div>}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Adding…' : 'Add Topic'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
