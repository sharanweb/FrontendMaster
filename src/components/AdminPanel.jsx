import { useState, useEffect } from 'react'
import { api } from '../services/api'

export default function AdminPanel({ modules }) {
  const [tab, setTab] = useState('progress') // 'progress' | 'users'
  const [usersProgress, setUsersProgress] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  // Add user state
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [addErr, setAddErr] = useState('')
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    Promise.all([api.getAllUsersProgress(), api.getUsers()])
      .then(([pd, ud]) => {
        setUsersProgress(pd.users)
        setUsers(ud.users)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleAdd = async (e) => {
    e.preventDefault()
    setAddErr('')
    setAdding(true)
    try {
      const d = await api.addUser(email.trim(), password, name.trim())
      setUsers(prev => [d.user, ...prev])
      setEmail(''); setPassword(''); setName('')
    } catch (err) {
      setAddErr(err.message)
    } finally {
      setAdding(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this user?')) return
    await api.deleteUser(id).catch(err => alert(err.message))
    setUsers(prev => prev.filter(u => u.id !== id))
    setUsersProgress(prev => prev.filter(u => String(u.id) !== String(id)))
  }

  const moduleNames = Object.fromEntries((modules || []).map(m => [m.slug, m.name]))

  return (
    <div className="admin-panel">
      <div className="dashboard-hero">
        <h1 className="dashboard-title">🛠️ Admin Panel</h1>
        <p className="dashboard-subtitle">Manage users and monitor progress</p>
      </div>

      <div className="admin-tabs">
        <button className={`admin-tab ${tab === 'progress' ? 'admin-tab--active' : ''}`} onClick={() => setTab('progress')}>All Users Progress</button>
        <button className={`admin-tab ${tab === 'users' ? 'admin-tab--active' : ''}`} onClick={() => setTab('users')}>Manage Users</button>
      </div>

      {loading ? <div className="lb-loading">Loading…</div> : tab === 'progress' ? (
        <div className="admin-progress-table">
          <div className="ap-header">
            <span className="ap-col-user">User</span>
            {Object.keys(moduleNames).map(slug => (
              <span key={slug} className="ap-col-mod">{moduleNames[slug]}</span>
            ))}
          </div>
          {usersProgress.map(u => (
            <div key={u.id} className="ap-row">
              <span className="ap-col-user">
                <span className="ap-name">{u.name || '—'}</span>
                <span className="ap-email">{u.email}</span>
                {u.role === 'admin' && <span className="ap-admin-badge">Admin</span>}
              </span>
              {u.modules.map(m => (
                <span key={m.slug} className="ap-col-mod">
                  <span className="ap-pct">{m.pct}%</span>
                  <span className="ap-sub">{m.completed}/{m.total}</span>
                  <div className="ap-bar"><div className="ap-bar-fill" style={{ width: m.pct + '%' }} /></div>
                </span>
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div className="admin-users-section">
          <form className="add-user-form" onSubmit={handleAdd}>
            <h3 className="modal-section-title">Add New User</h3>
            <div className="add-user-fields">
              <input className="field-input" placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
              <input className="field-input" type="email" placeholder="Email *" value={email} onChange={e => setEmail(e.target.value)} required />
              <input className="field-input" type="password" placeholder="Password *" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            {addErr && <div className="login-error" style={{ marginBottom: 8 }}>{addErr}</div>}
            <div className="add-user-submit">
              <button className="btn btn-primary" type="submit" disabled={adding}>{adding ? 'Adding…' : 'Add User'}</button>
            </div>
          </form>

          <div className="user-list-section">
            <h3 className="modal-section-title">All Users</h3>
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
          </div>
        </div>
      )}
    </div>
  )
}
