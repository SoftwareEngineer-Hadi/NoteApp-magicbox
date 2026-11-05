import { describe, expect, it } from 'vitest'
import { messages } from '../i18n/messages'
import { validateLogin } from './login'

describe('login validation', () => {
  it('accepts any email shape and keeps password spaces', () => {
    const result = validateLogin('  owner@example.com ', '  secret  ')
    expect(result).toEqual({ ok: true, value: { email: 'owner@example.com', password: '  secret  ' } })
  })

  it('rejects an empty email, a value without @, and an empty password', () => {
    expect(validateLogin('   ', 'secret')).toEqual({ ok: false, error: messages.emailRequired })
    expect(validateLogin('owner', 'secret')).toEqual({ ok: false, error: messages.emailInvalid })
    expect(validateLogin('owner@example.com', '')).toEqual({
      ok: false,
      error: messages.passwordRequired,
    })
  })

  it('drops control characters and rejects an overlong password', () => {
    const result = validateLogin('owner@example.com\u0000', 'secret\u0000')
    expect(result).toEqual({ ok: true, value: { email: 'owner@example.com', password: 'secret' } })
    expect(validateLogin('owner@example.com', 'x'.repeat(201))).toEqual({
      ok: false,
      error: messages.passwordTooLong,
    })
  })
})
