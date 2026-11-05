import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { NotesRepository } from '../../core/http/notes-repository'
import { messages } from '../../core/i18n/messages'
import { hookWrapper } from '../../test/render'
import { useAskViewModel } from './useAskViewModel'

const answer = {
  answer: 'From “Weekend trip”: Leave Saturday at 8.',
  source: 'demo' as const,
  notes: [{ id: '11111111-1111-4111-8111-111111111111', title: 'Weekend trip' }],
}

function repository(): NotesRepository {
  return {
    list: vi.fn(),
    get: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
    summarize: vi.fn(),
    ask: vi.fn().mockResolvedValue(answer),
  }
}

describe('useAskViewModel', () => {
  it('rejects an empty question before calling the repository', () => {
    const repo = repository()
    const { result } = renderHook(() => useAskViewModel(repo), { wrapper: hookWrapper() })
    act(() => result.current.onSubmit())
    expect(result.current.error).toBe(messages.questionRequired)
    expect(repo.ask).not.toHaveBeenCalled()
  })

  it('asks with the sanitized question', async () => {
    const repo = repository()
    const { result } = renderHook(() => useAskViewModel(repo), { wrapper: hookWrapper() })
    act(() => result.current.onQuestion('  cabin \u0000'))
    await act(async () => {
      result.current.onSubmit()
    })
    expect(repo.ask).toHaveBeenCalledWith('cabin')
    await waitFor(() => expect(result.current.answer?.answer).toContain('Weekend trip'))
  })
})
