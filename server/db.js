import './env.js'
import fs from 'node:fs'
import path from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import { fileURLToPath } from 'node:url'

const dataDir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'data')
const databasePath = process.env.NOTES_DB_PATH || path.join(dataDir, 'notes.db')
fs.mkdirSync(path.dirname(databasePath), { recursive: true })

const db = new DatabaseSync(databasePath)

db.exec(`
  CREATE TABLE IF NOT EXISTS notes (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS meta (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
`)

const seeds = [
  {
    title: 'Weekly grocery run',
    body: 'Need milk, eggs, and sourdough before Thursday.\n\nDinner plan: roast chicken on Friday and leftover soup on Saturday.\nBuy coffee beans if the jar is under half.\nCall the bakery about the weekend loaf.',
  },
  {
    title: 'Project kickoff',
    body: 'Smart Notes is a small demo with a React client and an Express API.\n\nReview the four screens with the team on Monday.\nSend the build package after the walkthrough.\nKeep the AI key on the server, never in the browser.',
  },
  {
    title: 'Weekend trip',
    body: 'Leave Saturday at 8. Book the lakeside cabin if it is still open.\nPack a charger, walking shoes, and the paper notebook.\nCheck the train time on Friday night.',
  },
]

const alreadySeeded = db.prepare(`SELECT value FROM meta WHERE key = 'seeded'`).get()
if (!alreadySeeded) {
  if (db.prepare('SELECT COUNT(*) AS count FROM notes').get().count === 0) {
    const insert = db.prepare(
      'INSERT INTO notes (id, title, body, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
    )
    const now = new Date().toISOString()
    for (const note of seeds) {
      insert.run(crypto.randomUUID(), note.title, note.body, now, now)
    }
  }
  db.prepare(`INSERT INTO meta (key, value) VALUES ('seeded', '1')`).run()
}

function likeTerm(query) {
  return `%${query.replace(/[\\%_]/g, '\\$&')}%`
}

export function listNotes(query = '') {
  const q = query.trim()
  if (!q) {
    return db.prepare('SELECT * FROM notes ORDER BY updated_at DESC, id DESC').all()
  }
  const term = likeTerm(q)
  return db
    .prepare(
      `SELECT * FROM notes
       WHERE title LIKE ? ESCAPE '\\' OR body LIKE ? ESCAPE '\\'
       ORDER BY updated_at DESC, id DESC`,
    )
    .all(term, term)
}

export function getNote(id) {
  return db.prepare('SELECT * FROM notes WHERE id = ?').get(id)
}

export function createNote({ title, body }) {
  const now = new Date().toISOString()
  const note = { id: crypto.randomUUID(), title, body, created_at: now, updated_at: now }
  db.prepare(
    'INSERT INTO notes (id, title, body, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
  ).run(note.id, note.title, note.body, note.created_at, note.updated_at)
  return note
}

export function updateNote(id, { title, body }) {
  const existing = getNote(id)
  if (!existing) return null
  const updated_at = new Date().toISOString()
  db.prepare('UPDATE notes SET title = ?, body = ?, updated_at = ? WHERE id = ?').run(
    title,
    body,
    updated_at,
    id,
  )
  return { ...existing, title, body, updated_at }
}

export function deleteNote(id) {
  const result = db.prepare('DELETE FROM notes WHERE id = ?').run(id)
  return result.changes > 0
}
