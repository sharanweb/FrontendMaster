import { useState, useEffect } from 'react'
import { api } from '../services/api'

const MEDALS = { 1: '🥇', 2: '🥈', 3: '🥉' }

export default function Leaderboard() {
  const [board, setBoard] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getLeaderboard()
      .then(d => setBoard(d.board))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="leaderboard">
      <div className="dashboard-hero">
        <h1 className="dashboard-title">🏆 Leaderboard</h1>
        <p className="dashboard-subtitle">Top learners ranked by questions completed</p>
      </div>

      {loading ? (
        <div className="lb-loading">Loading…</div>
      ) : board.length === 0 ? (
        <div className="lb-empty">No data yet — start completing questions!</div>
      ) : (
        <div className="lb-table">
          <div className="lb-header">
            <span className="lb-col-rank">Rank</span>
            <span className="lb-col-name">Name</span>
            <span className="lb-col-completed">Completed</span>
            <span className="lb-col-streak">Streak</span>
          </div>
          {board.map(row => (
            <div key={row.userId} className={`lb-row ${row.isMe ? 'lb-row--me' : ''}`}>
              <span className="lb-col-rank">
                {MEDALS[row.rank] || <span className="lb-rank-num">#{row.rank}</span>}
              </span>
              <span className="lb-col-name">
                <span className="lb-name">{row.name}</span>
                {row.isMe && <span className="lb-you">you</span>}
              </span>
              <span className="lb-col-completed">
                <span className="lb-count">{row.completed}</span>
                <span className="lb-count-label"> questions</span>
              </span>
              <span className="lb-col-streak">
                🔥 {row.streak} day{row.streak !== 1 ? 's' : ''}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
