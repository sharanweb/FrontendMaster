const mongoose = require('mongoose')

const progressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
  moduleSlug: { type: String, required: true },
  topicSlug: { type: String, required: true },
  completed: { type: Boolean, default: false },
  completedAt: { type: Date },
  seenAt: { type: Date }
}, { timestamps: true })

progressSchema.index({ userId: 1, questionId: 1 }, { unique: true })
progressSchema.index({ userId: 1, moduleSlug: 1 })
progressSchema.index({ userId: 1, topicSlug: 1 })

module.exports = mongoose.model('Progress', progressSchema)
