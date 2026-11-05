import { describe, expect, it } from 'vitest'
import { messages } from '../i18n/messages'
import { validateNoteDraft, validateQuestion, validateSearch } from './note'

describe('note validation', () => {
  it('accepts a title and an empty body', () => {
    expect(validateNoteDraft('  Grocery  ', '  ')).toEqual({
      ok: true,
      value: { title: 'Grocery', body: '' },
    })
  })

  it('rejects a blank title with the API string', () => {
    expect(validateNoteDraft('   ', 'body')).toEqual({ ok: false, error: messages.titleRequired })
  })

  it('rejects a title over 120 characters', () => {
    expect(validateNoteDraft('a'.repeat(121), 'body')).toEqual({
      ok: false,
      error: messages.titleTooLong,
    })
  })

  it('rejects a body over 8000 characters', () => {
    expect(validateNoteDraft('Title', 'b'.repeat(8001))).toEqual({
      ok: false,
      error: messages.bodyTooLong,
    })
  })

  it('rejects an empty question and a question over 500 characters', () => {
    expect(validateQuestion('  ')).toEqual({ ok: false, error: messages.questionRequired })
    expect(validateQuestion('q'.repeat(501))).toEqual({ ok: false, error: messages.questionTooLong })
  })

  it('rejects a search over 200 characters', () => {
    expect(validateSearch('s'.repeat(201))).toEqual({ ok: false, error: messages.searchTooLong })
    expect(validateSearch(' bakery ')).toEqual({ ok: true, value: 'bakery' })
  })
})
