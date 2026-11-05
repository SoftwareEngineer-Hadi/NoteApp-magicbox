import { describe, expect, it } from 'vitest'
import { ApiError } from './client'
import { mapAnswer, mapNote, mapNotePage, mapSession, mapSummary } from './mappers'

const note = {
  id: '11111111-1111-4111-8111-111111111111',
  title: 'Weekly grocery run',
  body: 'Need milk.',
  created_at: '2026-11-03T00:00:00.000Z',
  updated_at: '2026-11-03T00:00:00.000Z',
}

describe('response mappers', () => {
  it('keeps only the session email', () => {
    expect(mapSession({ email: 'owner@example.com', password: 'secret' })).toEqual({
      email: 'owner@example.com',
    })
  })

  it('keeps only note fields', () => {
    expect(mapNote({ ...note, extra: '<script>' })).toEqual(note)
  })

  it('keeps the server page', () => {
    expect(mapNotePage({ notes: [note], page: 2, pageSize: 20, total: 21 })).toEqual({
      notes: [note],
      page: 2,
      pageSize: 20,
      total: 21,
    })
    expect(() => mapNotePage({ notes: [note], page: 0, pageSize: 20, total: 1 })).toThrow(ApiError)
  })

  it('rejects a note missing a title', () => {
    expect(() => mapNote({ ...note, title: 12 })).toThrow(ApiError)
  })

  it('requires exactly three summary actions', () => {
    expect(
      mapSummary({
        summary: 'Need milk.',
        actions: ['Buy milk', 'Call bakery', 'Check eggs'],
        source: 'demo',
      }).actions,
    ).toHaveLength(3)
    expect(() => mapSummary({ summary: 'Need milk.', actions: ['Buy milk'], source: 'demo' })).toThrow(
      ApiError,
    )
  })

  it('keeps at most the mapped answer notes and an optional notice', () => {
    const answer = mapAnswer({
      answer: 'None of the saved notes mention that. Try a word from a title or from the note text.',
      source: 'demo',
      notes: [],
      notice: 'The AI service did not respond, so this answer comes from the saved notes directly.',
    })
    expect(answer.notes).toEqual([])
    expect(answer.notice).toContain('saved notes')
  })

  it('rejects an answer that names more than three notes', () => {
    expect(() =>
      mapAnswer({
        answer: 'From notes',
        source: 'openai',
        notes: [note, note, note, note],
      }),
    ).toThrow(ApiError)
  })
})
