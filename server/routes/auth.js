const router = require('express').Router()
const jwt = require('jsonwebtoken')
const User = require('../models/User')

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' })
    }
    const user = await User.findOne({ email: email.toLowerCase().trim() })
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )
    res.json({ token, user: user.toSafeObject() })
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

router.get('/me', require('../middleware/auth').authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
    if (!user) return res.status(404).json({ error: 'User not found' })
    res.json({ user: user.toSafeObject() })
  } catch {
    res.status(500).json({ error: 'Server error' })
  }
})

module.exports = router
