const router = require('express').Router()
const Module = require('../models/Module')
const Topic = require('../models/Topic')
const Question = require('../models/Question')
const { authMiddleware, adminOnly } = require('../middleware/auth')

router.use(authMiddleware)

// Get all modules
router.get('/', async (req, res) => {
  try {
    const modules = await Module.find().sort({ order: 1 })
    res.json({ modules })
  } catch {
    res.status(500).json({ error: 'Server error' })
  }
})

// Get topics for a module
router.get('/:slug/topics', async (req, res) => {
  try {
    const topics = await Topic.find({ moduleSlug: req.params.slug }).sort({ order: 1 })
    res.json({ topics })
  } catch {
    res.status(500).json({ error: 'Server error' })
  }
})

// Admin: add module
router.post('/', adminOnly, async (req, res) => {
  try {
    const { name, icon, color, description } = req.body
    if (!name) return res.status(400).json({ error: 'name required' })
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    const count = await Module.countDocuments()
    const module = await Module.create({ slug, name, icon: icon || '📦', color, description, order: count })
    res.status(201).json({ module })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Admin: delete module (and all its topics + questions)
router.delete('/:slug', adminOnly, async (req, res) => {
  try {
    const { slug } = req.params
    await Module.deleteOne({ slug })
    const topics = await Topic.find({ moduleSlug: slug })
    const topicSlugs = topics.map(t => t.slug)
    await Topic.deleteMany({ moduleSlug: slug })
    await Question.deleteMany({ topicSlug: { $in: topicSlugs } })
    res.json({ message: 'Module deleted' })
  } catch {
    res.status(500).json({ error: 'Server error' })
  }
})

// Admin: add topic to module
router.post('/:slug/topics', adminOnly, async (req, res) => {
  try {
    const { name, icon } = req.body
    if (!name) return res.status(400).json({ error: 'name required' })
    const moduleSlug = req.params.slug
    const slug = `${moduleSlug}-${name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`
    const count = await Topic.countDocuments({ moduleSlug })
    const topic = await Topic.create({ slug, name, icon: icon || '📝', moduleSlug, order: count })
    res.status(201).json({ topic })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Admin: delete topic and its questions
router.delete('/:moduleSlug/topics/:topicSlug', adminOnly, async (req, res) => {
  try {
    const { topicSlug } = req.params
    await Topic.deleteOne({ slug: topicSlug })
    await Question.deleteMany({ topicSlug })
    res.json({ message: 'Topic deleted' })
  } catch {
    res.status(500).json({ error: 'Server error' })
  }
})

module.exports = router
