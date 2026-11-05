import type { LoginInput } from '../domain/note'
import { messages } from '../i18n/messages'
import { limits, sanitizePlainText, stripControlChars } from './sanitize'
import type { FieldResult } from './note'

export function validateLogin(email: string, password: string): FieldResult<LoginInput> {
  const cleanEmail = sanitizePlainText(email)
  const cleanPassword = stripControlChars(password)
  if (!cleanEmail) return { ok: false, error: messages.emailRequired }
  if (cleanEmail.length > limits.emailMax) return { ok: false, error: messages.emailTooLong }
  if (!isEmail(cleanEmail)) return { ok: false, error: messages.emailInvalid }
  if (!cleanPassword) return { ok: false, error: messages.passwordRequired }
  if (cleanPassword.length > limits.passwordMax) return { ok: false, error: messages.passwordTooLong }
  return { ok: true, value: { email: cleanEmail, password: cleanPassword } }
}

function isEmail(value: string): boolean {
  const at = value.indexOf('@')
  if (at <= 0 || at !== value.lastIndexOf('@')) return false
  const domain = value.slice(at + 1)
  return domain.length > 0 && !domain.startsWith('.') && !domain.endsWith('.') && !domain.includes(' ')
}
