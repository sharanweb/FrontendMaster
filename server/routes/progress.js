const router = require('express').Router()
const Progress = require('../models/Progress')
const Streak = require('../models/Streak')
const Question = require('../models/Question')
const { authMiddleware } = require('../middleware/auth')

router.use(authMiddleware)

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

async function updateStreak(userId) {
  const today = todayStr()
  let streak = await Streak.findOne({ userId })
  if (!streak) streak = new Streak({ userId })

  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yStr = yesterday.toISOString().slice(0, 10)

  if (streak.lastDate === today) {
    // already counted today
  } else if (streak.lastDate === yStr) {
    streak.current += 1
    streak.longest = Math.max(streak.longest, streak.current)
    streak.lastDate = today
  } else {
    streak.current = 1
    streak.lastDate = today
    if (streak.longest === 0) streak.longest = 1
  }
  await streak.save()
  return streak
}

// Get my progress (optionally filter by moduleSlug or topicSlug)
router.get('/', async (req, res) => {
  try {
    const filter = { userId: req.user.id }
    if (req.query.module) filter.moduleSlug = req.query.module
    if (req.query.topic) filter.topicSlug = req.query.topic
    const progress = await Progress.find(filter)
    res.json({ progress })
  } catch {
    res.status(500).json({ error: 'Server error' })
  }
})

// Mark seen
router.post('/:questionId/seen', async (req, res) => {
  try {
    const q = await Question.findById(req.params.questionId)
    if (!q) return res.status(404).json({ error: 'Question not found' })
    const p = await Progress.findOneAndUpdate(
      { userId: req.user.id, questionId: q._id },
      { $set: { seenAt: new Date(), moduleSlug: q.moduleSlug, topicSlug: q.topicSlug } },
      { upsert: true, new: true }
    )
    await updateStreak(req.user.id)
    res.json({ progress: p })
  } catch {
    res.status(500).json({ error: 'Server error' })
  }
})

// Toggle complete
router.post('/:questionId/complete', async (req, res) => {
  try {
    const q = await Question.findById(req.params.questionId)
    if (!q) return res.status(404).json({ error: 'Question not found' })
    const existing = await Progress.findOne({ userId: req.user.id, questionId: q._id })
    const nowCompleted = existing ? !existing.completed : true
    const p = await Progress.findOneAndUpdate(
      { userId: req.user.id, questionId: q._id },
      {
        $set: {
          completed: nowCompleted,
          completedAt: nowCompleted ? new Date() : null,
          moduleSlug: q.moduleSlug,
          topicSlug: q.topicSlug,
          seenAt: existing?.seenAt || new Date()
        }
      },
      { upsert: true, new: true }
    )
    if (nowCompleted) await updateStreak(req.user.id)
    res.json({ progress: p })
  } catch {
    res.status(500).json({ error: 'Server error' })
  }
})

// Get my streak
router.get('/streak', async (req, res) => {
  try {
    const streak = await Streak.findOne({ userId: req.user.id })
    res.json({ streak: streak || { current: 0, longest: 0 } })
  } catch {
    res.status(500).json({ error: 'Server error' })
  }
})

module.exports = router
