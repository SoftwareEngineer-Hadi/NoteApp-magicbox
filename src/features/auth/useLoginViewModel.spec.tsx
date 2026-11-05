import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { NotesRepository } from '../../core/http/notes-repository'
import { messages } from '../../core/i18n/messages'
import { hookWrapper } from '../../test/render'
import { useLoginViewModel } from './useLoginViewModel'

function repository() {
  const login = vi.fn<NotesRepository['login']>().mockResolvedValue({ email: 'owner@example.com' })
  const repo: NotesRepository = {
    session: vi.fn(),
    login,
    logout: vi.fn(),
    list: vi.fn(),
    get: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
    summarize: vi.fn(),
    ask: vi.fn(),
  }
  return { repo, login }
}

describe('useLoginViewModel', () => {
  it('rejects a blank form before calling the repository', () => {
    const { repo, login } = repository()
    const { result } = renderHook(() => useLoginViewModel(repo), { wrapper: hookWrapper() })
    act(() => result.current.onSubmit())
    expect(result.current.error).toBe(messages.emailRequired)
    expect(login).not.toHaveBeenCalled()
    expect(window.localStorage.length).toBe(0)
    expect(window.sessionStorage.length).toBe(0)
  })

  it('signs in with the sanitized email and password', async () => {
    const { repo, login } = repository()
    const { result } = renderHook(() => useLoginViewModel(repo), { wrapper: hookWrapper() })
    act(() => {
      result.current.onEmail('  owner@example.com ')
      result.current.onPassword('any pass')
    })
    await act(async () => {
      result.current.onSubmit()
    })
    expect(login).toHaveBeenCalledWith({ email: 'owner@example.com', password: 'any pass' })
    await waitFor(() => expect(result.current.password).toBe(''))
    expect(window.localStorage.length).toBe(0)
    expect(window.sessionStorage.length).toBe(0)
  })
})
