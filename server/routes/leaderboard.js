const router = require('express').Router()
const Progress = require('../models/Progress')
const Streak = require('../models/Streak')
const User = require('../models/User')
const { authMiddleware } = require('../middleware/auth')

router.use(authMiddleware)

router.get('/', async (req, res) => {
  try {
    // Aggregate completed counts per user
    const completions = await Progress.aggregate([
      { $match: { completed: true } },
      { $group: { _id: '$userId', completed: { $sum: 1 } } },
      { $sort: { completed: -1 } },
      { $limit: 20 }
    ])

    const userIds = completions.map(c => c._id)
    const [users, streaks] = await Promise.all([
      User.find({ _id: { $in: userIds } }, 'name email'),
      Streak.find({ userId: { $in: userIds } })
    ])

    const userMap = Object.fromEntries(users.map(u => [u._id.toString(), u]))
    const streakMap = Object.fromEntries(streaks.map(s => [s.userId.toString(), s]))

    const board = completions.map((c, i) => {
      const u = userMap[c._id.toString()]
      const s = streakMap[c._id.toString()]
      return {
        rank: i + 1,
        userId: c._id,
        name: u?.name || u?.email?.split('@')[0] || 'Unknown',
        email: u?.email,
        completed: c.completed,
        streak: s?.current || 0,
        isMe: c._id.toString() === req.user.id
      }
    })

    res.json({ board })
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

module.exports = router
