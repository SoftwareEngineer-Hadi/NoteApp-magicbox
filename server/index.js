import './env.js'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import cors from 'cors'
import express from 'express'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import { answerQuestion, summarizeNote } from './ai.js'
import { createNote, deleteNote, getNote, listNotes, listNotesPage, updateNote } from './db.js'

const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const SEARCH_MAX = 200
const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function stripControls(value, allowNewlines) {
  const pattern = allowNewlines
    ? /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g
    : /[\u0000-\u001F\u007F]/g
  return value.replace(pattern, '')
}

export function readNoteInput(body) {
  const title =
    typeof body?.title === 'string' ? stripControls(body.title, false).trim() : ''
  const text = typeof body?.body === 'string' ? stripControls(body.body, true).trim() : ''
  if (!title) return { error: 'A title is required.' }
  if (title.length > 120) return { error: 'Title must be 120 characters or less.' }
  if (text.length > 8000) return { error: 'Note must be 8000 characters or less.' }
  return { title, body: text }
}

function readQuestion(body) {
  const question =
    typeof body?.question === 'string' ? stripControls(body.question, false).trim() : ''
  if (!question) return { error: 'Ask a question first.' }
  if (question.length > 500) return { error: 'Question must be 500 characters or less.' }
  return { question }
}

function noteId(value) {
  return typeof value === 'string' && UUID.test(value) ? value : null
}

function readPage(value) {
  if (value === undefined) return 1
  if (typeof value !== 'string' || !/^[1-9]\d*$/.test(value)) return null
  const page = Number(value)
  if (!Number.isSafeInteger(page) || page > 10000) return null
  return page
}

function allowedOrigins() {
  const configured = process.env.CLIENT_ORIGIN?.split(',')
    .map((item) => item.trim())
    .filter(Boolean)
  if (configured && configured.length > 0) return configured
  return ['http://127.0.0.1:5173', 'http://localhost:5173']
}

const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

export function createApp() {
  const app = express()
  app.disable('x-powered-by')
  app.set('trust proxy', false)

  app.use(
    helmet({
      crossOriginEmbedderPolicy: false,
      referrerPolicy: { policy: 'no-referrer' },
      contentSecurityPolicy:
        process.env.NODE_ENV === 'production'
          ? {
              directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'"],
                styleSrc: ["'self'"],
                imgSrc: ["'self'", 'data:'],
                connectSrc: ["'self'"],
                objectSrc: ["'none'"],
                baseUri: ["'none'"],
                frameAncestors: ["'none'"],
                formAction: ["'self'"],
              },
            }
          : false,
    }),
  )

  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || allowedOrigins().includes(origin)) {
          callback(null, true)
          return
        }
        callback(null, false)
      },
    }),
  )

  app.use(express.json({ limit: '200kb' }))

  const aiLimiter = rateLimit({
    windowMs: 60_000,
    limit: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests. Wait a moment and try again.' },
  })

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, ai: process.env.OPENAI_API_KEY ? 'openai' : 'demo' })
  })

  app.get('/api/notes', (req, res) => {
    const q = typeof req.query.q === 'string' ? stripControls(req.query.q, false).trim() : ''
    if (q.length > SEARCH_MAX) {
      return res.status(400).json({ error: 'Search must be 200 characters or less.' })
    }
    const page = readPage(req.query.page)
    if (page === null) return res.status(400).json({ error: 'Page must be a whole number.' })
    res.json(listNotesPage(q, page))
  })

  app.post(
    '/api/notes',
    wrap((req, res) => {
      const input = readNoteInput(req.body)
      if (input.error) return res.status(400).json({ error: input.error })
      res.status(201).json(createNote(input))
    }),
  )

  app.get('/api/notes/:id', (req, res) => {
    const id = noteId(req.params.id)
    const note = id ? getNote(id) : null
    if (!note) return res.status(404).json({ error: 'Note not found.' })
    res.json(note)
  })

  app.put(
    '/api/notes/:id',
    wrap((req, res) => {
      const id = noteId(req.params.id)
      if (!id) return res.status(404).json({ error: 'Note not found.' })
      const input = readNoteInput(req.body)
      if (input.error) return res.status(400).json({ error: input.error })
      const note = updateNote(id, input)
      if (!note) return res.status(404).json({ error: 'Note not found.' })
      res.json(note)
    }),
  )

  app.delete('/api/notes/:id', (req, res) => {
    const id = noteId(req.params.id)
    if (!id || !deleteNote(id)) return res.status(404).json({ error: 'Note not found.' })
    res.json({ ok: true })
  })

  app.post(
    '/api/notes/:id/summarize',
    aiLimiter,
    wrap(async (req, res) => {
      const id = noteId(req.params.id)
      const note = id ? getNote(id) : null
      if (!note) return res.status(404).json({ error: 'Note not found.' })
      if (!note.body) return res.status(400).json({ error: 'Write something in the note first.' })
      res.json(await summarizeNote(note))
    }),
  )

  app.post(
    '/api/ask',
    aiLimiter,
    wrap(async (req, res) => {
      const input = readQuestion(req.body)
      if (input.error) return res.status(400).json({ error: input.error })
      res.json(await answerQuestion(input.question, listNotes()))
    }),
  )

  if (process.env.NODE_ENV === 'production') {
    const distDir = path.join(rootDir, 'dist')
    app.use(express.static(distDir, { index: false, dotfiles: 'deny' }))
    app.use((req, res, next) => {
      if (req.method !== 'GET' && req.method !== 'HEAD') return next()
      if (req.path.startsWith('/api')) return next()
      res.sendFile(path.join(distDir, 'index.html'), (error) => {
        if (error) next(error)
      })
    })
  }

  app.use((error, _req, res, _next) => {
    if (error?.type === 'entity.too.large') {
      return res.status(413).json({ error: 'Request is too large.' })
    }
    if (error?.type === 'entity.parse.failed') {
      return res.status(400).json({ error: 'Something went wrong.' })
    }
    process.stderr.write('request_failed\n')
    return res.status(500).json({ error: 'Something went wrong.' })
  })

  return app
}

const isDirectRun =
  process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)

if (isDirectRun) {
  const port = Number(process.env.PORT) || 3001
  const app = createApp()
  app.listen(port, () => {
    const mode = process.env.OPENAI_API_KEY ? 'openai' : 'demo'
    process.stdout.write(`Smart Notes listening on port ${port} (AI: ${mode})\n`)
  })
}
