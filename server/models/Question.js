const mongoose = require('mongoose')

const questionSchema = new mongoose.Schema({
  topicSlug: { type: String, required: true },
  moduleSlug: { type: String, required: true },
  // type: theory | output | implementation | quiz
  type: { type: String, enum: ['theory', 'output', 'implementation', 'quiz'], required: true },
  level: { type: Number, min: 1, max: 4, default: 1 }, // theory/output/impl
  difficulty: { type: String, enum: ['easy', 'medium', 'hard', 'tricky'] }, // quiz
  question: { type: String }, // theory/output/impl
  title: { type: String },    // quiz
  answer: { type: String },
  explanation: { type: String }, // quiz
  code: { type: String },
  options: [String],  // quiz
  answerIndex: { type: Number }, // quiz correct option index
  concept: { type: String },  // quiz
  tip: { type: String },
  followUps: [String],
  companies: [String],
  order: { type: Number, default: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true })

questionSchema.index({ topicSlug: 1, order: 1 })
questionSchema.index({ moduleSlug: 1 })

module.exports = mongoose.model('Question', questionSchema)
