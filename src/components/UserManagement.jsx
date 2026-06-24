import { useState, useEffect } from 'react'
import { api } from '../services/api'

export default function UserManagement({ onClose }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [addError, setAddError] = useState('')
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    api.getUsers()
      .then(d => setUsers(d.users))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleAdd = async (e) => {
    e.preventDefault()
    setAddError('')
    setAdding(true)
    try {
      const data = await api.addUser(email.trim(), password, name.trim())
      setUsers(prev => [data.user, ...prev])
      setEmail(''); setPassword(''); setName('')
    } catch (err) {
      setAddError(err.message)
    } finally {
      setAdding(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this user?')) return
    try {
      await api.deleteUser(id)
      setUsers(prev => prev.filter(u => u.id !== id))
    } catch (err) {
      alert(err.message)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">User Management</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form className="add-user-form" onSubmit={handleAdd}>
          <h3 className="modal-section-title">Add New User</h3>
          <div className="add-user-fields">
            <input className="field-input" placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
            <input className="field-input" type="email" placeholder="Email *" value={email} onChange={e => setEmail(e.target.value)} required />
            <input className="field-input" type="password" placeholder="Password *" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          {addError && <div className="login-error" style={{ marginBottom: 8 }}>{addError}</div>}
          <div className="add-user-submit">
            <button className="btn btn-primary" type="submit" disabled={adding}>
              {adding ? 'Adding…' : 'Add User'}
            </button>
          </div>
        </form>

        <div className="user-list-section">
          <h3 className="modal-section-title">Existing Users</h3>
          {loading ? (
            <div className="modal-loading">Loading…</div>
          ) : users.length === 0 ? (
            <div className="modal-empty">No users yet.</div>
          ) : (
            <div className="user-table">
              {users.map(u => (
                <div key={u.id} className="user-row">
                  <div className="user-info">
                    <span className="user-name">{u.name || '—'}</span>
                    <span className="user-email">{u.email}</span>
                  </div>
                  <div className="user-meta">
                    <span className={`role-badge ${u.role}`}>{u.role}</span>
                    {u.role !== 'admin' && (
                      <button className="link-btn link-btn--danger" onClick={() => handleDelete(u.id)}>Remove</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
