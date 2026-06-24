const mongoose = require('mongoose')

const streakSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  current: { type: Number, default: 0 },
  longest: { type: Number, default: 0 },
  lastDate: { type: String, default: '' } // YYYY-MM-DD
})

module.exports = mongoose.model('Streak', streakSchema)
