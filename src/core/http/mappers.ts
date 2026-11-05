import type { Answer, Note, RelatedNote, Summary } from '../domain/note'
import { ApiError } from './client'
import { messages } from '../i18n/messages'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function text(value: unknown): string | null {
  return typeof value === 'string' ? value : null
}

function source(value: unknown): Summary['source'] | null {
  return value === 'demo' || value === 'openai' ? value : null
}

export function mapNote(value: unknown): Note {
  if (!isRecord(value)) throw new ApiError(messages.somethingWentWrong, 0)
  const id = text(value.id)
  const title = text(value.title)
  const body = text(value.body)
  const created_at = text(value.created_at)
  const updated_at = text(value.updated_at)
  if (!id || title === null || body === null || !created_at || !updated_at) {
    throw new ApiError(messages.somethingWentWrong, 0)
  }
  return { id, title, body, created_at, updated_at }
}

export function mapNotes(value: unknown): Note[] {
  if (!isRecord(value) || !Array.isArray(value.notes)) {
    throw new ApiError(messages.somethingWentWrong, 0)
  }
  return value.notes.map((item) => mapNote(item))
}

export function mapSummary(value: unknown): Summary {
  if (!isRecord(value)) throw new ApiError(messages.somethingWentWrong, 0)
  const summary = text(value.summary)
  const kind = source(value.source)
  const actions = Array.isArray(value.actions) ? value.actions.map(text) : []
  if (!summary || !kind || actions.length !== 3 || actions.some((item) => !item)) {
    throw new ApiError(messages.somethingWentWrong, 0)
  }
  const mapped: Summary = {
    summary,
    actions: [actions[0], actions[1], actions[2]] as [string, string, string],
    source: kind,
  }
  if (typeof value.notice === 'string' && value.notice.trim()) {
    mapped.notice = value.notice
  }
  return mapped
}

function mapRelated(value: unknown): RelatedNote {
  if (!isRecord(value)) throw new ApiError(messages.somethingWentWrong, 0)
  const id = text(value.id)
  const title = text(value.title)
  if (!id || title === null) throw new ApiError(messages.somethingWentWrong, 0)
  return { id, title }
}

export function mapAnswer(value: unknown): Answer {
  if (!isRecord(value)) throw new ApiError(messages.somethingWentWrong, 0)
  const answer = text(value.answer)
  const kind = source(value.source)
  if (!answer || !kind || !Array.isArray(value.notes) || value.notes.length > 3) {
    throw new ApiError(messages.somethingWentWrong, 0)
  }
  const mapped: Answer = {
    answer,
    source: kind,
    notes: value.notes.map((item) => mapRelated(item)),
  }
  if (typeof value.notice === 'string' && value.notice.trim()) {
    mapped.notice = value.notice
  }
  return mapped
}
