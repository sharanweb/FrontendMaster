require('dotenv').config({ path: require('path').join(__dirname, '.env') })
const mongoose = require('mongoose')
const fs = require('fs')
const path = require('path')

const Module = require('./models/Module')
const Topic = require('./models/Topic')
const Question = require('./models/Question')
const User = require('./models/User')

const MODULES = [
  { slug: 'js', name: 'JavaScript', icon: '⚡', color: '#f7df1e', description: 'Core JS concepts for frontend interviews', order: 0 },
  { slug: 'react', name: 'React', icon: '⚛️', color: '#61dafb', description: 'React hooks, state, performance & patterns', order: 1 },
  { slug: 'html', name: 'HTML', icon: '🌐', color: '#e34f26', description: 'Semantic HTML, accessibility & web standards', order: 2 },
  { slug: 'css', name: 'CSS', icon: '🎨', color: '#264de4', description: 'Layouts, animations & responsive design', order: 3 }
]

const JS_TOPICS = [
  { slug: 'closures',            name: 'Closures',              icon: '🔒', order: 0 },
  { slug: 'closures-quiz',       name: 'Closures — Quiz',       icon: '🧪', order: 1 },
  { slug: 'event-loop',          name: 'Event Loop',            icon: '🔄', order: 2 },
  { slug: 'promises-async',      name: 'Promises & Async',      icon: '⏳', order: 3 },
  { slug: 'this-keyword',        name: 'this Keyword',          icon: '👉', order: 4 },
  { slug: 'call-apply-bind',     name: 'Call / Apply / Bind',   icon: '🔗', order: 5 },
  { slug: 'hoisting',            name: 'Hoisting',              icon: '🏗️', order: 6 },
  { slug: 'scope-execution',     name: 'Scope & Execution',     icon: '🌐', order: 7 },
  { slug: 'types-coercion',      name: 'Types & Coercion',      icon: '🔢', order: 8 },
  { slug: 'functions',           name: 'Functions',             icon: '🎯', order: 9 },
  { slug: 'error-handling',      name: 'Error Handling',        icon: '⚠️', order: 10 },
  { slug: 'generators-iterators',name: 'Generators',            icon: '⚙️', order: 11 },
  { slug: 'weakmap-weakset',     name: 'WeakMap & WeakSet',     icon: '🗑️', order: 12 },
  { slug: 'symbols',             name: 'Symbols',               icon: '🔣', order: 13 },
  { slug: 'var-let-const',       name: 'var / let / const',     icon: '📦', order: 14 },
  { slug: 'iife-module-pattern', name: 'IIFE & Modules',        icon: '📐', order: 15 },
  { slug: 'memory-leaks',        name: 'Memory Leaks',          icon: '💧', order: 16 },
  { slug: 'debounce-throttle',   name: 'Debounce & Throttle',   icon: '⏱️', order: 17 },
  { slug: 'currying',            name: 'Currying',              icon: '🍛', order: 18 },
  { slug: 'stale-closures',      name: 'Stale Closures',        icon: '🕰️', order: 19 },
  { slug: 'prototype-inheritance',name: 'Prototype',            icon: '🧬', order: 20 }
]

function mapQuestion(q, topicSlug, moduleSlug, index) {
  if (q.type === 'quiz') {
    return {
      topicSlug,
      moduleSlug,
      type: 'quiz',
      difficulty: q.difficulty,
      title: q.title,
      code: q.code,
      options: q.options || [],
      answerIndex: q.answer,
      explanation: q.explanation,
      concept: q.concept,
      order: index
    }
  }
  return {
    topicSlug,
    moduleSlug,
    type: q.type || 'theory',
    level: q.level || 1,
    question: q.question,
    answer: q.answer,
    code: q.code,
    tip: q.tip,
    followUps: q.followUps || [],
    companies: q.companies || [],
    order: index
  }
}

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI)
  console.log('Connected to MongoDB')

  // Seed admin
  const adminEmail = 'sharan.d1997@gmail.com'
  if (!(await User.findOne({ email: adminEmail }))) {
    await User.create({ email: adminEmail, password: 'Sharan@1997', role: 'admin', name: 'Sharan' })
    console.log('Admin seeded')
  }

  // Upsert modules
  for (const m of MODULES) {
    await Module.findOneAndUpdate({ slug: m.slug }, m, { upsert: true, new: true })
  }
  console.log('Modules seeded')

  // Upsert JS topics
  for (const t of JS_TOPICS) {
    await Topic.findOneAndUpdate(
      { slug: t.slug },
      { ...t, moduleSlug: 'js' },
      { upsert: true, new: true }
    )
  }
  console.log('Topics seeded')

  // Import questions from JSON
  const dataDir = path.join(__dirname, '../src/data/topics')
  let total = 0

  for (const topic of JS_TOPICS) {
    const file = path.join(dataDir, `${topic.slug}.json`)
    if (!fs.existsSync(file)) continue
    const data = JSON.parse(fs.readFileSync(file, 'utf-8'))
    const questions = data.questions || []

    for (let i = 0; i < questions.length; i++) {
      const q = mapQuestion(questions[i], topic.slug, 'js', i)
      // Use original id as idempotency key via a field
      await Question.findOneAndUpdate(
        { topicSlug: topic.slug, order: i },
        q,
        { upsert: true, new: true }
      )
      total++
    }
    console.log(`  ${topic.name}: ${questions.length} questions`)
  }

  console.log(`\nTotal questions seeded: ${total}`)
  await mongoose.disconnect()
}

seed().catch(err => { console.error(err); process.exit(1) })
