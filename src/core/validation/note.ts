import type { NoteDraft } from '../domain/note'
import { messages } from '../i18n/messages'
import { limits, sanitizePlainText } from './sanitize'

export type FieldResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: string }

export function validateNoteDraft(title: string, body: string): FieldResult<NoteDraft> {
  const cleanTitle = sanitizePlainText(title)
  const cleanBody = sanitizePlainText(body, true)
  if (!cleanTitle) return { ok: false, error: messages.titleRequired }
  if (cleanTitle.length > limits.titleMax) return { ok: false, error: messages.titleTooLong }
  if (cleanBody.length > limits.bodyMax) return { ok: false, error: messages.bodyTooLong }
  return { ok: true, value: { title: cleanTitle, body: cleanBody } }
}

export function validateQuestion(question: string): FieldResult<string> {
  const clean = sanitizePlainText(question)
  if (!clean) return { ok: false, error: messages.questionRequired }
  if (clean.length > limits.questionMax) return { ok: false, error: messages.questionTooLong }
  return { ok: true, value: clean }
}

export function validateSearch(query: string): FieldResult<string> {
  const clean = sanitizePlainText(query)
  if (clean.length > limits.searchMax) return { ok: false, error: messages.searchTooLong }
  return { ok: true, value: clean }
}
