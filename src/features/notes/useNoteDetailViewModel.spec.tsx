import { renderHook, waitFor, act } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ApiError } from '../../core/http/client'
import type { Note, Summary } from '../../core/domain/note'
import type { NotesRepository } from '../../core/http/notes-repository'
import { messages } from '../../core/i18n/messages'
import { hookWrapper } from '../../test/render'
import { useNoteDetailViewModel } from './useNoteDetailViewModel'

const note = {
  id: '11111111-1111-4111-8111-111111111111',
  title: 'Weekend trip',
  body: 'Leave Saturday at 8.',
  created_at: '2026-11-03T00:00:00.000Z',
  updated_at: '2026-11-03T00:00:00.000Z',
}

function repository() {
  const get = vi.fn<(id: string) => Promise<Note>>().mockResolvedValue(note)
  const summarize = vi.fn<(id: string) => Promise<Summary>>()
  const repo: NotesRepository = {
    list: vi.fn(),
    get,
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
    summarize,
    ask: vi.fn(),
  }
  return { repo, get, summarize }
}

describe('useNoteDetailViewModel', () => {
  it('loads the note', async () => {
    const { repo } = repository()
    const { result } = renderHook(() => useNoteDetailViewModel(note.id, repo), {
      wrapper: hookWrapper(),
    })
    await waitFor(() => expect(result.current.status).toBe('ready'))
    expect(result.current.note?.title).toBe(note.title)
  })

  it('marks a missing note and a failed load differently', async () => {
    const missing = repository()
    missing.get.mockRejectedValue(new ApiError(messages.missingNote, 404))
    const first = renderHook(() => useNoteDetailViewModel(note.id, missing.repo), { wrapper: hookWrapper() })
    await waitFor(() => expect(first.result.current.missing).toBe(true))

    const failed = repository()
    failed.get.mockRejectedValue(new ApiError(messages.somethingWentWrong, 500))
    const second = renderHook(() => useNoteDetailViewModel(note.id, failed.repo), {
      wrapper: hookWrapper(),
    })
    await waitFor(() => expect(second.result.current.status).toBe('error'))
    expect(second.result.current.missing).toBe(false)
    expect(second.result.current.error).toBe(messages.somethingWentWrong)
  })

  it('does not summarize an empty note', async () => {
    const { repo, get, summarize } = repository()
    get.mockResolvedValue({ ...note, body: '' })
    const { result } = renderHook(() => useNoteDetailViewModel(note.id, repo), {
      wrapper: hookWrapper(),
    })
    await waitFor(() => expect(result.current.status).toBe('ready'))
    act(() => result.current.onSummarize())
    expect(result.current.summaryError).toBe(messages.emptyBodySummary)
    expect(summarize).not.toHaveBeenCalled()
  })
})
