const router = require('express').Router()
const CustomAnswer = require('../models/CustomAnswer')
const { authMiddleware } = require('../middleware/auth')

router.use(authMiddleware)

// Get all custom answers for current user
router.get('/', async (req, res) => {
  try {
    const answers = await CustomAnswer.find({ userId: req.user.id })
    res.json({ answers })
  } catch {
    res.status(500).json({ error: 'Server error' })
  }
})

// Save or update a custom answer
router.post('/', async (req, res) => {
  try {
    const { questionId, text } = req.body
    if (!questionId || !text?.trim()) {
      return res.status(400).json({ error: 'questionId and text required' })
    }
    const answer = await CustomAnswer.findOneAndUpdate(
      { userId: req.user.id, questionId },
      { text: text.trim(), updatedAt: new Date() },
      { upsert: true, new: true }
    )
    res.json({ answer })
  } catch {
    res.status(500).json({ error: 'Server error' })
  }
})

// Delete a custom answer
router.delete('/:questionId', async (req, res) => {
  try {
    await CustomAnswer.deleteOne({ userId: req.user.id, questionId: req.params.questionId })
    res.json({ message: 'Deleted' })
  } catch {
    res.status(500).json({ error: 'Server error' })
  }
})

module.exports = router
