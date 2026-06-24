require('dotenv').config({ path: require('path').join(__dirname, '.env') })
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')

const app = express()
app.use(cors())
app.use(express.json())

app.use('/api/auth', require('./routes/auth'))
app.use('/api/users', require('./routes/users'))
app.use('/api/answers', require('./routes/answers'))
app.use('/api/modules', require('./routes/modules'))
app.use('/api/questions', require('./routes/questions'))
app.use('/api/progress', require('./routes/progress'))
app.use('/api/leaderboard', require('./routes/leaderboard'))
app.use('/api/admin', require('./routes/admin'))

app.get('/api/health', (_, res) => res.json({ ok: true }))

const PORT = process.env.PORT || 3001

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected')
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`))
  })
  .catch(err => {
    console.error('MongoDB connection failed:', err.message)
    process.exit(1)
  })
