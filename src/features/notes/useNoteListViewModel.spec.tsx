import { renderHook, waitFor, act } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ApiError } from '../../core/http/client'
import type { NotesRepository } from '../../core/http/notes-repository'
import { messages } from '../../core/i18n/messages'
import { hookWrapper } from '../../test/render'
import { useNoteListViewModel } from './useNoteListViewModel'

const note = {
  id: '11111111-1111-4111-8111-111111111111',
  title: 'Milk',
  body: 'Buy milk',
  created_at: '2026-11-03T00:00:00.000Z',
  updated_at: '2026-11-03T00:00:00.000Z',
}

const page = { notes: [note], page: 1, pageSize: 20, total: 1 }

function repository() {
  const list = vi.fn<NotesRepository['list']>().mockResolvedValue(page)
  const repo: NotesRepository = {
    list,
    get: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
    summarize: vi.fn(),
    ask: vi.fn(),
    session: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
  }
  return { repo, list }
}

describe('useNoteListViewModel', () => {
  it('loads the first page', async () => {
    const { repo, list } = repository()
    const { result } = renderHook(() => useNoteListViewModel(repo), { wrapper: hookWrapper() })
    await waitFor(() => expect(result.current.status).toBe('ready'))
    expect(result.current.notes).toEqual([note])
    expect(list).toHaveBeenCalledWith('', 1)
  })

  it('shows an error when the repository fails', async () => {
    const { repo, list } = repository()
    list.mockRejectedValue(new ApiError(messages.somethingWentWrong, 500))
    const { result } = renderHook(() => useNoteListViewModel(repo), { wrapper: hookWrapper() })
    await waitFor(() => expect(result.current.status).toBe('error'))
    expect(result.current.error).toBe(messages.somethingWentWrong)
    expect(result.current.canRetry).toBe(true)
  })

  it('rejects an overlong search before requesting that text', async () => {
    vi.useFakeTimers()
    const { repo, list } = repository()
    const { result } = renderHook(() => useNoteListViewModel(repo), { wrapper: hookWrapper() })
    const tooLong = 'a'.repeat(201)
    act(() => result.current.onQuery(tooLong))
    await act(async () => {
      await vi.advanceTimersByTimeAsync(300)
    })
    expect(result.current.error).toBe(messages.searchTooLong)
    expect(list).not.toHaveBeenCalledWith(tooLong, 1)
    vi.useRealTimers()
  })

  it('requests the selected page and returns to page 1 when the search changes', async () => {
    vi.useFakeTimers()
    const { repo, list } = repository()
    const { result } = renderHook(() => useNoteListViewModel(repo), { wrapper: hookWrapper() })
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0)
    })
    act(() => result.current.onPage(2))
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0)
    })
    expect(list).toHaveBeenCalledWith('', 2)
    act(() => result.current.onQuery('milk'))
    await act(async () => {
      await vi.advanceTimersByTimeAsync(300)
    })
    expect(list).toHaveBeenCalledWith('milk', 1)
    expect(result.current.page).toBe(1)
    vi.useRealTimers()
  })
})
