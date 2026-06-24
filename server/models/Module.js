const mongoose = require('mongoose')

const moduleSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  icon: { type: String, default: '📦' },
  color: { type: String, default: '#007acc' },
  description: { type: String },
  order: { type: Number, default: 0 }
})

module.exports = mongoose.model('Module', moduleSchema)
