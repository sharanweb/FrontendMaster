const mongoose = require('mongoose')

const topicSchema = new mongoose.Schema({
  moduleSlug: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  icon: { type: String, default: '📝' },
  order: { type: Number, default: 0 }
})

topicSchema.index({ moduleSlug: 1, order: 1 })

module.exports = mongoose.model('Topic', topicSchema)
