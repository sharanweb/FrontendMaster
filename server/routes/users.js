const router = require('express').Router()
const User = require('../models/User')
const { authMiddleware, adminOnly } = require('../middleware/auth')

// All user management routes require admin
router.use(authMiddleware, adminOnly)

// List all users
router.get('/', async (req, res) => {
  try {
    const users = await User.find({}, '-password').sort({ createdAt: -1 })
    res.json({ users })
  } catch {
    res.status(500).json({ error: 'Server error' })
  }
})

// Add a new user
router.post('/', async (req, res) => {
  try {
    const { email, password, name, role } = req.body
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' })
    }
    const existing = await User.findOne({ email: email.toLowerCase().trim() })
    if (existing) {
      return res.status(409).json({ error: 'User with this email already exists' })
    }
    const user = await User.create({ email, password, name, role: role || 'user' })
    res.status(201).json({ user: user.toSafeObject() })
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

// Delete a user
router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) return res.status(404).json({ error: 'User not found' })
    if (user.role === 'admin') {
      return res.status(403).json({ error: 'Cannot delete admin accounts' })
    }
    await user.deleteOne()
    res.json({ message: 'User deleted' })
  } catch {
    res.status(500).json({ error: 'Server error' })
  }
})

module.exports = router
