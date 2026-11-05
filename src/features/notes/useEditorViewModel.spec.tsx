import { renderHook, act } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { NotesRepository } from '../../core/http/notes-repository'
import { messages } from '../../core/i18n/messages'
import { hookWrapper } from '../../test/render'
import { useEditorViewModel } from './useEditorViewModel'

const saved = {
  id: '11111111-1111-4111-8111-111111111111',
  title: 'Milk',
  body: 'Buy milk',
  created_at: '2026-11-03T00:00:00.000Z',
  updated_at: '2026-11-03T00:00:00.000Z',
}

function repository(): NotesRepository {
  return {
    list: vi.fn(),
    get: vi.fn(),
    create: vi.fn().mockResolvedValue(saved),
    update: vi.fn(),
    remove: vi.fn(),
    summarize: vi.fn(),
    ask: vi.fn(),
    session: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
  }
}

describe('useEditorViewModel', () => {
  it('rejects an empty title before calling the repository', () => {
    const repo = repository()
    const { result } = renderHook(() => useEditorViewModel(undefined, repo), {
      wrapper: hookWrapper(),
    })
    act(() => result.current.onSubmit())
    expect(result.current.error).toBe(messages.titleRequired)
    expect(repo.create).not.toHaveBeenCalled()
  })

  it('sanitizes and creates a note', async () => {
    const repo = repository()
    const { result } = renderHook(() => useEditorViewModel(undefined, repo), {
      wrapper: hookWrapper(),
    })
    act(() => {
      result.current.onTitle('  Milk  ')
      result.current.onBody('Buy milk\u0000')
    })
    await act(async () => {
      result.current.onSubmit()
    })
    expect(repo.create).toHaveBeenCalledWith({ title: 'Milk', body: 'Buy milk' })
  })
})
