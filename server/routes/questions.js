const router = require('express').Router()
const Question = require('../models/Question')
const { authMiddleware, adminOnly } = require('../middleware/auth')

router.use(authMiddleware)

// Get questions for a topic
router.get('/topic/:topicSlug', async (req, res) => {
  try {
    const questions = await Question.find({ topicSlug: req.params.topicSlug }).sort({ order: 1 })
    res.json({ questions })
  } catch {
    res.status(500).json({ error: 'Server error' })
  }
})

// Admin: add question
router.post('/', adminOnly, async (req, res) => {
  try {
    const { topicSlug, moduleSlug } = req.body
    if (!topicSlug || !moduleSlug) return res.status(400).json({ error: 'topicSlug and moduleSlug required' })
    // Set order to last
    const count = await Question.countDocuments({ topicSlug })
    const question = await Question.create({ ...req.body, order: count, createdBy: req.user.id })
    res.status(201).json({ question })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Admin: update question
router.put('/:id', adminOnly, async (req, res) => {
  try {
    const question = await Question.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!question) return res.status(404).json({ error: 'Not found' })
    res.json({ question })
  } catch {
    res.status(500).json({ error: 'Server error' })
  }
})

// Admin: delete question
router.delete('/:id', adminOnly, async (req, res) => {
  try {
    await Question.findByIdAndDelete(req.params.id)
    res.json({ message: 'Deleted' })
  } catch {
    res.status(500).json({ error: 'Server error' })
  }
})

module.exports = router
