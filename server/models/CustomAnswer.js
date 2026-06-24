const mongoose = require('mongoose')

const customAnswerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  questionId: { type: String, required: true },
  text: { type: String, required: true },
  updatedAt: { type: Date, default: Date.now }
})

customAnswerSchema.index({ userId: 1, questionId: 1 }, { unique: true })

module.exports = mongoose.model('CustomAnswer', customAnswerSchema)
