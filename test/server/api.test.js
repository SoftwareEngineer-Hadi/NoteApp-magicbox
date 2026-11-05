import assert from 'node:assert/strict'
import { mkdtempSync, rmSync } from 'node:fs'
import { createServer } from 'node:http'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { after, before, test } from 'node:test'

const dir = mkdtempSync(path.join(tmpdir(), 'smart-notes-'))
process.env.NOTES_DB_PATH = path.join(dir, 'notes.db')
delete process.env.OPENAI_API_KEY
delete process.env.OPENAI_BASE_URL

const { createApp } = await import('../../server/index.js')

let server
let base

before(async () => {
  server = createServer(createApp())
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  const address = server.address()
  assert.ok(address && typeof address === 'object')
  base = `http://127.0.0.1:${address.port}`
})

after(() => {
  server.close()
  rmSync(dir, { recursive: true, force: true })
})

async function json(pathname, init) {
  const response = await fetch(`${base}${pathname}`, init)
  const body = await response.json()
  return { response, body }
}

test('lists seeded notes newest-style and escapes percent searches', async () => {
  const all = await json('/api/notes')
  assert.equal(all.response.status, 200)
  assert.equal(all.body.notes.length, 3)
  const bakery = await json('/api/notes?q=bakery')
  assert.deepEqual(
    bakery.body.notes.map((note) => note.title),
    ['Weekly grocery run'],
  )
  const wildcard = await json(`/api/notes?q=${encodeURIComponent('%')}`)
  assert.deepEqual(wildcard.body.notes, [])
  assert.equal(all.body.page, 1)
  assert.equal(all.body.pageSize, 20)
  assert.equal(all.body.total, 3)
})

test('returns the second page and rejects a page that is not a whole number', async () => {
  const ids = []
  for (let index = 0; index < 21; index += 1) {
    const created = await json('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: `Pager ${index}`, body: 'pager-only' }),
    })
    ids.push(created.body.id)
  }
  const page = await json('/api/notes?q=pager-only&page=2')
  assert.equal(page.response.status, 200)
  assert.equal(page.body.page, 2)
  assert.equal(page.body.pageSize, 20)
  assert.equal(page.body.total, 21)
  assert.equal(page.body.notes.length, 1)
  const bad = await json('/api/notes?page=0')
  assert.equal(bad.response.status, 400)
  assert.equal(bad.body.error, 'Page must be a whole number.')
  for (const id of ids) {
    await json(`/api/notes/${id}`, { method: 'DELETE' })
  }
})

test('creates, rejects a blank title, and deletes', async () => {
  const blank = await json('/api/notes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: '   ', body: 'x' }),
  })
  assert.equal(blank.response.status, 400)
  assert.equal(blank.body.error, 'A title is required.')

  const created = await json('/api/notes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: '  Empty body note  ', body: '   ' }),
  })
  assert.equal(created.response.status, 201)
  assert.equal(created.body.title, 'Empty body note')
  assert.equal(created.body.body, '')

  const summary = await json(`/api/notes/${created.body.id}/summarize`, { method: 'POST' })
  assert.equal(summary.response.status, 400)
  assert.equal(summary.body.error, 'Write something in the note first.')

  const removed = await json(`/api/notes/${created.body.id}`, { method: 'DELETE' })
  assert.equal(removed.response.status, 200)
  assert.deepEqual(removed.body, { ok: true })
  const missing = await json(`/api/notes/${created.body.id}`)
  assert.equal(missing.response.status, 404)
  const unknown = await json('/api/notes/not-a-uuid', { method: 'DELETE' })
  assert.equal(unknown.response.status, 404)
})

test('summarizes a seed note and refuses an unknown question in demo mode', async () => {
  const grocery = await json('/api/notes?q=sourdough')
  const summary = await json(`/api/notes/${grocery.body.notes[0].id}/summarize`, { method: 'POST' })
  assert.equal(summary.response.status, 200)
  assert.equal(
    summary.body.summary,
    'Need milk, eggs, and sourdough before Thursday. Dinner plan: roast chicken on Friday and leftover soup on Saturday.',
  )
  assert.deepEqual(summary.body.actions, [
    'Need milk, eggs, and sourdough before Thursday',
    'Buy coffee beans if the jar is under half',
    'Call the bakery about the weekend loaf',
  ])
  assert.equal(summary.body.source, 'demo')

  const none = await json('/api/ask', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question: 'quantum physics homework' }),
  })
  assert.equal(
    none.body.answer,
    'None of the saved notes mention that. Try a word from a title or from the note text.',
  )
  assert.deepEqual(none.body.notes, [])

  const cabin = await json('/api/ask', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question: 'When is the lakeside cabin mentioned?' }),
  })
  assert.equal(cabin.body.answer, 'From “Weekend trip”: Leave Saturday at 8.')
  assert.deepEqual(
    cabin.body.notes.map((note) => note.title),
    ['Weekend trip'],
  )

  const tooLong = await json('/api/ask', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question: 'q'.repeat(501) }),
  })
  assert.equal(tooLong.response.status, 400)
  assert.equal(tooLong.body.error, 'Question must be 500 characters or less.')
})

test('health stays in demo mode and does not echo a provider key', async () => {
  process.env.OPENAI_API_KEY = 'sk-test-secret-value'
  process.env.OPENAI_BASE_URL = ''
  const health = await json('/api/health')
  assert.deepEqual(health.body, { ok: true, ai: 'openai' })
  assert.equal(JSON.stringify(health.body).includes('sk-test-secret-value'), false)

  const notes = await json('/api/notes?q=kickoff')
  const summary = await json(`/api/notes/${notes.body.notes[0].id}/summarize`, { method: 'POST' })
  assert.equal(summary.body.notice, 'The AI service did not respond, so this is a local summary.')
  assert.equal(summary.body.source, 'demo')
  assert.equal(JSON.stringify(summary.body).includes('sk-test-secret-value'), false)
  delete process.env.OPENAI_API_KEY
})

test('blocks a foreign browser origin', async () => {
  const response = await fetch(`${base}/api/health`, {
    headers: { Origin: 'https://evil.example' },
  })
  assert.equal(response.headers.get('access-control-allow-origin'), null)
  const local = await fetch(`${base}/api/health`, {
    headers: { Origin: 'http://127.0.0.1:5173' },
  })
  assert.equal(local.headers.get('access-control-allow-origin'), 'http://127.0.0.1:5173')
})
