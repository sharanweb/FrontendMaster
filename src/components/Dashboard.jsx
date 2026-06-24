import { useMemo } from 'react'

export default function Dashboard({ questions, progressMap, streak, topics, onTopicClick }) {
  const overall = useMemo(() => {
    const nonQuiz = questions.filter(q => q.type !== 'quiz')
    const total = nonQuiz.length
    const completed = nonQuiz.filter(q => progressMap[q._id]?.completed).length
    const seen = nonQuiz.filter(q => progressMap[q._id]?.seenAt).length
    return { total, completed, seen, pct: total ? Math.round(completed / total * 100) : 0 }
  }, [questions, progressMap])

  const topicStats = useMemo(() =>
    topics.map(t => {
      const qs = questions.filter(q => q.topicSlug === t.slug && q.type !== 'quiz')
      const total = qs.length
      const completed = qs.filter(q => progressMap[q._id]?.completed).length
      return { ...t, total, completed, pct: total ? Math.round(completed / total * 100) : 0 }
    })
  , [topics, questions, progressMap])

  const levelStats = useMemo(() => {
    const labels = ['Beginner', 'Intermediate', 'Advanced', 'Expert']
    return [1, 2, 3, 4].map((l, i) => {
      const qs = questions.filter(q => q.level === l && q.type !== 'quiz')
      const done = qs.filter(q => progressMap[q._id]?.completed).length
      return { label: labels[i], total: qs.length, done, pct: qs.length ? Math.round(done / qs.length * 100) : 0 }
    })
  }, [questions, progressMap])

  const calendarDays = useMemo(() => {
    const days = []
    const today = new Date()
    for (let i = 89; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().slice(0, 10)
      const count = Object.values(progressMap).filter(p => {
        if (!p.seenAt) return false
        return new Date(p.seenAt).toISOString().slice(0, 10) === dateStr
      }).length
      days.push({ date: dateStr, count })
    }
    return days
  }, [progressMap])

  const actLevel = (n) => n === 0 ? 'cal-none' : n < 3 ? 'cal-low' : n < 7 ? 'cal-mid' : 'cal-high'

  return (
    <div className="dashboard">
      <div className="dashboard-hero">
        <h1 className="dashboard-title">Learning Dashboard</h1>
        <p className="dashboard-subtitle">Track your frontend interview prep progress</p>
      </div>

      <div className="stat-grid">
        <div className="stat-card stat-card--streak">
          <div className="stat-card-icon">🔥</div>
          <div className="stat-card-value">{streak.current}</div>
          <div className="stat-card-label">Day Streak</div>
          <div className="stat-card-sub">Longest: {streak.longest} days</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon">✅</div>
          <div className="stat-card-value">{overall.completed}</div>
          <div className="stat-card-label">Completed</div>
          <div className="stat-card-sub">of {overall.total} questions</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon">👁</div>
          <div className="stat-card-value">{overall.seen}</div>
          <div className="stat-card-label">Reviewed</div>
          <div className="stat-card-sub">questions opened</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon">🎯</div>
          <div className="stat-card-value">{overall.pct}%</div>
          <div className="stat-card-label">Overall Progress</div>
          <div className="stat-card-sub">completion rate</div>
        </div>
      </div>

      <div className="dash-section">
        <div className="dash-section-title">Overall Progress</div>
        <div className="overall-bar-wrap">
          <div className="overall-bar">
            <div className="overall-bar-fill" style={{ width: overall.pct + '%' }} />
          </div>
          <span className="overall-bar-pct">{overall.pct}%</span>
        </div>
      </div>

      <div className="dash-section">
        <div className="dash-section-title">By Difficulty</div>
        <div className="level-grid">
          {levelStats.map(l => (
            <div key={l.label} className="level-card">
              <div className="level-label">{l.label}</div>
              <div className="level-bar-wrap">
                <div className="level-bar">
                  <div className={`level-bar-fill level-fill-${l.label.toLowerCase()}`} style={{ width: l.pct + '%' }} />
                </div>
              </div>
              <div className="level-counts">{l.done} / {l.total}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="dash-section">
        <div className="dash-section-title">By Topic</div>
        <div className="topic-list">
          {topicStats.map(t => (
            <button key={t.slug} className="topic-row" onClick={() => onTopicClick(t.slug)}>
              <span className="topic-row-icon">{t.icon}</span>
              <span className="topic-row-label">{t.name}</span>
              <div className="topic-row-bar">
                <div className="topic-bar-bg">
                  <div className="topic-bar-fill" style={{ width: t.pct + '%' }} />
                </div>
              </div>
              <span className="topic-row-counts">{t.completed}/{t.total}</span>
              {t.completed === t.total && t.total > 0 && <span className="topic-done-badge">✓</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="dash-section">
        <div className="dash-section-title">Activity — Last 90 Days</div>
        <div className="calendar-grid">
          {calendarDays.map((d, i) => (
            <div key={i} className={`cal-day ${actLevel(d.count)}`} title={`${d.date}: ${d.count} questions`} />
          ))}
        </div>
        <div className="cal-legend">
          <span>Less</span>
          <span className="cal-day cal-none" /><span className="cal-day cal-low" />
          <span className="cal-day cal-mid" /><span className="cal-day cal-high" />
          <span>More</span>
        </div>
      </div>
    </div>
  )
}
