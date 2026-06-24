const router = require('express').Router()
const Progress = require('../models/Progress')
const User = require('../models/User')
const Question = require('../models/Question')
const { authMiddleware, adminOnly } = require('../middleware/auth')

router.use(authMiddleware, adminOnly)

// All users' progress summary (per module)
router.get('/progress', async (req, res) => {
  try {
    const [users, totals, allProgress] = await Promise.all([
      User.find({}, 'name email role'),
      Question.aggregate([
        { $group: { _id: '$moduleSlug', total: { $sum: 1 } } }
      ]),
      Progress.aggregate([
        { $match: { completed: true } },
        { $group: { _id: { userId: '$userId', moduleSlug: '$moduleSlug' }, completed: { $sum: 1 } } }
      ])
    ])

    const totalMap = Object.fromEntries(totals.map(t => [t._id, t.total]))

    // Build per-user module map
    const progressMap = {}
    allProgress.forEach(p => {
      const uid = p._id.userId.toString()
      if (!progressMap[uid]) progressMap[uid] = {}
      progressMap[uid][p._id.moduleSlug] = p.completed
    })

    const result = users.map(u => ({
      id: u._id,
      name: u.name || '',
      email: u.email,
      role: u.role,
      modules: Object.entries(totalMap).map(([slug, total]) => ({
        slug,
        total,
        completed: progressMap[u._id.toString()]?.[slug] || 0,
        pct: total ? Math.round((progressMap[u._id.toString()]?.[slug] || 0) / total * 100) : 0
      }))
    }))

    res.json({ users: result, moduleTotals: totalMap })
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

module.exports = router
